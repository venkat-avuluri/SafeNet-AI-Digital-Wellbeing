"""
SafeNet - Synthetic Digital Wellbeing Dataset Generator
======================================================
NOTE: This script generates SYNTHETIC behavioral screen-time data explicitly created 
for development, research prototyping, and model evaluation of the SafeNet digital 
wellbeing risk classifier. It is NOT real clinical data and must NOT be used for 
medical diagnosis.
"""

import numpy as np
import pandas as pd
import os

def generate_synthetic_data(num_samples: int = 2400, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    
    samples_per_class = num_samples // 3
    data = []

    # 1. Low Risk Cluster (Balanced, healthy digital habits)
    for _ in range(samples_per_class):
        daily_screen_time_hours = np.clip(np.random.normal(3.0, 0.8), 0.8, 4.8)
        avg_session_mins = np.clip(np.random.normal(20.0, 6.0), 5.0, 38.0)
        sessions_per_day = int(np.clip(np.random.normal(25, 8), 6, 45))
        night_time_mins = np.clip(np.random.normal(18.0, 12.0), 0.0, 45.0)
        social_media_hours = np.clip(daily_screen_time_hours * np.random.uniform(0.15, 0.35), 0.1, 1.8)
        gaming_hours = np.clip(daily_screen_time_hours * np.random.uniform(0.05, 0.20), 0.0, 1.2)
        productive_hours = np.clip(daily_screen_time_hours * np.random.uniform(0.35, 0.65), 0.4, 3.5)
        entertainment_hours = np.clip(daily_screen_time_hours - (social_media_hours + gaming_hours + productive_hours), 0.0, 2.0)
        weekend_weekday_ratio = np.clip(np.random.normal(1.1, 0.2), 0.7, 1.5)
        break_frequency_per_day = int(np.clip(np.random.normal(8, 2), 3, 15))
        
        data.append({
            "daily_screen_time_hours": round(float(daily_screen_time_hours), 2),
            "avg_session_mins": round(float(avg_session_mins), 1),
            "sessions_per_day": sessions_per_day,
            "night_time_mins": round(float(night_time_mins), 1),
            "social_media_hours": round(float(social_media_hours), 2),
            "gaming_hours": round(float(gaming_hours), 2),
            "productive_hours": round(float(productive_hours), 2),
            "entertainment_hours": round(float(entertainment_hours), 2),
            "weekend_weekday_ratio": round(float(weekend_weekday_ratio), 2),
            "break_frequency_per_day": break_frequency_per_day,
            "risk_level": "Low Risk",
            "is_synthetic": 1
        })

    # 2. Moderate Risk Cluster (Elevated screen time, emerging late-night habits)
    for _ in range(samples_per_class):
        daily_screen_time_hours = np.clip(np.random.normal(5.8, 1.0), 4.2, 7.8)
        avg_session_mins = np.clip(np.random.normal(42.0, 10.0), 25.0, 68.0)
        sessions_per_day = int(np.clip(np.random.normal(52, 12), 30, 85))
        night_time_mins = np.clip(np.random.normal(65.0, 22.0), 30.0, 120.0)
        social_media_hours = np.clip(daily_screen_time_hours * np.random.uniform(0.35, 0.55), 1.4, 4.5)
        gaming_hours = np.clip(daily_screen_time_hours * np.random.uniform(0.10, 0.30), 0.2, 2.5)
        productive_hours = np.clip(daily_screen_time_hours * np.random.uniform(0.18, 0.38), 0.5, 2.5)
        entertainment_hours = np.clip(daily_screen_time_hours - (social_media_hours + gaming_hours + productive_hours), 0.0, 3.0)
        weekend_weekday_ratio = np.clip(np.random.normal(1.35, 0.25), 0.9, 2.0)
        break_frequency_per_day = int(np.clip(np.random.normal(4, 1.5), 1, 8))
        
        data.append({
            "daily_screen_time_hours": round(float(daily_screen_time_hours), 2),
            "avg_session_mins": round(float(avg_session_mins), 1),
            "sessions_per_day": sessions_per_day,
            "night_time_mins": round(float(night_time_mins), 1),
            "social_media_hours": round(float(social_media_hours), 2),
            "gaming_hours": round(float(gaming_hours), 2),
            "productive_hours": round(float(productive_hours), 2),
            "entertainment_hours": round(float(entertainment_hours), 2),
            "weekend_weekday_ratio": round(float(weekend_weekday_ratio), 2),
            "break_frequency_per_day": break_frequency_per_day,
            "risk_level": "Moderate Risk",
            "is_synthetic": 1
        })

    # 3. High Risk Cluster (Excessive, late-night dependency, low productive balance)
    for _ in range(samples_per_class):
        daily_screen_time_hours = np.clip(np.random.normal(9.2, 1.4), 7.2, 14.0)
        avg_session_mins = np.clip(np.random.normal(78.0, 18.0), 50.0, 150.0)
        sessions_per_day = int(np.clip(np.random.normal(88, 18), 55, 140))
        night_time_mins = np.clip(np.random.normal(145.0, 38.0), 85.0, 260.0)
        social_media_hours = np.clip(daily_screen_time_hours * np.random.uniform(0.45, 0.70), 3.2, 8.5)
        gaming_hours = np.clip(daily_screen_time_hours * np.random.uniform(0.15, 0.40), 0.8, 5.0)
        productive_hours = np.clip(daily_screen_time_hours * np.random.uniform(0.08, 0.22), 0.2, 1.8)
        entertainment_hours = np.clip(daily_screen_time_hours - (social_media_hours + gaming_hours + productive_hours), 0.0, 4.5)
        weekend_weekday_ratio = np.clip(np.random.normal(1.6, 0.35), 1.0, 2.5)
        break_frequency_per_day = int(np.clip(np.random.normal(2, 1), 0, 5))
        
        data.append({
            "daily_screen_time_hours": round(float(daily_screen_time_hours), 2),
            "avg_session_mins": round(float(avg_session_mins), 1),
            "sessions_per_day": sessions_per_day,
            "night_time_mins": round(float(night_time_mins), 1),
            "social_media_hours": round(float(social_media_hours), 2),
            "gaming_hours": round(float(gaming_hours), 2),
            "productive_hours": round(float(productive_hours), 2),
            "entertainment_hours": round(float(entertainment_hours), 2),
            "weekend_weekday_ratio": round(float(weekend_weekday_ratio), 2),
            "break_frequency_per_day": break_frequency_per_day,
            "risk_level": "High Risk",
            "is_synthetic": 1
        })

    df = pd.DataFrame(data)
    # Shuffle
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    return df

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(out_dir, "digital_wellbeing_dataset.csv")
    df = generate_synthetic_data(num_samples=2400)
    df.to_csv(out_path, index=False)
    print(f"[OK] Generated {len(df)} synthetic records to {out_path}")
    print(df["risk_level"].value_counts())
