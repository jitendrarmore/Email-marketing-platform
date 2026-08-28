'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { Server, Plus, RefreshCw, Inbox, ShieldCheck, X, CheckCircle2 } from 'lucide-react';

export default function ProvidersPage() {
  const [testing, setTesting] = useState<string | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [providerType, setProviderType] = useState('AWS_SES');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [awsAccessKey, setAwsAccessKey] = useState('');
  const [awsSecretKey, setAwsSecretKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: any[] }>('/providers').catch(() => ({ data: [] }));
      setProviders(res.data || []);
    } catch (e) {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      await api.post(`/providers/${id}/test`);
    } catch (e) {
      // Ignore
    } finally {
      setTesting(null);
    }
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const credentials = {
        region: awsRegion,
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      };

      const newProvider = await api.post<any>('/providers', {
        name,
        providerType,
        credentials,
      });

      setProviders((prev) => [newProvider, ...prev]);
      setIsModalOpen(false);

      // Reset form
      setName('');
      setAwsAccessKey('');
      setAwsSecretKey('');
    } catch (err: any) {
      setError(err.message || 'Failed to create provider');
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
              <h1 className="text-2xl font-bold text-slate-100">Email Providers</h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure strategy adapters (AWS SES, Azure, Custom SMTP). All API secrets are encrypted at rest with AES-256-GCM.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Provider</span>
            </button>
          </div>

          {/* Providers Grid or Empty State */}
          {providers.length === 0 ? (
            <div className="glass-panel p-12 text-center space-y-3">
              <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
              <div>
                <p className="text-base font-semibold text-slate-200">No email providers configured</p>
                <p className="text-xs text-slate-400 mt-1">Add an AWS SES, Azure Communication Services, or SMTP provider to start sending emails.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Provider</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {providers.map((p) => (
                <div key={p.id} className="glass-panel p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                        <Server className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white">{p.name}</h3>
                    <p className="text-xs font-mono text-cyan-400 mt-0.5">{p.providerType}</p>
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
          )}

          {/* Add Provider Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md glass-panel p-6 space-y-5 border-border/80 relative">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary-400" /> Add Email Provider
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

                <form onSubmit={handleCreateProvider} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Provider Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="AWS SES US East Production"
                      className="glass-input w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Provider Type</label>
                    <select
                      value={providerType}
                      onChange={(e) => setProviderType(e.target.value)}
                      className="glass-input w-full bg-surface text-xs"
                    >
                      <option value="AWS_SES">AWS SES (Amazon Simple Email Service)</option>
                      <option value="AZURE_EMAIL">Azure Communication Services Email</option>
                      <option value="SMTP">Custom SMTP Server</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">AWS Region / Host</label>
                    <input
                      type="text"
                      value={awsRegion}
                      onChange={(e) => setAwsRegion(e.target.value)}
                      placeholder="us-east-1"
                      className="glass-input w-full font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Access Key ID / Username</label>
                    <input
                      type="text"
                      value={awsAccessKey}
                      onChange={(e) => setAwsAccessKey(e.target.value)}
                      placeholder="AKIA..."
                      className="glass-input w-full font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Secret Access Key / Password</label>
                    <input
                      type="password"
                      value={awsSecretKey}
                      onChange={(e) => setAwsSecretKey(e.target.value)}
                      placeholder="••••••••••••••••••••"
                      className="glass-input w-full font-mono text-xs"
                    />
                  </div>

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
                      {submitting ? 'Saving...' : 'Save Provider'}
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
