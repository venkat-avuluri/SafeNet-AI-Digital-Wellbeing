import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  BarChart3,
  BrainCircuit,
  Sparkles,
  History,
  FileText,
  UserCheck,
  LogOut,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Usage Tracking', path: '/track', icon: Clock },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'AI Risk Assessment', path: '/assessment', icon: BrainCircuit },
  { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
  { name: 'Usage History', path: '/history', icon: History },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'User Profile', path: '/profile', icon: UserCheck }
];

const Sidebar = ({ onOpenQuickLog }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-lg font-extrabold text-white tracking-tight">SafeNet</span>
          <span className="block text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">
            AI Digital Wellbeing
          </span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 py-3">
        <button
          onClick={onOpenQuickLog}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-98 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Quick Log Usage</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 font-semibold border-l-3 border-indigo-500'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Card */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
