
import os
from groq import Groq
from django.conf import settings
from .prompts import SYMPTOM_CHECKER_PROMPT, REPORT_ANALYSIS_PROMPT, RECOVERY_CHAT_PROMPT, MEDICATION_EXTRACTION_PROMPT

class AIService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile" # Using a strong versatile model

    def analyze_symptoms(self, symptoms):
        prompt = SYMPTOM_CHECKER_PROMPT.format(symptoms=symptoms)
        try:
            completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful and caring medical assistant."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=1024,
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"Error analyzing symptoms: {str(e)}"

    def analyze_report(self, report_text=None, image_data=None):
        """
        Analyze report from text or image.
        image_data should be a base64 encoded string.
        """
        prompt = REPORT_ANALYSIS_PROMPT.format(report_text=report_text if report_text else "Provided Image")
        
        try:
            messages = [
                {"role": "system", "content": "You are a professional medical report analyzer."}
            ]
            
            if image_data:
                messages.append({
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            }
                        }
                    ]
                })
                model = "llama-3.2-11b-vision-preview"
            else:
                messages.append({"role": "user", "content": prompt})
                model = self.model

            completion = self.client.chat.completions.create(
                messages=messages,
                model=model,
                temperature=0.1,
                max_tokens=1024,
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"Error analyzing report: {str(e)}"

    def get_recovery_chat_response(self, condition, status, user_message, chat_history=[]):
        system_prompt = RECOVERY_CHAT_PROMPT.format(condition=condition, status=status)
        
        messages = [{"role": "system", "content": system_prompt}]
        for msg in chat_history:
            messages.append(msg)
        messages.append({"role": "user", "content": user_message})

        try:
            completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.8,
                max_tokens=512,
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"Error getting chat response: {str(e)}"
    def extract_text(self, file_path, file_type):
        """
        Extract text from file.
        file_type: 'image' or 'pdf'
        """
        if file_type == 'image':
            import base64
            with open(file_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
            
            try:
                completion = self.client.chat.completions.create(
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Extract all readable text from this medical report. Provide ONLY the extracted text without any commentary."},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{image_data}"
                                    }
                                }
                            ]
                        }
                    ],
                    model="llama-3.2-11b-vision-preview",
                    temperature=0.1,
                )
                return completion.choices[0].message.content
            except Exception as e:
                return f"Error extracting text from image: {str(e)}"
        
        elif file_type == 'pdf':
            try:
                from pdfminer.high_level import extract_text as pdf_extract
                return pdf_extract(file_path)
            except Exception as e:
                return f"Error extracting text from PDF: {str(e)}"
        
        return "Unsupported file type"

    def extract_medications(self, report_text):
        prompt = MEDICATION_EXTRACTION_PROMPT.format(report_text=report_text)
        try:
            completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a clinical pharmacist assistant."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.1,
            )
            import json
            content = completion.choices[0].message.content
            # Handle cases where model returns markdown JSON blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            data = json.loads(content.strip())
            return data if isinstance(data, list) else data.get("medications", [])
        except Exception as e:
            print(f"Medication extraction error: {e}")
            return []
