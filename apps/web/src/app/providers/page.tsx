'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Server, Plus, CheckCircle2, ShieldCheck, Key, RefreshCw, Trash2, Cpu } from 'lucide-react';

export default function ProvidersPage() {
  const [testing, setTesting] = useState<string | null>(null);

  const providers = [
    {
      id: 'prov-1',
      name: 'AWS SES Production',
      type: 'AWS_SES',
      region: 'us-east-1',
      isActive: true,
      createdAt: '2026-08-20',
    },
    {
      id: 'prov-2',
      name: 'Azure Comm Services',
      type: 'AZURE_EMAIL',
      region: 'East US',
      isActive: true,
      createdAt: '2026-08-22',
    },
    {
      id: 'prov-3',
      name: 'Mailpit Local SMTP',
      type: 'SMTP',
      region: 'localhost:1025',
      isActive: true,
      createdAt: '2026-08-25',
    },
  ];

  const handleTest = (id: string) => {
    setTesting(id);
    setTimeout(() => setTesting(null), 1000);
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="p-8 pl-72 space-y-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Email Providers</h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure strategy adapters (AWS SES, Azure, Custom SMTP). All API secrets are encrypted at rest with AES-256-GCM.
              </p>
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all">
              <Plus className="w-4 h-4" />
              <span>Add Provider</span>
            </button>
          </div>

          {/* Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.map((p) => (
              <div key={p.id} className="glass-panel p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                      <Server className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{p.name}</h3>
                  <p className="text-xs font-mono text-cyan-400 mt-0.5">{p.type}</p>
                  <p className="text-[11px] text-slate-400 mt-2">Target Node: {p.region}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Credentials AES-256 Encrypted</span>
                  </div>

                  <button
                    onClick={() => handleTest(p.id)}
                    className="w-full py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-slate-200 hover:bg-surface-hover hover:text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing === p.id ? 'animate-spin' : ''}`} />
                    <span>{testing === p.id ? 'Testing Connection...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
