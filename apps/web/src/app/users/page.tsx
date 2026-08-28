'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Users, Shield, Lock, Check, X, Plus, Mail } from 'lucide-react';

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<string>('u-1');

  // Users list
  const usersList = [
    { id: 'u-1', name: 'Jitendra More', email: 'admin@marketing-pro.internal', role: 'ADMIN', status: 'ACTIVE' },
    { id: 'u-2', name: 'Sarah Conner', email: 'sarah.c@marketing-pro.internal', role: 'USER', status: 'ACTIVE' },
    { id: 'u-3', name: 'Michael Scott', email: 'michael.s@marketing-pro.internal', role: 'USER', status: 'ACTIVE' },
  ];

  // All Sender Identities in system
  const allSenders = [
    { id: 's-1', email: 'newsletter@example.com', name: 'Newsletter Team' },
    { id: 's-2', email: 'marketing@example.com', name: 'Marketing Dept' },
    { id: 's-3', email: 'finance@example.com', name: 'Finance Desk' },
    { id: 's-4', email: 'hr@example.com', name: 'Human Resources' },
  ];

  // Matrix of Authorized User Senders
  const [userAccess, setUserAccess] = useState<Record<string, string[]>>({
    'u-1': ['s-1', 's-2', 's-3', 's-4'], // Admin has all
    'u-2': ['s-1', 's-2'],               // User A: only newsletter & marketing
    'u-3': ['s-3'],                      // User B: only finance
  });

  const toggleSenderAccess = (userId: string, senderId: string) => {
    setUserAccess((prev) => {
      const current = prev[userId] || [];
      const hasAccess = current.includes(senderId);
      const updated = hasAccess
        ? current.filter((id) => id !== senderId)
        : [...current, senderId];
      return { ...prev, [userId]: updated };
    });
  };

  const activeUserData = usersList.find((u) => u.id === selectedUser)!;
  const activeUserSenders = userAccess[selectedUser] || [];

  return (
    <div className="min-h-screen bg-background text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="p-8 pl-72 space-y-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                RBAC & Sender Authorization Matrix
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-normal">
                  Backend Guard Active
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Grant or revoke specific sender email identity access per user. Backend API rejects requests if non-authorized sender is submitted.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Select User (1 col) */}
            <div className="glass-panel p-5 space-y-4">
              <h3 className="font-semibold text-slate-100 text-sm flex items-center justify-between">
                <span>Select User</span>
                <span className="text-xs text-slate-400 font-normal">{usersList.length} users</span>
              </h3>

              <div className="space-y-2">
                {usersList.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedUser === u.id
                        ? 'bg-primary-600/20 border-primary-500 text-white shadow-lg shadow-primary-500/10'
                        : 'bg-surface/50 border-border/60 text-slate-300 hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold">{u.name}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-1">{u.email}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Sender Authorization Matrix (2 cols) */}
            <div className="glass-panel p-6 lg:col-span-2 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Authorized Senders for <span className="text-primary-400">{activeUserData?.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeUserData?.email}</p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-surface border border-border text-xs text-slate-300">
                  <span className="font-bold text-emerald-400">{activeUserSenders.length}</span> / {allSenders.length} Senders Granted
                </div>
              </div>

              <div className="space-y-3">
                {allSenders.map((s) => {
                  const isGranted = activeUserSenders.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        isGranted
                          ? 'bg-emerald-500/5 border-emerald-500/30'
                          : 'bg-surface/30 border-border/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isGranted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface text-slate-500'
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-mono font-bold text-slate-100">{s.email}</p>
                          <p className="text-[11px] text-slate-400">{s.name}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSenderAccess(selectedUser, s.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isGranted
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30'
                            : 'bg-surface border-border text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400'
                        }`}
                      >
                        {isGranted ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Allowed
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Revoked (Forbidden)
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-surface/60 border border-border/50 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">🛡️ How Authorization Works:</p>
                <p>
                  When {activeUserData?.name} attempts to create or submit a campaign via REST API, Fastify middleware calls `validateSenderAuthorization(userId, senderIdentityId)`. If sender access is Revoked, API throws `403 Forbidden`.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
