# Responsible AI in Arogya

Arogya AI is designed to empower patients and assist doctors by providing intelligent, data-driven insights. We prioritize transparency, privacy, and clinical safety in every AI-driven feature.

## 1. AI Models & Infrastructure
Arogya utilizes state-of-the-art Large Language Models (LLMs) via the **Groq Cloud** infrastructure for high-speed, low-latency medical reasoning.

*   **Primary Reasoning Model**: `llama-3.3-70b-versatile`
    *   Used for: Symptom analysis, recovery companionship, and complex medical report interpretation.
    *   Reason: Chosen for its high parameter count (70B) which ensures sophisticated medical logic and nuanced communication.
*   **Vision & OCR Model**: `llama-3.2-11b-vision-preview`
    *   Used for: Extracting text and medical markers from uploaded images of physical medical reports.
    *   Reason: Optimized for visual understanding and high-accuracy text extraction from clinical documents.

## 2. Data Sources & Extraction
The AI does not "guess"—it processes specific data provided by the user and their clinical history:
*   **User Inputs**: Daily check-ins, symptom descriptions, and pain levels.
*   **Clinical Documents**: Uploaded PDF and Image reports (e.g., blood work, discharge summaries).
*   **Platform History**: Historical trends in health data stored within the Arogya database.
*   **Extraction Method**: We use a hybrid approach of `pdfminer.six` for native PDF text and `Llama 3.2 Vision` for image-based reports, ensuring no data point is missed.

## 3. Integration Architecture
The AI is integrated as a core service within the Arogya ecosystem:
*   **Backend**: A dedicated Django `AI` application handles all requests to the Groq API. This layer sanitizes inputs and manages prompts to ensure consistent, safe responses.
*   **Frontend**: Real-time interaction through the **AI Health Suite**, featuring instant symptom feedback and a recovery chat companion that remembers user context.
*   **Security**: All data sent to AI models is encrypted in transit. We use stateless API calls to ensure patient data is processed but not stored as "training data" by external providers.

## 4. Accuracy & Clinical Safety
While Arogya AI provides high-accuracy insights, it is designed with "Human-in-the-Loop" principles:
*   **Accuracy**: By using 70B parameter models, we minimize hallucinations. The AI is grounded in the specific text extracted from the user's own reports.
*   **Doctor Verification**: All AI-extracted insights are presented to the patient's doctor for verification. The doctor remains the final authority on any diagnosis or medication change.
*   **Safety Disclaimers**: The AI is programmed to recognize "Emergency" markers (e.g., severe breathing difficulty) and immediately directs users to emergency services rather than providing text-based advice.

## 5. Ethical Considerations
*   **Transparency**: We clearly label all AI-generated content with the ✨ icon so users know when they are interacting with a model.
*   **Bias Mitigation**: We use diverse prompts that focus on clinical markers rather than demographic data to ensure equitable health insights for all users.
