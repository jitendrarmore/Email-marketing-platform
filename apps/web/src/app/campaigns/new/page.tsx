'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/lib/auth-context';
import {
  Send,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  Mail,
  Server,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

export default function NewCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [senderIdentityId, setSenderIdentityId] = useState('sender-1');
  const [providerConfigId, setProviderConfigId] = useState('provider-1');
  const [recipientsCsv, setRecipientsCsv] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bodyHtml, setBodyHtml] = useState(
    '<h1>Hello {{firstName}},</h1>\n<p>We are thrilled to announce our latest updates!</p>\n<p>Best regards,<br/>The Team</p>'
  );
  const [bodyText, setBodyText] = useState('Hello {{firstName}},\nWe are thrilled to announce our latest updates!');

  // Mock Authorized Senders for user
  const authorizedSenders = [
    { id: 'sender-1', email: 'newsletter@example.com', name: 'Newsletter Team', status: 'VERIFIED' },
    { id: 'sender-2', email: 'marketing@example.com', name: 'Marketing Dept', status: 'VERIFIED' },
  ];

  // Configured Providers
  const providers = [
    { id: 'provider-1', name: 'AWS SES Production', type: 'AWS_SES' },
    { id: 'provider-2', name: 'Azure Comm Backup', type: 'AZURE_EMAIL' },
    { id: 'provider-3', name: 'Local Mailpit SMTP', type: 'SMTP' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setRecipientsCsv(evt.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate submission API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/campaigns');
    } catch (err: any) {
      setError(err.message || 'Failed to submit campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="p-8 pl-72 space-y-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Create New Campaign</h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure target audience, authorized sender, email body & dispatch strategy.
              </p>
            </div>
          </div>

          {/* Wizard Progress Bar */}
          <div className="glass-panel p-4 flex items-center justify-between border-border/40">
            {[
              { num: 1, label: 'Details' },
              { num: 2, label: 'Sender & Provider' },
              { num: 3, label: 'Audience' },
              { num: 4, label: 'Compose' },
              { num: 5, label: 'Review' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.num
                      ? 'bg-primary-500 text-white ring-4 ring-primary-500/20'
                      : step > s.num
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-surface text-slate-500 border border-border'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs font-medium ${step === s.num ? 'text-white' : 'text-slate-400'}`}>
                  {s.label}
                </span>
                {s.num < 5 && <ChevronRight className="w-4 h-4 text-slate-600 ml-2" />}
              </div>
            ))}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Step Contents */}
          <div className="glass-panel p-6 space-y-6">
            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white">Campaign Basics</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Campaign Internal Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Q3 Promotional Blast #1"
                      className="glass-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Subject Line *</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. 🔥 Exclusive 30% Off Product Upgrades!"
                      className="glass-input w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Sender & Provider */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">Authorized Sender Identity</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    🔒 Backend-enforced authorization: You can only select senders granted by Admin to {user?.email}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {authorizedSenders.map((sender) => (
                      <div
                        key={sender.id}
                        onClick={() => setSenderIdentityId(sender.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          senderIdentityId === sender.id
                            ? 'bg-primary-600/20 border-primary-500 text-white'
                            : 'bg-surface/50 border-border text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{sender.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {sender.status}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-400 mt-1">{sender.email}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white mb-1">Target Email Provider</h3>
                  <p className="text-xs text-slate-400 mb-4">Select configured strategy adapter</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {providers.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setProviderConfigId(p.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          providerConfigId === p.id
                            ? 'bg-primary-600/20 border-primary-500 text-white'
                            : 'bg-surface/50 border-border text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <Server className="w-5 h-5 text-primary-400 mb-2" />
                        <p className="text-xs font-bold">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Audience CSV Upload */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white">Recipient Audience List</h3>
                <p className="text-xs text-slate-400">Upload CSV file containing emails and merge fields (`email, firstName, lastName`)</p>

                <div className="border-2 border-dashed border-border/80 rounded-2xl p-8 text-center bg-surface/30 hover:border-primary-500 transition-all">
                  <Upload className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                  <p className="text-xs font-semibold text-slate-200">Drag and drop your CSV file here</p>
                  <p className="text-[11px] text-slate-400 mt-1">Supports up to 50MB CSV files (~1,000,000 rows)</p>

                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label
                    htmlFor="csv-file-input"
                    className="inline-block mt-4 px-4 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-slate-200 hover:bg-surface-hover cursor-pointer transition-all"
                  >
                    Select File
                  </label>
                </div>

                {csvFile && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
                    <span className="font-mono">📄 {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)</span>
                    <span className="font-semibold">Parsed Ready</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Or Paste CSV Data Directly:</label>
                  <textarea
                    rows={4}
                    value={recipientsCsv}
                    onChange={(e) => setRecipientsCsv(e.target.value)}
                    placeholder="email,firstName,lastName&#10;john@example.com,John,Doe&#10;alice@example.com,Alice,Smith"
                    className="glass-input w-full font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Compose HTML */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">Compose Email Content</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Available Tags:</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-cyan-400">
                      {"{{firstName}}"}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-cyan-400">
                      {"{{email}}"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">HTML Body Content</label>
                  <textarea
                    rows={8}
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    className="glass-input w-full font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Plain Text Fallback Body</label>
                  <textarea
                    rows={3}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    className="glass-input w-full font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {step === 5 && (
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-white">Review Campaign Details</h3>

                <div className="space-y-3 bg-surface/40 p-4 rounded-xl border border-border/60 text-xs">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-slate-400">Campaign Name:</span>
                    <span className="font-semibold text-white">{name || 'Untitled Campaign'}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-slate-400">Subject:</span>
                    <span className="font-semibold text-white">{subject || 'No Subject'}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-slate-400">Sender Identity:</span>
                    <span className="font-mono text-cyan-400">newsletter@example.com</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-slate-400">Provider Strategy:</span>
                    <span className="font-semibold text-white">AWS SES Production</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tracking Options:</span>
                    <span className="text-emerald-400 font-semibold">Open & Click Tracking Enabled</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-3">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <span>
                    Submitting will place the campaign into BullMQ async queue pipeline. Emails will be rate-limited and sent in batches.
                  </span>
                </div>
              </div>
            )}

            {/* Controls Button Row */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <button
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {step < 5 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting...' : 'Submit & Queue Campaign'}</span>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
