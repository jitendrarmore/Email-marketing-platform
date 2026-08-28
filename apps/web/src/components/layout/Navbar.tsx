'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { LogOut, Bell, Shield, Zap, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-border/60 bg-card/40 backdrop-blur-xl sticky top-0 z-20 pl-72 pr-6 flex items-center justify-between">
      {/* Global Search Bar */}
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search campaigns, providers, senders..."
          className="w-full bg-surface/80 border border-border/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* System Health Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Engine Active</span>
        </div>

        {/* Notifications Button */}
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-surface-hover rounded-xl transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-primary-500 absolute top-1.5 right-1.5" />
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-border/60">
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
