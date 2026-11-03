import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Moon,
  Coffee,
  Shield,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';
import { recommendationService } from '../services/recommendationService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await recommendationService.getRecommendations();
      if (res.success) {
        setRecommendations(res.data);
      }
    } catch (err) {
      console.error('[Recommendations] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await recommendationService.toggleRecommendation(id);
      if (res.success && res.data) {
        setRecommendations((prev) =>
          prev.map((r) => (r._id === id ? res.data : r))
        );
      }
    } catch (err) {
      alert('Failed to update recommendation status.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Tailoring personal wellbeing guidance..." />
      </div>
    );
  }

  const filtered = recommendations.filter((r) => {
    if (filter === 'ACTIVE') return !r.isCompleted;
    if (filter === 'COMPLETED') return r.isCompleted;
    if (filter === 'HIGH') return r.priority === 'HIGH';
    return true;
  });

  const completedCount = recommendations.filter((r) => r.isCompleted).length;
  const progressPct = recommendations.length > 0 ? Math.round((completedCount / recommendations.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Personalized Recommendations</h2>
          <p className="text-xs text-slate-500 mt-1">
            Data-backed action items designed to improve sleep, focus, and digital intentionality.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl self-start">
          {['ALL', 'ACTIVE', 'HIGH', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filter === f
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Habit Completion Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-700">Habit Implementation Progress</span>
          <span className="text-xs font-extrabold text-indigo-600">
            {completedCount} of {recommendations.length} ({progressPct}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
          No recommendations found matching the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                item.isCompleted
                  ? 'bg-slate-50/60 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200/80 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      item.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : item.priority === 'MODERATE'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.priority} PRIORITY
                  </span>
                </div>

                <h3 className={`text-sm font-bold text-slate-900 ${item.isCompleted ? 'line-through text-slate-500' : ''}`}>
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {item.action}
                </p>

                {item.triggerReason && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-500 border border-slate-100">
                    <span className="font-semibold text-slate-700">Driver: </span>
                    {item.triggerReason}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {item.isCompleted ? 'Completed habit' : 'Pending practice'}
                </span>

                <button
                  onClick={() => handleToggle(item._id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    item.isCompleted
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {item.isCompleted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark as Done</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
