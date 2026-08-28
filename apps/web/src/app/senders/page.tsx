'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Mail, Plus, CheckCircle2, AlertCircle, RefreshCw, ShieldAlert } from 'lucide-react';

export default function SendersPage() {
  const senders = [
    {
      id: 'sender-1',
      email: 'newsletter@example.com',
      displayName: 'Newsletter Team',
      domain: 'example.com',
      provider: 'AWS SES Production',
      status: 'VERIFIED',
      verifiedAt: '2026-08-21 14:00',
    },
    {
      id: 'sender-2',
      email: 'marketing@example.com',
      displayName: 'Marketing Dept',
      domain: 'example.com',
      provider: 'Azure Comm Services',
      status: 'VERIFIED',
      verifiedAt: '2026-08-22 09:30',
    },
    {
      id: 'sender-3',
      email: 'finance@example.com',
      displayName: 'Finance Desk',
      domain: 'example.com',
      provider: 'Custom SMTP',
      status: 'PENDING',
      verifiedAt: '-',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="p-8 pl-72 space-y-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Sender Identities</h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure authorized sender email addresses and verify DKIM/SPF domain records.
              </p>
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all">
              <Plus className="w-4 h-4" />
              <span>Add Sender Identity</span>
            </button>
          </div>

          {/* Senders Table */}
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-surface/50 text-slate-400 font-medium">
                  <th className="p-4">Sender Email & Name</th>
                  <th className="p-4">Domain</th>
                  <th className="p-4">Associated Provider</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {senders.map((s) => (
                  <tr key={s.id} className="hover:bg-surface/40 transition-all">
                    <td className="p-4">
                      <p className="font-bold text-slate-100 font-mono">{s.email}</p>
                      <p className="text-slate-400 text-[11px]">{s.displayName}</p>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{s.domain}</td>
                    <td className="p-4 text-slate-300">{s.provider}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          s.status === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {s.status === 'PENDING' && (
                        <button className="px-3 py-1 rounded-lg bg-surface border border-border text-[11px] text-slate-200 hover:text-white hover:border-primary-500 transition-all">
                          Re-verify DKIM
                        </button>
                      )}
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
