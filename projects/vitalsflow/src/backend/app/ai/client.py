"""Gemini client — lazy singleton using google-generativeai."""

import google.generativeai as genai

from app.core.config import settings

_model: genai.GenerativeModel | None = None


def get_gemini_model() -> genai.GenerativeModel | None:
    """Return a cached Gemini model, or None if no API key is configured."""
    global _model
    if _model is not None:
        return _model
    if not settings.gemini_api_key:
        return None
    genai.configure(api_key=settings.gemini_api_key)
    _model = genai.GenerativeModel(settings.gemini_model)
    return _model
