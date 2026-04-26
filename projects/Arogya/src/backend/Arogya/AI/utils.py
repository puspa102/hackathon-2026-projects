# AI/utils.py
# Utility/helper functions for CareLoop AI app

import json
import re
import base64


def clean_gemini_json(raw_text: str) -> dict:
    """
    Strips markdown code fences from Gemini response
    and parses clean JSON. Raises ValueError on failure.
    """
    cleaned = re.sub(r"^```json\s*|\s*```$", "", raw_text.strip(), flags=re.MULTILINE).strip()
    return json.loads(cleaned)


def encode_file_to_base64(file_bytes: bytes) -> str:
    """Encodes raw file bytes to base64 string for Gemini multimodal input."""
    return base64.b64encode(file_bytes).decode("utf-8")


def apply_safety_override(result: dict, payload: dict) -> dict:
    """
    Hard safety rule: force 'emergency' status if any critical
    symptom threshold is met, regardless of Gemini classification.
    """
    fever     = int(payload.get("fever", 0))
    pain      = int(payload.get("pain_level", 0))
    breathing = payload.get("breathing", "none")

    if breathing == "severe" or fever >= 8 or pain >= 9:
        result["status"]      = "emergency"
        result["seek_help"]   = True
        result["help_message"] = (
            "Your symptoms need immediate attention. "
            "Please contact your doctor or go to the nearest emergency room now."
        )
    return result


def validate_mime_type(content_type: str) -> str | None:
    """
    Returns a normalized MIME type for Gemini if the file type is allowed.
    Returns None if the file type is not supported.
    """
    ALLOWED = {
        "application/pdf": "application/pdf",
        "image/jpeg":      "image/jpeg",
        "image/jpg":       "image/jpeg",
        "image/png":       "image/png",
        "image/webp":      "image/webp",
    }
    return ALLOWED.get(content_type)


def build_patient_context_block(patient_context: dict) -> str:
    """
    Formats patient context dict into a readable string
    to inject into the Gemini chat system prompt.
    """
    if not patient_context:
        return ""

    medicines = patient_context.get("medicines", [])
    med_names = ", ".join(
        [m.get("name", "") for m in medicines if m.get("name")]
    ) or "not specified"

    return f"""
Patient context:
- Name       : {patient_context.get('patient_name', 'Patient')}
- Diagnosis  : {patient_context.get('diagnosis', 'unknown')}
- Discharged : {patient_context.get('discharge_date', 'recently')}
- Follow-up  : {patient_context.get('followup_date', 'not specified')}
- Medicines  : {med_names}
"""