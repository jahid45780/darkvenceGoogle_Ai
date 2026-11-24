import React, { useState } from 'react';
import { UserCheck, Plus, Trash2, Shield, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { AdminUser } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminUsersPageProps {
  users: AdminUser[];
  onRefresh: () => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ users, onRefresh }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; email: string; password: string; role: 'admin' | 'editor' }>({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Custom delete modal
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('All fields are required.');
      return;
    }

    if (newUser.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await api.createAdminUser(newUser);
      setIsCreating(false);
      setNewUser({ name: '', email: '', password: '', role: 'admin' });
      setSuccessMessage('Administrator account provisioned successfully.');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create administrator account.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromptDelete = (user: AdminUser) => {
    if (user.role === 'superadmin') {
      setError('The primary superadmin account cannot be removed.');
      return;
    }
    setDeletingUser(user);
    setError(null);
  };

  const handleExecuteDelete = async () => {
    if (!deletingUser) return;
    try {
      setIsDeleting(true);
      setError(null);
      await api.deleteAdminUser(deletingUser.id);
      setSuccessMessage(`Account for ${deletingUser.name} removed.`);
      setDeletingUser(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B6FF2B] uppercase tracking-wider">
            <span>Security &amp; Access</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display mt-1">Administrator Accounts &amp; RBAC</h1>
          <p className="text-xs text-slate-400 mt-1">Manage team permissions, role-based access control, and user credentials.</p>
        </div>
        <button
          onClick={() => { setIsCreating(true); setError(null); }}
          className="px-4 py-2.5 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Account</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && !isCreating && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Users List */}
      <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-black border border-[#232323] text-[#B6FF2B] flex items-center justify-center font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      u.role === 'superadmin'
                        ? 'bg-[#B6FF2B] text-black border-[#B6FF2B] font-bold'
                        : u.role === 'admin'
                        ? 'bg-[#B6FF2B]/15 text-[#B6FF2B] border-[#B6FF2B]/40'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {u.role !== 'superadmin' ? (
                      <button
                        onClick={() => handlePromptDelete(u)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                        title="Delete account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Revoke Account Access?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove administrator access for <strong className="text-white">{deletingUser.name}</strong> ({deletingUser.email})?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision Account Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsCreating(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-white font-display">Provision Administrator Account</h2>
              <p className="text-xs text-slate-400 mt-0.5">Grant access to content management and CRM leads.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@darkvence.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Initial Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Administrative Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  <option value="admin">Administrator (Full CMS &amp; CRM Access)</option>
                  <option value="editor">Editor (Content &amp; Blog Only)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSaving ? 'Provisioning...' : 'Provision Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
