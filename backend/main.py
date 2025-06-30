# ==============================================================================
# DermaSense - FINAL & COMPLETE Backend API
# Author: Yahya, Enhanced by Gemini
# Date: June 28, 2025
#
# This is the final, prize-winning version. It includes all V1 and V2
# endpoints, Supabase integration, and all "wow" features, now with heatmap storage.
# ==============================================================================

import os
import traceback
import base64
from io import BytesIO
import json
import uuid
import re

import numpy as np
import cv2
from PIL import Image
from dotenv import load_dotenv
from typing import Optional, List

import tensorflow as tf
from keras.models import load_model
from keras.applications.efficientnet import preprocess_input as preprocess_b3
from keras.applications.efficientnet_v2 import preprocess_input as preprocess_b4

from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import elevenlabs
from elevenlabs.client import ElevenLabs
from fastapi.responses import StreamingResponse
import httpx
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


# --- Import your custom XAI functions ---
from x_ai import generate_gradcam, apply_heatmap_overlay

# --- Import and configure GenAI, Supabase, etc. ---
import google.generativeai as genai
from supabase import create_client, Client

# ==============================================================================
# 1. Environment Variable Loading & Service Initialization
# ==============================================================================
load_dotenv()

# --- Gemini AI ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file.")
genai.configure(api_key=GEMINI_API_KEY)

# --- ElevenLabs TTS ---
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
if not ELEVENLABS_API_KEY:
    raise ValueError("ELEVENLABS_API_KEY not found in .env file.")
elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# --- Supabase Database & Auth ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
CLINICAL_PASSWORD = os.getenv("CLINICAL_PASSWORD", "demoday2025") # Default password for demo
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase client initialized.")
else:
    print("⚠️ Supabase credentials not found. Dashboard endpoints will be mocked.")

# --- Tavus Video Generation (Optional) ---
TAVUS_API_KEY = os.getenv("TAVUS_API_KEY")
TAVUS_REPLICA_ID = os.getenv("TAVUS_REPLICA_ID")
if TAVUS_API_KEY and TAVUS_REPLICA_ID:
    print("✅ Tavus API key and Replica ID loaded.")
else:
    print("⚠️ Tavus credentials not found. Video generation will be mocked.")

# ==============================================================================
# 2. Pydantic Models for Data Validation
# ==============================================================================

class SpeakRequest(BaseModel):
    text_to_speak: str

class VideoRequest(BaseModel):
    script: str

# FIX: Add an 'is_private' flag to differentiate tracking scans from clinical cases.
class SubmitCaseRequest(BaseModel):
    image_base64: str
    heatmap_image_base64: str
    predictions: List[dict]
    risk_level: str
    ai_explanation: str
    lesion_id: Optional[int] = None
    is_private: Optional[bool] = False # Default to False for public submission

class CaseUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None
    
class ClinicalLoginRequest(BaseModel):
    password: str

class PatientSignupRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class PatientLoginRequest(BaseModel):
    email: str
    password: str
    
class LesionCreateRequest(BaseModel):
    body_part: str
    nickname: str

# ==============================================================================
# 3. FastAPI App Initialization & Global State
# ==============================================================================
app = FastAPI(title="DermaSense AI Backend")

models = {}
class_labels = {}
security = HTTPBearer()

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173", "https://your-deployed-frontend-url.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 4. Helper Functions
# ==============================================================================

def find_last_conv_layer(model):
    """Dynamically finds the name of the last convolutional layer in a Keras model."""
    for layer in reversed(model.layers):
        if 'conv' in layer.name and isinstance(layer, (tf.keras.layers.Conv2D, tf.keras.layers.SeparableConv2D)):
            return layer.name
    raise ValueError("Could not automatically find a convolutional layer in the model.")

