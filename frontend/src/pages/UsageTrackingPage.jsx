import React, { useState, useEffect } from 'react';
import {
  Clock,
  PlusCircle,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { usageService } from '../services/usageService';
import { formatMinutesToHoursAndMins, formatDate, getCategoryColor } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORIES = [
  'Social Media',
  'Entertainment',
  'Education',
  'Productivity',
  'Gaming',
  'Communication',
  'Others'
];

const UsageTrackingPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [appName, setAppName] = useState('');
  const [category, setCategory] = useState('Social Media');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState('45');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timePeriod, setTimePeriod] = useState('Afternoon');
  const [notes, setNotes] = useState('');

  const fetchRecentLogs = async () => {
    try {
      setLoading(true);
      const res = await usageService.getRecords({ limit: 15 });
      if (res.success) {
        setRecords(res.data);
      }
    } catch (err) {
      console.error('[UsageTracking] Error loading records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!appName.trim()) {
      setError('Please provide an application name.');
      return;
    }

    const duration = parseInt(durationMinutes, 10);
    if (isNaN(duration) || duration <= 0 || duration > 1440) {
      setError('Duration must be between 1 and 1440 minutes (24h).');
      return;
    }

    try {
      setSaving(true);
      await usageService.logUsage({
        appName: appName.trim(),
        category,
        durationMinutes: duration,
        sessionDurationMinutes: sessionDurationMinutes ? parseInt(sessionDurationMinutes, 10) : duration,
        date,
        timePeriod,
        isNightUsage: timePeriod === 'Night',
        notes
      });

      setSuccess(`Successfully logged ${duration}m for ${appName}!`);
      setAppName('');
      setNotes('');
      fetchRecentLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this usage record?')) return;
    try {
      await usageService.deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r._id !== id));
      setSuccess('Record deleted.');
    } catch (err) {
      setError('Failed to delete record.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Notice */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Digital Usage Tracking</h2>
        <p className="text-xs text-slate-500 mt-1">
          Record your daily app sessions, categories, and durations to power your wellbeing analytics.
        </p>
      </div>

      {/* Manual Tracking Transparency Note */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <span className="font-bold">Manual Logging Architecture:</span> To respect device privacy and avoid invasive background screen scraping, SafeNet relies on transparent manual session logging and batch entry.
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Entry Form Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Add New Record</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Application Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. YouTube, Instagram, Figma"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration (mins) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  required
                  value={durationMinutes}
                  onChange={(e) => {
                    setDurationMinutes(e.target.value);
                    setSessionDurationMinutes(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Session (mins)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={sessionDurationMinutes}
                  onChange={(e) => setSessionDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Period</label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night (Late)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Study session or relaxation"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {saving ? 'Saving...' : 'Add Usage Record'}
            </button>
          </form>
        </div>

        {/* Recent Activity Table Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Usage Entries</h3>
                <p className="text-xs text-slate-400">Latest records logged into your account</p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {records.length} Records
              </span>
            </div>

            {loading ? (
              <div className="py-12">
                <LoadingSpinner size="md" text="Loading records..." />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No records found. Use the form on the left to add your first session.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">App</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((r) => {
                      const color = getCategoryColor(r.category);
                      return (
                        <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                            {formatDate(r.date)}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                            {r.appName}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${color.bg} ${color.text}`}>
                              {r.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-800 font-bold whitespace-nowrap">
                            {formatMinutesToHoursAndMins(r.durationMinutes)}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              r.timePeriod === 'Night' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {r.timePeriod}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDelete(r._id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageTrackingPage;
