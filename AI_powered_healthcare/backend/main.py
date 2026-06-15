from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import pandas as pd
import time

# Local imports
from ml_model import train_and_save_model, SYMPTOMS, DISEASES
from xai_engine import SymptomExplainer

app = FastAPI(title="Healthcare Symptom Analyser API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and explainer
MODEL = None
EXPLAINER = None

# Input schemas
class SymptomInput(BaseModel):
    symptoms: List[str]

@app.on_event("startup")
async def startup_event():
    global MODEL, EXPLAINER
    print("Training ML model on synthetic data...")
    # Train the model dynamically
    MODEL, background_data = train_and_save_model()
    
    print("Initializing SHAP Explainer...")
    EXPLAINER = SymptomExplainer(MODEL, background_data)
    print("Backend ready!")

@app.get("/api/symptoms")
async def get_symptoms():
    return {"symptoms": SYMPTOMS}

@app.post("/api/analyze")
async def analyze_symptoms(request: SymptomInput):
    if not MODEL:
        raise HTTPException(status_code=503, detail="Model is still loading...")
        
    # Create the feature vector
    row = {s: 1 if s in request.symptoms else 0 for s in SYMPTOMS}
    df_input = pd.DataFrame([row], columns=SYMPTOMS)
    
    # Run prediction
    try:
        prediction_val = MODEL.predict(df_input)[0]
        probabilities = MODEL.predict_proba(df_input)[0]
        confidence = float(max(probabilities))
        
        disease_info = DISEASES.get(prediction_val, {"name": "Unknown", "severity": "Unknown"})
        
        # Get Explanation
        explanations = EXPLAINER.explain_prediction(df_input, SYMPTOMS)
        
        # Calculate % relative contributions for the frontend
        total_abs_contribution = sum(abs(x["contribution"]) for x in explanations)
        formatted_explanation = []
        for e in explanations:
            percentage = (abs(e["contribution"]) / total_abs_contribution * 100) if total_abs_contribution > 0 else 0
            formatted_explanation.append({
                "feature": e["feature"].replace("_", " ").title(),
                "percentage": round(percentage, 1),
                "impact": e["impact"]
            })
        
        # Simulate slight network delay to show off beautiful UI loading animations
        time.sleep(1.5)
        
        return {
            "disease": disease_info["name"],
            "severity": disease_info["severity"],
            "confidence": round(confidence * 100, 1),
            "explanation": formatted_explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
