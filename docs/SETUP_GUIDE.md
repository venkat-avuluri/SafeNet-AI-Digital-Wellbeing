# SafeNet – Setup & Installation Guide

Complete developer guide to configure, build, and run the SafeNet platform across Frontend, Backend, and Machine Learning services.

---

## 1. Prerequisites

Ensure the following runtimes are installed on your machine:

- **Node.js**: v18.0.0 or higher (v24+ recommended)
- **npm**: v9.0.0 or higher
- **Python**: v3.10 to v3.14
- **MongoDB**: Community Server v6.0+ or MongoDB Atlas connection URI

---

## 2. Repository Structure

```
SafeNet-AI-Digital-Wellbeing/
├── frontend/      # React.js + Vite + Tailwind CSS User Interface
├── backend/       # Node.js + Express + Mongoose REST API Server
├── ml-service/    # Python FastAPI + Scikit-learn Risk Prediction Microservice
├── docs/          # Technical & Architectural Documentation
├── .env.example   # Template for environment variables
└── README.md      # Primary project summary
```

---

## 3. Environment Configuration

Copy the example environment configuration into the backend directory:

```bash
# In the project root:
cp .env.example backend/.env
```

Ensure `backend/.env` contains the required values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/safenet
JWT_SECRET=safenet_super_secret_jwt_key_2026_dev
JWT_EXPIRE=30d
ML_SERVICE_URL=http://127.0.0.1:8000
```

---

## 4. Service-by-Service Setup

### Step 1: Python Machine Learning Microservice

1. Open a terminal and navigate to `ml-service`:
   ```bash
   cd ml-service
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. (Optional) Re-generate benchmark synthetic dataset and train candidate models:
   ```bash
   python data/generate_dataset.py
   python training/train.py
   ```

4. Start the FastAPI microservice:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *The ML service will be accessible at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.*

---

### Step 2: Database (MongoDB)

Ensure your MongoDB instance is running locally or provide a remote MongoDB Atlas URI in `backend/.env`.

To start MongoDB locally (Windows example):
```powershell
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath backend\data\db --port 27017 --bind_ip 127.0.0.1
```

---

### Step 3: Node.js Express Backend

1. In a new terminal, navigate to `backend`:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   *The backend will start on `http://localhost:5000`.*

---

### Step 4: React Vite Frontend

1. In another terminal, navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will launch at `http://localhost:5173`.*

---

## 5. Verification Checklist

1. Open `http://localhost:5173` in your browser.
2. Click **Get Started** or **Live Demo Sign In**.
3. In the Dashboard, click **Load 7-Day Demo Records** or use **+ Log Usage** to create manual records.
4. Navigate to **AI Risk Assessment** and click **Run Live AI Assessment** to verify real-time ML inference.
5. Visit **Analytics** to view Chart.js graphs and **Reports** to test CSV and JSON export.
