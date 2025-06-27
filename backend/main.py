# ==============================================================================
# DermaSense - Final Backend API
# Author: Yahya
# Date: June 26, 2025
#
# ARCHITECTURE:
# - FastAPI for a high-performance web framework.
# - Dual-Model system loading both Clinical (B3) and Consumer (B4) models.
# - Clear, separated endpoints for different functionalities.
# - Pydantic models for robust data validation.
# - Environment variables for secure API key management.
# - Integrated Grad-CAM, AI, and Database functions.
# ==============================================================================

import os
import traceback
import base64
from io import BytesIO

import numpy as np
import cv2
from PIL import Image
from dotenv import load_dotenv
from typing import Optional

import tensorflow as tf
from keras.models import load_model
from keras.applications.efficientnet import preprocess_input as preprocess_b3
from keras.applications.efficientnet_v2 import preprocess_input as preprocess_b4

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- Import your custom XAI functions ---
from x_ai import generate_gradcam, apply_heatmap_overlay

# --- Import and configure the Gemini client ---
import google.generativeai as genai

# --- Load Environment Variables ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file. Please create a .env file and add your key.")

# CORRECTED: Configure the Gemini library with your API key
genai.configure(api_key=GEMINI_API_KEY)
# Add other keys for ElevenLabs, Tavus, Supabase etc.

# ==============================================================================
# 1. Pydantic Models for Data Validation
# ==============================================================================

class ExplainRequest(BaseModel):
    lesion_name: str
    secondary_lesion_name: Optional[str] = None
    
class SpeakRequest(BaseModel):
    text_to_speak: str

class CaseUpdateRequest(BaseModel):
    status: str
    notes: str | None = None

# ==============================================================================
# 2. FastAPI App Initialization & Global State
# ==============================================================================

app = FastAPI(title="DermaSense AI Backend")

# In-memory storage for models to avoid reloading on every request
models = {}
class_labels = {}

@app.on_event("startup")
def load_models_on_startup():
    """Load ML models into memory when the application starts."""
    print("🚀 Server starting up. Loading models...")
    try:
        # --- Clinical Model (B3) ---
        # IMPORTANT: Replace with the actual path to your model file
        clinical_model_path = r"C:\Users\yahya\Worlds-Largest-Hackathon-dermascan\models\clinical_b3_model.keras"
        models["clinical"] = load_model(clinical_model_path, compile=False)
        class_labels["clinical"] = [
            "Actinic Keratosis", "Basal Cell Carcinoma", "Benign Mole",
            "Dermatofibroma", "Melanoma", "Seborrheic Keratosis", "Vascular Lesion"
        ]
        print("   ✅ Clinical Model (B3) loaded successfully.")

        # --- Consumer Model (B4) ---
        # IMPORTANT: Replace with the actual path to your model file
        consumer_model_path = r"C:\Users\yahya\Worlds-Largest-Hackathon-dermascan\models\consumer_b4_model.keras"
        models["consumer"] = load_model(consumer_model_path, compile=False)
        class_labels["consumer"] = [
            'Acne', 'Benign_Mole', 'Eczema', 'Healthy_skin', 
            'Melanoma_Consumer', 'Psoriasis', 'Ringworm'
        ]
        print("   ✅ Consumer Model (B4) loaded successfully.")
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR: Could not load models. Check paths. {e}")

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173", "https://your-deployed-frontend-url.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 3. Helper Functions
# ==============================================================================

def process_image(contents: bytes, target_size: tuple):
    """Reads image bytes, converts to RGB, and resizes."""
    image = Image.open(BytesIO(contents)).convert("RGB")
    image = image.resize(target_size, Image.LANCZOS)
    return image

def classify_risk(label: str) -> str:
    """Assigns a risk level based on the predicted label."""
    label = label.lower()
    if "melanoma" in label:
        return "high"
    elif "basal cell carcinoma" in label or "actinic keratosis" in label:
        return "medium"
    else:
        return "low"

