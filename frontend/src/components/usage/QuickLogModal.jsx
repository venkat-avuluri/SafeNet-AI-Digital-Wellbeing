import React, { useState } from 'react';
import Modal from '../common/Modal';
import { usageService } from '../../services/usageService';
import { CATEGORIES, TIME_PERIODS } from '../../utils/formatters';

const POPULAR_APPS = [
  { name: 'Instagram', category: 'Social Media' },
  { name: 'YouTube', category: 'Entertainment' },
  { name: 'VS Code', category: 'Productivity' },
  { name: 'WhatsApp', category: 'Communication' },
  { name: 'Netflix', category: 'Entertainment' },
  { name: 'Notion', category: 'Productivity' },
  { name: 'Duolingo', category: 'Education' },
  { name: 'Reddit', category: 'Social Media' }
];

const QuickLogModal = ({ isOpen, onClose, onLogged }) => {
  const [appName, setAppName] = useState('');
  const [category, setCategory] = useState('Social Media');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState('45');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timePeriod, setTimePeriod] = useState('Evening');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectPopular = (app) => {
    setAppName(app.name);
    setCategory(app.category);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!appName.trim()) {
      setError('Please provide an application name.');
      return;
    }
    const mins = parseInt(durationMinutes, 10);
    if (isNaN(mins) || mins <= 0 || mins > 1440) {
      setError('Duration must be between 1 and 1440 minutes.');
      return;
    }

    try {
      setLoading(true);
      await usageService.logUsage({
        appName: appName.trim(),
        category,
        durationMinutes: mins,
        sessionDurationMinutes: sessionDurationMinutes ? parseInt(sessionDurationMinutes, 10) : mins,
        date,
        timePeriod,
        isNightUsage: timePeriod === 'Night',
        notes
      });
      setAppName('');
      setNotes('');
      if (onLogged) onLogged();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log usage. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Digital Screen Time">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Quick Suggestions Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Quick Select App
          </label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_APPS.map((app) => (
              <button
                type="button"
                key={app.name}
                onClick={() => handleSelectPopular(app)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                  appName === app.name
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {app.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* App Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Application Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chrome, TikTok, Slack"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Duration (minutes) *
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
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Average Session Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Single Session Length (mins)
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={sessionDurationMinutes}
              onChange={(e) => setSessionDurationMinutes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
            />
          </div>

          {/* Time Period */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Time Period
            </label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
            >
              <option value="Morning">Morning (6 AM - 12 PM)</option>
              <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
              <option value="Evening">Evening (5 PM - 10 PM)</option>
              <option value="Night">Night (10 PM - 6 AM)</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Optional Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Late night project deadline or relax time"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save Usage'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickLogModal;
