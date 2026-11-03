import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  BrainCircuit,
  BarChart3,
  Sparkles,
  ArrowRight,
  Clock,
  Moon,
  HeartPulse,
  Lock
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">SafeNet</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800/60 uppercase">
                AI Wellbeing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Machine Learning Powered Habit Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Master Your Screen Time with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
              AI-Driven Insight
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            SafeNet evaluates application screen time, late-night exposure, and session durations to classify digital habit risks and deliver explainable, actionable recommendations.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-600/40 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Start Tracking Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold rounded-2xl transition-all cursor-pointer"
            >
              Live Demo Sign In
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Private & Isolated Data
            </span>
            <span className="flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
              Trained Scikit-Learn Model
            </span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-slate-950/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Comprehensive Wellbeing Architecture
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Engineered end-to-end to empower you with awareness, metrics, and actionable habit shifts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Dimensional Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visualise screen time by category, application breakdown, and day-by-day trend line charts powered by Chart.js.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-violet-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-5">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">FastAPI Machine Learning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trained classifier evaluates habit patterns across 13 engineered features to estimate Low, Moderate, or High digital risk.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Explainable Coaching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clear recommendations connected directly to late-night screen time, high social media intake, and daily limit targets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Disclaimer Banner */}
      <section className="bg-indigo-950/40 border-y border-indigo-900/40 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>Digital Wellbeing & Awareness Advisory</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            SafeNet is an educational digital habit tracking and awareness platform. Assessments generated by the machine learning model represent statistical behavioural risk indicators and do <strong>NOT</strong> constitute medical, psychiatric, or clinical diagnoses.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>© 2026 SafeNet Platform – AI Digital Wellbeing System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
