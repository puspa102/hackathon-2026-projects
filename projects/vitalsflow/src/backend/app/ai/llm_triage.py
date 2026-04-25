"""
LLM Triage Agent — calls Gemini to produce a TriageOutput from clinical summary + vitals.

Design rules:
- score_patient() NEVER raises — always returns a TriageOutput (fallback on any error)
- Uses the new google-genai SDK via get_gemini_client()
- Temperature 0.1 for minimal clinical variance
- Strips markdown fences before JSON parsing
"""

# Standard library
import json
import logging
import re

# Third-party
from google.genai import types

# Internal
from app.ai.client import get_gemini_client
from app.ai.prompts import build_triage_system_prompt, build_triage_user_message
from app.core.config import settings
from app.schemas.triage import News2Subscores, TriageOutput, VitalsInput

logger = logging.getLogger(__name__)

# Safe fallback returned when Gemini fails or returns unparseable output
_FALLBACK = TriageOutput(
    risk_score=0,
    news2_score=0,
    triage_tier="unknown",
    justification="Analysis unavailable. Manual assessment required.",
    suggested_actions=["Manual clinical assessment required"],
    subscores=None,
    missing_parameters=[],
    data_confidence="insufficient",
)


async def score_patient(clinical_summary: str, vitals: VitalsInput) -> TriageOutput:
    """
    Call Gemini to produce a TriageOutput for the given patient.

    Returns the safe _FALLBACK on ANY exception — callers never need to catch.
    """
    client = get_gemini_client()
    if client is None:
        logger.warning("Gemini client unavailable (no API key) — using fallback")
        return _FALLBACK

    system_prompt = build_triage_system_prompt()
    user_message = build_triage_user_message(clinical_summary, vitals)

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.1,
                max_output_tokens=512,
            ),
        )
        raw_text = response.text or ""
    except Exception as exc:
        logger.warning("Gemini API call failed: %s", exc)
        return _FALLBACK

    try:
        clean = _strip_fences(raw_text)
        data = json.loads(clean)
        return _parse_triage_output(data)
    except Exception as exc:
        logger.warning("LLM output parsing failed: %s | raw: %.200s", exc, raw_text)
        return _FALLBACK


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _strip_fences(text: str) -> str:
    """Remove ```json ... ``` markdown fences if present."""
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip())
    return cleaned.strip()


def _parse_triage_output(data: dict) -> TriageOutput:
    """
    Convert the raw LLM JSON dict into a TriageOutput.
    Clamps risk_score to [0, 10] for safety.
    """
    risk_score = max(0, min(10, int(data.get("risk_score", 0))))
    news2_score = max(0, int(data.get("news2_score", 0)))
    raw_tier = str(data.get("triage_tier", "unknown")).lower()

    # Normalise tier — LLM might return "high" but we expose 3 tiers
    triage_tier = raw_tier if raw_tier in {"critical", "urgent", "routine"} else "unknown"

    justification = str(data.get("justification", "")).strip() or _FALLBACK.justification
    actions = data.get("suggested_actions", [])
    if not isinstance(actions, list) or not actions:
        actions = _FALLBACK.suggested_actions

    return TriageOutput(
        risk_score=risk_score,
        news2_score=news2_score,
        triage_tier=triage_tier,  # type: ignore[arg-type]
        justification=justification,
        suggested_actions=[str(a) for a in actions],
        subscores=None,          # enriched by triage_service after deterministic pass
        missing_parameters=[],
        data_confidence="complete",
    )

