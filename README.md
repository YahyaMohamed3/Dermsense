# 🧴 DermaScan – AI-Powered Skin Cancer Detector & Explainer

DermaScan is a web-based AI application that allows users to upload a photo of a skin lesion and receive an instant risk classification — **Benign** or **Suspicious** — along with a simple, AI-generated explanation in natural language. It runs **entirely in-browser**, prioritizing **privacy**, **speed**, and **usability** with zero server-side image processing.

---

## 🚀 Overview

Skin cancer is one of the most common yet treatable cancers if caught early. DermaScan empowers individuals with **accessible, AI-powered pre-screening** directly in their browser — without needing to send personal images to any server. This tool combines image classification and large language model (LLM) explanation to make AI decisions understandable and trustworthy.

---

## 🧠 What It Does

1. **Image Upload**  
   Users drag and drop or upload a photo of a skin lesion.

2. **AI-Powered Risk Classification**  
   A TensorFlow.js model (or Hugging Face-hosted model) runs entirely in-browser to classify the lesion as either *Benign* or *Suspicious*.

3. **Plain English Explanation**  
   A small LLM (e.g., GPT-4 via API or a distilled open-source model) explains the classification in simple terms (e.g., _"irregular borders and uneven coloring are common signs of melanoma."_)

4. **Confidence Score & Disclaimers**  
   The model’s confidence level is displayed along with a clear disclaimer that it is not a substitute for professional diagnosis.

---

## 💡 Why It Matters

- **Privacy-First**: All inference is done locally in the browser.
- **Explainable AI**: Users don’t just get a result — they understand *why*.
- **Accessible**: No signup, no app download, and works on mobile.
- **Actionable Impact**: Early awareness = earlier checkups = lives saved.

---

## 🛠 Tech Stack

| Layer               | Tool / Framework                                                                 |
|---------------------|----------------------------------------------------------------------------------|
| **Frontend**        | [Bolt.new](https://bolt.new) (React-based)                                       |
| **Model Inference** | TensorFlow.js or Hugging Face model ([`Anwarkh1/Skin_Cancer-Image_Classification`](https://huggingface.co/Anwarkh1/Skin_Cancer-Image_Classification)) |
| **Explanation**     | GPT-4 (OpenAI API) or distilled open-source GPT model                            |
| **Deployment**      | Bolt.new live deploy with required badge                                         |
| **Utilities**       | GitHub, YouTube (for demo), Figma (optional for UI planning)                     |

---

## 🗓 Project Timeline

### ✅ Week 1–2: Capture → Score → Explain
- [ ] Setup project on Bolt.new with clean UI
- [ ] Integrate Hugging Face or TF.js model to run inference in-browser
- [ ] Build basic image upload pipeline and classification handler
- [ ] Add GPT prompt logic to generate explanation based on classification

### ✅ Week 3: Polish and Expand
- [ ] Improve UI/UX and add responsiveness (mobile-friendly)
- [ ] Display model confidence + disclaimers
- [ ] Error handling: corrupted files, unsupported formats, etc.
- [ ] Add helpful visual cues for better accessibility

### ✅ Week 4: Final Touches
- [ ] Add "Built with Bolt.new" badge and deployment polish
- [ ] Record <3 min demo video (show real-time usage)
- [ ] Complete GitHub repo with full documentation
- [ ] Submit final live link, video, and contribution log

---

## 🧪 Model Details

- **Model Source**: [Anwarkh1/Skin_Cancer-Image_Classification](https://huggingface.co/Anwarkh1/Skin_Cancer-Image_Classification)
- **Categories**: `benign`, `malignant` (can be mapped to “benign” and “suspicious”)
- **Inference**: Can be run using `transformers.js`, `ONNX.js`, or TensorFlow.js depending on compatibility
- **Alternative**: Train or fine-tune a MobileNetV2 or ResNet model using TensorFlow/Keras and convert to TF.js

---

## 🎯 Success Criteria

| Criteria             | Our Approach                                                                 |
|----------------------|------------------------------------------------------------------------------|
| **Potential Impact** | Early detection, privacy-first, medically relevant                          |
| **Technological Depth** | ML + LLM integration, full in-browser inference                           |
| **Design & UX**      | Clean, fast, mobile-ready, no friction onboarding                            |
| **Originality**      | Hybrid of healthcare + explainable AI                                        |

---

## 🎥 Demo Video (Coming Soon)
> 📌 Will demonstrate uploading an image, instant classification, explanation, and mobile use.

---

## ⚠️ Disclaimer

**DermaScan is not a diagnostic tool.** It is intended for educational and pre-screening purposes only. Users should consult with a certified dermatologist for any concerns.

---
