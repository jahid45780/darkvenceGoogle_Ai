import React, { useState } from 'react';
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  X,
  Loader2,
  Tag
} from 'lucide-react';
import { InquiryItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminInquiriesPageProps {
  inquiries: InquiryItem[];
  onRefresh: () => void;
}

export const AdminInquiriesPage: React.FC<AdminInquiriesPageProps> = ({ inquiries, onRefresh }) => {
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Custom Delete Modal
  const [deletingInquiry, setDeletingInquiry] = useState<InquiryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statuses = ['ALL', 'NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'SPAM'];

  const filteredInquiries = inquiries.filter(inq => {
    const matchesStatus = statusFilter === 'ALL' || inq.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inq.company && inq.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inq.serviceInterested.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenDetail = (inquiry: InquiryItem) => {
    setSelectedInquiry(inquiry);
    setInternalNotes(inquiry.internalNotes || '');
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      setErrorMessage(null);
      await api.updateInquiry(inquiryId, { status: newStatus });
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus as any });
      }
      setSuccessMessage(`Inquiry status updated to ${newStatus}.`);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    try {
      setIsUpdating(true);
      setErrorMessage(null);
      await api.updateInquiry(selectedInquiry.id, { internalNotes });
      setSelectedInquiry({ ...selectedInquiry, internalNotes });
      setSuccessMessage('Internal team CRM notes saved.');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save notes.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deletingInquiry) return;
    try {
      setIsDeleting(true);
      setErrorMessage(null);
      await api.deleteInquiry(deletingInquiry.id);
      if (selectedInquiry?.id === deletingInquiry.id) {
        setSelectedInquiry(null);
      }
      setSuccessMessage('Inquiry successfully removed.');
      setDeletingInquiry(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete inquiry.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'CONTACTED':
        return 'bg-[#B6FF2B]/20 text-[#B6FF2B] border-[#B6FF2B]';
      case 'IN_PROGRESS':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'SPAM':
        return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
      default:
        return 'bg-white/5 text-slate-400 border-white/10';
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B6FF2B] uppercase tracking-wider">
            <span>CRM &amp; Lead Management</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display mt-1">Client Inquiries &amp; CRM</h1>
          <p className="text-xs text-slate-400 mt-1">Review incoming discovery briefs, budget scopes, and client status.</p>
        </div>
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

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#0F0F0F] border border-white/5 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inquiries by name, email, company, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161616] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B6FF2B]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#B6FF2B] text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {status}
              {status === 'ALL' && ` (${inquiries.length})`}
              {status !== 'ALL' && ` (${inquiries.filter(i => i.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-4">Client Contact</th>
                <th className="py-3.5 px-4">Service Required</th>
                <th className="py-3.5 px-4">Budget Scope</th>
                <th className="py-3.5 px-4">Date Received</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No client inquiries match the current filter.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-white font-display">{inq.name}</span>
                        {inq.company && <span className="text-[11px] text-slate-400 block">{inq.company}</span>}
                        <span className="text-[11px] text-[#B6FF2B] font-mono block">{inq.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {inq.serviceInterested}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {inq.budgetRange || 'Unspecified'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        className={`text-[10px] font-mono px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadge(inq.status)}`}
                      >
                        <option value="NEW" className="bg-[#0e1017] text-white">NEW</option>
                        <option value="CONTACTED" className="bg-[#0e1017] text-white">CONTACTED</option>
                        <option value="IN_PROGRESS" className="bg-[#0e1017] text-white">IN_PROGRESS</option>
                        <option value="COMPLETED" className="bg-[#0e1017] text-white">COMPLETED</option>
                        <option value="SPAM" className="bg-[#0e1017] text-white">SPAM</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetail(inq)}
                        className="px-2.5 py-1 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                      >
                        View Brief
                      </button>
                      <button
                        onClick={() => setDeletingInquiry(inq)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Delete Client Inquiry?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to permanently delete the inquiry from <strong className="text-white">{deletingInquiry.name}</strong> ({deletingInquiry.email})?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setDeletingInquiry(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isDeleting ? 'Deleting...' : 'Delete Inquiry'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Detail Drawer / Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getStatusBadge(selectedInquiry.status)}`}>
                {selectedInquiry.status}
              </span>
              <h2 className="text-xl font-bold text-white font-display mt-2">
                Inquiry from {selectedInquiry.name}
              </h2>
              <p className="text-xs text-slate-400">
                Received on {new Date(selectedInquiry.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <div>
                <span className="text-slate-500 block">Email Address:</span>
                <a href={`mailto:${selectedInquiry.email}`} className="text-[#B6FF2B] font-mono hover:underline">
                  {selectedInquiry.email}
                </a>
              </div>
              <div>
                <span className="text-slate-500 block">Phone:</span>
                <span className="text-slate-200">{selectedInquiry.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Company:</span>
                <span className="text-slate-200">{selectedInquiry.company || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Budget Scope:</span>
                <span className="text-slate-200 font-mono">{selectedInquiry.budgetRange || 'Unspecified'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-semibold text-slate-400">Client Brief / Message</h4>
              <div className="p-4 rounded-xl bg-[#161616] border border-white/5 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-semibold text-slate-400">Internal Agency Notes</h4>
              <textarea
                rows={3}
                placeholder="Add private team CRM notes, call log, or proposal stage..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-xs text-white"
              />
              <button
                onClick={handleSaveNotes}
                disabled={isUpdating}
                className="px-4 py-2 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl disabled:opacity-50"
              >
                {isUpdating ? 'Saving Notes...' : 'Save Internal Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
