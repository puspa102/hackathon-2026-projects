from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import (
    extract_text_from_pdf, 
    analyze_report_with_groq, 
    analyze_image_report_with_groq,
    analyze_symptoms_with_groq, 
    chat_with_groq
)
from .serializers import SymptomAnalysisSerializer, RecoveryChatSerializer

class AIRootView(APIView):
    """
    Index view for AI API.
    """
    def get(self, request):
        return Response({
            "message": "Welcome to CareLoop AI API",
            "endpoints": {
                "extract-report": "/api/ai/extract-report/ (POST: upload PDF or Image)",
                "symptom-analysis": "/api/ai/symptom-analysis/ (POST: analyze symptoms)",
                "chat": "/api/ai/chat/ (POST: converse with AI)"
            }
        })

class ExtractReportAPIView(APIView):
    """
    API View to handle PDF or Image discharge report uploads and extraction via Groq.
    """
    def get(self, request):
        return Response({
            "message": "This endpoint accepts POST requests with a PDF or Image file.",
            "usage": "POST /api/ai/extract-report/ with 'file' key in form-data."
        })

    def post(self, request):
        file = request.FILES.get("file")

        # 1. Basic Validation
        if not file:
            return Response(
                {"error": "No file provided", "details": "Please upload a PDF or Image file using the 'file' key."},
                status=status.HTTP_400_BAD_REQUEST
            )

        filename = file.name.lower()
        content_type = file.content_type.lower()
        
        is_pdf = filename.endswith(".pdf") or content_type == "application/pdf"
        is_image = any(filename.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]) or "image" in content_type

        if not (is_pdf or is_image):
            return Response(
                {"error": "Invalid file type", "details": "Only PDF and images (JPG, PNG, WEBP) are accepted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            if is_pdf:
                # 2a. Extract text from PDF
                extracted_text = extract_text_from_pdf(file)
                
                if not extracted_text.strip():
                    return Response(
                        {"error": "Empty PDF", "details": "The uploaded PDF contains no readable text."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # 3a. Analyze with Groq (Text)
                structured_data = analyze_report_with_groq(extracted_text)
            else:
                # 2b. Analyze with Groq (Vision)
                structured_data = analyze_image_report_with_groq(file)

            # 4. Return Response
            return Response(structured_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {
                    "error": "Failed to process report",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SymptomAnalysisAPIView(APIView):
    """
    API View to classify patient symptoms and provide guidance.
    """
    def get(self, request):
        return Response({
            "message": "This endpoint accepts POST requests with symptom data.",
            "fields": {
                "fever": "Integer (0-10)",
                "pain_level": "Integer (0-10)",
                "breathing": "Choice (none, mild, severe)",
                "other_symptoms": "List of strings (optional)",
                "notes": "String (optional)"
            }
        })

    def post(self, request):
        serializer = SymptomAnalysisSerializer(data=request.data)
        if serializer.is_valid():
            try:
                result = analyze_symptoms_with_groq(serializer.validated_data)
                return Response(result, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        print("Symptom Analysis Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecoveryChatAPIView(APIView):
    """
    API View for ongoing recovery chat with AI companion.
    """
    def get(self, request):
        return Response({
            "message": "This endpoint accepts POST requests for chat.",
            "usage": "POST /api/ai/chat/ with 'message' (string) or 'messages' (list of chat history)."
        })

    def post(self, request):
        serializer = RecoveryChatSerializer(data=request.data)
        if serializer.is_valid():
            try:
                messages = serializer.validated_data.get("messages", [])
                patient_context = serializer.validated_data.get("patient_context")
                
                # If a single 'message' is sent instead of history
                if not messages and "message" in serializer.validated_data:
                    messages = [{"role": "user", "parts": [serializer.validated_data["message"]]}]
                
                ai_response = chat_with_groq(messages, patient_context)
                return Response({"response": ai_response}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)