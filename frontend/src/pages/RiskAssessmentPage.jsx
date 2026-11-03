import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Info,
  Clock,
  Moon,
  Flame,
  ArrowRight
} from 'lucide-react';
import { mlService } from '../services/mlService';
import RiskBadge from '../components/common/RiskBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getRiskTheme } from '../utils/formatters';

const RiskAssessmentPage = () => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);

  // What-If Simulator state
  const [simScreenTime, setSimScreenTime] = useState(6.0);
  const [simSessionMins, setSimSessionMins] = useState(45);
  const [simNightMins, setSimNightMins] = useState(60);
  const [simSocialHours, setSimSocialHours] = useState(3.0);
  const [simProductiveHours, setSimProductiveHours] = useState(1.5);
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      const [latestRes, statusRes] = await Promise.all([
        mlService.getLatest(),
        mlService.getStatus()
      ]);

      if (latestRes.success && latestRes.data) {
        setAssessment(latestRes.data);
      }
      if (statusRes.success) {
        setServiceStatus(statusRes.data);
      }
    } catch (err) {
      console.error('[RiskAssessment] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  const handleRunAssessment = async () => {
    try {
      setEvaluating(true);
      const res = await mlService.triggerAssessment();
      if (res.success && res.data) {
        setAssessment(res.data);
      }
    } catch (err) {
      alert('Assessment failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setEvaluating(false);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      const res = await mlService.simulateAssessment({
        daily_screen_time_hours: parseFloat(simScreenTime),
        avg_session_mins: parseFloat(simSessionMins),
        night_time_mins: parseFloat(simNightMins),
        social_media_hours: parseFloat(simSocialHours),
        productive_hours: parseFloat(simProductiveHours),
        gaming_hours: 0.5,
        entertainment_hours: 1.0,
        sessions_per_day: 35
      });
      if (res.success && res.data) {
        setSimResult(res.data);
      }
    } catch (err) {
      console.error('[Simulator] Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Run initial simulation on mount
  useEffect(() => {
    handleRunSimulation();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Connecting to SafeNet Machine Learning engine..." />
      </div>
    );
  }

  const activeAssessment = assessment;
  const theme = getRiskTheme(activeAssessment?.riskLevel || 'Low Risk');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Risk Assessment</h2>
          <p className="text-xs text-slate-500 mt-1">
            Machine Learning evaluation classifying digital habit risk and identifying behavior drivers.
          </p>
        </div>

        <button
          onClick={handleRunAssessment}
          disabled={evaluating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer self-start"
        >
          <Sparkles className="w-4 h-4" />
          <span>{evaluating ? 'Analyzing Habits...' : 'Run Live AI Assessment'}</span>
        </button>
      </div>

      {/* Educational Non-Medical Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Transparent Machine Learning Disclosure:</span> This model assesses habit patterns (such as night-time screen time and social media duration) to encourage mindfulness. It is <strong>not</strong> a medical diagnosis. The model was trained on behavioral benchmark distributions using Scikit-learn.
        </div>
      </div>

      {/* Current Assessment Display */}
      {activeAssessment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Risk Score Card */}
          <div className={`lg:col-span-1 rounded-3xl border ${theme.border} ${theme.cardBg} p-7 flex flex-col justify-between shadow-xs`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Assessment
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                  {activeAssessment.source === 'fastapi_ml' ? 'FastAPI ML Model' : 'Heuristic Engine'}
                </span>
              </div>

              <div className="mt-6 text-center">
                <div className="inline-flex items-center justify-center p-6 rounded-full bg-white shadow-md border border-slate-100 mb-4">
                  <div className="text-center">
                    <span className="text-4xl font-black text-slate-900">{activeAssessment.riskScore}</span>
                    <span className="block text-[11px] font-bold text-slate-400">/ 100 Index</span>
                  </div>
                </div>

                <div className="flex justify-center mb-2">
                  <RiskBadge riskLevel={activeAssessment.riskLevel} size="lg" />
                </div>
                <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                  Confidence Score: {(activeAssessment.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Class Probabilities Bar */}
            <div className="mt-6 pt-4 border-t border-slate-200/60 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Probability Distribution
              </span>
              {activeAssessment.probabilities &&
                Object.entries(activeAssessment.probabilities).map(([cls, prob]) => (
                  <div key={cls} className="text-xs">
                    <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                      <span>{cls}</span>
                      <span>{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cls === 'High Risk'
                            ? 'bg-rose-500'
                            : cls === 'Moderate Risk'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(5, prob * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Key Risk Drivers & Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Drivers */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>Primary Risk Drivers Identified</span>
              </h3>

              <div className="space-y-3">
                {activeAssessment.keyFactors?.map((f, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start gap-3"
                  >
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${
                        f.impact === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : f.impact === 'MODERATE'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {f.impact} IMPACT
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{f.factor}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Features Evaluated */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Evaluated Feature Parameters</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Daily Screen Time</span>
                  <span className="text-sm font-bold text-slate-800">
                    {activeAssessment.inputFeatures?.dailyScreenTimeHours || 0}h
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Session</span>
                  <span className="text-sm font-bold text-slate-800">
                    {activeAssessment.inputFeatures?.avgSessionMins || 0}m
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Night Screen Time</span>
                  <span className="text-sm font-bold text-slate-800">
                    {activeAssessment.inputFeatures?.nightTimeMins || 0}m
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Social Media</span>
                  <span className="text-sm font-bold text-slate-800">
                    {activeAssessment.inputFeatures?.socialMediaHours || 0}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <BrainCircuit className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-900">No Assessment Recorded Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Click the button below to feed your recent screen time records into the SafeNet ML classifier.
          </p>
          <button
            onClick={handleRunAssessment}
            disabled={evaluating}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            {evaluating ? 'Analyzing...' : 'Run Assessment Now'}
          </button>
        </div>
      )}

      {/* Interactive What-If Habit Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Interactive Habit Risk Simulator (What-If Analysis)</h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Adjust the hypothetical parameters below to observe in real-time how habit changes alter the ML risk classification.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sliders */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Daily Screen Time: {simScreenTime} Hours</span>
                <span className="text-slate-400 font-normal">Range: 1h - 14h</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                step="0.5"
                value={simScreenTime}
                onChange={(e) => setSimScreenTime(e.target.value)}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Late-Night Usage (Past 10 PM): {simNightMins} Mins</span>
                <span className="text-slate-400 font-normal">Range: 0m - 240m</span>
              </div>
              <input
                type="range"
                min="0"
                max="240"
                step="15"
                value={simNightMins}
                onChange={(e) => setSimNightMins(e.target.value)}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Social Media Intake: {simSocialHours} Hours</span>
                <span className="text-slate-400 font-normal">Range: 0h - 8h</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={simSocialHours}
                onChange={(e) => setSimSocialHours(e.target.value)}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Average Session Length: {simSessionMins} Mins</span>
                <span className="text-slate-400 font-normal">Range: 10m - 120m</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={simSessionMins}
                onChange={(e) => setSimSessionMins(e.target.value)}
                className="w-full accent-indigo-600"
              />
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              {simulating ? 'Calculating...' : 'Recalculate Simulation'}
            </button>
          </div>

          {/* Simulator Output */}
          <div className="lg:col-span-1 bg-slate-50 rounded-2xl p-5 border border-slate-200/60 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                Simulated AI Output
              </span>

              {simResult ? (
                <div className="text-center py-4">
                  <div className="mb-2 flex justify-center">
                    <RiskBadge riskLevel={simResult.risk_level} size="lg" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mt-2">
                    {simResult.risk_score}
                    <span className="text-xs font-bold text-slate-400 ml-1">/ 100</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Confidence: {(simResult.confidence * 100).toFixed(0)}%
                  </p>

                  <div className="mt-4 text-left border-t border-slate-200/80 pt-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Top Factor:</span>
                    <p className="text-xs text-slate-700 font-medium">
                      {simResult.key_factors?.[0]?.description || 'Balanced habits.'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Loading simulation...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentPage;