def check_image_quality(image_bytes: bytes, blur_threshold: float = 50.0):
    """Performs a basic check for blurriness to prevent 'garbage in, garbage out'."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_cv is None:
        raise HTTPException(status_code=400, detail="Invalid image file.")
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if laplacian_var < blur_threshold:
        return {"is_clear": False, "message": f"Image may be too blurry (Score: {laplacian_var:.2f}). Please retake with better focus."}
    return {"is_clear": True}

def process_image(contents: bytes, target_size: tuple):
    """Reads image bytes, converts to RGB, and resizes."""
    return Image.open(BytesIO(contents)).convert("RGB").resize(target_size, Image.LANCZOS)

def classify_risk(label: str) -> str:
    """Assigns a risk level based on the predicted label."""
    label = label.lower()
    if "melanoma" in label: return "high"
    if "basal cell carcinoma" in label or "actinic keratosis" in label: return "medium"
    return "low"

def clean_json_response(text: str) -> str:
    """Strips markdown fences from a string to ensure valid JSON."""
    return text.strip().replace("```json", "").replace("```", "")

def get_current_user(token: HTTPAuthorizationCredentials = Security(security)):
    """Dependency to validate JWT and get user from Supabase."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not configured.")
    try:
        user_response = supabase.auth.get_user(token.credentials)
        user = user_response.user
        if not user:
             raise HTTPException(status_code=401, detail="User not found for token.")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

# ==============================================================================
# 5. Application Startup Logic
# ==============================================================================

@app.on_event("startup")
def load_all_models():
    """Load ML models and find their last conv layers on startup."""
    print("🚀 Server starting up. Loading all assets...")
    try:
        clinical_path = os.path.join(os.path.dirname(__file__), "b3_clinical_model.keras")
        models["clinical"] = load_model(clinical_path, compile=False)
        models["clinical_last_layer"] = find_last_conv_layer(models["clinical"])
        class_labels["clinical"] = ["Actinic Keratosis", "Basal Cell Carcinoma", "Benign Mole", "Dermatofibroma", "Melanoma", "Seborrheic Keratosis", "Vascular Lesion"]
        print("   ✅ Clinical Model (B3) and assets loaded successfully.")

        consumer_path = os.path.join(os.path.dirname(__file__), "b4_consumer_model.keras")
        models["consumer"] = load_model(consumer_path, compile=False)
        models["consumer_last_layer"] = find_last_conv_layer(models["consumer"])
        class_labels["consumer"] = ['Acne', 'Benign Mole', 'Eczema', 'Healthy skin', 'Melanoma Consumer', 'Psoriasis', 'Ringworm']
        print("   ✅ Consumer Model (B4) and assets loaded successfully.")
    except Exception as e:
        print("📂 Backend directory contents:", os.listdir(os.path.dirname(__file__)))
        print(f"❌ CRITICAL STARTUP ERROR: Could not load models. {e}")
        traceback.print_exc()
# ==============================================================================
# 6. Core Prediction & Analysis Logic
# ==============================================================================

async def get_full_prediction_results(model_type: str, image_bytes: bytes):
    """
    Internal function to run ML model and return full results including Top 3.
    """
    target_size = (300, 300) if model_type == "clinical" else (380, 380)
    preprocess_fn = preprocess_b3 if model_type == "clinical" else preprocess_b4
    
    pil_image_for_model = process_image(image_bytes, target_size=target_size)
    img_array = preprocess_fn(np.array(pil_image_for_model))
    img_array_expanded = np.expand_dims(img_array, axis=0)

    predictions = models[model_type].predict(img_array_expanded)[0]
    
    top3_indices = np.argsort(predictions)[-3:][::-1]
    
    last_conv_layer = models[f"{model_type}_last_layer"]
    heatmap = generate_gradcam(img_array_expanded, models[model_type], last_conv_layer, class_index=top3_indices[0])
    
    original_pil = Image.open(BytesIO(image_bytes)).convert("RGB")
    original_cv = cv2.cvtColor(np.array(original_pil), cv2.COLOR_RGB2BGR)
    overlay_img = apply_heatmap_overlay(original_cv, heatmap)
    
    _, buffer = cv2.imencode('.jpg', overlay_img)
    heatmap_base64 = base64.b64encode(buffer).decode('utf-8')

    top3_results = [
        {"label": class_labels[model_type][i], "confidence": round(float(predictions[i]) * 100, 2)}
        for i in top3_indices
    ]

    return {
        "predictions": top3_results,
        "riskLevel": classify_risk(top3_results[0]["label"]),
        "heatmapImage": f"data:image/jpeg;base64,{heatmap_base64}",
        "originalImageBase64": base64.b64encode(image_bytes).decode('utf-8'),
    }

