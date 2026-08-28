'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { Send, Plus, Search, Filter, Eye, Inbox, RefreshCw } from 'lucide-react';

export default function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: any[] }>('/campaigns').catch(() => ({ data: [] }));
      setCampaigns(res.data || []);
    } catch (e) {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.subject?.toLowerCase().includes(search.toLowerCase());
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

          {/* Campaigns Table or Clean Empty State */}
          <div className="glass-panel overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
                <div>
                  <p className="text-base font-semibold text-slate-200">No campaigns found</p>
                  <p className="text-xs text-slate-400 mt-1">Start by creating your first campaign to send mass emails.</p>
                </div>
                <Link
                  href="/campaigns/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Campaign</span>
                </Link>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-surface/50 text-slate-400 font-medium">
                    <th className="p-4">Campaign Name & Subject</th>
                    <th className="p-4">Sender & Provider</th>
                    <th className="p-4">Recipients</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created At</th>
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
                        <p className="font-mono text-slate-200">{c.senderEmail}</p>
                        <span className="text-[10px] text-slate-400">{c.providerName}</span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-200">
                        {c.totalRecipients || 0}
                      </td>
                      <td className="p-4 font-semibold">{c.status}</td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">{c.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
