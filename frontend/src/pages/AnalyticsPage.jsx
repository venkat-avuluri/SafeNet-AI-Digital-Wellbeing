import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Layers,
  Clock,
  PieChart,
  Moon,
  Sparkles,
  Zap,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import ScreenTimeBarChart from '../components/charts/ScreenTimeBarChart';
import CategoryDoughnutChart from '../components/charts/CategoryDoughnutChart';
import WeeklyTrendLineChart from '../components/charts/WeeklyTrendLineChart';
import AppComparisonBarChart from '../components/charts/AppComparisonBarChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { analyticsService } from '../services/analyticsService';
import { formatMinutesToHoursAndMins } from '../utils/formatters';

const AnalyticsPage = () => {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (selectedDays) => {
    try {
      setLoading(true);
      const res = await analyticsService.getDetailed(selectedDays);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('[Analytics] Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Rendering deep wellbeing analytics..." />
      </div>
    );
  }

  const totalHours = data ? Number((data.totalPeriodMinutes / 60).toFixed(1)) : 0;
  const avgDailyHours = data ? Number((data.totalPeriodMinutes / (days * 60)).toFixed(1)) : 0;

  // Compute productive vs leisure ratio
  const categories = data?.categoryDistribution || {};
  const productiveMins = (categories['Productivity'] || 0) + (categories['Education'] || 0);
  const leisureMins = (categories['Social Media'] || 0) + (categories['Entertainment'] || 0) + (categories['Gaming'] || 0);
  const productivePct = data?.totalPeriodMinutes > 0 ? Math.round((productiveMins / data.totalPeriodMinutes) * 100) : 0;
  const leisurePct = data?.totalPeriodMinutes > 0 ? Math.round((leisureMins / data.totalPeriodMinutes) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Wellbeing Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Deep-dive into your screen time patterns, category balances, and time distributions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl self-start">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                days === d
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Window Screen Time</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalHours} Hours</span>
            <span className="text-xs text-slate-500">over {days} days</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Average</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{avgDailyHours} Hours / day</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productivity Balance</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">{productivePct}%</span>
            <span className="text-xs text-slate-500">Productive vs {leisurePct}% Leisure</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day-by-Day Screen Time Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Screen Time & Late Night Usage</h3>
              <p className="text-xs text-slate-400">Total duration broken down by night vs day</p>
            </div>
          </div>
          <ScreenTimeBarChart dailyData={data?.dailyTrends || []} />
        </div>

        {/* Weekly Trend Line */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Screen Time Fluctuation Trend</h3>
              <p className="text-xs text-slate-400">Trend trajectory compared against daily bounds</p>
            </div>
          </div>
          <WeeklyTrendLineChart dailyData={data?.dailyTrends || []} goalHours={4.0} />
        </div>

        {/* Category Share */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Breakdown</h3>
              <p className="text-xs text-slate-400">Distribution across lifestyle categories</p>
            </div>
          </div>
          <CategoryDoughnutChart categoryBreakdown={data?.categoryDistribution || {}} />
        </div>

        {/* App Rankings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Application Usage</h3>
              <p className="text-xs text-slate-400">Highest duration applications</p>
            </div>
          </div>
          <AppComparisonBarChart apps={data?.appComparison || []} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
