import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../models/care_state.dart';
import '../models/meal_plan.dart';

class GeminiMealService {
  static final String _apiKey = dotenv.env['GEMINI_API_KEY'] ?? '';

  static Future<MealPlan> generateMealPlan({
    required String ingredientsText,
    required String mealType,
    CareState? careState,
  }) async {
    if (_apiKey.isEmpty) {
      throw Exception('GEMINI_API_KEY is missing in .env');
    }

    final careSummary = careState?.summary ?? 'No active care state';
    final careCaution = careState?.caution ?? 'No active caution';

    final prompt = '''
You are generating a meal plan for a healthcare support app.

The app already determined the user’s current care context. Use that context to personalize the meal plan.
Do not provide medical advice.
Keep the output practical, concise, and easy to understand.

Meal type: $mealType
Ingredients available: $ingredientsText
Care summary: $careSummary
Care caution: $careCaution

Return valid JSON only with this exact structure:
{
  "title": "",
  "summary": "",
  "ingredientsUsed": [],
  "steps": [],
  "reason": ""
}
''';

    final response = await http.post(
      Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      ),
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': _apiKey,
      },
      body: jsonEncode({
        'contents': [
          {
            'parts': [
              {'text': prompt}
            ]
          }
        ]
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to generate meal plan: ${response.body}');
    }

    final decoded = jsonDecode(response.body);

    final content =
        decoded['candidates']?[0]?['content']?['parts']?[0]?['text'];

    if (content == null || content.toString().trim().isEmpty) {
      throw Exception('Gemini returned an empty response.');
    }

    final cleaned = _stripCodeFences(content.toString().trim());
    final Map<String, dynamic> mealJson = jsonDecode(cleaned);

    return MealPlan.fromJson(mealJson);
  }

  static String _stripCodeFences(String text) {
    var cleaned = text.trim();

    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replaceFirst('```json', '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replaceFirst('```', '').trim();
    }

    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3).trim();
    }

    return cleaned;
  }
}
