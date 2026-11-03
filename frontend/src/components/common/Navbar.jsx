import React from 'react';
import { Shield, Sparkles, Moon, Sun } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Navbar = ({ onOpenQuickLog }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-800">
          Welcome back, <span className="text-indigo-600">{user?.name || 'Friend'}</span>
        </h1>
        <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          SafeNet AI Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenQuickLog}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>+ Log Usage</span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <div className="text-right">
          <p className="text-xs font-bold text-slate-800">Goal: {Math.round((user?.dailyScreenTimeGoalMinutes || 240) / 60)}h / day</p>
          <p className="text-[11px] text-slate-400">Target Bedtime: {user?.nightTimeCutoff || '22:00'}</p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
