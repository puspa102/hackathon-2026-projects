import os
import json
import base64
import PyPDF2
from groq import Groq
from django.conf import settings
from .prompts import SYMPTOM_ANALYSIS_PROMPT, CHAT_SYSTEM_PROMPT
from .utils import apply_safety_override

def extract_text_from_pdf(file):
    """
    Extracts text content from a PDF file using PyPDF2.
    """
    text = ""
    try:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
    except Exception as e:
        raise Exception(f"PDF extraction failed: {str(e)}")
    return text

def analyze_report_with_groq(text):
    """
    Sends extracted text to Groq for structured medical information extraction.
    Note: This is an information extraction tool, not a medical diagnosis.
    """
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    model = "llama-3.3-70b-versatile"

    prompt = f"""
    You are CareLoop, a soft, caring, and gentle recovery companion. 
    Your goal is to extract structured information from the following discharge report text with empathy and care.
    
    IMPORTANT: 
    - This is for information extraction only. 
    - DO NOT provide medical advice or a diagnosis.
    - If a field is not found, use "Not specified".
    - For the "summary" field, write a warm, nurturing, and reassuring 1-2 sentence summary of the report to comfort the patient.

    Extract the following fields in JSON format:
    - medicines (list of strings)
    - dosages (list of strings)
    - follow_up (string)
    - instructions (string)
    - warnings (string)
    - summary (string)

    Return ONLY the raw JSON object. Do not include any markdown or extra text.

    REPORT TEXT:
    {text}
    """

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        raw_content = response.choices[0].message.content
        return json.loads(raw_content)
    
    except json.JSONDecodeError:
        # Fallback JSON if parsing fails
        return {
            "medicines": [],
            "dosages": [],
            "follow_up": "Not specified",
            "instructions": "Error parsing instructions",
            "warnings": "Error parsing warnings",
            "summary": "The AI response could not be parsed into JSON."
        }
    except Exception as e:
        raise Exception(f"Groq analysis failed: {str(e)}")

def analyze_image_report_with_groq(image_file):
    """
    Uses Groq's Llama 4 vision model to extract structured data from an image of a medical report.
    """
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    model = "meta-llama/llama-4-scout-17b-16e-instruct"

    # Read and encode image
    image_content = image_file.read()
    base64_image = base64.b64encode(image_content).decode("utf-8")
    
    prompt = """
    You are CareLoop, a soft, caring, and gentle recovery companion. 
    Analyze this image of a medical discharge report and extract structured information with empathy and care.
    
    IMPORTANT: 
    - This is for information extraction only. 
    - DO NOT provide medical advice or a diagnosis.
    - If a field is not found, use "Not specified".
    - For the "summary" field, write a warm, nurturing, and reassuring 1-2 sentence summary of the report to comfort the patient.

    Extract the following fields in JSON format:
    - medicines (list of strings)
    - dosages (list of strings)
    - follow_up (string)
    - instructions (string)
    - warnings (string)
    - summary (string)

    Return ONLY the raw JSON object. Do not include any markdown or extra text.
    """

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{image_file.content_type};base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        raw_content = response.choices[0].message.content
        return json.loads(raw_content)
    except Exception as e:
        raise Exception(f"Vision analysis failed: {str(e)}")

def analyze_symptoms_with_groq(payload):
    """
    Analyzes patient symptoms using Groq and returns structured classification.
    """
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    model = "llama-3.3-70b-versatile"

    # Inject context into prompt
    other_symptoms = payload.get('other_symptoms') or []
    user_data = f"""
    Patient Symptoms:
    - Fever: {payload.get('fever')}/10
    - Pain Level: {payload.get('pain_level')}/10
    - Breathing: {payload.get('breathing')}
    - Other: {', '.join(other_symptoms)}
    - Notes: {payload.get('notes', 'None')}
    """

    messages = [
        {"role": "system", "content": SYMPTOM_ANALYSIS_PROMPT},
        {"role": "user", "content": user_data}
    ]

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Apply hard safety overrides
        result = apply_safety_override(result, payload)
        
        return result
    except Exception as e:
        raise Exception(f"Symptom analysis failed: {str(e)}")

def chat_with_groq(messages, patient_context=None):
    """
    Handles ongoing recovery chat using Groq.
    """
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    model = "llama-3.3-70b-versatile"

    system_content = CHAT_SYSTEM_PROMPT
    if patient_context:
        from .utils import build_patient_context_block
        system_content += build_patient_context_block(patient_context)

    # Format messages for Groq (Llama 3 usually expects role/content)
    # The serializer provides 'role' and 'parts' (Gemini style)
    formatted_messages = [{"role": "system", "content": system_content}]
    
    for msg in messages:
        role = "assistant" if msg["role"] == "model" else "user"
        content = " ".join(msg["parts"])
        formatted_messages.append({"role": role, "content": content})

    try:
        response = client.chat.completions.create(
            model=model,
            messages=formatted_messages,
            temperature=0.7,
        )
        
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Chat failed: {str(e)}")