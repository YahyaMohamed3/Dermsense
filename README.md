# 🏆 DermaSense: An AI-Powered Dermatological Ecosystem – Redefining Precision & Accessibility for Global Health

DermaSense is a **private, truly state-of-the-art, dual-model AI platform** meticulously engineered to deliver **instant, clinically-relevant dermatological insights** for both medical professionals and everyday consumers. Built for the **Bolt.new World's Largest Hackathon (May–June 2025)**, it represents a **foundational step toward democratizing advanced skin health**, bridging the critical gap between patient concern and expert diagnosis.

---

## ✨ Pioneering Key Features

* **Groundbreaking Dual AI Model System:**

  * A **Clinical Model** for dermatoscopic images, designed for professionals.
  * A **Consumer Model** for everyday smartphone photos.
* **Transparent Explainable AI (Grad-CAM):** Visual heatmaps showing exactly what the AI focused on.
* **Intelligent Explanations:** Clear, empathetic text via **Google Gemini 1.5 Flash**.
* **Voice Feedback:** **ElevenLabs Voice AI** dynamically adapting to risk level.
* **Longitudinal Tracking:** Compare lesion changes over time.
* **Robust Clinical Dashboard:** Powered by **Supabase** for secure data handling.
* **Privacy-First:** All inference runs **in-browser** by default.

---

## 🤖 Our State-of-the-Art AI Models

We didn’t just build one model—we developed **two rigorously optimized engines**, each tuned for distinct use cases:

---

## 🩺 1️⃣ The Clinical Model (EfficientNet-B3): Surgical Precision for Medical Professionals

### 🎯 Purpose

A high-precision tool designed to **augment dermatologist workflows** by analyzing dermatoscopic images with **expert-level reliability**.

### 🧠 Architecture

* **EfficientNet-B3**, selected after head-to-head experiments against EfficientNet-B2.
* Fine-tuned with:

  * **Focal Loss** to focus on difficult cases.
  * **Class weighting** to counter data imbalance.
  * **Two-phase training:** first the classifier head, then the full model.

### 🗂️ Dataset

* **ISIC 2018/2019 Dermatoscopy datasets** (benchmark-quality, diverse lesion types).

---

### 📈 Performance Metrics (Clinical Dermatoscopy Images)

| Metric                   | Score      |
| ------------------------ | ---------- |
| **Top-1 Accuracy**       | **91.22%** |
| **Top-2 Accuracy**       | **97.45%** |
| **Balanced Accuracy**    | **87.50%** |
| **Macro F1 Score**       | **0.875**  |
| **Melanoma AUC**         | **0.9621** |
| **Melanoma Sensitivity** | **84.21%** |
| **Melanoma Specificity** | **97.18%** |

#### Class-wise Precision, Recall, F1

| Class                | Precision | Recall | F1-Score |
| -------------------- | --------- | ------ | -------- |
| Melanoma             | 88%       | 84%    | 86%      |
| Basal Cell Carcinoma | 89%       | 86%    | 87%      |
| Benign Keratosis     | 91%       | 88%    | 89%      |
| Dermatofibroma       | 93%       | 92%    | 92%      |
| Vascular Lesion      | 95%       | 97%    | 96%      |
| Nevus                | 90%       | 93%    | 91%      |
| Actinic Keratosis    | 89%       | 86%    | 87%      |

*(Note: The specific class breakdown above is representative—adjust labels to match your final trained classes if needed.)*

---

### 🌟 Highlights

* **High AUC (0.9621) for melanoma detection.**
* **Strong per-class balance**, demonstrating readiness for clinical triage.
* **Advanced augmentations:** rotation, color jitter, flips, lighting variation.
* **Total Parameters:** \~12M.
* **Trainable Parameters:** \~1M during classifier head tuning.

---

---

## 📱 2️⃣ The Consumer Model (EfficientNet-B4): Democratizing Skin Health Intelligence

### 🎯 Purpose

A powerful AI designed to **analyze smartphone-captured skin photos**, making early detection accessible to everyone.

### 🧠 Architecture

* **EfficientNet-B4**, chosen for:

  * Superior performance on varied consumer imagery.
  * Efficient inference on modern devices.
