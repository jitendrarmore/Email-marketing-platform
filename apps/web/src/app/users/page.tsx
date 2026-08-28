'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { Users, Mail, Inbox, Lock, Check } from 'lucide-react';

export default function UsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: any[] }>('/users').catch(() => ({ data: [] }));
      const fetched = res.data || [];
      setUsersList(fetched);
      if (fetched.length > 0) setSelectedUser(fetched[0].id);
    } catch (e) {
      setUsersList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

          {usersList.length === 0 ? (
            <div className="glass-panel p-16 text-center space-y-3">
              <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
              <div>
                <p className="text-base font-semibold text-slate-200">No registered users in organization</p>
                <p className="text-xs text-slate-400 mt-1">Users created via sign-up or admin invitation will appear here for sender assignment.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Select User */}
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
                        <p className="text-xs font-bold">{u.firstName} {u.lastName}</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {u.roles?.[0] || 'USER'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-1">{u.email}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Matrix */}
              <div className="glass-panel p-6 lg:col-span-2 space-y-5">
                <h3 className="font-bold text-sm text-white">Sender Identity Authorization Permissions</h3>
                <p className="text-xs text-slate-400">Manage granted sender email identities for the selected user.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
