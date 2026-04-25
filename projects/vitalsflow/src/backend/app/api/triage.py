"""
Triage endpoints for score calculation and clinician approval writeback.
"""

from datetime import datetime, timezone
from uuid import uuid4

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
        print(f"[VitalsFlow] POST /triage/{patient_id} received")
        print(f"[VitalsFlow] vitals={vitals.model_dump()}")
        return await run_triage(patient_id, vitals)
    except RuntimeError as exc:
        msg = str(exc)
        if "not found" in msg.lower():
            raise HTTPException(status_code=404, detail=msg) from exc
        raise HTTPException(status_code=500, detail=f"Triage failed: {msg}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Triage failed: {exc}") from exc


@router.post("/{patient_id}/approve")
async def approve_action(patient_id: str, payload: dict) -> dict:
    """
    Draft a FHIR ServiceRequest for a clinician-approved action.

    The hackathon version returns the drafted resource and logs it server-side.
    Production would POST the draft back to the EHR/FHIR server.
    """
    try:
        print(f"[VitalsFlow] POST /triage/{patient_id}/approve received")
        print(f"[VitalsFlow] approve payload={payload}")
        action = str(payload.get("action", "")).strip()
        if not action:
            raise ValueError("action is required")

        justification = str(payload.get("justification", "")).strip()
        risk_score = int(payload.get("risk_score", 0))
        news2_score = int(payload.get("news2_score", 0))
        triage_tier = str(payload.get("triage_tier", "unknown")).strip().lower()
        priority = _priority_for_tier(triage_tier)

        service_request = {
            "resourceType": "ServiceRequest",
            "id": uuid4().hex,
            "status": "draft",
            "intent": "proposal",
            "priority": priority,
            "subject": {"reference": f"Patient/{patient_id}"},
            "code": {"text": action},
            "authoredOn": datetime.now(timezone.utc)
            .isoformat(timespec="seconds")
            .replace("+00:00", "Z"),
            "note": [
                {
                    "text": (
                        f"VitalsFlow AI suggested action: {action}. "
                        f"NEWS2 {news2_score}, risk {risk_score}/10, tier {triage_tier}. "
                        f"{justification or 'Clinician review recommended.'}"
                    ).strip()
                }
            ],
        }

        print(f"Drafted ServiceRequest for patient={patient_id} action={action}")
        return {
            "message": "ServiceRequest drafted",
            "patient_id": patient_id,
            "service_request": service_request,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"ServiceRequest draft failed: {exc}",
        ) from exc


def _priority_for_tier(tier: str) -> str:
    return {
        "critical": "stat",
        "urgent": "urgent",
        "routine": "routine",
    }.get(tier, "routine")

