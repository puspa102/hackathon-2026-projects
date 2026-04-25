from fastapi import APIRouter, HTTPException
from src.api.models import SymptomRequest, SpecialtyResponse

router = APIRouter()

# --- MOCK DATA ---
# This mapping will be replaced by Person 3's core_logic function.
# For now, we use a hardcoded dictionary so the Frontend team
# can build the UI without waiting for the "Brain" to be ready.
# (Contract-Driven Development per context.md Section 5)
MOCK_SYMPTOM_MAP = {
    "headache": {"specialty": "Neurology", "confidence": 0.92},
    "chest pain": {"specialty": "Cardiology", "confidence": 0.95},
    "skin rash": {"specialty": "Dermatology", "confidence": 0.88},
    "back pain": {"specialty": "Orthopedics", "confidence": 0.85},
    "anxiety": {"specialty": "Psychiatry", "confidence": 0.90},
    "blurry vision": {"specialty": "Ophthalmology", "confidence": 0.87},
    "toothache": {"specialty": "Dentistry", "confidence": 0.93},
    "stomach ache": {"specialty": "Gastroenterology", "confidence": 0.89},
}

@router.post("/analyze", response_model=SpecialtyResponse)
async def analyze_symptoms(request: SymptomRequest):
    """
    AI Care Navigator: Takes a patient's symptom description and
    returns the recommended medical specialty.

    Currently uses mock data. Will be wired to:
    from src.core_logic.symptom_mapper import map_symptoms
    """
    # Normalize input to lowercase for matching
    symptom_key = request.symptoms.strip().lower()

    # Look up the symptom in the mock map
    result = MOCK_SYMPTOM_MAP.get(symptom_key)

    if not result:
        # Default fallback: route to General Practice
        return SpecialtyResponse(
            specialty="General Practice",
            confidence=0.50
        )

    return SpecialtyResponse(
        specialty=result["specialty"],
        confidence=result["confidence"]
    )
