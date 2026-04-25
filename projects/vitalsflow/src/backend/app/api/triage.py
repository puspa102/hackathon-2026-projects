from fastapi import APIRouter, HTTPException

from app.schemas.triage import TriageOutput, VitalsInput
from app.services.triage_service import run_triage

router = APIRouter()


@router.post("/{patient_id}", response_model=TriageOutput)
async def triage(patient_id: str, vitals: VitalsInput) -> TriageOutput:
    """
    Run AI triage for a patient with current vitals.

    Fetches FHIR data from HAPI server, normalizes, calls Gemini,
    and returns a rich TriageOutput including deterministic NEWS2 subscores.
    """
    try:
        return await run_triage(patient_id, vitals)
    except RuntimeError as exc:
        msg = str(exc)
        if "not found" in msg.lower():
            raise HTTPException(status_code=404, detail=msg) from exc
        raise HTTPException(status_code=500, detail=f"Triage failed: {msg}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Triage failed: {exc}") from exc

