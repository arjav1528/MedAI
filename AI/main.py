from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai
import os
import re
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Configure Google Generative AI
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY not found in environment variables")

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientQuery(BaseModel):
    patient_description: str


@app.get("/")
async def root():
    return {"message": "Medical Assistant API is running"}


@app.post("/api/chat")
async def chat(query: PatientQuery):
    try:
        # Check if API key is configured
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="API key not configured")

        # Prepare prompt for Gemini
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

        return medical_advice

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Error handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


# For local development only - not used in Vercel
if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)
