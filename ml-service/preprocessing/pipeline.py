"""
SafeNet - Preprocessing Pipeline
================================
Encapsulates feature engineering, ratio computations, and scaling for ML inference and training.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List

FEATURE_COLUMNS = [
    "daily_screen_time_hours",
    "avg_session_mins",
    "sessions_per_day",
    "night_time_mins",
    "social_media_hours",
    "gaming_hours",
    "productive_hours",
    "entertainment_hours",
    "weekend_weekday_ratio",
    "break_frequency_per_day",
    "social_ratio",
    "night_ratio",
    "productivity_ratio"
]

RISK_CLASSES = ["Low Risk", "Moderate Risk", "High Risk"]

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes derived ratios and interaction terms safely.
    """
    df = df.copy()
    
    # Avoid division by zero
    screen_time = np.maximum(df["daily_screen_time_hours"].values, 0.1)
    
    # Ratios
    df["social_ratio"] = np.clip(df["social_media_hours"].values / screen_time, 0.0, 1.0)
    df["night_ratio"] = np.clip((df["night_time_mins"].values / 60.0) / screen_time, 0.0, 1.0)
    df["productivity_ratio"] = np.clip(df["productive_hours"].values / screen_time, 0.0, 1.0)
    
    return df[FEATURE_COLUMNS]

def raw_dict_to_feature_row(raw: Dict[str, Any]) -> pd.DataFrame:
    """
    Converts a single incoming dictionary/request into the expected DataFrame format.
    """
    data = {
        "daily_screen_time_hours": [float(raw.get("daily_screen_time_hours", 0.0))],
        "avg_session_mins": [float(raw.get("avg_session_mins", 0.0))],
        "sessions_per_day": [int(raw.get("sessions_per_day", 1))],
        "night_time_mins": [float(raw.get("night_time_mins", 0.0))],
        "social_media_hours": [float(raw.get("social_media_hours", 0.0))],
        "gaming_hours": [float(raw.get("gaming_hours", 0.0))],
        "productive_hours": [float(raw.get("productive_hours", 0.0))],
        "entertainment_hours": [float(raw.get("entertainment_hours", 0.0))],
        "weekend_weekday_ratio": [float(raw.get("weekend_weekday_ratio", 1.0))],
        "break_frequency_per_day": [int(raw.get("break_frequency_per_day", 3))]
    }
    df = pd.DataFrame(data)
    return engineer_features(df)
