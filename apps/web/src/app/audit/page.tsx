'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { ShieldAlert, Search, FileText, Lock, UserCheck, Key } from 'lucide-react';

export default function AuditPage() {
  const auditLogs = [
    {
      id: 'aud-101',
      action: 'USER_GRANT_SENDER_ACCESS',
      user: 'admin@marketing-pro.internal',
      resource: 'User: sarah.c@marketing-pro.internal',
      details: 'Granted access to sender newsletter@example.com',
      ip: '192.168.1.45',
      time: '2026-08-28 12:10:45',
    },
    {
      id: 'aud-102',
      action: 'CAMPAIGN_SUBMITTED',
      user: 'sarah.c@marketing-pro.internal',
      resource: 'Campaign: Q3 Product Launch Announcement',
      details: 'Queued 15,000 recipients via AWS SES',
      ip: '192.168.1.88',
      time: '2026-08-28 10:15:22',
    },
    {
      id: 'aud-103',
      action: 'PROVIDER_CREATED',
      user: 'admin@marketing-pro.internal',
      resource: 'Provider: AWS SES Production',
      details: 'Encrypted AES-256-GCM credentials stored',
      ip: '192.168.1.45',
      time: '2026-08-20 09:30:00',
    },
    {
      id: 'aud-104',
      action: 'USER_LOGIN',
      user: 'sarah.c@marketing-pro.internal',
      resource: 'Session',
      details: 'JWT + Refresh Token Family issued',
      ip: '192.168.1.88',
      time: '2026-08-28 08:45:10',
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
              <h1 className="text-2xl font-bold text-slate-100">Audit Trail</h1>
              <p className="text-xs text-slate-400 mt-1">
                Immutable security logs tracking all state-changing API operations, authorization changes & logins.
              </p>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-surface/50 text-slate-400 font-medium">
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor User</th>
                  <th className="p-4">Target Resource</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4 font-mono">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/40 transition-all text-[11px]">
                    <td className="p-4 font-bold text-cyan-400">{log.action}</td>
                    <td className="p-4 text-slate-200">{log.user}</td>
                    <td className="p-4 text-slate-300">{log.resource}</td>
                    <td className="p-4 text-slate-400">{log.details}</td>
                    <td className="p-4 text-slate-400">{log.ip}</td>
                    <td className="p-4 text-slate-500">{log.time}</td>
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
