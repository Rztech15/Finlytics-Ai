import React, { useState } from 'react';
import { X, Lock, Mail, User, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await login(email, password);
    } else if (mode === 'register') {
      await register(email, password, fullName, company);
    } else if (mode === 'forgot') {
      setForgotSent(true);
    }
  };

  const handleDemoLogin = async () => {
    await login('ramzanbalochmrbaloch@gmail.com', 'finlytics2025');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#132232] border border-[#42D6C0]/30 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative text-white">
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-[#8B9AA8] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#153C43] to-[#101D2B] border border-[#42D6C0]/40 flex items-center justify-center text-[#42D6C0] shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-mono tracking-wide text-white">FINLYTICS</h3>
            <p className="text-xs text-[#8B9AA8]">Enterprise Financial Intelligence Platform</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#101D2B] rounded-xl mb-5 text-xs font-semibold">
          <button
            onClick={() => {
              setMode('login');
              setForgotSent(false);
            }}
            className={`py-2 rounded-lg transition-colors ${
              mode === 'login' ? 'bg-[#153C43] text-[#42D6C0]' : 'text-[#8B9AA8] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setForgotSent(false);
            }}
            className={`py-2 rounded-lg transition-colors ${
              mode === 'register' ? 'bg-[#153C43] text-[#42D6C0]' : 'text-[#8B9AA8] hover:text-white'
            }`}
          >
            Register Org
          </button>
        </div>

        {forgotSent ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#42D6C0] mx-auto" />
            <h4 className="text-sm font-bold text-white">Password Reset Dispatched</h4>
            <p className="text-xs text-[#8B9AA8]">
              If an enterprise profile exists for <strong>{email}</strong>, secure recovery instructions have been transmitted.
            </p>
            <button
              onClick={() => setMode('login')}
              className="text-xs text-[#42D6C0] hover:underline font-semibold pt-2"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-[#8B9AA8] font-semibold mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8B9AA8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-[#101D2B] text-white pl-9 pr-3 py-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#8B9AA8] font-semibold mb-1">Company / Organization</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-[#8B9AA8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Acme Global Inc."
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      className="w-full bg-[#101D2B] text-white pl-9 pr-3 py-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8B9AA8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="finance@organization.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#101D2B] text-white pl-9 pr-3 py-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[#8B9AA8] font-semibold">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#42D6C0] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8B9AA8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#101D2B] text-white pl-9 pr-3 py-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#42D6C0] to-[#2FD3B4] text-[#101D2B] font-bold text-xs shadow-md shadow-[#42D6C0]/20 hover:opacity-95 disabled:opacity-50 transition-all mt-2"
            >
              {isLoading
                ? 'Processing...'
                : mode === 'login'
                ? 'Authenticate Session'
                : mode === 'register'
                ? 'Create Enterprise Profile'
                : 'Send Password Reset'}
            </button>
          </form>
        )}

        {/* Demo Fast Access */}
        <div className="mt-5 pt-4 border-t border-[#42D6C0]/15 text-center">
          <p className="text-[11px] text-[#8B9AA8] mb-2">Want to explore instantly?</p>
          <button
            onClick={handleDemoLogin}
            className="w-full py-2 px-3 rounded-lg bg-[#101D2B] text-[#42D6C0] hover:bg-[#153C43] border border-[#42D6C0]/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Fast Demo Sign-In (Pre-populated)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
