
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .services import AIService
import base64

class SymptomCheckView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        symptoms = request.data.get('symptoms')
        if not symptoms:
            return Response({"error": "Symptoms are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        ai_service = AIService()
        analysis = ai_service.analyze_symptoms(symptoms)
        return Response({"analysis": analysis}, status=status.HTTP_200_OK)

class ReportAnalysisView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        report_text = request.data.get('report_text')
        image_file = request.FILES.get('image')
        
        image_data = None
        if image_file:
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
        
        if not report_text and not image_data:
            return Response({"error": "Either report_text or image is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        ai_service = AIService()
        analysis = ai_service.analyze_report(report_text=report_text, image_data=image_data)
        return Response({"analysis": analysis}, status=status.HTTP_200_OK)

class RecoveryChatView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        condition = request.data.get('condition', 'General Recovery')
        status_info = request.data.get('status', 'Doing well')
        user_message = request.data.get('message')
        chat_history = request.data.get('history', [])
        
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        ai_service = AIService()
        response_text = ai_service.get_recovery_chat_response(
            condition=condition, 
            status=status_info, 
            user_message=user_message,
            chat_history=chat_history
        )
        return Response({"response": response_text}, status=status.HTTP_200_OK)
