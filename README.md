# 🏥 Arogya AI: Post-Discharge Health Companion

## 👥 Team Members
*   **Samikshya Karki** (Leader) - [@samikxya-karki](https://github.com/samikxya-karki)
*   **Aashish Kumar Shah** (Member) - [@Aashish-Kumar-Shah-091](https://github.com/Aashish-Kumar-Shah-091)
*   **Puspa Khadka** (Member) - [@puspa102](https://github.com/puspa102)
*   **Sulav Shrestha** (Member) - [@Prognoob01](https://github.com/prognoob01)

---

## 🚩 Problem Statement
After hospital discharge, patients often face a "Care Gap." Without 24/7 medical supervision, they struggle to:
*   Interpret complex medical jargon in their discharge summaries.
*   Adhere to strict medication schedules.
*   Recognize early warning signs of complications before they become emergencies.
*   Stay connected with their discharge doctors for follow-up care.

This lack of continuity leads to preventable complications, high patient anxiety, and increased hospital readmission rates.

---

## 💡 Solution Description
**Arogya** (Health) is an AI-powered ecosystem that serves as a bridge between clinical discharge and full recovery.

**Key Features:**
1.  **AI Report Analysis**: Instantly parses medical reports (PDF/Photos) using **Groq Llama 3.2 Vision** to extract key clinical markers and simplify terminology.
2.  **AI Symptom Checker & Chatbot**: A 24/7 interactive assistant that analyzes patient symptoms against their medical history to provide empathetic guidance and risk classification.
3.  **Proactive Monitoring**: Daily health check-ins that automatically escalate to doctors if emergency markers are detected.
4.  **Secure Care Circle**: Direct real-time messaging between patients and specialists for seamless follow-up.

---

## 🛠️ Tech Stack
*   **Frontend**: React Native (Expo), TypeScript, Expo Router, Material Icons.
*   **Backend**: Python, Django REST Framework, SQLite (Development).
*   **AI Engine**: Groq Llama 3.3 70B (Reasoning) & Llama 3.2 11B Vision (OCR/Image Analysis).
*   **Notifications**: Expo Notifications for automated medication reminders and alerts.
*   **UI/UX**: Custom Teal-themed Design System.

---

## 📥 Setup Instructions

### 1. Backend Setup
```bash
# Navigate to backend
cd projects/Arogya/src/backend/Arogya

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver
```

### 2. Frontend Setup
```bash
# Navigate to frontend
cd projects/Arogya/src/frontend

# Install dependencies
npm install

# Start Expo (Scan QR code with Expo Go app)
npx expo start
```

---

## 📺 Demo
*   **Screenshots**: [View Screen Mockups](./projects/Arogya/demo/screenshots/)
*   **Demo Video**: [Watch the Walkthrough](https://your-demo-link.com)

---

## 📄 License
This project is licensed under the MIT License.