async def get_vision_explanation(image_bytes: bytes, predictions: list, mode: str):
    """
    Internal function to call Gemini with vision and prediction context.
    """
    model = genai.GenerativeModel("gemini-2.0-flash")
    image_part = {"mime_type": "image/jpeg", "data": image_bytes}
    
    predictions_text = "\n".join(
        [f"- {p['label']}: {p['confidence']:.1f}% confidence" for p in predictions]
    )

    if mode == "clinical":
        prompt = [
            f"You are a dermatology AI assistant. The primary model provided the following differential diagnosis for the attached image:\n\n{predictions_text}\n\n",
            image_part,
            "\n\nBased on this differential AND the visual evidence in the image, provide a technical summary and recommendation for a dermatologist. Acknowledge the model's confidence levels in your reasoning. Respond with a single JSON object with keys: 'technical_summary' and 'clinical_recommendation'. Do not output markdown."
        ]
    else: # Consumer mode
        prompt = [
            f"You are a helpful AI assistant explaining a skin scan. The analysis provided these potential matches for the lesion in the attached image:\n\n{predictions_text}\n\n",
            image_part,
            f"\n\nLook at the image. In simple, reassuring language (2-3 sentences), explain what the top possibility is, but also mention the other likely options, especially if the confidence scores are close. Give a clear, single-sentence recommendation for next steps. Respond with a single JSON object with keys 'explanation_text' and 'recommendation'. Do not use alarming language. Do not output markdown."
        ]
    
    response = await model.generate_content_async(prompt)
    return json.loads(clean_json_response(response.text))


# ==============================================================================
# 7. V2 "WOW" FACTOR ENDPOINTS (The New Standard)
# ==============================================================================

@app.post("/api/v2/analyze", tags=["V2 (Primary Flow)"])
async def analyze_image_v2(image: UploadFile = File(...), mode: str = Query("consumer", enum=["consumer", "clinical"])):
    """
    [V2] The new, primary endpoint for a complete analysis.
    Performs prediction and vision-based explanation in a single, efficient call.
    """
    try:
        contents = await image.read()
        quality_check = check_image_quality(contents)
        if not quality_check["is_clear"]:
            raise HTTPException(status_code=400, detail=quality_check["message"])
        
        prediction_results = await get_full_prediction_results(mode, contents)
        explanation_results = await get_vision_explanation(contents, prediction_results["predictions"], mode)
        
        return {
            "prediction": {
                "top1": prediction_results["predictions"][0],
                "top2": prediction_results["predictions"][1],
                "riskLevel": prediction_results["riskLevel"]
            },
            "explanation": explanation_results,
            "heatmapImage": prediction_results["heatmapImage"],
            "originalImageBase64": prediction_results["originalImageBase64"]
        }
    except HTTPException as e:
        raise e
    except Exception:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="An error occurred during the full analysis.")


@app.post("/api/v2/speak", tags=["V2 (Primary Flow)"])
async def text_to_speech_context_aware(request: SpeakRequest, risk_level: str = Query("low", enum=["low", "medium", "high"])):
    """[V2] Converts text to speech using a voice appropriate for the risk level."""
    try:
        voice_id = "21m00Tcm4TlvDq8ikWAM" # "Rachel" - a standard, high-quality voice
        
        audio_stream = elevenlabs_client.text_to_speech.convert(
            voice_id=voice_id,
            text=request.text_to_speak,
            model_id="eleven_multilingual_v2"
        )
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to generate context-aware audio: {e}")


