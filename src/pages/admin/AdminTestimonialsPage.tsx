import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  Star,
  Search,
  Eye,
  EyeOff,
  Power,
  Quote,
  ArrowUpDown,
  Image as ImageIcon
} from 'lucide-react';
import { Testimonial } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminTestimonialsPageProps {
  testimonials: Testimonial[];
  onRefresh: () => void;
}

type StatusFilter = 'all' | 'live' | 'draft' | 'inactive';

const getInitials = (name?: string) => {
  if (!name) return 'CL';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const AdminTestimonialsPage: React.FC<AdminTestimonialsPageProps> = ({
  testimonials,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<Partial<Testimonial> | null>(null);
  const [deletingItem, setDeletingItem] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewImgError, setPreviewImgError] = useState(false);

  const stats = useMemo(() => {
    const total = testimonials.length;
    const live = testimonials.filter((t) => t.isActive && t.isPublished).length;
    const drafts = testimonials.filter((t) => !t.isPublished).length;
    const avgRating =
      total > 0
        ? (testimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / total).toFixed(1)
        : '—';
    return { total, live, drafts, avgRating };
  }, [testimonials]);

  const filteredTestimonials = useMemo(() => {
    return [...testimonials]
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .filter((t) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.designation.toLowerCase().includes(q) ||
          t.company.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q);

        const matchesFilter =
          statusFilter === 'all' ||
          (statusFilter === 'live' && t.isActive && t.isPublished) ||
          (statusFilter === 'draft' && !t.isPublished) ||
          (statusFilter === 'inactive' && !t.isActive);

        return matchesSearch && matchesFilter;
      });
  }, [testimonials, searchQuery, statusFilter]);

  const handleCreateNew = () => {
    const nextOrder =
      testimonials.length > 0
        ? Math.max(...testimonials.map((t) => t.displayOrder ?? 0)) + 1
        : 1;
    setEditingItem({
      name: '',
      designation: '',
      company: '',
      content: '',
      rating: 5,
      image: '',
      isActive: true,
      isPublished: true,
      displayOrder: nextOrder
    });
    setPreviewImgError(false);
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleEdit = (item: Testimonial) => {
    setEditingItem({ ...item });
    setPreviewImgError(false);
    setIsCreating(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      setError('Only JPEG, PNG, WebP, and SVG images are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Client photo or logo must be under 5MB.');
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadImage(base64, `${editingItem?.name || 'client'}_avatar`);
        if (res?.url) {
          setPreviewImgError(false);
          setEditingItem((prev) => (prev ? { ...prev, image: res.url } : null));
          setSuccessMessage('Client image uploaded successfully.');
        }
      } catch (err: any) {
        setError(err.message || 'Image upload failed.');
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.name?.trim() || editingItem.name.trim().length < 2) {
      setError('Client name is required (minimum 2 characters).');
      return;
    }
    if (!editingItem.designation?.trim() || editingItem.designation.trim().length < 2) {
      setError('Client designation / role is required (minimum 2 characters).');
      return;
    }
    if (!editingItem.company?.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!editingItem.content?.trim() || editingItem.content.trim().length < 10) {
      setError('Testimonial text must be at least 10 characters.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      name: editingItem.name.trim(),
      designation: editingItem.designation.trim(),
      company: editingItem.company.trim(),
      content: editingItem.content.trim(),
      rating: Math.min(5, Math.max(1, Number(editingItem.rating || 5))),
      image: editingItem.image?.trim() || '',
      isActive: editingItem.isActive ?? true,
      isPublished: editingItem.isPublished ?? true,
      displayOrder: Math.max(0, Number(editingItem.displayOrder ?? 0))
    };

    try {
      if (isCreating) {
        await api.createTestimonial(payload);
        setSuccessMessage(`Testimonial from "${payload.name}" created successfully.`);
      } else if (editingItem.id) {
        await api.updateTestimonial(editingItem.id, payload);
        setSuccessMessage(`Testimonial from "${payload.name}" updated successfully.`);
      }
      setEditingItem(null);
      setIsCreating(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save testimonial.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickToggle = async (
    item: Testimonial,
    field: 'isActive' | 'isPublished'
  ) => {
    setTogglingId(item.id);
    setError(null);
    try {
      const nextVal = !item[field];
      await api.updateTestimonialStatus(item.id, { [field]: nextVal });
      setSuccessMessage(
        field === 'isPublished'
          ? `Testimonial "${item.name}" ${nextVal ? 'published to live website' : 'moved to draft'}.`
          : `Testimonial "${item.name}" ${nextVal ? 'enabled' : 'disabled'}.`
      );
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update testimonial visibility.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    setError(null);
    try {
      await api.deleteTestimonial(deletingItem.id);
      setSuccessMessage(`Testimonial from "${deletingItem.name}" deleted.`);
      setDeletingItem(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete testimonial.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232323] pb-6">
        <div>
          <div className="text-xs font-mono font-medium text-[#B6FF2B] uppercase tracking-[0.12em]">
            Social Proof &amp; Reviews CMS
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
            Client Testimonials Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A1] mt-1">
            Create, curate, preview, and publish real client testimonials shown on the public homepage.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Testimonial</span>
        </button>
      </div>

      {/* Feedback Banners */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-[#A1A1A1] hover:text-white cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && !editingItem && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-[#A1A1A1] hover:text-white cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F0F0F] border border-[#232323]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">Total Records</p>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono-tabular mt-1">{stats.total}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F0F0F] border border-[#232323]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">Live on Homepage</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#B6FF2B] font-mono-tabular mt-1">{stats.live}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F0F0F] border border-[#232323]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">Drafts / Unpublished</p>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono-tabular mt-1">{stats.drafts}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F0F0F] border border-[#232323]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">Average Rating</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono-tabular">{stats.avgRating}</span>
            <Star className="w-4 h-4 fill-[#B6FF2B] text-[#B6FF2B]" />
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#0F0F0F] border border-[#232323] rounded-xl overflow-x-auto max-w-full">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'live', label: 'Live on Site' },
              { id: 'draft', label: 'Unpublished' },
              { id: 'inactive', label: 'Disabled' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#B6FF2B] text-black font-bold'
                  : 'text-[#A1A1A1] hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#A1A1A1] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, role, company..."
            className="w-full bg-[#0F0F0F] border border-[#232323] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#A1A1A1] focus:outline-none focus:border-[#B6FF2B]"
          />
        </div>
      </div>

      {/* Empty State vs List */}
      {filteredTestimonials.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-3xl bg-[#0F0F0F] border border-[#232323] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#232323] flex items-center justify-center mx-auto text-[#B6FF2B]">
            <Quote className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white font-display">
              {testimonials.length === 0
                ? 'No Client Testimonials Added Yet'
                : 'No Testimonials Match Your Filter'}
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1A1] mx-auto">
              {testimonials.length === 0
                ? 'Add verified client feedback here. Only testimonials marked Active and Published appear on the public website.'
                : 'Try clearing your search query or switching the status filter tab.'}
            </p>
          </div>
          {testimonials.length === 0 && (
            <button
              onClick={handleCreateNew}
              className="px-5 py-2.5 text-xs font-bold text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Testimonial</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block rounded-2xl bg-[#0F0F0F] border border-[#232323] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#232323] bg-[#161616] text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">
                    <th className="py-3.5 px-4">Order</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4">Testimonial</th>
                    <th className="py-3.5 px-4">Visibility</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232323] text-sm">
                  {filteredTestimonials.map((item) => {
                    const isLive = item.isActive && item.isPublished;
                    const busy = togglingId === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors align-top">
                        <td className="py-4 px-4 font-mono text-xs text-[#A1A1A1] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#161616] border border-[#232323]">
                            <ArrowUpDown className="w-3 h-3 text-[#B6FF2B]" />
                            #{item.displayOrder}
                          </span>
                        </td>
                        <td className="py-4 px-4 min-w-[210px]">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-full object-cover border border-[#232323] shrink-0 bg-black"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#232323] flex items-center justify-center text-xs font-bold text-[#B6FF2B] font-mono shrink-0">
                                {getInitials(item.name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-white font-display truncate">{item.name}</p>
                              <p className="text-xs text-[#A1A1A1] truncate">
                                {item.designation} · {item.company}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= item.rating
                                    ? 'fill-[#B6FF2B] text-[#B6FF2B]'
                                    : 'text-[#232323]'
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-md">
                          <p className="text-xs text-[#A1A1A1] leading-relaxed line-clamp-2 break-words">
                            &ldquo;{item.content}&rdquo;
                          </p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleQuickToggle(item, 'isPublished')}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-colors cursor-pointer ${
                                item.isPublished
                                  ? 'bg-[#B6FF2B]/15 text-[#B6FF2B] border-[#B6FF2B]/40'
                                  : 'bg-[#161616] text-[#A1A1A1] border-[#232323] hover:text-white'
                              }`}
                            >
                              {item.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{item.isPublished ? 'Published' : 'Unpublished'}</span>
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleQuickToggle(item, 'isActive')}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-colors cursor-pointer ${
                                item.isActive
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              <Power className="w-3 h-3" />
                              <span>{item.isActive ? 'Enabled' : 'Disabled'}</span>
                            </button>
                            {isLive && (
                              <span className="text-[10px] font-mono text-[#B6FF2B] uppercase tracking-wider">
                                ● Live on site
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-[#B6FF2B] hover:border-[#B6FF2B] transition-colors cursor-pointer"
                              title="Preview live card"
                              aria-label={`Preview testimonial by ${item.name}`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-white hover:border-[#B6FF2B] transition-colors cursor-pointer"
                              title="Edit testimonial"
                              aria-label={`Edit testimonial by ${item.name}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingItem(item)}
                              className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40 transition-colors cursor-pointer"
                              title="Delete testimonial"
                              aria-label={`Delete testimonial by ${item.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet Card List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredTestimonials.map((item) => {
              const busy = togglingId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#0F0F0F] border border-[#232323] space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#232323] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#161616] border border-[#232323] flex items-center justify-center text-xs font-bold text-[#B6FF2B] font-mono shrink-0">
                            {getInitials(item.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{item.name}</p>
                          <p className="text-xs text-[#A1A1A1] truncate">
                            {item.designation} · {item.company}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-[#A1A1A1] bg-[#161616] px-2 py-0.5 rounded border border-[#232323]">
                        #{item.displayOrder}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= item.rating ? 'fill-[#B6FF2B] text-[#B6FF2B]' : 'text-[#232323]'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-[#A1A1A1] leading-relaxed break-words">
                      &ldquo;{item.content}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#232323] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleQuickToggle(item, 'isPublished')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                          item.isPublished
                            ? 'bg-[#B6FF2B]/15 text-[#B6FF2B] border-[#B6FF2B]/40'
                            : 'bg-[#161616] text-[#A1A1A1] border-[#232323]'
                        }`}
                      >
                        {item.isPublished ? 'Published' : 'Draft'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleQuickToggle(item, 'isActive')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                          item.isActive
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-[#B6FF2B] cursor-pointer"
                        aria-label="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="p-1.5 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-white cursor-pointer"
                        aria-label="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 rounded-lg bg-[#161616] border border-[#232323] text-rose-400 cursor-pointer"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CREATE / EDIT MODAL WITH LIVE CARD PREVIEW */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F0F0F] border border-[#232323] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-[#232323] pb-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#B6FF2B]">
                  {isCreating ? 'New Client Endorsement' : 'Update Client Endorsement'}
                </p>
                <h2 className="text-xl font-bold text-white font-display">
                  {isCreating ? 'Add Client Testimonial' : `Edit — ${editingItem.name}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsCreating(false);
                }}
                className="p-2 rounded-xl bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-white cursor-pointer"
                aria-label="Close editor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Form Fields */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white">
                      Client Name <span className="text-[#B6FF2B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Rahman"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full bg-[#161616] border border-[#232323] rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white">
                      Designation / Role <span className="text-[#B6FF2B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Technology Officer"
                      value={editingItem.designation || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, designation: e.target.value })}
                      className="w-full bg-[#161616] border border-[#232323] rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white">
                      Company Name <span className="text-[#B6FF2B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FinScale Ltd."
                      value={editingItem.company || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                      className="w-full bg-[#161616] border border-[#232323] rounded-xl px-3.5 py-2.5 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white">Display Order</label>
                    <input
                      type="number"
                      min={0}
                      max={9999}
                      value={editingItem.displayOrder ?? 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          displayOrder: Math.max(0, parseInt(e.target.value || '0', 10) || 0)
                        })
                      }
                      className="w-full bg-[#161616] border border-[#232323] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                </div>

                {/* Star Rating Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white block">
                    Client Rating ({editingItem.rating ?? 5} / 5 Stars)
                  </label>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#161616] border border-[#232323] w-fit">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, rating: star })}
                        className="p-1 rounded-lg hover:bg-white/5 transition-transform hover:scale-110 cursor-pointer"
                        aria-label={`Set rating to ${star} stars`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= (editingItem.rating ?? 5)
                              ? 'fill-[#B6FF2B] text-[#B6FF2B]'
                              : 'text-[#3A3A3A]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Testimonial Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">
                    Testimonial Text <span className="text-[#B6FF2B]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share the client's real feedback, outcome, and experience..."
                    value={editingItem.content || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                    className="w-full bg-[#161616] border border-[#232323] rounded-xl px-3.5 py-2.5 text-sm text-white leading-relaxed"
                  />
                </div>

                {/* Image Upload or URL */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white block">
                    Client Avatar or Company Logo (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      placeholder="https://... or upload image"
                      value={editingItem.image || ''}
                      onChange={(e) => {
                        setPreviewImgError(false);
                        setEditingItem({ ...editingItem, image: e.target.value });
                      }}
                      className="flex-1 bg-[#161616] border border-[#232323] rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                    />
                    <label className="px-4 py-2 rounded-xl bg-[#161616] border border-[#232323] hover:border-[#B6FF2B] text-xs font-semibold text-white inline-flex items-center justify-center gap-2 cursor-pointer shrink-0">
                      {isUploadingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B6FF2B]" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#B6FF2B]" />
                      )}
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>
                    {editingItem.image && (
                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, image: '' })}
                        className="px-3 py-2 rounded-xl bg-[#161616] border border-[#232323] text-xs text-rose-400 hover:border-rose-500/40 cursor-pointer shrink-0"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Visibility Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="p-3.5 rounded-xl bg-[#161616] border border-[#232323] flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold text-white">Published</p>
                      <p className="text-[11px] text-[#A1A1A1]">Show on public homepage</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingItem.isPublished ?? true}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, isPublished: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#B6FF2B] cursor-pointer"
                    />
                  </label>

                  <label className="p-3.5 rounded-xl bg-[#161616] border border-[#232323] flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-xs font-semibold text-white">Active</p>
                      <p className="text-[11px] text-[#A1A1A1]">Enable testimonial record</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingItem.isActive ?? true}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, isActive: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#B6FF2B] cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Right: Live Public Card Preview */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#B6FF2B]">
                      Live Card Preview
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                        editingItem.isActive && editingItem.isPublished
                          ? 'bg-[#B6FF2B] text-black font-bold'
                          : 'bg-[#161616] text-[#A1A1A1] border border-[#232323]'
                      }`}
                    >
                      {editingItem.isActive && editingItem.isPublished ? 'Will Publish Live' : 'Hidden / Draft'}
                    </span>
                  </div>

                  {/* Preview Card mimicking public HomePage testimonial card */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-[#000000] border border-[#232323] flex flex-col justify-between space-y-6 shadow-xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (editingItem.rating ?? 5)
                                  ? 'fill-[#B6FF2B] text-[#B6FF2B]'
                                  : 'text-[#2A2A2A]'
                              }`}
                            />
                          ))}
                        </div>
                        <Quote className="w-4 h-4 text-[#B6FF2B]/50" />
                      </div>

                      <p className="text-sm sm:text-base text-white leading-[1.7] font-body break-words whitespace-normal">
                        &ldquo;{editingItem.content?.trim() || 'Client testimonial copy will appear here naturally wrapped with zero clipping...'}&rdquo;
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#232323] flex items-center gap-3.5">
                      {editingItem.image && !previewImgError ? (
                        <img
                          src={editingItem.image}
                          alt={editingItem.name || 'Client preview'}
                          className="w-11 h-11 rounded-full object-cover border border-[#232323] shrink-0 bg-[#161616]"
                          onError={() => setPreviewImgError(true)}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#161616] border border-[#232323] flex items-center justify-center text-xs font-bold text-[#B6FF2B] font-mono shrink-0">
                          {editingItem.image && previewImgError ? (
                            <ImageIcon className="w-4 h-4 text-[#A1A1A1]" />
                          ) : (
                            getInitials(editingItem.name)
                          )}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white font-display truncate">
                          {editingItem.name?.trim() || 'Client Name'}
                        </h4>
                        <p className="text-xs text-[#A1A1A1] font-mono break-words">
                          {editingItem.designation?.trim() || 'Designation'} ·{' '}
                          {editingItem.company?.trim() || 'Company'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#232323]">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(null);
                      setIsCreating(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#161616] border border-[#232323] text-xs font-semibold text-[#A1A1A1] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploadingImage}
                    className="px-5 py-2.5 rounded-xl bg-[#B6FF2B] hover:bg-[#9FE61A] text-black text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-[#B6FF2B]/20"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSaving ? 'Saving...' : isCreating ? 'Save Testimonial' : 'Update Testimonial'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STANDALONE PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F0F0F] border border-[#232323] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#B6FF2B]">
                Public Card Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-2 rounded-xl bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-white cursor-pointer"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-7 rounded-2xl bg-[#000000] border border-[#232323] space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (previewItem.rating ?? 5)
                          ? 'fill-[#B6FF2B] text-[#B6FF2B]'
                          : 'text-[#2A2A2A]'
                      }`}
                    />
                  ))}
                </div>
                <Quote className="w-4 h-4 text-[#B6FF2B]/50" />
              </div>

              <p className="text-base text-white leading-[1.7] font-body break-words whitespace-normal">
                &ldquo;{previewItem.content}&rdquo;
              </p>

              <div className="pt-4 border-t border-[#232323] flex items-center gap-3.5">
                {previewItem.image ? (
                  <img
                    src={previewItem.image}
                    alt={previewItem.name || 'Client'}
                    className="w-11 h-11 rounded-full object-cover border border-[#232323] shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#161616] border border-[#232323] flex items-center justify-center text-xs font-bold text-[#B6FF2B] font-mono shrink-0">
                    {getInitials(previewItem.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white font-display">{previewItem.name}</h4>
                  <p className="text-xs text-[#A1A1A1] font-mono">
                    {previewItem.designation} · {previewItem.company}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F0F0F] border border-[#232323] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-display">Delete Client Testimonial?</h3>
              <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed">
                Are you sure you want to permanently delete the testimonial from{' '}
                <span className="text-white font-semibold">{deletingItem.name}</span> (
                {deletingItem.company})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-[#161616] border border-[#232323] text-xs font-semibold text-[#A1A1A1] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
