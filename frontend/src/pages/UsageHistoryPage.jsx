import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Calendar,
  Layers,
  ArrowUpDown,
  Download,
  AlertTriangle
} from 'lucide-react';
import { usageService } from '../services/usageService';
import { formatMinutesToHoursAndMins, formatDate, getCategoryColor } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORIES = [
  'All',
  'Social Media',
  'Entertainment',
  'Education',
  'Productivity',
  'Gaming',
  'Communication',
  'Others'
];

const UsageHistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        category: category !== 'All' ? category : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };
      const res = await usageService.getRecords(params);
      if (res.success) {
        setRecords(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('[History] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, category, startDate, endDate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this historical record?')) return;
    try {
      await usageService.deleteRecord(id);
      fetchRecords();
    } catch (err) {
      alert('Failed to delete record.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('CAUTION: Are you sure you want to permanently clear ALL your usage records? This cannot be undone.')) return;
    try {
      await usageService.clearAllData();
      fetchRecords();
    } catch (err) {
      alert('Failed to clear records.');
    }
  };

  const filteredRecords = records.filter((r) =>
    r.appName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Usage History & Logs</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, and inspect all past screen time logs associated with your account.
          </p>
        </div>

        <button
          onClick={handleClearAll}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer self-start"
        >
          Clear All Records
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center gap-3">
        {/* App Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by app name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="md" text="Loading historical usage records..." />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No records matched your search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">App Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4">Time Period</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => {
                  const color = getCategoryColor(r.category);
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {formatDate(r.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {r.appName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${color.bg} ${color.text}`}>
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {formatMinutesToHoursAndMins(r.durationMinutes)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatMinutesToHoursAndMins(r.sessionDurationMinutes || r.durationMinutes)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.timePeriod === 'Night'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.timePeriod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 italic max-w-xs truncate">
                        {r.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredRecords.length} of {total} total records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer"
            >
              Previous
            </button>
            <span className="font-bold text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageHistoryPage;
