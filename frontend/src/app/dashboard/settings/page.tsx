'use client';
import { useState } from 'react';
import { User, Lock, Trash2, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/utils';

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', avatar_url: user?.avatar_url || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [deletePassword, setDeletePassword] = useState('');
  const [saving, setSaving] = useState('');

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving('profile');
    try {
      await api.put('/users/profile', profileForm);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(''); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    setSaving('password');
    try {
      await api.put('/users/password', pwForm);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed!');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(''); }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you absolutely sure? This will permanently delete your account and all bots.')) return;
    try {
      await api.delete('/users/account', { data: { password: deletePassword } });
      toast.success('Account deleted');
      logout();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your profile and security settings.</p>
        </div>
      </div>

      {/* Profile */}
      <form onSubmit={saveProfile} className="card p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4" /> Profile Information
        </h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1">
            <label className="label">Avatar URL</label>
            <input className="input" placeholder="https://example.com/avatar.jpg"
              value={profileForm.avatar_url} onChange={e => setProfileForm(p => ({ ...p, avatar_url: e.target.value }))} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-gray-50 text-gray-400 cursor-not-allowed" value={user?.email || ''} disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
        </div>
        <button type="submit" disabled={saving === 'profile'} className="btn-primary mt-4">
          {saving === 'profile' ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save profile</>}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={changePassword} className="card p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Change Password
        </h2>
        <div className="space-y-3">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" placeholder="Current password"
              value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" placeholder="Min 8 chars, upper + lower + number"
              value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" placeholder="Repeat new password"
              value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
          </div>
        </div>
        <button type="submit" disabled={saving === 'password'} className="btn-primary mt-4">
          {saving === 'password' ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Change password'}
        </button>
      </form>

      {/* Danger zone */}
      <div className="card p-6 border-red-200 bg-red-50/30">
        <h2 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Danger Zone
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Deleting your account will permanently remove all your bots, conversations, and data. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <input type="password" className="input max-w-xs" placeholder="Enter password to confirm"
            value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
          <button onClick={deleteAccount} disabled={!deletePassword}
            className="px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors">
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
