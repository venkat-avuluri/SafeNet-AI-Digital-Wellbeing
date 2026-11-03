import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  Moon,
  Sparkles,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';
import { reportService } from '../services/reportService';
import RiskBadge from '../components/common/RiskBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatMinutesToHoursAndMins, formatDate } from '../utils/formatters';

const ReportsPage = () => {
  const [period, setPeriod] = useState(30);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReport = async (days) => {
    try {
      setLoading(true);
      const res = await reportService.getSummary(days);
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('[Reports] Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(period);
  }, [period]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      await reportService.downloadCSV();
    } catch (err) {
      alert('CSV export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      await reportService.downloadJSON();
    } catch (err) {
      alert('JSON export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Generating comprehensive wellbeing report..." />
      </div>
    );
  }

  const overview = reportData?.overview;
  const assessments = reportData?.assessments || [];

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Wellbeing Reports & Exports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate printable executive summaries and download your raw usage records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value, 10))}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium outline-none"
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm print:border-none print:shadow-none space-y-8">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">SafeNet Executive Wellbeing Audit</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation Period: Past {reportData?.reportingPeriodDays} Days
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold text-slate-800">{reportData?.user?.name}</p>
            <p className="text-slate-400">{reportData?.user?.email}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Generated: {new Date(reportData?.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Executive Highlights Grid */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
            1. Core Usage Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">Today Screen Time</span>
              <span className="text-xl font-bold text-slate-900">
                {overview?.todayScreenTimeHours || 0} Hours
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Limit: {Math.round((overview?.dailyGoalMinutes || 240) / 60)}h/day
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">Weekly Daily Average</span>
              <span className="text-xl font-bold text-slate-900">
                {overview?.weeklyAverageHours || 0} Hours
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Across active days</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">Night Screen Time</span>
              <span className="text-xl font-bold text-slate-900">
                {overview?.todayNightHours || 0} Hours
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Past 10:00 PM</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">Habits Adopted</span>
              <span className="text-xl font-bold text-emerald-600">
                {reportData?.completedHabitsCount || 0} Habits
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Completed successfully</span>
            </div>
          </div>
        </div>

        {/* Recent AI Assessments Timeline */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
            2. Machine Learning Risk Assessment History
          </h3>
          {assessments.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No formal AI risk evaluations recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {assessments.map((ass) => (
                <div
                  key={ass._id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <RiskBadge riskLevel={ass.riskLevel} size="md" />
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Score {ass.riskScore}/100 • {(ass.confidence * 100).toFixed(0)}% Confidence
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(ass.assessmentDate, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 max-w-sm truncate">
                    {ass.keyFactors?.[0]?.description || 'Normal habit balance.'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Educational Disclaimer */}
        <div className="pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400 leading-relaxed">
          <p>
            SafeNet is an informational digital awareness system. Evaluations represent statistical estimations derived from self-logged screen time. Not intended as medical diagnosis, psychiatric evaluation, or clinical care.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
