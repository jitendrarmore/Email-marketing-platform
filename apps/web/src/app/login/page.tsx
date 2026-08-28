'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@marketing-pro.internal');
  const [password, setPassword] = useState('Admin123!@#');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@marketing-pro.internal');
      setPassword('Admin123!@#');
      await login('admin@marketing-pro.internal', 'Admin123!@#');
    } else {
      setEmail('sarah.c@marketing-pro.internal');
      setPassword('User123!@#');
      await login('sarah.c@marketing-pro.internal', 'User123!@#');
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="w-96 h-96 rounded-full bg-primary-600/20 absolute -top-20 -left-20 blur-3xl" />
      <div className="w-96 h-96 rounded-full bg-cyan-500/20 absolute -bottom-20 -right-20 blur-3xl" />

      <div className="w-full max-w-md glass-panel p-8 space-y-6 relative z-10 border-border/80">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-primary-500 to-cyan-400 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-background/90 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OmniSend PRO</h1>
          <p className="text-xs text-slate-400">Mass Email Marketing Platform</p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="p-3 rounded-xl bg-surface/60 border border-border/60 space-y-2">
          <p className="text-[11px] font-semibold text-slate-300 text-center">⚡ Quick Role Logins:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-1.5 px-3 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/30 transition-all text-center"
            >
              👑 Admin Role
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('user')}
              className="py-1.5 px-3 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-all text-center"
            >
              👤 Standard User
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-input w-full pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass-input w-full pl-9 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
