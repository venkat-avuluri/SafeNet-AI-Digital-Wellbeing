# SafeNet – REST API Documentation

This document describes all API endpoints provided by the **SafeNet Express Backend** (port 5000) and the **SafeNet FastAPI ML Service** (port 8000).

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new user account.
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secretpassword",
  "dailyScreenTimeGoalMinutes": 240,
  "ageGroup": "18-24"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "67...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "dailyScreenTimeGoalMinutes": 240,
    "nightTimeCutoff": "22:00",
    "ageGroup": "18-24"
  }
}
```

### `POST /api/auth/login`
Authenticates existing credentials.
- **Access**: Public
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "secretpassword"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { ... }
}
```

### `GET /api/auth/me`
Fetches current authenticated profile.
- **Access**: Private (Bearer JWT)
- **Response (200 OK)**: User profile object.

### `PUT /api/auth/profile`
Updates profile goals, bedtime cutoff, or age bracket.
- **Access**: Private (Bearer JWT)

### `PUT /api/auth/change-password`
Updates user account password.
- **Access**: Private (Bearer JWT)

---

## 2. Usage Tracking Endpoints (`/api/usage`)

### `POST /api/usage`
Logs a new application usage session.
- **Access**: Private (Bearer JWT)
- **Request Body**:
```json
{
  "appName": "Instagram",
  "category": "Social Media",
  "durationMinutes": 60,
  "sessionDurationMinutes": 45,
  "date": "2026-11-03",
  "timePeriod": "Evening",
  "isNightUsage": false,
  "notes": "Evening browsing"
}
```
- **Supported Categories**: `Social Media`, `Entertainment`, `Education`, `Productivity`, `Gaming`, `Communication`, `Others`

### `GET /api/usage`
Retrieves paginated usage logs for the authenticated user.
- **Access**: Private (Bearer JWT)
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 20)
  - `category` (optional)
  - `startDate` (optional: YYYY-MM-DD)
  - `endDate` (optional: YYYY-MM-DD)

### `DELETE /api/usage/:id`
Deletes a specific usage record owned by the user.

### `POST /api/usage/seed-demo`
Generates 7 days of realistic usage activity for rapid testing.

### `DELETE /api/usage/clear-all`
Clears all usage records belonging to the authenticated user.

---

## 3. Analytics Endpoints (`/api/analytics`)

### `GET /api/analytics/dashboard`
Returns high-level KPI metrics for the current day and past week:
- `todayScreenTimeMinutes` & `todayScreenTimeHours`
- `weeklyAverageMinutes`
- `todayNightMinutes`
- `goalPercentage` & `goalExceeded`
- `categoryBreakdown`
- `topApps`

### `GET /api/analytics/detailed?days=7`
Returns structured chart datasets:
- `dailyTrends`: Day-by-day timestamps, daytime minutes, and nighttime minutes.
- `categoryDistribution`: Aggregate minutes per category.
- `timePeriodDistribution`: Usage split across Morning, Afternoon, Evening, Night.
- `appComparison`: Top applications ranked by duration.

---

## 4. Machine Learning Endpoints (`/api/ml`)

### `POST /api/ml/assess`
Triggers an end-to-end evaluation:
1. Aggregates the user's recent screen-time activity.
2. Calls the FastAPI ML Service (`POST /predict`).
3. Stores the `RiskAssessment` in MongoDB.
4. Updates personalized recommendations.
- **Access**: Private (Bearer JWT)

### `POST /api/ml/simulate`
Allows What-If habit simulation with custom hypothetical features without modifying the user's permanent logs.
- **Request Body**: `DigitalUsageInput` object.

### `GET /api/ml/latest`
Returns the most recent risk assessment recorded for the user.

### `GET /api/ml/history`
Returns historical risk assessments.

### `GET /api/ml/status`
Checks connectivity and health of the Python FastAPI microservice.

---

## 5. Recommendation Endpoints (`/api/recommendations`)

### `GET /api/recommendations`
Returns tailored recommendations sorted by completion status and urgency.

### `PUT /api/recommendations/:id/toggle`
Toggles a recommendation between pending and completed.

---

## 6. Report Endpoints (`/api/reports`)

### `GET /api/reports/summary?days=30`
Generates an executive wellbeing summary covering the selected time window.

### `GET /api/reports/export?format=csv`
Downloads a formatted `.csv` file containing the user's historical records.

### `GET /api/reports/export?format=json`
Downloads raw records in structured JSON format.

---

## 7. Python FastAPI ML Service Endpoints (Port 8000)

### `GET /health`
Returns model status, loaded classifier name, and feature count.
```json
{
  "status": "healthy",
  "service": "safenet-ml-service",
  "version": "1.0.0",
  "model_loaded": true,
  "model_name": "LogisticRegression",
  "features_count": 13,
  "synthetic_notice": "Trained on synthetic behavioral benchmark data for digital wellbeing habit analysis."
}
```

### `POST /predict`
Infers digital habit risk from feature vector.
- **Request Body**:
```json
{
  "daily_screen_time_hours": 7.5,
  "avg_session_mins": 60,
  "sessions_per_day": 40,
  "night_time_mins": 90,
  "social_media_hours": 3.5,
  "gaming_hours": 1.0,
  "productive_hours": 1.5,
  "entertainment_hours": 1.5,
  "weekend_weekday_ratio": 1.3,
  "break_frequency_per_day": 3
}
```
- **Response (200 OK)**:
```json
{
  "risk_level": "Moderate Risk",
  "risk_score": 68.8,
  "confidence": 0.69,
  "probabilities": {
    "Low Risk": 0.05,
    "Moderate Risk": 0.69,
    "High Risk": 0.26
  },
  "key_factors": [ ... ],
  "recommendations": [ ... ],
  "model_version": "1.0.0",
  "is_synthetic_model": true,
  "disclaimer": "This is an AI-assisted digital habit awareness assessment, NOT a clinical diagnosis or medical evaluation."
}
```
