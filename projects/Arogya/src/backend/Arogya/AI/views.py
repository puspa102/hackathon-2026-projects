from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import extract_text_from_pdf, analyze_report_with_groq

class ExtractReportAPIView(APIView):
    """
    API View to handle PDF discharge report uploads and extraction via Groq.
    """
    def post(self, request):
        file = request.FILES.get("file")

        # 1. Basic Validation
        if not file:
            return Response(
                {"error": "No file provided", "details": "Please upload a PDF file using the 'file' key."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not file.name.lower().endswith(".pdf"):
            return Response(
                {"error": "Invalid file type", "details": "Only PDF files are accepted for report extraction."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 2. Extract text from PDF
            extracted_text = extract_text_from_pdf(file)
            
            if not extracted_text.strip():
                return Response(
                    {"error": "Empty PDF", "details": "The uploaded PDF contains no readable text."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 3. Analyze with Groq
            structured_data = analyze_report_with_groq(extracted_text)

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