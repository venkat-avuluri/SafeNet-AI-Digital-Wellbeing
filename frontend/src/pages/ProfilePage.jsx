import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { authService } from '../services/authService';
import {
  UserCheck,
  Shield,
  KeyRound,
  Bell,
  Clock,
  Moon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [dailyGoalHours, setDailyGoalHours] = useState(
    user?.dailyScreenTimeGoalMinutes ? (user.dailyScreenTimeGoalMinutes / 60).toString() : '4'
  );
  const [nightTimeCutoff, setNightTimeCutoff] = useState(user?.nightTimeCutoff || '22:00');
  const [ageGroup, setAgeGroup] = useState(user?.ageGroup || '18-24');
  const [notifications, setNotifications] = useState(user?.notificationsEnabled ?? true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      setProfileSaving(true);
      const res = await authService.updateProfile({
        name,
        dailyScreenTimeGoalMinutes: parseInt(dailyGoalHours, 10) * 60,
        nightTimeCutoff,
        ageGroup,
        notificationsEnabled: notifications
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setProfileSuccess('Profile and wellbeing targets successfully updated.');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordSaving(true);
      await authService.changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password successfully changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">User Profile & Wellbeing Goals</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure your personal digital limits, nighttime boundaries, and account credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Targets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Targets & Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Personal Information & Digital Targets</span>
            </h3>

            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Screen Limit
                  </label>
                  <select
                    value={dailyGoalHours}
                    onChange={(e) => setDailyGoalHours(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white font-medium"
                  >
                    <option value="2">2 Hours / day</option>
                    <option value="3">3 Hours / day</option>
                    <option value="4">4 Hours / day (Target)</option>
                    <option value="5">5 Hours / day</option>
                    <option value="6">6 Hours / day</option>
                    <option value="8">8 Hours / day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Night-Time Cutoff
                  </label>
                  <input
                    type="time"
                    value={nightTimeCutoff}
                    onChange={(e) => setNightTimeCutoff(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Age Bracket
                  </label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white font-medium"
                  >
                    <option value="Under 18">Under 18</option>
                    <option value="18-24">18 - 24</option>
                    <option value="25-34">25 - 34</option>
                    <option value="35-50">35 - 50</option>
                    <option value="50+">50+</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="notif"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="notif" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Enable digital limit threshold notifications and weekly digests
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {profileSaving ? 'Saving Changes...' : 'Save Wellbeing Targets'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>Security & Password Update</span>
            </h3>

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password (min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Account Snapshot Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black mb-4 shadow-md shadow-indigo-600/30">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Account Status</span>
                <span className="font-bold text-emerald-600">Active</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Role</span>
                <span className="font-bold text-slate-900">Standard User</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Data Isolation</span>
                <span className="font-bold text-indigo-600">Strict User-Scoped</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Member Since</span>
                <span className="font-medium text-slate-700">{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
