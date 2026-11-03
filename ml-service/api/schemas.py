"""
SafeNet ML Service - Request and Response Pydantic Schemas
==========================================================
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class DigitalUsageInput(BaseModel):
    daily_screen_time_hours: float = Field(..., ge=0.0, le=24.0, description="Total daily screen time in hours")
    avg_session_mins: float = Field(..., ge=0.0, le=720.0, description="Average single session duration in minutes")
    sessions_per_day: int = Field(default=20, ge=1, le=500, description="Total session/unlock count per day")
    night_time_mins: float = Field(default=0.0, ge=0.0, le=720.0, description="Screen time after 10:00 PM in minutes")
    social_media_hours: float = Field(default=0.0, ge=0.0, le=24.0, description="Hours spent on social media apps")
    gaming_hours: float = Field(default=0.0, ge=0.0, le=24.0, description="Hours spent gaming")
    productive_hours: float = Field(default=0.0, ge=0.0, le=24.0, description="Hours spent on work/study/productivity")
    entertainment_hours: float = Field(default=0.0, ge=0.0, le=24.0, description="Hours spent streaming or on entertainment")
    weekend_weekday_ratio: float = Field(default=1.0, ge=0.1, le=5.0, description="Ratio of weekend screen time to weekday screen time")
    break_frequency_per_day: int = Field(default=4, ge=0, le=50, description="Number of designated screen-free breaks taken")

class RiskFactor(BaseModel):
    factor: str
    impact: str  # "HIGH", "MODERATE", "LOW"
    description: str

class RecommendationItem(BaseModel):
    category: str
    title: str
    action: str
    priority: str

class PredictionResponse(BaseModel):
    risk_level: str
    risk_score: float  # 0 to 100 scale
    confidence: float
    probabilities: Dict[str, float]
    key_factors: List[RiskFactor]
    recommendations: List[RecommendationItem]
    model_version: str
    is_synthetic_model: bool
    disclaimer: str

class AnalysisRequest(BaseModel):
    user_id: Optional[str] = None
    period_days: Optional[int] = 7
    usage_data: DigitalUsageInput

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model_loaded: bool
    model_name: Optional[str] = None
    features_count: int
    synthetic_notice: str
