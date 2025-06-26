from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from keras.models import load_model
from PIL import Image
import numpy as np
from io import BytesIO
from keras.applications.efficientnet import preprocess_input
from x_ai import generate_gradcam, apply_heatmap_overlay

import base64
import cv2
import traceback

# Load model
model = load_model(
    r"C:\Users\yahya\Worlds-Largest-Hackathon-dermascan\models\main_b3_model.keras",
    compile=False
)

class_labels = [
    "Actinic Keratosis", "Basal Cell Carcinoma", "Benign Mole",
    "Dermatofibroma", "Melanoma", "Seborrheic Keratosis", "Vascular Lesion"
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/uploadImage")
async def upload_image(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        pil_image = Image.open(BytesIO(contents)).convert("RGB")
        pil_image = pil_image.resize((300, 300))

        # Prepare for model
        img_array = preprocess_input(np.array(pil_image))
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)[0]
        top2_indices = np.argsort(predictions)[-2:][::-1]
        top2_classes = [class_labels[i] for i in top2_indices]
        top2_confidences = [round(float(predictions[i]) * 100, 2) for i in top2_indices]

        # 🔥 Grad-CAM
        heatmap = generate_gradcam(img_array, model, "top_activation", class_index=top2_indices[0])
        original = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        overlay_img = apply_heatmap_overlay(original, heatmap)
        _, buffer = cv2.imencode('.jpg', overlay_img)
        heatmap_base64 = base64.b64encode(buffer).decode('utf-8')

        return JSONResponse(content={
            "heatmapImage": f"data:image/jpeg;base64,{heatmap_base64}",
            "image": base64.b64encode(contents).decode('utf-8'),
            "imageType": image.content_type,
            "top1": {
                "label": top2_classes[0],
                "confidence": top2_confidences[0]
            },
            "top2": {
                "label": top2_classes[1],
                "confidence": top2_confidences[1]
            },
            "riskLevel": classify_risk(top2_classes[0]),
            "description": f"Most likely: {top2_classes[0]}, next likely: {top2_classes[1]}",
            "recommendation": "Please consult a dermatologist for a professional diagnosis."
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={
            "top1": { "label": "unknown", "confidence": 0.0 },
            "top2": { "label": "unknown", "confidence": 0.0 },
            "riskLevel": "unknown",
            "description": "An error occurred while processing the image.",
            "recommendation": "Try again or upload a clearer image."
        })


def classify_risk(label: str) -> str:
    """ Return clinical severity based on condition name """
    label = label.lower()

    if "melanoma" in label:
        return "high"
    elif "basal cell carcinoma" in label or "actinic keratosis" in label:
        return "medium"
    elif "seborrheic keratosis" in label:
        return "low"
    else:
        return "low"
