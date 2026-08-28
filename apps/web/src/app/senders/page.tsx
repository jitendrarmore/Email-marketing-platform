'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { Mail, Plus, Inbox, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SendersPage() {
  const [senders, setSenders] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [domain, setDomain] = useState('');
  const [providerConfigId, setProviderConfigId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSendersAndProviders = async () => {
    setLoading(true);
    try {
      const [sendersRes, providersRes] = await Promise.all([
        api.get<{ data: any[] }>('/senders').catch(() => ({ data: [] })),
        api.get<{ data: any[] }>('/providers').catch(() => ({ data: [] })),
      ]);

      const fetchedSenders = sendersRes.data || [];
      const fetchedProviders = providersRes.data || [];

      setSenders(fetchedSenders);
      setProviders(fetchedProviders);
      if (fetchedProviders.length > 0) {
        setProviderConfigId(fetchedProviders[0].id);
      }
    } catch (e) {
      setSenders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSendersAndProviders();
  }, []);

  const handleCreateSender = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const newSender = await api.post<any>('/senders', {
        emailAddress,
        displayName,
        domain: domain || (emailAddress.includes('@') ? emailAddress.split('@')[1] : ''),
        providerConfigId,
      });

      setSenders((prev) => [newSender, ...prev]);
      setIsModalOpen(false);

      // Reset form
      setEmailAddress('');
      setDisplayName('');
      setDomain('');
    } catch (err: any) {
      setError(err.message || 'Failed to register sender identity');
    } finally {
      setSubmitting(false);
    }
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
              <h1 className="text-2xl font-bold text-slate-100">Sender Identities</h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure authorized sender email addresses and verify DKIM/SPF domain records.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all"
            >
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
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sender Identity</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-surface/50 text-slate-400 font-medium">
                    <th className="p-4">Sender Email & Display Name</th>
                    <th className="p-4">Domain</th>
                    <th className="p-4">Associated Provider</th>
                    <th className="p-4">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {senders.map((s) => (
                    <tr key={s.id} className="hover:bg-surface/40 transition-all">
                      <td className="p-4 font-mono font-bold text-slate-100">
                        {s.emailAddress}
                        {s.displayName && <span className="block text-[11px] font-sans font-normal text-slate-400">{s.displayName}</span>}
                      </td>
                      <td className="p-4 font-mono text-slate-300">{s.domain}</td>
                      <td className="p-4 text-slate-300">{s.providerConfig?.name || 'AWS SES Primary'}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> VERIFIED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Add Sender Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md glass-panel p-6 space-y-5 border-border/80 relative">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary-400" /> Add Sender Identity
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreateSender} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Sender Email Address *</label>
                    <input
                      type="email"
                      required
                      value={emailAddress}
                      onChange={(e) => {
                        setEmailAddress(e.target.value);
                        if (e.target.value.includes('@')) {
                          setDomain(e.target.value.split('@')[1]);
                        }
                      }}
                      placeholder="newsletter@company.com"
                      className="glass-input w-full font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Newsletter Team"
                      className="glass-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Sender Domain</label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="company.com"
                      className="glass-input w-full font-mono text-xs"
                    />
                  </div>

                  {providers.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Associated Email Provider</label>
                      <select
                        value={providerConfigId}
                        onChange={(e) => setProviderConfigId(e.target.value)}
                        className="glass-input w-full bg-surface"
                      >
                        {providers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.providerType})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-slate-300 hover:bg-surface-hover"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-500/20"
                    >
                      {submitting ? 'Registering...' : 'Register Sender'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