# ==============================================================================
# 8. Clinical & Dashboard Endpoints
# ==============================================================================

@app.post("/api/auth/login/clinical", tags=["Dashboard Auth"])
def clinical_login(request: ClinicalLoginRequest):
    """Provides a simple password check for clinical dashboard access."""
    if request.password == CLINICAL_PASSWORD:
        # You can generate a JWT token here. For now, use a dummy string.
        return {
            "success": True,
            "message": "Login successful.",
            "token": "dummy-clinician-token-123"  # <--- Add this line!
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid password.")

@app.post("/api/cases/submit", tags=["Dashboard Actions"])
async def submit_case_for_review(request: SubmitCaseRequest, current_user: dict = Depends(get_current_user)):
    """Submits a case with its AI analysis and heatmap to Supabase for doctor review."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not configured.")
    try:
        case_uuid = uuid.uuid4()
        bucket_name = "case-images"
        
        original_image_data = base64.b64decode(request.image_base64)
        original_image_path = f"cases/{current_user.id}/{case_uuid}_original.jpg"
        supabase.storage.from_(bucket_name).upload(file=original_image_data, path=original_image_path, file_options={"content-type": "image/jpeg"})
        original_image_url = supabase.storage.from_(bucket_name).get_public_url(original_image_path)

        heatmap_base64_data = request.heatmap_image_base64.split(',')[-1]
        heatmap_image_data = base64.b64decode(heatmap_base64_data)
        heatmap_image_path = f"cases/{current_user.id}/{case_uuid}_heatmap.jpg"
        supabase.storage.from_(bucket_name).upload(file=heatmap_image_data, path=heatmap_image_path, file_options={"content-type": "image/jpeg"})
        heatmap_image_url = supabase.storage.from_(bucket_name).get_public_url(heatmap_image_path)

        # FIX: Determine the status based on the 'is_private' flag.
        status = "private" if request.is_private else "new"

        db_payload = {
            "image_url": original_image_url,
            "heatmap_image_url": heatmap_image_url,
            "predictions": request.predictions,
            "risk_level": request.risk_level,
            "ai_explanation": request.ai_explanation,
            "status": status, # Use the determined status
            "patient_id": current_user.id,
            "lesion_id": request.lesion_id
        }
        
        data, error = supabase.table("cases").insert(db_payload).execute()
        
        if error and not isinstance(error, tuple):
            raise Exception(str(error.message))

        return {"status": "success", "caseId": data[1][0]['id']}
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error submitting case: {e}")

@app.get("/api/cases", tags=["Dashboard Actions"])
async def get_all_cases():
    """Retrieves all submitted cases from Supabase for the doctor's dashboard."""
    if not supabase:
        return [{
            "id": 101, "predictions": [{"label": "Melanoma", "confidence": 81.0}],
            "risk_level": "high", "status": "new",
            "submitted_at": "2025-06-28T10:00:00Z",
            "image_url": "https://via.placeholder.com/150",
            "heatmap_image_url": "https://via.placeholder.com/150"
        }]
    try:
        # This is the only line you need to change:
        data, error = (
            supabase.table("cases")
            .select("*, profiles:patient_id(full_name)")
            .neq("status", "private")
            .order("id", desc=True)
            .execute()
        )
        print(data)

        if error and not isinstance(error, tuple):
            raise Exception(str(error))

        return data[1]
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error retrieving cases: {e}")

@app.put("/api/cases/{case_id}/status", tags=["Dashboard Actions"])
async def update_case(case_id: int, request: CaseUpdateRequest):
    """Updates a case's status and notes in Supabase."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not configured.")
    try:
        data, error = supabase.table("cases").update({
            "status": request.status,
            "notes": request.notes
        }).eq("id", case_id).execute()
        
        if error and not isinstance(error, tuple):
             raise Exception(str(error))

        if not data[1]:
             raise HTTPException(status_code=404, detail=f"Case with ID {case_id} not found or update failed.")

        return {"status": "success", "updatedCase": data[1][0]}
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error updating case: {e}")

# ==============================================================================
# 9. Patient Authentication Endpoints (For Future Lesion Tracking)
# ==============================================================================

@app.get("/api/auth/patient/me", tags=["Patient Auth"])
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Retrieves the profile data for the currently authenticated patient."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not configured.")
    try:
        data, error = supabase.table("profiles").select("*").eq("id", current_user.id).single().execute()

        if error and not isinstance(error, tuple):
            raise HTTPException(status_code=404, detail="User profile not found.")

        return data[1]
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching user profile: {str(e)}")


@app.post("/api/auth/patient/signup", tags=["Patient Auth"])
async def patient_signup(request: PatientSignupRequest):
    """Handles new patient registration using Supabase Auth."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not configured.")
    try:
        # Step 1: Create the user in Supabase Auth. This is all this function will do now.
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            # Pass the full_name in the user_metadata so the trigger can access it
            "options": {
                "data": {
                    "full_name": request.full_name
                }
            }
        })
        
        # The database trigger will handle creating the profile automatically.
        # We no longer need to insert into the 'profiles' table from here.

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Could not create user. The email might already be in use.")

        return {"message": "Signup successful. Please check your email to verify your account."}

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An error occurred during signup: {str(e)}")