# ==============================================================================
# 4. Core Prediction Endpoints
# ==============================================================================

# Note: Your original endpoint is now specific to the clinical model
@app.post("/api/predict/clinical")
async def predict_clinical(image: UploadFile = File(...)):
    """Endpoint for the high-precision clinical model (B3) with Grad-CAM."""
    try:
        contents = await image.read()
        pil_image = process_image(contents, target_size=(300, 300))
        
        img_array = preprocess_b3(np.array(pil_image))
        img_array_expanded = np.expand_dims(img_array, axis=0)

        predictions = models["clinical"].predict(img_array_expanded)[0]
        
        top2_indices = np.argsort(predictions)[-2:][::-1]
        top2_classes = [class_labels["clinical"][i] for i in top2_indices]
        top2_confidences = [round(float(predictions[i]) * 100, 2) for i in top2_indices]

        # NOTE: Replace "top_activation" with the actual name of the last conv layer in your B3 model
        heatmap = generate_gradcam(img_array_expanded, models["clinical"], "top_activation", class_index=top2_indices[0])
        original_cv = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        overlay_img = apply_heatmap_overlay(original_cv, heatmap)
        _, buffer = cv2.imencode('.jpg', overlay_img)
        heatmap_base64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "heatmapImage": f"data:image/jpeg;base64,{heatmap_base64}",
            "top1": {"label": top2_classes[0], "confidence": top2_confidences[0]},
            "top2": {"label": top2_classes[1], "confidence": top2_confidences[1]},
            "riskLevel": classify_risk(top2_classes[0]),
        }
    except Exception:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Error processing clinical image.")

@app.post("/api/predict/consumer")
async def predict_consumer(image: UploadFile = File(...)):
    """Endpoint for the broad-coverage consumer model (B4) with Grad-CAM."""
    try:
        contents = await image.read()
        pil_image = process_image(contents, target_size=(380, 380))
        
        img_array = preprocess_b4(np.array(pil_image))
        img_array_expanded = np.expand_dims(img_array, axis=0)

        predictions = models["consumer"].predict(img_array_expanded)[0]
        
        top2_indices = np.argsort(predictions)[-2:][::-1]
        top2_classes = [class_labels["consumer"][i] for i in top2_indices]
        top2_confidences = [round(float(predictions[i]) * 100, 2) for i in top2_indices]
        
        # NOTE: Replace "top_activation" with the actual name of the last conv layer in your B4 model
        heatmap = generate_gradcam(img_array_expanded, models["consumer"], "top_activation", class_index=top2_indices[0])
        original_cv = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        overlay_img = apply_heatmap_overlay(original_cv, heatmap)
        _, buffer = cv2.imencode('.jpg', overlay_img)
        heatmap_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "heatmapImage": f"data:image/jpeg;base64,{heatmap_base64}",
            "top1": {"label": top2_classes[0], "confidence": top2_confidences[0]},
            "top2": {"label": top2_classes[1], "confidence": top2_confidences[1]},
            "riskLevel": classify_risk(top2_classes[0]),
        }
    except Exception:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Error processing consumer image.")

# ==============================================================================
# 5. AI "Wow" Factor Endpoints
# ==============================================================================

