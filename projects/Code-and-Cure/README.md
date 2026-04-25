Project Name - CureIT

Team Members - Prajan Manoj Kumar Rekha (PrajanManojKumarRekha), Eric Cariaga (eCarCodes), Jessica C O'Bonna (jessic-o), Shayan Ali (CodewithShayan456)

Problem Statement -
Access to timely care is often delayed when patients cannot instantly find available doctors in their preferred area or specialty. Many users want fast booking with a doctor they trust, while still having a fallback recommendation when their preferred choice is unavailable. At the same time, clinicians need a lightweight consultation workflow (chat or video) and structured documentation support without adding operational burden.

Solution -
CureIT is a prototype telehealth workflow platform focused on one clean end-to-end demo path:
- Patient enters symptoms (example: headache).
- System maps symptoms to a recommended specialty (example: Neurology) and can suggest nearby available doctors.
- Patient can choose and book a preferred doctor from any area if that doctor has availability.
- If the preferred doctor is unavailable, the system can recommend the next available option.
- Patient books a short 15-30 minute consultation slot for chat or video call.
- Doctor views appointment, runs a consultation simulation, and generates a structured SOAP note.
- SOAP note is converted into FHIR R4-style JSON for interoperable record formatting.

This project is a workflow/documentation prototype and is not a diagnostic tool. It is designed for hackathon speed with clear team boundaries across frontend, API, core logic, and database layers.

Tech Stack -
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- API Gateway: FastAPI, Pydantic
- Core Logic: Pure Python 3.12, dataclasses, deterministic rule-based processing
- Database: Supabase (PostgreSQL)
- Data Standard: FHIR R4 JSON (prototype output)
- Security/Compliance Approach: role-based route separation, mock auth for demo, HIPAA-aware handling principles in design