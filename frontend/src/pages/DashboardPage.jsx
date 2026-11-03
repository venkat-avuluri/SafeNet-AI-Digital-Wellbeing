import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Clock,
  Moon,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import RiskBadge from '../components/common/RiskBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ScreenTimeBarChart from '../components/charts/ScreenTimeBarChart';
import CategoryDoughnutChart from '../components/charts/CategoryDoughnutChart';
import WeeklyTrendLineChart from '../components/charts/WeeklyTrendLineChart';
import AppComparisonBarChart from '../components/charts/AppComparisonBarChart';
import { analyticsService } from '../services/analyticsService';
import { mlService } from '../services/mlService';
import { usageService } from '../services/usageService';
import { formatMinutesToHoursAndMins, getCategoryColor } from '../utils/formatters';

const DashboardPage = () => {
  const { refreshTrigger, onRefresh } = useOutletContext() || {};
  const [summary, setSummary] = useState(null);
  const [detailed, setDetailed] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, detRes, mlRes] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getDetailed(7),
        mlService.getLatest()
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (detRes.success) setDetailed(detRes.data);
      if (mlRes.success) setLatestAssessment(mlRes.data);
    } catch (err) {
      console.error('[Dashboard] Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const handleSeedDemoData = async () => {
    try {
      setSeeding(true);
      await usageService.seedDemoData();
      setBannerMessage('Successfully loaded 7 days of realistic usage records into your account!');
      await fetchDashboardData();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to seed demo data: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading your digital wellbeing analytics..." />
      </div>
    );
  }

  const hasLogs = summary && summary.totalLogsCount > 0;
  const goalHours = summary ? (summary.dailyGoalMinutes / 60).toFixed(1) : 4.0;

  return (
    <div className="space-y-6">
      {/* Top Banner if user has 0 logs */}
      {!hasLogs && (
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shrink-0 shadow-md shadow-indigo-600/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Usage Log is Empty</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Start by logging your daily app usage, or seed realistic 7-day demo data to explore the AI models immediately.
              </p>
            </div>
          </div>
          <button
            onClick={handleSeedDemoData}
            disabled={seeding}
            className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {seeding ? 'Generating Data...' : 'Load 7-Day Demo Records'}
          </button>
        </div>
      )}

      {bannerMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl p-3 flex items-center justify-between">
          <span>{bannerMessage}</span>
          <button onClick={() => setBannerMessage('')} className="text-emerald-900 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Screen Time"
          value={formatMinutesToHoursAndMins(summary?.todayScreenTimeMinutes || 0)}
          subtitle={`Goal: ${goalHours}h / day (${summary?.goalPercentage || 0}% used)`}
          icon={Clock}
          color={summary?.goalExceeded ? 'rose' : 'indigo'}
        />

        <StatCard
          title="Weekly Daily Average"
          value={formatMinutesToHoursAndMins(summary?.weeklyAverageMinutes || 0)}
          subtitle={`Based on active logged days`}
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="Night-Time Usage Today"
          value={formatMinutesToHoursAndMins(summary?.todayNightMinutes || 0)}
          subtitle="Screen time past 10:00 PM"
          icon={Moon}
          color={summary?.todayNightMinutes > 60 ? 'rose' : 'amber'}
        />

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              AI Risk Index
            </span>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 ring-4 ring-violet-100">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <RiskBadge
                riskLevel={latestAssessment?.riskLevel || 'Low Risk'}
                size="md"
              />
              <span className="text-sm font-bold text-slate-700">
                {latestAssessment ? `${latestAssessment.riskScore}/100` : 'Not run yet'}
              </span>
            </div>
            <Link
              to="/assessment"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>Run fresh AI assessment</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Section: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Screen Time Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Screen Time Distribution</h3>
              <p className="text-xs text-slate-400">Daytime vs Late-Night Breakdown (Past 7 Days)</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Chart.js Bar
            </span>
          </div>
          <ScreenTimeBarChart dailyData={detailed?.dailyTrends || []} />
        </div>

        {/* Category Breakdown Doughnut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Share</h3>
              <p className="text-xs text-slate-400">Total usage by category</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Doughnut
            </span>
          </div>
          <CategoryDoughnutChart categoryBreakdown={detailed?.categoryDistribution || {}} />
        </div>
      </div>

      {/* Charts Section: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend vs Target Limit */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Trend vs Target</h3>
              <p className="text-xs text-slate-400">Comparing actual screen time against your daily limit</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Line Trend
            </span>
          </div>
          <WeeklyTrendLineChart dailyData={detailed?.dailyTrends || []} goalHours={Number(goalHours)} />
        </div>

        {/* Top Used Applications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Most-Used Applications</h3>
              <p className="text-xs text-slate-400">Screen hours by specific app</p>
            </div>
            <Link
              to="/history"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View Full History →
            </Link>
          </div>
          <AppComparisonBarChart apps={detailed?.appComparison || []} />
        </div>
      </div>

      {/* AI Recommendations Teaser Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recommended Next Actions</h3>
              <p className="text-xs text-slate-400">Tailored to your recent habit patterns</p>
            </div>
          </div>
          <Link
            to="/recommendations"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All Recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {latestAssessment?.recommendations?.slice(0, 2).map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  {rec.category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800">{rec.title}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.action}</p>
            </div>
          )) || (
            <p className="text-xs text-slate-400 py-4 col-span-2">
              Run an AI risk assessment to unlock personalized behavioral recommendations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
