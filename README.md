# DermSense: AI-Powered Dermatological Diagnostic Platform

DermSense is a dual-model AI platform built to deliver clinically relevant dermatological insights for both medical professionals and everyday consumers. Developed for the Bolt.new World's Largest Hackathon (May–June 2025), the platform is designed around the principle that early, accurate skin health screening should not require a clinic visit.

---

## Overview

The platform features two independent AI models: a clinical model for dermatoscopic images used by medical professionals, and a consumer model for standard smartphone photos. Both models are supported by explainable AI (Grad-CAM heatmaps), natural language explanations via Gemini 1.5 Flash, and voice feedback via ElevenLabs. All inference runs in-browser by default.

---

## AI Models

### Clinical Model (EfficientNet-B3)

Designed to augment dermatologist workflows by analyzing dermatoscopic images with expert-level reliability.

**Architecture**

EfficientNet-B3, selected after head-to-head evaluation against EfficientNet-B2. Fine-tuned with Focal Loss for difficult cases, class weighting to address data imbalance, and a two-phase training strategy (classifier head first, then full model fine-tuning). Trained on the ISIC 2018/2019 dermatoscopy benchmark datasets.

**Performance**

| Metric | Score |
|---|---|
| Top-1 Accuracy | 91.22% |
| Top-2 Accuracy | 97.45% |
| Balanced Accuracy | 87.50% |
| Macro F1 Score | 0.875 |
| Melanoma AUC | 0.9621 |
| Melanoma Sensitivity | 84.21% |
| Melanoma Specificity | 97.18% |

**Per-Class Results**

| Class | Precision | Recall | F1 |
|---|---|---|---|
| Melanoma | 88% | 84% | 86% |
| Basal Cell Carcinoma | 89% | 86% | 87% |
| Benign Keratosis | 91% | 88% | 89% |
| Dermatofibroma | 93% | 92% | 92% |
| Vascular Lesion | 95% | 97% | 96% |
| Nevus | 90% | 93% | 91% |
| Actinic Keratosis | 89% | 86% | 87% |

Total parameters: ~12M. Trainable during head tuning: ~1M.

---

### Consumer Model (EfficientNet-B4)

Designed to analyze standard smartphone photos, making early detection accessible without specialized equipment.

**Architecture**

EfficientNet-B4, chosen for its performance on varied consumer imagery and efficient inference. Trained with aggressive augmentation (lighting, angle, color, noise), Focal Loss, and the same two-phase strategy as the clinical model. Dataset: 150,000+ real-world smartphone images across 7 classes.

**Performance**

| Metric | Score |
|---|---|
| Top-1 Accuracy | 85.82% |
| Top-2 Accuracy | 96.25% |
| Balanced Accuracy | 79.70% |
| Macro Avg F1 Score | 0.8013 |
| Melanoma AUC | 0.9572 |
| Melanoma Sensitivity | 35.48% |
| Melanoma Specificity | 98.33% |

**Per-Class Results**

| Class | Precision | Recall | F1 |
|---|---|---|---|
| Acne | 95.43% | 95.43% | 95.43% |
| Benign Mole | 74.30% | 81.91% | 77.92% |
| Eczema | 76.71% | 78.14% | 77.42% |
| Healthy Skin | 96.02% | 93.37% | 94.68% |
| Melanoma | 44.00% | 35.48% | 39.29% |
| Psoriasis | 91.19% | 91.48% | 91.34% |
| Ringworm | 87.84% | 82.05% | 84.85% |

Total parameters: ~19M. Trainable during final tuning: ~2M.

---

## Technology Stack

**Frontend:** React, TypeScript, Tailwind CSS, Framer Motion, Lucide React

**Backend:** Python, FastAPI, Docker

**AI/ML:** TensorFlow/Keras, Focal Loss, Grad-CAM, Google Gemini 1.5 Flash, ElevenLabs TTS

**Database & Storage:** Supabase (PostgreSQL + file storage)

**Deployment:** Google Cloud (backend + models), Netlify (frontend), IONOS (custom domain)

---

## Hackathon Submissions

Submitted to the following Bolt.new challenge tracks: Supabase Startup Challenge, ElevenLabs Voice AI Challenge, Netlify Deploy Challenge, IONOS Custom Domain Challenge.

---

## Demo

[Watch the demo](https://youtu.be/gV-f4dFk6e4?si=WiowkwY9OdOMiOOk)

---

## Roadmap

- Expansion to 100+ skin conditions
- Full longitudinal lesion tracking
- HIPAA-compliant telehealth integration
- Academic publication targeting NeurIPS

---

## References

- [EfficientNet Paper](https://arxiv.org/abs/1905.11946)
- [ISIC Challenge](https://challenge.isic-archive.com)
- [DermNet](https://dermnetnz.org)
- [Smartphone Dermatology Studies](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7758048/)

---

## License & Copyright

Patent pending. This project is © 2025 Yahya Mohamed. All rights reserved. Licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Unauthorized commercial use or reproduction is strictly prohibited.

For licensing inquiries or collaboration, contact via [LinkedIn](https://www.linkedin.com/in/yahya-mohamed-798688275) or [GitHub](https://github.com/YahyaMohamed3).

---

**Disclaimer:** DermSense is a research and demonstration project. It is not a substitute for professional medical advice. Always consult a qualified dermatologist.
