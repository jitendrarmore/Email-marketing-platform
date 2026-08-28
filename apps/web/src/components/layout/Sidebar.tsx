'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Send,
  Server,
  Mail,
  Users,
  ShieldAlert,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, isMaintainer } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, show: true },
    { name: 'Campaigns', href: '/campaigns', icon: Send, show: true },
    { name: 'Sender Identities', href: '/senders', icon: Mail, show: true },
    {
      name: 'Email Providers',
      href: '/providers',
      icon: Server,
      show: isAdmin || isMaintainer,
      badge: 'Admin',
    },
    {
      name: 'Users & Permissions',
      href: '/users',
      icon: Users,
      show: isAdmin || isMaintainer,
      badge: 'RBAC',
    },
    {
      name: 'Audit Trail',
      href: '/audit',
      icon: ShieldAlert,
      show: isAdmin,
      badge: 'Sec',
    },
  ];

  return (
    <aside className="w-64 bg-card/60 backdrop-blur-xl border-r border-border/60 flex flex-col justify-between p-4 min-h-screen fixed left-0 top-0 z-30">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-primary-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-background/90 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              OmniSend <span className="text-xs text-cyan-400 font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400">Mass Email Delivery Engine</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navigation
            .filter((item) => item.show)
            .map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-primary-600/20 text-white border border-primary-500/30 shadow-lg shadow-primary-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-surface border border-border text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>
      </div>

      {/* User Quick Switcher / Status */}
      <div className="pt-4 border-t border-border/50">
        <div className="bg-surface/60 rounded-xl p-3 border border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {user?.roles?.[0] || 'USER'}
          </span>
        </div>
      </div>
    </aside>
  );
};
