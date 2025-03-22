import google.generativeai as genai
from fastapi import FastAPI
from pydantic import BaseModel
import os
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI()


class Query(BaseModel):
    patient_description: str  # User enters a paragraph describing symptoms


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/chat")
async def chat_with_bot(query: Query):
    user_input = (f"A patient describes their condition as follows:\n\n"
                  f"{query.patient_description}\n\n"
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

    # Using Gemini 1.5 pro latest model to generate a response with a system prompt
    model = genai.GenerativeModel("gemini-1.5-pro-latest")

    system_prompt = (
        "You are a medical assistant that helps patients identify possible conditions and the appropriate medical specialist. "
        "Provide accurate and concise medical information, focusing on clarity and brevity. "
        "When recommending a clinician, choose only from the provided list.")

    # Combine system prompt and user input
    combined_prompt = f"{system_prompt}\n\n{user_input}"

    # Generate content with the correct method
    response = model.generate_content(combined_prompt)

    # Processing the response to structure it as JSON
    raw_text = response.text

    # Creating dictionary to store sections
    medical_advice = {
        "common_causes": "",
        "immediate_response": "",
        "further_tests": "",
        "seek_medical_attention": "",
        "prevention_tips": "",
        "Needed_Clinician": ""
    }

    # Mapping section names to dictionary keys
    section_mapping = {
        "Common Causes": "common_causes",
        "Immediate Response": "immediate_response",
        "Further Medical Tests": "further_tests",
        "When to Seek Immediate Medical Attention": "seek_medical_attention",
        "Prevention Tips": "prevention_tips",
        "Needed Clinician": "Needed_Clinician"
    }

    # Splitting the response by section headers
    sections = raw_text.split("\n\n")
    for section in sections:
        for title, key in section_mapping.items():
            if title in section:
                content = section.replace(f"{title}:", "").strip()
                content = re.sub(r'\*+', '', content).strip()
                medical_advice[key] = content
                break

    # Post-processing to clean up any responses
    for key in medical_advice:
        if medical_advice[key]:
            medical_advice[key] = re.sub(r'\*', '', medical_advice[key])

    return medical_advice


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)