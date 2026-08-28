'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import {
  Send,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Pause,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const campaigns = [
    {
      id: 'c-101',
      name: 'Q3 Product Launch Announcement',
      subject: '🔥 Exclusive 30% Off Product Upgrades!',
      sender: 'newsletter@example.com',
      provider: 'AWS SES',
      totalRecipients: 15000,
      sentCount: 12750,
      status: 'SENDING',
      createdAt: '2026-08-28 10:15',
    },
    {
      id: 'c-102',
      name: 'Weekly Developer Digest #42',
      subject: 'Top 10 Fastify & Node.js Performance Hacks',
      sender: 'marketing@example.com',
      provider: 'Azure Comm',
      totalRecipients: 8400,
      sentCount: 8400,
      status: 'COMPLETED',
      createdAt: '2026-08-27 14:00',
    },
    {
      id: 'c-103',
      name: 'Security Update & Policy Notice',
      subject: 'Action Required: Update your account security settings',
      sender: 'newsletter@example.com',
      provider: 'Custom SMTP',
      totalRecipients: 2100,
      sentCount: 0,
      status: 'QUEUED',
      createdAt: '2026-08-28 11:45',
    },
    {
      id: 'c-104',
      name: 'Draft - Black Friday Early Access',
      subject: 'VIP Member Early Access Pass',
      sender: 'marketing@example.com',
      provider: 'AWS SES',
      totalRecipients: 0,
      sentCount: 0,
      status: 'DRAFT',
      createdAt: '2026-08-28 12:30',
    },
  ];

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="p-8 pl-72 space-y-8 max-w-7xl">
          {/* Top Title Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Campaign Management</h1>
              <p className="text-xs text-slate-400 mt-1">
                View, create and manage email marketing campaigns across all authorized senders.
              </p>
            </div>

            <Link
              href="/campaigns/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </Link>
          </div>

          {/* Search & Filter Controls */}
          <div className="glass-panel p-4 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaigns by name or subject..."
                className="glass-input w-full pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="glass-input text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="QUEUED">Queued</option>
                <option value="SENDING">Sending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-surface/50 text-slate-400 font-medium">
                  <th className="p-4">Campaign Name & Subject</th>
                  <th className="p-4">Sender & Provider</th>
                  <th className="p-4">Recipients</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/40 transition-all">
                    <td className="p-4">
                      <p className="font-bold text-slate-100">{c.name}</p>
                      <p className="text-slate-400 text-[11px] truncate max-w-xs">{c.subject}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-slate-200">{c.sender}</p>
                      <span className="text-[10px] text-slate-400">{c.provider}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-semibold text-slate-200">
                        {c.sentCount.toLocaleString()} / {c.totalRecipients.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          c.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : c.status === 'SENDING'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse'
                            : c.status === 'QUEUED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{c.createdAt}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/campaigns/${c.id}`}
                          className="p-1.5 rounded-lg bg-surface border border-border text-slate-300 hover:text-white hover:border-primary-500 transition-all"
                          title="View telemetry logs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
