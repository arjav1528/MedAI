from flask import Flask, request, jsonify
import google.generativeai as genai
import os
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Configure Google Generative AI
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY not found in environment variables")

# Initialize Flask app
app = Flask(__name__)


@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Medical Assistant API is running"})


@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Get JSON data from request
        data = request.get_json()

        if not data or 'patient_description' not in data:
            return jsonify({"error": "Missing patient_description in request"}), 400

        patient_description = data['patient_description']

        # Check if API key is configured
        if not GEMINI_API_KEY:
            return jsonify({"error": "API key not configured"}), 500

        # Prepare prompt for Gemini
        user_input = (f"A patient describes their condition as follows:\n\n"
                      f"{patient_description}\n\n"
                      "For each of the following categories, provide a concise paragraph (maximum 50 words each) "
                      "about the patient's condition:\n\n"
                      "1. Common Causes: Summarize the most likely medical conditions responsible for these symptoms.\n"
                      "2. Immediate Response: Briefly describe home care measures that could help.\n"
                      "3. Further Medical Tests: Mention any relevant diagnostic tests in a short paragraph.\n"
                      "4. When to Seek Immediate Medical Attention: Concisely describe warning signs requiring urgent care.\n"
                      "5. Prevention Tips: Briefly explain how to reduce risk of similar issues.\n"
                      "6. Needed Clinician: from this list of specialisations (Andrologist, Cardiologist, Dermatologist, Gastroenterologist, Pulmonologist, Nephrologist, Hepatologist, Rheumatologist, Endocrinologist, Neurologist, Ophthalmologist, Otolaryngologist (ENT) ,Urologist, General Practitioner (GP) ,Pediatrician) which one is the most is the most appropriate to treat this patient, give a single word answer for this section."
                      "For each category, provide only one short paragraph with no bullet points or asterisks. Keep each paragraph "
                      "under 50 words. Label each paragraph with its category.")

        # System prompt for Gemini
        system_prompt = (
            "You are a medical assistant that helps patients identify possible conditions and the appropriate medical specialist. "
            "Provide accurate and concise medical information, focusing on clarity and brevity. "
            "When recommending a clinician, choose only from the provided list.")

        # Combine system prompt and user input
        combined_prompt = f"{system_prompt}\n\n{user_input}"

        # Generate content using Gemini
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(combined_prompt)

        # Extract text from response
        raw_text = response.text

        # Parse response into structured format
        medical_advice = {
            "common_causes": "",
            "immediate_response": "",
            "further_tests": "",
            "seek_medical_attention": "",
            "prevention_tips": "",
            "needed_clinician": ""
        }

        # Mapping section names to dictionary keys
        section_mapping = {
            "Common Causes": "common_causes",
            "Immediate Response": "immediate_response",
            "Further Medical Tests": "further_tests",
            "When to Seek Immediate Medical Attention": "seek_medical_attention",
            "Prevention Tips": "prevention_tips",
            "Needed Clinician": "needed_clinician"
        }

        # Split the response by sections and extract content
        sections = raw_text.split("\n\n")
        for section in sections:
            for title, key in section_mapping.items():
                if title in section:
                    content = section.replace(f"{title}:", "").strip()
                    content = re.sub(r'\*+', '', content).strip()
                    medical_advice[key] = content
                    break

        # Clean up responses
        for key in medical_advice:
            if medical_advice[key]:
                medical_advice[key] = re.sub(r'\*', '', medical_advice[key])

        return jsonify(medical_advice)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# For local development only - not used in Vercel
if __name__ == "__main__":
    app.run(debug=True)
