import os
import json
import PyPDF2
from groq import Groq
from django.conf import settings

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
    model = "llama-3.1-8b-instant"

    prompt = f"""
    You are a medical data extraction assistant. 
    Extract structured information from the following discharge report text.
    
    IMPORTANT: 
    - This is for information extraction only. 
    - DO NOT provide medical advice or a diagnosis.
    - If a field is not found, use "Not specified".

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