@app.post("/api/explain")
async def explain_lesion(request: ExplainRequest, mode: str = "consumer"):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        # Compose the prompt for clinical/consumer with both labels, output plain text with NO labels
        if mode == "clinical":
            prompt = f"""
You are an AI clinical assistant working with a dermatologist. 
Given a dermoscopic image, you provide short, practical, technical summaries that help the doctor decide next steps.
Most likely finding: '{request.lesion_name}'. 
Second likely: '{request.secondary_lesion_name or "N/A"}'.

Reply in plain text. Include:
- A brief pattern-based summary of what the AI sees (no headings or labels, just technical language, e.g., "Irregular pigment network, blue-white veil, and regression structures, supporting melanoma over seborrheic keratosis.")
- A direct, one-sentence next-step clinical recommendation (e.g., "Excisional biopsy recommended" or "Routine follow-up in 6 months").
- Finish with (in parentheses): AI is assistive only. Clinical correlation required.

Do NOT use any headings, colons, or section labels. Just technical guidance and the final line in parentheses.
"""
        else:
            prompt = f"""
You are an AI assistant for a general user with a skin lesion.
Most likely: '{request.lesion_name}'. Second likely: '{request.secondary_lesion_name or "N/A"}'.

Reply in plain text. In 2-4 sentences:
- Briefly describe what it might be in simple language and mention the second possibility.
- Clearly state what signs to watch for.
- Give direct advice, e.g., "See a dermatologist within a week if changes occur."
- End with: (This is not a diagnosis. See a dermatologist for confirmation.)

Do NOT use headings, colons, or labels. No empathy statements.
"""
        response = await model.generate_content_async(prompt)
        # No label parsing, just pass the text (and for frontend, we'll also split off the recommendation)
        text_response = response.text.strip()

        # Try to extract the clinical recommendation sentence for frontend usage
        # (assume it's the sentence with "biopsy", "follow-up", "monitor", or ends before the parens)
        recommendation = ""
        import re
        match = re.search(r'([^.]*?(biopsy|follow[- ]?up|monitor|dermatologist)[^.]*\.)', text_response, re.I)
        if match:
            recommendation = match.group(1).strip()
        else:
            # fallback: grab the last sentence before any parentheses
            if "(" in text_response:
                main_text = text_response.split("(")[0]
                sentences = main_text.strip().split(". ")
                recommendation = sentences[-1].strip() + "."
            else:
                recommendation = ""

        return {"text": text_response, "recommendation": recommendation}
    except Exception:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Failed to generate AI explanation.")

@app.post("/api/speak")
async def text_to_speech(request: SpeakRequest):
    """Endpoint to convert text to speech using ElevenLabs."""
    # Placeholder for ElevenLabs API call
    print(f"--- Generating audio for text: '{request.text_to_speak[:30]}...' ---")
    return {"audioUrl": "/path/to/placeholder_audio.mp3"}

@app.post("/api/video-greeting")
async def get_video_greeting():
    """Endpoint to get a dynamic video greeting from Tavus."""
    # Placeholder for Tavus API call
    print("--- Generating video greeting ---")
    return {"videoUrl": "/path/to/placeholder_video.mp4"}

# ==============================================================================
# 6. Dermatologist Dashboard Endpoints (Supabase Integration)
# ==============================================================================

@app.post("/api/cases/submit")
async def submit_case_for_review(image: UploadFile = File(...)):
    """Patient-facing endpoint to submit a case for doctor review."""
    # Placeholder for Supabase integration
    print("Placeholder: A case would be submitted to Supabase here.")
    return {"status": "success", "caseId": np.random.randint(100, 999)}

@app.get("/api/cases")
async def get_cases_for_dashboard():
    """Doctor-facing endpoint to get all submitted cases."""
    # Placeholder for Supabase integration
    mock_cases = [
        {"id": 101, "prediction": "Melanoma", "confidence": 0.81, "status": "new", "submittedAt": "2025-06-26T10:00:00Z"},
        {"id": 102, "prediction": "Benign_Mole", "confidence": 0.99, "status": "reviewed", "submittedAt": "2025-06-26T09:30:00Z"}
    ]
    return mock_cases

@app.put("/api/cases/{case_id}/status")
async def update_case_status(case_id: int, request: CaseUpdateRequest):
    """Doctor-facing endpoint to update a case's status and notes."""
    # Placeholder for Supabase integration
    print(f"Placeholder: Case {case_id} status updated to {request.status} with notes: '{request.notes}'")
    return {"status": "success", "caseId": case_id, "newStatus": request.status}

# ==============================================================================
# 7. Root Endpoint
# ==============================================================================

@app.get("/")
def read_root():
    """Root endpoint for health checks."""
    return {"message": "DermaSense AI Backend is running."}

