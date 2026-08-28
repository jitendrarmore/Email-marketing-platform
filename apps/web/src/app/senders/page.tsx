'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { Mail, Plus, Inbox } from 'lucide-react';

export default function SendersPage() {
  const [senders, setSenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSenders = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: any[] }>('/senders').catch(() => ({ data: [] }));
      setSenders(res.data || []);
    } catch (e) {
      setSenders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSenders();
  }, []);

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

          {/* Senders Table or Clean Empty State */}
          <div className="glass-panel overflow-hidden">
            {senders.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
                <div>
                  <p className="text-base font-semibold text-slate-200">No sender identities registered</p>
                  <p className="text-xs text-slate-400 mt-1">Add your authorized sending email address or domain.</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all">
                  <Plus className="w-4 h-4" />
                  <span>Add Sender Identity</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-surface/50 text-slate-400 font-medium">
                    <th className="p-4">Sender Email & Name</th>
                    <th className="p-4">Domain</th>
                    <th className="p-4">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {senders.map((s) => (
                    <tr key={s.id} className="hover:bg-surface/40 transition-all">
                      <td className="p-4 font-mono font-bold text-slate-100">{s.emailAddress}</td>
                      <td className="p-4 font-mono text-slate-300">{s.domain}</td>
                      <td className="p-4 font-semibold">{s.verificationStatus}</td>
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