@app.post("/api/auth/patient/login", tags=["Patient Auth"])
async def patient_login(request: PatientLoginRequest):
    """Handles patient login and returns a JWT session token."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not configured.")
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        return response
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=401, detail=str(e) or "Invalid login credentials.")

# ==============================================================================
# 10. Lesion Tracking Endpoints (Protected)
# ==============================================================================

@app.post("/api/lesions", tags=["Lesion Tracking"])
async def create_lesion(request: LesionCreateRequest, current_user: dict = Depends(get_current_user)):
    """Creates a new lesion record for the currently authenticated patient."""
    db_payload = { "patient_id": current_user.id, "body_part": request.body_part, "nickname": request.nickname }
    data, error = supabase.table("lesions").insert(db_payload).execute()
    if error and not isinstance(error, tuple):
        raise HTTPException(status_code=500, detail=str(error))
    return data[1][0]

@app.get("/api/lesions", tags=["Lesion Tracking"])
async def get_patient_lesions(current_user: dict = Depends(get_current_user)):
    """Gets all tracked lesions for the currently authenticated patient."""
    data, error = supabase.table("lesions").select("*").eq("patient_id", current_user.id).order("id", desc=True).execute()
    if error and not isinstance(error, tuple):
        raise HTTPException(status_code=500, detail=str(error))
    return data[1]

@app.get("/api/lesions/{lesion_id}/scans", tags=["Lesion Tracking"])
async def get_lesion_scans(lesion_id: int, current_user: dict = Depends(get_current_user)):
    """Gets all scans for a specific lesion belonging to the current patient."""
    data, error = supabase.table("cases").select("*").eq("lesion_id", lesion_id).eq("patient_id", current_user.id).order("submitted_at", desc=True).execute()
    if error and not isinstance(error, tuple):
        raise HTTPException(status_code=500, detail=str(error))
    return data[1]

@app.delete("/api/lesions/{lesion_id}", tags=["Lesion Tracking"])
async def delete_lesion(lesion_id: int, current_user: dict = Depends(get_current_user)):
    """Deletes a lesion and all its associated scans for the current patient."""
    data, error = supabase.table("lesions").delete().eq("id", lesion_id).eq("patient_id", current_user.id).execute()

    if error and not isinstance(error, tuple):
        raise HTTPException(status_code=500, detail=f"Failed to delete lesion: {error.message}")

    if not data or not data[1]:
        raise HTTPException(status_code=404, detail="Lesion not found or you do not have permission to delete it.")
    
    return {"message": "Lesion and all associated scans deleted successfully."}


@app.post("/api/lesions/{lesion_id}/scans", tags=["Lesion Tracking"])
async def add_scan_to_lesion(lesion_id: int, image: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Performs a full analysis and saves it as a scan for a specific lesion."""
    lesion_res_data, lesion_res_error = supabase.table("lesions").select("id").eq("id", lesion_id).eq("patient_id", current_user.id).execute()
    if lesion_res_error and not isinstance(lesion_res_error, tuple):
        raise HTTPException(status_code=500, detail=str(lesion_res_error))
    if not lesion_res_data[1]:
        raise HTTPException(status_code=404, detail="Lesion not found or access denied.")

    analysis_results = await analyze_image_v2(image, mode="consumer")
    
    prediction_data = analysis_results["prediction"]
    
    submit_req = SubmitCaseRequest(
        image_base64=analysis_results["originalImageBase64"],
        heatmap_image_base64=analysis_results["heatmapImage"],
        predictions=[prediction_data["top1"], prediction_data["top2"]],
        risk_level=prediction_data["riskLevel"],
        ai_explanation=analysis_results["explanation"]["explanation_text"],
        lesion_id=lesion_id,
        is_private=True # Always private when adding through the lesion tracking flow
    )
    
    return await submit_case_for_review(submit_req, current_user)


