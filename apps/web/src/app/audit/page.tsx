'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { ShieldAlert, Inbox } from 'lucide-react';

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: any[] }>('/audit').catch(() => ({ data: [] }));
      setAuditLogs(res.data || []);
    } catch (e) {
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
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
              <h1 className="text-2xl font-bold text-slate-100">Audit Trail</h1>
              <p className="text-xs text-slate-400 mt-1">
                Immutable security logs tracking all state-changing API operations, authorization changes & logins.
              </p>
            </div>
          </div>

          {/* Audit Logs Table or Clean Empty State */}
          <div className="glass-panel overflow-hidden">
            {auditLogs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
                <div>
                  <p className="text-base font-semibold text-slate-200">No security audit logs recorded</p>
                  <p className="text-xs text-slate-400 mt-1">State-changing events (logins, provider updates, sender permissions) will be logged here.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border/60 bg-surface/50 text-slate-400 font-medium">
                    <th className="p-4">Action</th>
                    <th className="p-4">Actor User</th>
                    <th className="p-4">Target Resource</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface/40 transition-all">
                      <td className="p-4 font-bold text-cyan-400">{log.action}</td>
                      <td className="p-4 text-slate-200">{log.userId}</td>
                      <td className="p-4 text-slate-300">{log.resourceType} ({log.resourceId})</td>
                      <td className="p-4 text-slate-500">{log.createdAt}</td>
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
