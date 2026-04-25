"""
Gemini client — lazy singleton using the new google-genai SDK.
The old google.generativeai package is deprecated as of 2025.
"""

from google import genai
from google.genai import types

from app.core.config import settings

_client: genai.Client | None = None


def get_gemini_client() -> genai.Client | None:
    """Return a cached Gemini client, or None if no API key is configured."""
    global _client
    if _client is not None:
        return _client
    if not settings.gemini_api_key:
        return None
    _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


# Keep the old name so llm_triage.py can migrate smoothly
def get_gemini_model():
    """Deprecated alias — use get_gemini_client() instead."""
    return get_gemini_client()