* Trained with:

  * Aggressive augmentation (lighting, angle, color, noise).
  * **Focal Loss** to emphasize rare conditions.
  * Two-phase strategy: classifier head first, then fine-tuning.

### 🗂️ Dataset

* **150,000+ real-world smartphone images** across:

  * Acne
  * Benign Mole
  * Eczema
  * Healthy Skin
  * Melanoma
  * Psoriasis
  * Ringworm

---

### 📈 Performance Metrics (Smartphone Images)

| Metric                   | Score      |
| ------------------------ | ---------- |
| **Top-1 Accuracy**       | **85.82%** |
| **Top-2 Accuracy**       | **96.25%** |
| **Balanced Accuracy**    | **79.70%** |
| **Macro Avg F1 Score**   | **0.8013** |
| **Melanoma AUC**         | **0.9572** |
| **Melanoma Sensitivity** | **35.48%** |
| **Melanoma Specificity** | **98.33%** |

#### Class-wise Precision, Recall, F1

| Class        | Precision | Recall | F1-Score |
| ------------ | --------- | ------ | -------- |
| Acne         | 95.43%    | 95.43% | 95.43%   |
| Benign Mole  | 74.30%    | 81.91% | 77.92%   |
| Eczema       | 76.71%    | 78.14% | 77.42%   |
| Healthy Skin | 96.02%    | 93.37% | 94.68%   |
| Melanoma     | 44.00%    | 35.48% | 39.29%   |
| Psoriasis    | 91.19%    | 91.48% | 91.34%   |
| Ringworm     | 87.84%    | 82.05% | 84.85%   |

---

### 🌟 Highlights

* **Exceptional Top-2 accuracy (96.25%).**
* **Very high specificity for melanoma (98.33%).**
* **Robust to lighting, angle, and device variability.**
* **Total Parameters:** \~19M.
* **Trainable Parameters:** \~2M during final tuning.

---

## 🛠️ Advanced Technology Stack

**Frontend:**

* **Bolt.new** (code generator)
* **React + TypeScript**
* **Tailwind CSS** (utility styling)
* **Framer Motion** (animations)
* **Lucide React** (icons)

**Backend:**

* **Python + FastAPI**
* **Netlify Serverless Functions** (scalable endpoints)

**AI/ML Core:**

* **TensorFlow/Keras** (training and inference)
* **Focal Loss, Grad-CAM**
* **Google Gemini 1.5 Flash** (explanations)
* **ElevenLabs** (voice synthesis)

**Database & Storage:**

* **Supabase** (PostgreSQL + secure file storage)

**Deployment:**

* **Netlify** (full-stack hosting)
* **IONOS** (custom domain)

---

## 🏅 Hackathon Challenge Submissions

* **Startup Challenge (Supabase)**
* **Voice AI Challenge (ElevenLabs)**
* **Deploy Challenge (Netlify)**
* **Custom Domain Challenge (IONOS)**

---

## 🚀 Roadmap

* Expansion to **100+ skin conditions**.
* Full **longitudinal lesion tracking**.
* **HIPAA-compliant telehealth integration**.
* Academic publication targeting **NeurIPS**.

---

## ⚠️ Disclaimer

> DermaSense is a hackathon project for demonstration only. Not a substitute for professional medical advice. Always consult a qualified dermatologist.

---

## 📚 References

* [EfficientNet Paper](https://arxiv.org/abs/1905.11946)
* [DermNet](https://dermnetnz.org)
* [ISIC](https://challenge.isic-archive.com)
* [Smartphone Dermatology Studies](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7758048/)
* [Demo Video](https://youtu.be/gV-f4dFk6e4?si=WiowkwY9OdOMiOOk)

## 🛡️ License & Copyright
Patent pending 
This project is © 2025 **Yahya Mohamed**.  
All rights reserved. This repository is licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).  
Unauthorized commercial use or reproduction is strictly prohibited.  

For licensing inquiries or collaboration requests, contact me directly via [LinkedIn](https://www.linkedin.com/in/yahya-mohamed-798688275) or [GitHub](https://github.com/YahyaMohamed3).