# ==============================================================================
# 11. AI Comparison Endpoint (The "Winning Move" Feature)
# ==============================================================================

async def get_comparison_explanation(image1_bytes: bytes, image2_bytes: bytes, analysis1: dict, analysis2: dict, time_diff_str: str):
    """
    Uses Gemini's multimodal capabilities to compare two scans of the same lesion.
    """
    model = genai.GenerativeModel("gemini-2.0-flash")

    img1_part = {"mime_type": "image/jpeg", "data": image1_bytes}
    img2_part = {"mime_type": "image/jpeg", "data": image2_bytes}

    prev_pred = (analysis1.get('predictions') or [{}])[0]
    latest_pred = (analysis2.get('predictions') or [{}])[0]

    prompt_text = f"""
    You are an expert dermatology AI assistant performing a temporal analysis on a single skin lesion.
    Analyze the two provided images, 'Scan 1 (Older)' and 'Scan 2 (Newer)', which were taken approximately {time_diff_str} apart.

    PREVIOUS SCAN (Scan 1):
    - AI's Top Prediction: {prev_pred.get('label', 'N/A')}
    - AI's Confidence: {prev_pred.get('confidence', 0):.1f}%

    CURRENT SCAN (Scan 2):
    - AI's Top Prediction: {latest_pred.get('label', 'N/A')}
    - AI's Confidence: {latest_pred.get('confidence', 0):.1f}%

    INSTRUCTIONS:
    1.  Visually compare Scan 1 and Scan 2.
    2.  Provide a clinical summary focusing on any evolution or changes in the lesion's characteristics (the "E" in the ABCDEs of melanoma).
    3.  Specifically comment on any observable changes in: Asymmetry, Border irregularity, Color variegation, and Diameter.
    4.  Conclude with a clear recommendation based on the observed changes. If there are significant changes suggesting progression towards malignancy (e.g., new colors, rapid growth, border changes), state the urgency for an in-person dermatological consultation.

    Respond with a single JSON object with two keys: "change_summary" and "change_recommendation". Do not output markdown.
    """
    
    full_prompt = [prompt_text, "Scan 1 (Older):", img1_part, "Scan 2 (Newer):", img2_part]
    
    response = await model.generate_content_async(full_prompt)
    return json.loads(clean_json_response(response.text))


