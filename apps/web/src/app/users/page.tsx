'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import {
  Users,
  Plus,
  Mail,
  Lock,
  Check,
  Shield,
  X,
  UserPlus,
  AlertCircle,
  RefreshCw,
  Sliders,
} from 'lucide-react';

export default function UsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [sendersList, setSendersList] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State for Creating User
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserRole, setNewUserRole] = useState('USER');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sender Access Matrix per user
  const [userSenderAccess, setUserSenderAccess] = useState<Record<string, string[]>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, sendersRes] = await Promise.all([
        api.get<{ data: any[] }>('/users').catch(() => ({ data: [] })),
        api.get<{ data: any[] }>('/senders').catch(() => ({ data: [] })),
      ]);

      const fetchedUsers = usersRes.data || [];
      const fetchedSenders = sendersRes.data || [];

      setUsersList(fetchedUsers);
      setSendersList(fetchedSenders);

      if (fetchedUsers.length > 0) {
        setSelectedUserId(fetchedUsers[0].id);
      }
    } catch (e) {
      setUsersList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);

    try {
      const createdUser = await api.post<any>('/users', {
        email: newUserEmail,
        password: newUserPassword,
        firstName: newUserFirstName,
        lastName: newUserLastName,
        roles: [newUserRole],
      });

      setUsersList((prev) => [createdUser, ...prev]);
      setSelectedUserId(createdUser.id);
      setIsCreateModalOpen(false);

      // Reset form
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserFirstName('');
      setNewUserLastName('');
      setNewUserRole('USER');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/users/${userId}`, { roles: [newRole] });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: [newRole] } : u))
      );
    } catch (e) {
      // Ignore
    }
  };

  const toggleSenderAccess = async (userId: string, senderId: string) => {
    const current = userSenderAccess[userId] || [];
    const hasAccess = current.includes(senderId);

    try {
      if (hasAccess) {
        await api.delete(`/users/${userId}/sender-access/${senderId}`).catch(() => {});
        setUserSenderAccess((prev) => ({
          ...prev,
          [userId]: (prev[userId] || []).filter((id) => id !== senderId),
        }));
      } else {
        await api.post(`/users/${userId}/sender-access`, { senderIdentityId: senderId }).catch(() => {});
        setUserSenderAccess((prev) => ({
          ...prev,
          [userId]: [...(prev[userId] || []), senderId],
        }));
      }
    } catch (e) {
      // Fallback optimistic UI toggle
      setUserSenderAccess((prev) => {
        const list = prev[userId] || [];
        return {
          ...prev,
          [userId]: hasAccess ? list.filter((id) => id !== senderId) : [...list, senderId],
        };
      });
    }
  };

  const selectedUser = usersList.find((u) => u.id === selectedUserId);
  const activeUserSenders = selectedUserId ? userSenderAccess[selectedUserId] || [] : [];

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
                Users & Role Management
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-normal">
                  RBAC Active
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Create user accounts, assign system roles (ADMIN, MAINTAINER, USER), and grant explicit sender identity authorizations.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New User</span>
            </button>
          </div>

          {/* User Management Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: User List (1 col) */}
            <div className="glass-panel p-5 space-y-4">
              <h3 className="font-semibold text-slate-100 text-sm flex items-center justify-between">
                <span>Organization Users</span>
                <span className="text-xs text-slate-400 font-normal">{usersList.length} users</span>
              </h3>

              {usersList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No users found. Click Create New User.</div>
              ) : (
                <div className="space-y-2">
                  {usersList.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedUserId === u.id
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
              )}
            </div>

            {/* Right: Selected User Role & Sender Access Controls (2 cols) */}
            <div className="glass-panel p-6 lg:col-span-2 space-y-6">
              {selectedUser ? (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div>
                      <h3 className="font-bold text-base text-white">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{selectedUser.email}</p>
                    </div>

                    {/* Role Selector Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Assigned Role:</span>
                      <select
                        value={selectedUser.roles?.[0] || 'USER'}
                        onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                        className="glass-input text-xs font-semibold text-primary-400 bg-surface"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MAINTAINER">MAINTAINER</option>
                        <option value="USER">USER</option>
                      </select>
                    </div>
                  </div>

                  {/* Sender Authorization Matrix */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-slate-200">Sender Identity Authorization Permissions</h4>
                    <p className="text-xs text-slate-400">
                      Explicitly grant or revoke sender email addresses this user is allowed to dispatch from:
                    </p>

                    {sendersList.length === 0 ? (
                      <div className="p-4 rounded-xl bg-surface/40 border border-border/50 text-xs text-slate-400 text-center">
                        No sender identities configured yet. Add senders in the Senders tab to assign permissions.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sendersList.map((s) => {
                          const isGranted = activeUserSenders.includes(s.id);
                          return (
                            <div
                              key={s.id}
                              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                                isGranted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-surface/30 border-border/40'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Mail className={`w-4 h-4 ${isGranted ? 'text-emerald-400' : 'text-slate-500'}`} />
                                <div>
                                  <p className="text-xs font-mono font-bold text-slate-200">{s.emailAddress}</p>
                                  <p className="text-[10px] text-slate-400">{s.displayName || s.domain}</p>
                                </div>
                              </div>

                              <button
                                onClick={() => toggleSenderAccess(selectedUser.id, s.id)}
                                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                                  isGranted
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-400'
                                    : 'bg-surface border-border text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400'
                                }`}
                              >
                                {isGranted ? 'Allowed' : 'Revoked'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">Select a user to view and assign roles & sender permissions.</div>
              )}
            </div>
          </div>

          {/* Create User Modal */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md glass-panel p-6 space-y-5 border-border/80 relative">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-primary-400" /> Create New User
                  </h3>
                  <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={newUserFirstName}
                        onChange={(e) => setNewUserFirstName(e.target.value)}
                        placeholder="John"
                        className="glass-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={newUserLastName}
                        onChange={(e) => setNewUserLastName(e.target.value)}
                        placeholder="Doe"
                        className="glass-input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="john.doe@company.com"
                      className="glass-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="glass-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">System Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="glass-input w-full bg-surface"
                    >
                      <option value="USER">USER (Standard User)</option>
                      <option value="MAINTAINER">MAINTAINER (Operations)</option>
                      <option value="ADMIN">ADMIN (System Administrator)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-slate-300 hover:bg-surface-hover"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-500/20"
                    >
                      {creating ? 'Creating...' : 'Create User'}
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
