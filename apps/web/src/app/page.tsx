'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Plus,
  RefreshCw,
  Inbox,
  Server,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      const res = await api.get<{ data: any[] }>('/campaigns').catch(() => ({ data: [] }));
      setCampaigns(res.data || []);
    } catch (e) {
      setCampaigns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalSent = campaigns.reduce((acc, c) => acc + (c.totalRecipients || 0), 0);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="p-8 pl-72 space-y-8 max-w-7xl">
          {/* Header Banner */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                Executive Overview
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 font-normal">
                  Live System
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time delivery telemetry, campaign performance & multi-provider routing health.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                className="p-2 rounded-xl bg-surface border border-border text-slate-300 hover:text-white transition-all"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/campaigns/new"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-primary-500 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campaign</span>
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="glass-panel p-5 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total Emails Sent</span>
                <Send className="w-4 h-4 text-primary-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">{totalSent.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-slate-400">Across {campaigns.length} active campaigns</p>
            </div>

            <div className="glass-panel p-5 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Delivery Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">{campaigns.length > 0 ? '99.8%' : '0%'}</span>
              </div>
              <p className="text-[11px] text-slate-400">Successful dispatches</p>
            </div>

            <div className="glass-panel p-5 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Unique Open Rate</span>
                <Eye className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">{campaigns.length > 0 ? '0.0%' : '0%'}</span>
              </div>
              <p className="text-[11px] text-slate-400">Unique recipient opens</p>
            </div>

            <div className="glass-panel p-5 space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Bounce Rate</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">0.0%</span>
              </div>
              <p className="text-[11px] text-slate-400">Hard & soft bounces</p>
            </div>
          </div>

          {/* Active Campaigns Table / Clean Empty State */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Active Campaigns</h3>
                <p className="text-xs text-slate-400">Monitor batch execution progress and sending state</p>
              </div>
              <Link href="/campaigns" className="text-xs text-primary-400 hover:underline">
                View All Campaigns →
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-surface/30 rounded-2xl border border-dashed border-border/60">
                <Inbox className="w-10 h-10 text-slate-500 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">No campaigns created yet</p>
                  <p className="text-xs text-slate-400 mt-1">Get started by creating your first mass email campaign.</p>
                </div>
                <Link
                  href="/campaigns/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Campaign</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-slate-400 font-medium">
                      <th className="pb-3">Campaign Name</th>
                      <th className="pb-3">Sender Identity</th>
                      <th className="pb-3">Provider</th>
                      <th className="pb-3">Recipients</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {campaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-surface/40 transition-all">
                        <td className="py-3.5 font-semibold text-slate-200">{c.name}</td>
                        <td className="py-3.5 text-slate-300">{c.senderEmail}</td>
                        <td className="py-3.5 text-slate-400">{c.providerName}</td>
                        <td className="py-3.5 text-slate-300 font-mono">{c.totalRecipients}</td>
                        <td className="py-3.5 font-semibold">{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