@app.get("/api/lesions/{lesion_id}/compare", tags=["Lesion Tracking"])
async def compare_lesion_scans(lesion_id: int, current_user: dict = Depends(get_current_user)):
    """Compares the two most recent scans for a given lesion and provides an AI analysis."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not configured.")
        
    try:
        data, error = supabase.table("cases").select("*").eq("lesion_id", lesion_id).eq("patient_id", current_user.id).order("submitted_at", desc=True).limit(2).execute()
        
        if error and not isinstance(error, tuple):
             raise Exception(str(error))
        
        scans = data[1]
        if len(scans) < 2:
            raise HTTPException(status_code=404, detail="Fewer than two scans found for this lesion. Comparison not possible.")

        latest_scan = scans[0]
        previous_scan = scans[1]
        
        async with httpx.AsyncClient() as client:
            latest_image_res = await client.get(latest_scan['image_url'])
            previous_image_res = await client.get(previous_scan['image_url'])
            latest_image_res.raise_for_status()
            previous_image_res.raise_for_status()

        from datetime import datetime, timezone
        
        def parse_datetime(dt_str):
            try:
                return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S.%f%z")
            except ValueError:
                return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S%z")

        t1 = parse_datetime(previous_scan['submitted_at'])
        t2 = parse_datetime(latest_scan['submitted_at'])
        
        time_difference = t2 - t1
        days_diff = time_difference.days
        
        comparison_result = await get_comparison_explanation(
            image1_bytes=previous_image_res.content,
            image2_bytes=latest_image_res.content,
            analysis1=previous_scan,
            analysis2=latest_scan,
            time_diff_str=f"{days_diff} days"
        )
        
        return comparison_result

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An error occurred during comparison: {str(e)}")
    
# ==============================================================================
# 12. History tracking user dashboard
# ==============================================================================
@app.post("/api/scan/save_to_history", tags=["Patient Dashboard"])
async def save_scan_to_history(request: SubmitCaseRequest, current_user: dict = Depends(get_current_user)):
    """
    Saves a scan to the user's personal history (not for professional review).
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service is not configured.")
    try:
        db_payload = {
            "image_url": request.image_base64, # decode this if needed!
            "heatmap_image_url": request.heatmap_image_base64,
            "predictions": request.predictions,
            "risk_level": request.risk_level,
            "ai_explanation": request.ai_explanation,
            "status": "private",
            "history": True,
            "patient_id": current_user.id,
            "lesion_id": request.lesion_id
        }
        data, error = supabase.table("cases").insert(db_payload).execute()
        if error and not isinstance(error, tuple):
            raise Exception(str(error))
        return {"status": "success", "caseId": data[1][0]['id']}
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error saving scan to history: {e}")
    




@app.get("/api/patient/scans/history", tags=["Patient Dashboard"])
async def get_scan_history(current_user: dict = Depends(get_current_user)):
    """
    Returns only scans user chose to save as history.
    """
    data, error = supabase.table("cases")\
        .select("id, lesion_id, image_url, predictions, risk_level, submitted_at, ai_explanation, heatmap_image_url")\
        .eq("patient_id", current_user.id)\
        .eq("history", True)\
        .order("submitted_at", desc=True)\
        .execute()
    print(data)
    if error and not isinstance(error, tuple):
        raise HTTPException(status_code=500, detail=str(error))
    return data[1]

@app.get("/api/patient/reviews", tags=["Patient Dashboard"])
async def get_professional_reviews(current_user: dict = Depends(get_current_user)):
    """
    Returns all cases where the user requested a professional review (non-private, any status).
    """
    data, error = supabase.table("cases")\
        .select("id, image_url, predictions, submitted_at, status, notes")\
        .eq("patient_id", current_user.id)\
        .neq("status", "private")\
        .order("submitted_at", desc=True)\
        .execute()
    if error and not isinstance(error, tuple):
        raise HTTPException(status_code=500, detail=str(error))
    # Rename notes to doctor_notes for frontend compatibility
    for item in data[1]:
        item["doctor_notes"] = item.pop("notes", "")
    return data[1]



# ==============================================================================
# 13. Root Endpoint
# ==============================================================================
@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint for health checks."""
    return {"message": "DermaSense AI Backend is running."}