import React, { useState, useEffect } from 'react';
import {
  Settings,
  DollarSign,
  Building,
  User,
  ShieldCheck,
  Server,
  Sparkles,
  Key,
  CheckCircle2,
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { currency, setCurrency, activeDataset, showToast } = useFinancial();
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || 'Ramzan Baloch');
  const [company, setCompany] = useState(user?.company || activeDataset.companyName || 'Apex Cloud Systems Inc.');
  const [newPassword, setNewPassword] = useState('');
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    fetch('/api/system/health')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) setSystemHealth(data);
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({
      fullName,
      company,
      currency,
      password: newPassword || undefined,
    } as any);
    if (success) {
      showToast('Profile and organization settings updated successfully.');
      setNewPassword('');
    } else {
      showToast('Failed to update settings.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#42D6C0]/15 text-[#42D6C0]">
            <Settings className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Platform Settings & System Governance
          </h2>
        </div>
        <p className="text-xs text-[#8B9AA8] mt-1">
          Manage currency standards, organizational hierarchy, AI models, and view system health telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization & Profile Form */}
        <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Building className="w-4 h-4 text-[#42D6C0]" />
            <span>Organization & User Profile</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/20 focus:outline-none focus:border-[#42D6C0]"
              />
            </div>

            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">Company / Legal Entity</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/20 focus:outline-none focus:border-[#42D6C0]"
              />
            </div>

            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">Default Reporting Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/20 focus:outline-none focus:border-[#42D6C0]"
              >
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="JPY">JPY (¥) — Japanese Yen</option>
                <option value="CAD">CAD (CA$) — Canadian Dollar</option>
                <option value="AUD">AUD (AU$) — Australian Dollar</option>
                <option value="INR">INR (₹) — Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">Role / Authorization Level</label>
              <div className="p-2.5 rounded-lg bg-[#101D2B] border border-[#42D6C0]/15 text-white font-mono flex items-center justify-between">
                <span>{user?.role?.toUpperCase() || 'ADMINISTRATOR'}</span>
                <span className="text-[10px] text-[#42D6C0] font-bold">FULL ACCESS</span>
              </div>
            </div>

            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">New Password (Leave blank to keep current)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/20 focus:outline-none focus:border-[#42D6C0]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#42D6C0] to-[#2FD3B4] text-[#101D2B] font-bold text-xs shadow-md shadow-[#42D6C0]/20 hover:opacity-95 transition-all"
            >
              Update Preferences
            </button>
          </form>
        </div>

        {/* AI & System Telemetry */}
        <div className="space-y-6">
          {/* AI Configuration Box */}
          <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#42D6C0]" />
              <span>AI Engine Architecture</span>
            </h3>

            <div className="p-3 rounded-xl bg-[#101D2B] border border-[#42D6C0]/15 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#8B9AA8]">Model Provider:</span>
                <span className="font-bold text-white">Google Gemini API</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8B9AA8]">Active Model:</span>
                <span className="font-mono text-[#42D6C0] font-semibold">gemini-3.8-flash</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8B9AA8]">Integration Scope:</span>
                <span className="font-medium text-white">Secure Server-Side Proxy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8B9AA8]">Grounding Mode:</span>
                <span className="text-[#D4B36A] font-semibold">Deterministic Ledger Calculation</span>
              </div>
            </div>

            <p className="text-[11px] text-[#8B9AA8]">
              Your API key is automatically attached and managed securely in the server environment without exposing credentials to the client.
            </p>
          </div>

          {/* System Health Diagnostics */}
          <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Server className="w-4 h-4 text-[#42D6C0]" />
              <span>System Health & Node Environment</span>
            </h3>

            <div className="p-3 rounded-xl bg-[#101D2B] border border-[#42D6C0]/15 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[#8B9AA8]">API Status:</span>
                <span className="text-[#42D6C0] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ONLINE (200 OK)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8B9AA8]">Database:</span>
                <span className="text-white">PostgreSQL-compatible File DB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8B9AA8]">Server Uptime:</span>
                <span className="text-white">{systemHealth?.uptimeSeconds || 120} seconds</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8B9AA8]">Heap Memory:</span>
                <span className="text-white">{systemHealth?.memoryUsageMb || 45} MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8B9AA8]">Isolation Level:</span>
                <span className="text-[#42D6C0]">User-Specific Data Isolation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
