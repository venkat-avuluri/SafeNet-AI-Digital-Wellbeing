# SafeNet – Machine Learning Pipeline Documentation

## 1. Machine Learning Overview & Problem Formulation

SafeNet's Machine Learning component addresses the problem of **multiclass digital wellbeing habit risk categorization**:
- **Target Variable**: `risk_level`
  - `Low Risk`: Balanced digital habits, healthy screen durations, minimal late-night disruption, high productivity ratio.
  - `Moderate Risk`: Elevated daily usage, emerging bedtime screen time, or high social media engagement without sufficient balance.
  - `High Risk`: Extended screen time (> 7-10 hours), prolonged single sessions, heavy nocturnal exposure (> 90 mins), high passive consumption.

> **CRITICAL ETHICAL & MEDICAL DISCLAIMER:**  
> SafeNet's machine learning model is an educational and behavioral awareness platform. It estimates statistical habit risks and does **NOT** provide medical, psychiatric, or addiction diagnoses.

---

## 2. Dataset Synthesis & Transparency Notice

In compliance with Phase 1 development requirements, a dedicated behavioral generator (`ml-service/data/generate_dataset.py`) creates **2,400 balanced synthetic samples** (800 Low Risk, 800 Moderate Risk, 800 High Risk).

- **Synthetic Notice**: Data is synthetically generated based on empirical distributions documented in digital wellbeing literature (e.g. Pew Research, sleep and blue-light screen studies).
- **No Fabrication of Real-World Claims**: Synthetic benchmark performance is not presented as clinical real-world human accuracy. Real human behavior entails substantial variance (e.g. knowledge workers requiring 8+ hours of screen time for occupational productivity).

---

## 3. Feature Engineering Pipeline

The raw inputs are transformed into a 13-dimensional feature space in `ml-service/preprocessing/pipeline.py`:

| Feature Name | Description | Type / Unit |
|---|---|---|
| `daily_screen_time_hours` | Total daily device usage | Continuous (Hours) |
| `avg_session_mins` | Mean continuous session duration | Continuous (Minutes) |
| `sessions_per_day` | Device unlock / app open frequency | Discrete Integer |
| `night_time_mins` | Screen time logged after 10:00 PM | Continuous (Minutes) |
| `social_media_hours` | Screen time on social networking apps | Continuous (Hours) |
| `gaming_hours` | Screen time on mobile/PC gaming | Continuous (Hours) |
| `productive_hours` | Time spent on work, code, or study | Continuous (Hours) |
| `entertainment_hours` | Streaming, videos, and media | Continuous (Hours) |
| `weekend_weekday_ratio` | Ratio of weekend to weekday screen time | Ratio (Float) |
| `break_frequency_per_day` | Number of screen-free breaks taken | Discrete Integer |
| `social_ratio` | $\text{social\_media\_hours} / \text{daily\_screen\_time\_hours}$ | Ratio ($[0.0, 1.0]$) |
| `night_ratio` | $(\text{night\_time\_mins} / 60) / \text{daily\_screen\_time\_hours}$ | Ratio ($[0.0, 1.0]$) |
| `productivity_ratio` | $\text{productive\_hours} / \text{daily\_screen\_time\_hours}$ | Ratio ($[0.0, 1.0]$) |

---

## 4. Model Training & Comparison

The pipeline splits the 2,400 samples into **80% training (1,920 samples)** and **20% testing (480 samples)** using stratified splitting.

- **Data Leakage Prevention**: `StandardScaler` is fit **exclusively** on the training set, and applied as a transform to the test set and inference requests.

### Candidate Model Comparison Results

| Model Candidate | 5-Fold CV Macro F1 | Test Accuracy | Test Macro Precision | Test Macro Recall | Test Macro F1 |
|---|---|---|---|---|---|
| **Logistic Regression** (Selected) | **1.0000 (±0.00)** | **100.00%** | **1.0000** | **1.0000** | **1.0000** |
| Decision Tree (depth=5) | 0.9943 (±0.0038) | 99.58% | 0.9959 | 0.9958 | 0.9958 |
| Random Forest (n=100) | 1.0000 (±0.00) | 100.00% | 1.0000 | 1.0000 | 1.0000 |

### Confusion Matrix (Logistic Regression on Test Split)
```
               Predicted Low   Predicted Mod   Predicted High
Actual Low          160              0               0
Actual Mod            0            160               0
Actual High           0              0             160
```

---

## 5. Model Serialization & Packaging

The best model is serialized into `ml-service/models/wellbeing_risk_model.joblib` alongside:
- Fitted `StandardScaler`
- Feature column order
- Class labels
- Training timestamp and metadata

The detailed evaluation report is preserved in `ml-service/models/training_report.json`.

---

## 6. Real-Time Explainability & Factor Extraction

In `ml-service/api/model_loader.py`, predictions are augmented with:
1. **Calibrated Continuous Risk Score (0 - 100)**: Combines class probabilities with micro-adjustments for late night and prolonged sessions.
2. **Key Risk Drivers**: Identifies specific behavioral patterns (e.g. `Late-Night Screen Exposure > 60m`, `High Social Media Proportion > 3.5h`).
3. **Actionable Suggestions**: Sleep hygiene, Pomodoro intervals, and screen-free detox blocks.
