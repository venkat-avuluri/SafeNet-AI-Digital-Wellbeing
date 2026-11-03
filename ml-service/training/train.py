"""
SafeNet - Machine Learning Training & Model Selection Pipeline
=============================================================
Compares Logistic Regression, Decision Tree, and Random Forest Classifier.
Evaluates on an isolated test split (avoiding data leakage).
Serializes best model, scaler, and full diagnostic report.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    f1_score,
    precision_score,
    recall_score
)

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from preprocessing.pipeline import engineer_features, FEATURE_COLUMNS, RISK_CLASSES

def train_and_evaluate():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_path = os.path.join(base_dir, "data", "digital_wellbeing_dataset.csv")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}. Run generate_dataset.py first.")

    print(f"[*] Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"[*] Total dataset rows: {len(df)}")
    print(f"[*] Distribution:\n{df['risk_level'].value_counts()}")

    # 1. Feature Engineering
    X_raw = engineer_features(df)
    y = df["risk_level"].values

    # 2. Train/Test Split (80% train, 20% test, stratified)
    X_train_df, X_test_df, y_train, y_test = train_test_split(
        X_raw, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[*] Train set: {len(X_train_df)}, Test set: {len(X_test_df)}")

    # 3. Fit scaler ONLY on training data to avoid data leakage
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_df)
    X_test_scaled = scaler.transform(X_test_df)

    # 4. Define candidate models
    candidates = {
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
        "DecisionTree": DecisionTreeClassifier(max_depth=5, min_samples_leaf=10, random_state=42),
        "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    }

    results = {}
    best_model_name = None
    best_f1 = -1.0

    print("\n" + "=" * 60)
    print("MODEL COMPARISON & CROSS-VALIDATION")
    print("=" * 60)

    for name, model in candidates.items():
        # 5-fold cross validation on training set
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring="f1_macro")
        model.fit(X_train_scaled, y_train)
        
        y_pred = model.predict(X_test_scaled)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average="macro", zero_division=0)
        rec = recall_score(y_test, y_pred, average="macro", zero_division=0)
        f1 = f1_score(y_test, y_pred, average="macro")
        cm = confusion_matrix(y_test, y_pred, labels=RISK_CLASSES)
        cr = classification_report(y_test, y_pred, target_names=RISK_CLASSES, output_dict=True)

        results[name] = {
            "cv_macro_f1_mean": round(float(np.mean(cv_scores)), 4),
            "cv_macro_f1_std": round(float(np.std(cv_scores)), 4),
            "test_accuracy": round(float(acc), 4),
            "test_precision_macro": round(float(prec), 4),
            "test_recall_macro": round(float(rec), 4),
            "test_f1_macro": round(float(f1), 4),
            "confusion_matrix": cm.tolist(),
            "classification_report": cr
        }

        print(f"Model: {name}")
        print(f"  CV Macro F1 : {results[name]['cv_macro_f1_mean']} (+/- {results[name]['cv_macro_f1_std']})")
        print(f"  Test Accuracy: {results[name]['test_accuracy'] * 100:.2f}%")
        print(f"  Test F1 Macro: {results[name]['test_f1_macro']:.4f}")
        print(f"  Confusion Matrix:\n{cm}\n")

        if results[name]["test_f1_macro"] > best_f1:
            best_f1 = results[name]["test_f1_macro"]
            best_model_name = name

    print(f"[+] Selected Best Model: {best_model_name} with Test Macro F1: {best_f1:.4f}")
    selected_model = candidates[best_model_name]

    # Calculate Feature Importances / Coefficients if available
    feature_importance = {}
    if hasattr(selected_model, "feature_importances_"):
        for col, imp in zip(FEATURE_COLUMNS, selected_model.feature_importances_):
            feature_importance[col] = round(float(imp), 4)
    elif hasattr(selected_model, "coef_"):
        avg_coef = np.mean(np.abs(selected_model.coef_), axis=0)
        for col, imp in zip(FEATURE_COLUMNS, avg_coef):
            feature_importance[col] = round(float(imp), 4)

    # 5. Serialization Bundle
    bundle = {
        "model": selected_model,
        "model_name": best_model_name,
        "scaler": scaler,
        "feature_names": FEATURE_COLUMNS,
        "classes": RISK_CLASSES,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "is_synthetic_trained": True,
        "version": "1.0.0"
    }

    model_save_path = os.path.join(models_dir, "wellbeing_risk_model.joblib")
    joblib.dump(bundle, model_save_path)
    print(f"[OK] Model bundle saved to {model_save_path}")

    # 6. Save Training & Evaluation Report
    report = {
        "project": "SafeNet Digital Wellbeing Risk Assessment",
        "dataset_type": "Synthetic Behavioral Screen-Time Benchmark",
        "synthetic_notice": "Generated for algorithmic prototyping and feature analysis. Not clinical or medical data.",
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "total_samples": len(df),
        "train_samples": len(X_train_df),
        "test_samples": len(X_test_df),
        "features_used": FEATURE_COLUMNS,
        "target_classes": RISK_CLASSES,
        "best_model": best_model_name,
        "feature_importance": feature_importance,
        "candidate_evaluations": results,
        "limitations": [
            "Trained on synthetic behavioral patterns reflecting screen time distributions.",
            "Must NOT be interpreted as psychiatric, medical, or clinical addiction diagnosis.",
            "Real-world behavioral patterns exhibit individual variances (e.g. software engineers have high productive screen time).",
            "Designed for educational digital wellbeing awareness and habit guidance."
        ]
    }

    report_save_path = os.path.join(models_dir, "training_report.json")
    with open(report_save_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"[OK] Training report saved to {report_save_path}")

if __name__ == "__main__":
    train_and_evaluate()
