'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Eye,
  TrendingUp,
  Plus,
  Server,
  Mail,
  Zap,
  ArrowUpRight,
  RefreshCw,
  Sliders,
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

const chartData = [
  { time: '00:00', sent: 1200, delivered: 1180, bounced: 20 },
  { time: '04:00', sent: 800, delivered: 790, bounced: 10 },
  { time: '08:00', sent: 4500, delivered: 4420, bounced: 80 },
  { time: '12:00', sent: 12400, delivered: 12150, bounced: 250 },
  { time: '16:00', sent: 9800, delivered: 9650, bounced: 150 },
  { time: '20:00', sent: 6200, delivered: 6100, bounced: 100 },
];

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

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
                  Live Stream
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time delivery telemetry, campaign performance & multi-provider routing health.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
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
              <div className="w-24 h-24 rounded-full bg-primary-500/10 absolute -right-6 -bottom-6 blur-2xl group-hover:bg-primary-500/20 transition-all" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total Emails Sent</span>
                <Send className="w-4 h-4 text-primary-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">34,900</span>
                <span className="text-xs font-medium text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +14.2%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Across 12 active campaigns</p>
            </div>

            <div className="glass-panel p-5 space-y-3 relative overflow-hidden group">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 absolute -right-6 -bottom-6 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Delivery Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">98.4%</span>
                <span className="text-xs font-medium text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +0.8%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">34,342 delivered successfully</p>
            </div>

            <div className="glass-panel p-5 space-y-3 relative overflow-hidden group">
              <div className="w-24 h-24 rounded-full bg-cyan-500/10 absolute -right-6 -bottom-6 blur-2xl group-hover:bg-cyan-500/20 transition-all" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Unique Open Rate</span>
                <Eye className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">42.1%</span>
                <span className="text-xs font-medium text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> +3.4%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">14,458 readers opened</p>
            </div>

            <div className="glass-panel p-5 space-y-3 relative overflow-hidden group">
              <div className="w-24 h-24 rounded-full bg-rose-500/10 absolute -right-6 -bottom-6 blur-2xl group-hover:bg-rose-500/20 transition-all" />
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Bounce Rate</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">1.6%</span>
                <span className="text-xs font-medium text-emerald-400 flex items-center">
                  -0.2% improvement
                </span>
              </div>
              <p className="text-[11px] text-slate-400">558 hard/soft bounces</p>
            </div>
          </div>

          {/* Chart & Active Providers Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Delivery Chart (2 cols) */}
            <div className="glass-panel p-6 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-100 text-sm">Throughput Telemetry</h3>
                  <p className="text-xs text-slate-400">Emails dispatched per hour across all configured nodes</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-primary-400">
                    <span className="w-2 h-2 rounded-full bg-primary-500" /> Dispatched
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Delivered
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="delGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A364F" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161F30',
                        borderColor: '#2A364F',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="sent" stroke="#6366F1" fillOpacity={1} fill="url(#sentGrad)" />
                    <Area type="monotone" dataKey="delivered" stroke="#10B981" fillOpacity={1} fill="url(#delGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Configured Provider Health (1 col) */}
            <div className="glass-panel p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-100 text-sm">Provider Pool Health</h3>
                  <Link href="/providers" className="text-xs text-primary-400 hover:underline">
                    Manage
                  </Link>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-surface/60 border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                        SES
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">AWS SES Primary</p>
                        <p className="text-[10px] text-slate-400">us-east-1 • 14 req/sec quota</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Healthy
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface/60 border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                        AZ
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">Azure Comm Services</p>
                        <p className="text-[10px] text-slate-400">East US • Backup Strategy</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Healthy
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface/60 border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                        SMTP
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">Local Relay SMTP</p>
                        <p className="text-[10px] text-slate-400">port 1025 • Mailpit dev</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 text-center">
                <p className="text-[11px] text-slate-400">
                  ⚡ Auto-Failover Strategy enabled across 3 providers
                </p>
              </div>
            </div>
          </div>

          {/* Recent Campaigns Table */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Active & Recent Campaigns</h3>
                <p className="text-xs text-slate-400">Monitor batch execution progress and sending state</p>
              </div>
              <Link href="/campaigns" className="text-xs text-primary-400 hover:underline">
                View All Campaigns →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-slate-400 font-medium">
                    <th className="pb-3">Campaign Name</th>
                    <th className="pb-3">Sender Identity</th>
                    <th className="pb-3">Provider</th>
                    <th className="pb-3">Recipients</th>
                    <th className="pb-3">Progress</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  <tr className="hover:bg-surface/40 transition-all">
                    <td className="py-3.5 font-semibold text-slate-200">
                      <Link href="/campaigns/c-101" className="hover:text-primary-400">
                        Q3 Product Launch Announcement
                      </Link>
                    </td>
                    <td className="py-3.5 text-slate-300">newsletter@example.com</td>
                    <td className="py-3.5 text-slate-400">AWS SES</td>
                    <td className="py-3.5 text-slate-300 font-mono">15,000</td>
                    <td className="py-3.5 w-48">
                      <div className="w-full bg-surface-hover rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full w-[85%]" />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">12,750 / 15,000</span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        SENDING
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface/40 transition-all">
                    <td className="py-3.5 font-semibold text-slate-200">
                      <Link href="/campaigns/c-102" className="hover:text-primary-400">
                        Weekly Developer Digest #42
                      </Link>
                    </td>
                    <td className="py-3.5 text-slate-300">marketing@example.com</td>
                    <td className="py-3.5 text-slate-400">Azure Comm</td>
                    <td className="py-3.5 text-slate-300 font-mono">8,400</td>
                    <td className="py-3.5 w-48">
                      <div className="w-full bg-surface-hover rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-full" />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">8,400 / 8,400 (100%)</span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        COMPLETED
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface/40 transition-all">
                    <td className="py-3.5 font-semibold text-slate-200">
                      <Link href="/campaigns/c-103" className="hover:text-primary-400">
                        Security Update & Policy Notice
                      </Link>
                    </td>
                    <td className="py-3.5 text-slate-300">newsletter@example.com</td>
                    <td className="py-3.5 text-slate-400">Custom SMTP</td>
                    <td className="py-3.5 text-slate-300 font-mono">2,100</td>
                    <td className="py-3.5 w-48">
                      <div className="w-full bg-surface-hover rounded-full h-2 overflow-hidden">
                        <div className="bg-slate-600 h-full w-[0%]" />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">Queued in BullMQ</span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        QUEUED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
