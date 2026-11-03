"""
SafeNet ML Service - Model Loader & Inference Engine
====================================================
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from preprocessing.pipeline import raw_dict_to_feature_row, RISK_CLASSES

class MLModelManager:
    def __init__(self):
        self.bundle = None
        self.model = None
        self.scaler = None
        self.model_name = None
        self.feature_names = []
        self.classes = RISK_CLASSES
        self.is_loaded = False
        self._load_model()

    def _load_model(self):
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        model_path = os.path.join(base_dir, "models", "wellbeing_risk_model.joblib")
        
        if os.path.exists(model_path):
            try:
                self.bundle = joblib.load(model_path)
                self.model = self.bundle.get("model")
                self.scaler = self.bundle.get("scaler")
                self.model_name = self.bundle.get("model_name", "TrainedClassifier")
                self.feature_names = self.bundle.get("feature_names", [])
                self.classes = self.bundle.get("classes", RISK_CLASSES)
                self.is_loaded = True
                print(f"[OK] Successfully loaded {self.model_name} from {model_path}")
            except Exception as e:
                print(f"[WARN] Error loading model from {model_path}: {e}")
                self.is_loaded = False
        else:
            print(f"[WARN] Model file not found at {model_path}. Fallback heuristic will be used.")
            self.is_loaded = False

    def predict(self, input_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs ML prediction with explainable risk breakdown.
        """
        # Convert raw inputs to feature dataframe
        X_df = raw_dict_to_feature_row(input_dict)
        
        if self.is_loaded and self.model and self.scaler:
            try:
                X_scaled = self.scaler.transform(X_df)
                predicted_class = self.model.predict(X_scaled)[0]
                
                # Probabilities
                if hasattr(self.model, "predict_proba"):
                    proba_values = self.model.predict_proba(X_scaled)[0]
                    proba_dict = {
                        cls: round(float(prob), 4)
                        for cls, prob in zip(self.model.classes_, proba_values)
                    }
                    confidence = round(float(np.max(proba_values)), 4)
                else:
                    proba_dict = {cls: 1.0 if cls == predicted_class else 0.0 for cls in self.classes}
                    confidence = 0.95
            except Exception as e:
                print(f"[WARN] Prediction pipeline exception: {e}. Using rule-based fallback.")
                return self._fallback_inference(input_dict)
        else:
            return self._fallback_inference(input_dict)

        # Calculate calibrated 0-100 risk score
        risk_score = self._compute_risk_score(input_dict, predicted_class, proba_dict)
        key_factors = self._extract_risk_factors(input_dict)
        recommendations = self._generate_recommendations(predicted_class, input_dict, key_factors)

        return {
            "risk_level": predicted_class,
            "risk_score": risk_score,
            "confidence": confidence,
            "probabilities": proba_dict,
            "key_factors": key_factors,
            "recommendations": recommendations,
            "model_version": "1.0.0",
            "is_synthetic_model": True,
            "disclaimer": "This is an AI-assisted digital habit awareness assessment, NOT a clinical diagnosis or medical evaluation."
        }

    def _compute_risk_score(self, d: Dict[str, Any], risk_level: str, probs: Dict[str, float]) -> float:
        """
        Blends class probabilities with continuous habit indicators into a smooth 0-100 score.
        """
        screen_time = float(d.get("daily_screen_time_hours", 0))
        night_mins = float(d.get("night_time_mins", 0))
        social_hrs = float(d.get("social_media_hours", 0))
        
        # Base from probabilities
        high_p = probs.get("High Risk", 0.0)
        mod_p = probs.get("Moderate Risk", 0.0)
        low_p = probs.get("Low Risk", 0.0)
        
        base_score = (high_p * 85.0) + (mod_p * 50.0) + (low_p * 20.0)
        
        # Micro-adjustments based on specific habits
        bonus = 0.0
        if night_mins > 60:
            bonus += min((night_mins - 60) / 10.0, 10.0)
        if screen_time > 8:
            bonus += min((screen_time - 8) * 2.0, 10.0)
        if social_hrs > 4:
            bonus += min((social_hrs - 4) * 2.0, 5.0)

        score = np.clip(base_score + bonus, 5.0, 98.0)
        return round(float(score), 1)

    def _extract_risk_factors(self, d: Dict[str, Any]) -> List[Dict[str, str]]:
        factors = []
        screen_time = float(d.get("daily_screen_time_hours", 0))
        night_mins = float(d.get("night_time_mins", 0))
        social_hrs = float(d.get("social_media_hours", 0))
        session_mins = float(d.get("avg_session_mins", 0))
        productive_hrs = float(d.get("productive_hours", 0))

        if screen_time >= 7.0:
            factors.append({
                "factor": "Elevated Daily Screen Time",
                "impact": "HIGH",
                "description": f"Daily usage of {screen_time:.1f} hrs exceeds the recommended 4-6 hr balance threshold."
            })
        elif screen_time >= 5.0:
            factors.append({
                "factor": "Moderate Daily Screen Time",
                "impact": "MODERATE",
                "description": f"Daily usage of {screen_time:.1f} hrs indicates upper-middle digital engagement."
            })

        if night_mins >= 60:
            factors.append({
                "factor": "Late-Night Screen Exposure",
                "impact": "HIGH" if night_mins > 90 else "MODERATE",
                "description": f"{night_mins:.0f} mins of late-night screen time disrupts circadian rhythms and melatonin production."
            })

        if social_hrs >= 3.5:
            factors.append({
                "factor": "High Social Media Proportion",
                "impact": "HIGH" if social_hrs > 5.0 else "MODERATE",
                "description": f"{social_hrs:.1f} hrs spent on infinite-scroll feeds correlates with passive consumption fatigue."
            })

        if session_mins >= 60:
            factors.append({
                "factor": "Prolonged Uninterrupted Sessions",
                "impact": "MODERATE",
                "description": f"Average session of {session_mins:.0f} mins without regular ocular/physical breaks."
            })

        if screen_time > 4.0 and (productive_hrs / max(screen_time, 0.1)) < 0.20:
            factors.append({
                "factor": "Low Productivity Ratio",
                "impact": "MODERATE",
                "description": "Productive and educational apps make up less than 20% of your total device screen time."
            })

        if not factors:
            factors.append({
                "factor": "Balanced Digital Lifestyle",
                "impact": "LOW",
                "description": "Screen time, session lengths, and bedtime device usage are within healthy recommended bounds."
            })

        return factors

    def _generate_recommendations(self, risk_level: str, d: Dict[str, Any], factors: List[Dict[str, str]]) -> List[Dict[str, str]]:
        recs = []
        night_mins = float(d.get("night_time_mins", 0))
        social_hrs = float(d.get("social_media_hours", 0))
        session_mins = float(d.get("avg_session_mins", 0))

        if night_mins > 30:
            recs.append({
                "category": "Sleep Hygiene",
                "title": "Establish 30-Minute Digital Wind-Down",
                "action": "Enable 'Bedtime Mode' or place your device across the room starting at 10:00 PM.",
                "priority": "HIGH"
            })

        if social_hrs > 2.5:
            recs.append({
                "category": "Mindful Consumption",
                "title": "Set 45-Minute Social Media App Timers",
                "action": "Configure daily limits on feed apps to replace passive scrolling with intentional check-ins.",
                "priority": "HIGH" if social_hrs > 4.0 else "MODERATE"
            })

        if session_mins > 45:
            recs.append({
                "category": "Physical Health",
                "title": "Apply the 20-20-20 Eye Rest Rule",
                "action": "Every 20 minutes, look at an object 20 feet away for 20 seconds to prevent digital eye strain.",
                "priority": "MODERATE"
            })

        recs.append({
            "category": "Habit Optimization",
            "title": "Schedule Device-Free Focus Blocks",
            "action": "Dedicate two 60-minute blocks daily for deep work or offline hobbies without notifications.",
            "priority": "LOW" if risk_level == "Low Risk" else "MODERATE"
        })

        return recs

    def _fallback_inference(self, d: Dict[str, Any]) -> Dict[str, Any]:
        """
        Rule-based heuristic fallback if model file is temporarily unavailable.
        """
        screen_time = float(d.get("daily_screen_time_hours", 4.0))
        night_mins = float(d.get("night_time_mins", 20.0))
        social_hrs = float(d.get("social_media_hours", 1.5))

        if screen_time >= 7.5 or night_mins >= 90 or social_hrs >= 5.0:
            risk = "High Risk"
            score = 78.0
            probs = {"Low Risk": 0.05, "Moderate Risk": 0.25, "High Risk": 0.70}
        elif screen_time >= 4.5 or night_mins >= 40 or social_hrs >= 2.5:
            risk = "Moderate Risk"
            score = 52.0
            probs = {"Low Risk": 0.15, "Moderate Risk": 0.65, "High Risk": 0.20}
        else:
            risk = "Low Risk"
            score = 22.0
            probs = {"Low Risk": 0.75, "Moderate Risk": 0.20, "High Risk": 0.05}

        key_factors = self._extract_risk_factors(d)
        recs = self._generate_recommendations(risk, d, key_factors)

        return {
            "risk_level": risk,
            "risk_score": score,
            "confidence": 0.88,
            "probabilities": probs,
            "key_factors": key_factors,
            "recommendations": recs,
            "model_version": "1.0.0-fallback",
            "is_synthetic_model": True,
            "disclaimer": "This is an AI-assisted digital habit awareness assessment, NOT a clinical diagnosis or medical evaluation."
        }

model_manager = MLModelManager()
