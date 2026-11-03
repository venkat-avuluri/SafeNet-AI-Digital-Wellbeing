"""
SafeNet - FastAPI Machine Learning Prediction Service
=====================================================
Provides real-time digital wellbeing risk assessment endpoints for the Node.js backend.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Ensure local imports work reliably
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from api.schemas import (
    DigitalUsageInput,
    PredictionResponse,
    AnalysisRequest,
    HealthResponse
)
from api.model_loader import model_manager

app = FastAPI(
    title="SafeNet AI - Digital Wellbeing Risk Assessment API",
    description="Machine Learning service for habit risk evaluation and explainable digital wellbeing insights.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
def root_status():
    return {
        "service": "SafeNet AI ML Service",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/health"
    }

@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
def get_health():
    """
    Health check endpoint reporting model status, feature count, and synthetic notice.
    """
    return HealthResponse(
        status="healthy",
        service="safenet-ml-service",
        version="1.0.0",
        model_loaded=model_manager.is_loaded,
        model_name=model_manager.model_name or "HeuristicFallbackEngine",
        features_count=len(model_manager.feature_names) if model_manager.feature_names else 13,
        synthetic_notice="Trained on synthetic behavioral benchmark data for digital wellbeing habit analysis."
    )

@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
def predict_risk(usage: DigitalUsageInput):
    """
    Single digital usage risk assessment using the trained Machine Learning classifier.
    """
    try:
        input_data = usage.model_dump()
        result = model_manager.predict(input_data)
        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference processing error: {str(e)}"
        )

@app.post("/analyze", response_model=PredictionResponse, tags=["Inference"])
def analyze_user_trends(request: AnalysisRequest):
    """
    Comprehensive analysis endpoint for user historical screen-time patterns.
    """
    try:
        input_data = request.usage_data.model_dump()
        result = model_manager.predict(input_data)
        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis processing error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
