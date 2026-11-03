# SafeNet – Full-Stack Project Architecture

## 1. System Overview

SafeNet is an AI-powered digital wellbeing full-stack platform built to analyze user screen-time habits, evaluate digital dependency risk levels, and deliver personalized, explainable recommendations.

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React.js + Vite)"]
        UI["SPA Interface (Tailwind CSS)"]
        Charts["Chart.js & react-chartjs-2"]
        AuthContext["Auth Context & JWT Store"]
    end

    subgraph Backend ["Backend API Layer (Node.js + Express)"]
        Routes["REST API Routes (/api/*)"]
        AuthMW["JWT Auth Middleware"]
        Controllers["Controllers (Auth, Usage, Analytics, ML, Recs, Reports)"]
        Services["Services (Analytics Engine, ML Client, Rec Engine)"]
    end

    subgraph Database ["Persistence Layer (MongoDB)"]
        MUsers[("Users Collection")]
        MUsage[("UsageRecords Collection")]
        MRisk[("RiskAssessments Collection")]
        MRecs[("Recommendations Collection")]
    end

    subgraph MLService ["AI/ML Microservice (Python + FastAPI)"]
        FastAPI["FastAPI HTTP Server (:8000)"]
        Pipeline["Feature Engineering & Scaling Pipeline"]
        Model["Trained Scikit-Learn Classifier (.joblib)"]
        Explain["Explainability & Factor Extraction"]
    end

    UI -->|HTTP / REST + Bearer JWT| Routes
    Routes --> AuthMW --> Controllers
    Controllers --> Services
    Services -->|Mongoose Queries| Database
    Services -->|HTTP REST (:8000)| FastAPI
    FastAPI --> Pipeline --> Model --> Explain
    Explain -->|Prediction JSON| Services
```

---

## 2. Layer-by-Layer Architectural Breakdown

### 2.1 Client Layer (`frontend/`)
- **Technology**: React 18, Vite 6, Tailwind CSS, React Router v6, Chart.js 4, Lucide React.
- **State & Session Management**: Centralized `AuthContext` provides persistent session storage using local storage tokens and automatic interceptor-based authorization injection.
- **Visual Analytics**: Chart.js canvas components for stacked bar distributions, trend line trajectories with goal thresholds, category doughnuts, and horizontal app ranking bars.

### 2.2 Backend Service Layer (`backend/`)
- **Technology**: Node.js, Express.js 5, Mongoose 9, JWT, bcryptjs.
- **Security & Authorization**: User-level tenant isolation. Every data retrieval operation filters strictly by `req.user._id`, ensuring users cannot access or tamper with records from another account.
- **Analytics Aggregator**: `analyticsService.js` aggregates usage logs across arbitrary rolling windows (7, 14, 30 days) and computes category balances, late-night durations, and features for ML inference.
- **Fail-Safe ML Integration**: `mlClientService.js` connects via REST calls to the FastAPI microservice. If the Python service is offline, a built-in heuristic rule-based engine activates transparently to ensure 100% uninterrupted user workflow.

### 2.3 Data Persistence Layer (`backend/models/`)
- **MongoDB & Mongoose**:
  - `User`: Encrypted credentials (bcrypt 10 rounds), personalized daily goals, bedtime cutoffs, age brackets.
  - `UsageRecord`: Individual application usage logs (app name, category, duration, session length, time period, night flag, notes).
  - `RiskAssessment`: Historical AI assessments, confidence scores, probability distributions, evaluated input features, and explainability factors.
  - `Recommendation`: Actionable, dynamic behavioral guidance items with progress tracking (`isCompleted`).

### 2.4 Machine Learning Microservice (`ml-service/`)
- **Technology**: Python 3, FastAPI, Pydantic, Scikit-learn, Pandas, NumPy, Joblib.
- **Pipeline Structure**:
  - Raw usage metrics -> Feature engineering (social ratio, night ratio, productivity balance) -> Standard scaling -> Trained Classifier.
  - Serialized model bundle (`wellbeing_risk_model.joblib`) containing the fitted model, scaler, feature columns, and classes.
  - Endpoints: `GET /health`, `POST /predict`, `POST /analyze`.

---

## 3. Communication Contracts

| Origin | Target | Protocol | Payload Type |
|---|---|---|---|
| React Frontend | Express Backend | HTTP / REST | JSON (Bearer JWT in headers) |
| Express Backend | MongoDB | TCP (Mongoose Wire Protocol) | BSON |
| Express Backend | FastAPI ML Service | HTTP / REST | JSON (`DigitalUsageInput`) |

---

## 4. Security & Privacy Guarantees

1. **Password Protection**: Passwords are never stored in plaintext; salted and hashed via `bcryptjs` with a cost factor of 10.
2. **Stateless Authentication**: Signed JSON Web Tokens (JWT) with configurable expiration.
3. **Data Isolation**: All MongoDB queries (`find`, `findOne`, `create`, `deleteMany`) are scoped to the authenticated user ID.
4. **Transparent Ethics**: Model predictions are clearly labeled as educational digital wellbeing assessments and explicitly disclaim medical or psychiatric diagnoses.
