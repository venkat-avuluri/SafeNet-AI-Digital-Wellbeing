import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setLoading(true);
    const demoEmail = 'demo@safenet.ai';
    const demoPassword = 'password123';

    try {
      // Try login first
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch {
      // If demo user doesn't exist yet, auto register demo user
      try {
        await register({
          name: 'Demo Explorer',
          email: demoEmail,
          password: demoPassword,
          dailyScreenTimeGoalMinutes: 240,
          ageGroup: '18-24'
        });
        navigate('/dashboard');
      } catch (err) {
        setError('Could not initialize demo account. Please register manually.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to SafeNet</h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your digital usage metrics and personalized AI insights.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Demo Login Shortcut */}
      <div className="mb-5">
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>One-Click Demo Account Sign In</span>
        </button>
      </div>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-white px-3 text-slate-400 font-semibold">Or use credentials</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
          </div>
          <input
            type="password"
            required
            placeholder="Your account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500">
          Create one now
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
