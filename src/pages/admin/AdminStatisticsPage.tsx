import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Eye,
  EyeOff,
  BarChart3,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw,
  Clock,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { StatisticItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminStatisticsPageProps {
  statistics: StatisticItem[];
  isLoading?: boolean;
  loadError?: string | null;
  onRefresh: () => void;
}

type VisibilityFilter = 'all' | 'published' | 'hidden';

const formatTimestamp = (iso?: string) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const AdminStatisticsPage: React.FC<AdminStatisticsPageProps> = ({
  statistics,
  isLoading = false,
  loadError = null,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VisibilityFilter>('all');

  const [editingItem, setEditingItem] = useState<Partial<StatisticItem> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<StatisticItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const orderedAll = useMemo(() => {
    return [...statistics].sort((a, b) => {
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [statistics]);

  const kpiSummary = useMemo(() => {
    const total = statistics.length;
    const published = statistics.filter((s) => s.isPublished).length;
    const hidden = total - published;
    return { total, published, hidden };
  }, [statistics]);

  const filteredStatistics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orderedAll.filter((item) => {
      const displayMetric = `${item.prefix || ''}${item.value}${item.suffix || ''}`.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        displayMetric.includes(q);

      const matchesFilter =
        statusFilter === 'all' ||
        (statusFilter === 'published' && item.isPublished) ||
        (statusFilter === 'hidden' && !item.isPublished);

      return matchesSearch && matchesFilter;
    });
  }, [orderedAll, searchQuery, statusFilter]);

  const livePublishedPreview = useMemo(() => {
    return orderedAll.filter((s) => s.isPublished);
  }, [orderedAll]);

  const handleCreateNew = () => {
    const nextOrder =
      statistics.length > 0 ? Math.max(...statistics.map((s) => s.order ?? 0)) + 1 : 1;
    setEditingItem({
      prefix: '',
      value: '',
      suffix: '',
      title: '',
      description: '',
      order: nextOrder,
      isPublished: true
    });
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleEdit = (item: StatisticItem) => {
    setEditingItem({ ...item });
    setIsCreating(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const cleanValue = editingItem.value?.trim() || '';
    const cleanTitle = editingItem.title?.trim() || '';
    const cleanPrefix = editingItem.prefix ?? '';
    const cleanSuffix = editingItem.suffix ?? '';
    const cleanDescription = editingItem.description?.trim() || '';

    if (!cleanValue) {
      setError('Statistic value is required (e.g. 99.9, 700, 4.2, 45).');
      return;
    }
    if (cleanValue.length > 40) {
      setError('Statistic value must be 40 characters or fewer.');
      return;
    }
    if (cleanPrefix.length > 20 || cleanSuffix.length > 20) {
      setError('Prefix and suffix must be 20 characters or fewer.');
      return;
    }
    if (cleanTitle.length < 2) {
      setError('Statistic title is required (minimum 2 characters).');
      return;
    }
    if (cleanTitle.length > 100) {
      setError('Statistic title must be 100 characters or fewer.');
      return;
    }
    if (cleanDescription.length > 240) {
      setError('Description must be 240 characters or fewer.');
      return;
    }

    const parsedOrder = Number(editingItem.order ?? 0);
    if (!Number.isFinite(parsedOrder) || parsedOrder < 0 || parsedOrder > 9999) {
      setError('Display order must be a whole number between 0 and 9999.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      value: cleanValue,
      prefix: cleanPrefix,
      suffix: cleanSuffix,
      title: cleanTitle,
      description: cleanDescription,
      order: Math.round(parsedOrder),
      isPublished: editingItem.isPublished ?? true
    };

    try {
      if (isCreating) {
        await api.createStatistic(payload);
        setSuccessMessage(`Statistic "${payload.title}" created successfully.`);
      } else if (editingItem.id) {
        await api.updateStatistic(editingItem.id, payload);
        setSuccessMessage(`Statistic "${payload.title}" updated successfully.`);
      }
      setEditingItem(null);
      setIsCreating(false);
      onRefresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to save statistic.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublished = async (item: StatisticItem) => {
    setTogglingId(item.id);
    setError(null);
    try {
      const nextPublished = !item.isPublished;
      await api.updateStatistic(item.id, { isPublished: nextPublished });
      setSuccessMessage(
        `"${item.title}" is now ${nextPublished ? 'published on the public website' : 'hidden from the public website'}.`
      );
      onRefresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to update statistic visibility.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleMoveOrder = async (item: StatisticItem, direction: 'up' | 'down') => {
    const idx = orderedAll.findIndex((s) => s.id === item.id);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= orderedAll.length) return;

    const nextList = [...orderedAll];
    const [moved] = nextList.splice(idx, 1);
    nextList.splice(swapIdx, 0, moved);

    setReorderingId(item.id);
    setError(null);

    try {
      await api.reorderStatistics(nextList.map((s) => s.id));
      setSuccessMessage(`Updated display order for "${item.title}".`);
      onRefresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to reorder statistics.');
    } finally {
      setReorderingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    setError(null);
    try {
      await api.deleteStatistic(deletingItem.id);
      setSuccessMessage(`Deleted statistic "${deletingItem.title}".`);
      setDeletingItem(null);
      onRefresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete statistic.');
    } finally {
      setIsDeleting(false);
    }
  };

  const canReorderDirectly = !searchQuery.trim() && statusFilter === 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232323] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[#B6FF2B] mb-1">
            <span>Website Content</span>
            <span className="text-[#5C5C5C]">/</span>
            <span>Statistics CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Statistics &amp; Achievements CMS
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A1] mt-1">
            Manage quantitative benchmarks, prefixes/suffixes, display order, and public visibility in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowLivePreview((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F0F0F] hover:bg-[#161616] border border-[#232323] hover:border-[#B6FF2B] text-white text-xs sm:text-sm font-semibold font-display transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#B6FF2B]" />
            <span>{showLivePreview ? 'Hide Preview' : 'Live Preview'}</span>
          </button>

          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B6FF2B] hover:bg-[#9FE61A] text-black text-xs sm:text-sm font-semibold font-display transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Statistic</span>
          </button>
        </div>
      </div>

      {/* Feedback / Toast Banners */}
      {(error || loadError) && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between gap-3 text-red-400 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error || loadError}</span>
          </div>
          <div className="flex items-center gap-2">
            {loadError && (
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            )}
            {error && (
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-[#B6FF2B]/10 border border-[#B6FF2B]/30 flex items-center justify-between gap-3 text-[#B6FF2B] text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-[#B6FF2B] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F0F0F] border border-[#232323]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">
            Total Statistics
          </p>
          <p className="text-2xl font-bold text-white font-display mt-1">{kpiSummary.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F0F0F] border border-[#232323]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">
            Published (Live)
          </p>
          <p className="text-2xl font-bold text-[#B6FF2B] font-display mt-1">
            {kpiSummary.published}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F0F0F] border border-[#232323]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">
            Unpublished / Hidden
          </p>
          <p className="text-2xl font-bold text-white font-display mt-1">{kpiSummary.hidden}</p>
        </div>
      </div>

      {/* Live Preview Panel */}
      {showLivePreview && (
        <div className="rounded-3xl bg-[#0F0F0F] border border-[#232323] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#232323] bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#B6FF2B]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                Homepage Statistics Strip Live Preview
              </span>
            </div>

            <div className="inline-flex rounded-lg border border-[#232323] bg-black p-0.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPreviewTheme('dark')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono cursor-pointer ${
                  previewTheme === 'dark' ? 'bg-[#B6FF2B] text-black font-semibold' : 'text-[#A1A1A1]'
                }`}
              >
                <Moon className="w-3 h-3" /> Dark
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme('light')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono cursor-pointer ${
                  previewTheme === 'light' ? 'bg-[#B6FF2B] text-black font-semibold' : 'text-[#A1A1A1]'
                }`}
              >
                <Sun className="w-3 h-3" /> Light
              </button>
            </div>
          </div>

          <div
            className={`p-6 sm:p-10 transition-colors ${
              previewTheme === 'dark' ? 'bg-[#000000]' : 'bg-[#FFFFFF]'
            }`}
          >
            <div
              className={`p-8 sm:p-12 rounded-3xl border shadow-sm ${
                previewTheme === 'dark'
                  ? 'bg-[#0F0F0F] border-[#232323]'
                  : 'bg-[#F5F5F5] border-[#E5E5E5]'
              }`}
            >
              {livePublishedPreview.length === 0 ? (
                <p
                  className={`text-center text-xs font-mono py-4 ${
                    previewTheme === 'dark' ? 'text-[#A1A1A1]' : 'text-[#5C5C5C]'
                  }`}
                >
                  No published statistics yet. Publish at least one statistic to display this section on the homepage.
                </p>
              ) : (
                <div
                  className={`grid gap-8 text-center divide-y md:divide-y-0 md:divide-x ${
                    previewTheme === 'dark' ? 'divide-[#232323]' : 'divide-[#E5E5E5]'
                  } ${
                    livePublishedPreview.length === 1
                      ? 'grid-cols-1 max-w-sm mx-auto'
                      : livePublishedPreview.length === 2
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : livePublishedPreview.length === 3
                          ? 'grid-cols-1 sm:grid-cols-3'
                          : 'grid-cols-2 md:grid-cols-4'
                  }`}
                >
                  {livePublishedPreview.map((stat) => (
                    <div key={stat.id} className="pt-4 md:pt-0 px-3 space-y-1">
                      <div
                        className={`text-3xl sm:text-5xl font-extrabold tracking-tight font-mono-tabular ${
                          previewTheme === 'dark' ? 'text-white' : 'text-[#0A0A0A]'
                        }`}
                      >
                        {stat.prefix && <span>{stat.prefix}</span>}
                        <span>{stat.value}</span>
                        {stat.suffix && (
                          <span className="text-xl sm:text-2xl text-[#B6FF2B] ml-1">
                            {stat.suffix}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs font-medium font-mono uppercase tracking-wider ${
                          previewTheme === 'dark' ? 'text-[#A1A1A1]' : 'text-[#5C5C5C]'
                        }`}
                      >
                        {stat.title}
                      </div>
                      {stat.description && (
                        <p
                          className={`text-[11px] font-body leading-snug pt-0.5 ${
                            previewTheme === 'dark' ? 'text-[#A1A1A1]/80' : 'text-[#5C5C5C]'
                          }`}
                        >
                          {stat.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-[#0F0F0F] border border-[#232323] p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A1A1A1] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search statistic value, title, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black border border-[#232323] text-xs sm:text-sm text-white placeholder-[#5C5C5C] focus:border-[#B6FF2B] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'published', 'hidden'] as VisibilityFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === filter
                  ? 'bg-[#B6FF2B] text-black font-semibold'
                  : 'bg-[#161616] text-[#A1A1A1] hover:text-white border border-[#232323]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && statistics.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0F0F0F] border border-[#232323] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#B6FF2B]" />
          <p className="text-xs sm:text-sm font-mono text-[#A1A1A1]">
            Loading statistics from database...
          </p>
        </div>
      ) : filteredStatistics.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-[#0F0F0F] border border-[#232323] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#232323] flex items-center justify-center mx-auto text-[#B6FF2B]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display">
              {statistics.length === 0 ? 'No Statistics Configured Yet' : 'No Matching Statistics'}
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1A1] max-w-md mx-auto">
              {statistics.length === 0
                ? 'Add your first performance metric or achievement benchmark to display on the homepage.'
                : 'Try clearing your search query or switching the visibility filter.'}
            </p>
          </div>
          {statistics.length === 0 && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B6FF2B] hover:bg-[#9FE61A] text-black text-xs sm:text-sm font-semibold font-display transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Statistic</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!canReorderDirectly && (
            <p className="text-[11px] font-mono text-[#A1A1A1] px-1">
              Clear search and set filter to &ldquo;ALL&rdquo; to use quick Up/Down row reordering, or edit display order directly per item.
            </p>
          )}

          {/* Desktop Table */}
          <div className="hidden lg:block rounded-3xl bg-[#0F0F0F] border border-[#232323] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#232323] bg-[#161616]/60 text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">
                  <th className="py-3.5 px-5 w-32">
                    <span className="inline-flex items-center gap-1">
                      <ArrowUpDown className="w-3 h-3" /> Order
                    </span>
                  </th>
                  <th className="py-3.5 px-5">Metric Preview</th>
                  <th className="py-3.5 px-5">Title &amp; Description</th>
                  <th className="py-3.5 px-5">Visibility</th>
                  <th className="py-3.5 px-5">Timestamps</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232323]">
                {filteredStatistics.map((stat, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === filteredStatistics.length - 1;
                  const isReordering = reorderingId === stat.id;

                  return (
                    <tr key={stat.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#A1A1A1] min-w-[28px]">
                            #{stat.order ?? 0}
                          </span>
                          {canReorderDirectly && (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={isFirst || Boolean(reorderingId)}
                                onClick={() => handleMoveOrder(stat, 'up')}
                                title="Move Up"
                                className="p-1 rounded-md bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-[#B6FF2B] hover:border-[#B6FF2B] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                {isReordering ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ArrowUp className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                type="button"
                                disabled={isLast || Boolean(reorderingId)}
                                onClick={() => handleMoveOrder(stat, 'down')}
                                title="Move Down"
                                className="p-1 rounded-md bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-[#B6FF2B] hover:border-[#B6FF2B] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="inline-flex items-baseline px-3.5 py-2 rounded-xl bg-black border border-[#232323] font-mono-tabular">
                          {stat.prefix && (
                            <span className="text-lg font-extrabold text-white">{stat.prefix}</span>
                          )}
                          <span className="text-xl font-extrabold text-white">{stat.value}</span>
                          {stat.suffix && (
                            <span className="text-sm font-bold text-[#B6FF2B] ml-1">
                              {stat.suffix}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5 max-w-sm">
                        <p className="text-sm font-semibold text-white">{stat.title}</p>
                        {stat.description ? (
                          <p className="text-xs text-[#A1A1A1] mt-0.5 line-clamp-2">
                            {stat.description}
                          </p>
                        ) : (
                          <p className="text-[11px] font-mono text-[#5C5C5C] mt-0.5">
                            No subtitle description
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
                              stat.isPublished
                                ? 'bg-[#B6FF2B]/15 text-[#B6FF2B] border border-[#B6FF2B]/30'
                                : 'bg-[#161616] text-[#A1A1A1] border border-[#232323]'
                            }`}
                          >
                            {stat.isPublished ? 'Published' : 'Hidden'}
                          </span>
                          <button
                            type="button"
                            disabled={togglingId === stat.id}
                            onClick={() => handleTogglePublished(stat)}
                            title={stat.isPublished ? 'Unpublish / Hide' : 'Publish / Show'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              stat.isPublished
                                ? 'border-[#B6FF2B]/30 text-[#B6FF2B] bg-[#B6FF2B]/10 hover:bg-[#B6FF2B]/20'
                                : 'border-[#232323] text-[#A1A1A1] bg-[#161616] hover:text-white'
                            }`}
                          >
                            {togglingId === stat.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : stat.isPublished ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="text-[11px] font-mono text-[#A1A1A1] space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-[#B6FF2B]" />
                            <span>Upd: {formatTimestamp(stat.updatedAt)}</span>
                          </div>
                          <div className="text-[#5C5C5C] pl-4.5">
                            Add: {formatTimestamp(stat.createdAt)}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(stat)}
                            title="Edit Statistic"
                            className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-[#B6FF2B] hover:border-[#B6FF2B] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingItem(stat)}
                            title="Delete Statistic"
                            className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
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

          {/* Mobile / Tablet Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredStatistics.map((stat, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === filteredStatistics.length - 1;
              return (
                <div
                  key={stat.id}
                  className="p-5 rounded-2xl bg-[#0F0F0F] border border-[#232323] space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="font-extrabold text-2xl text-white font-mono-tabular">
                        {stat.prefix && <span>{stat.prefix}</span>}
                        <span>{stat.value}</span>
                        {stat.suffix && (
                          <span className="text-base font-bold text-[#B6FF2B] ml-1">
                            {stat.suffix}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white">{stat.title}</h3>
                      {stat.description && (
                        <p className="text-xs text-[#A1A1A1] line-clamp-2">{stat.description}</p>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[#A1A1A1] shrink-0">
                      #{stat.order ?? 0}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-[#5C5C5C] flex flex-wrap gap-x-4 gap-y-1">
                    <span>Updated: {formatTimestamp(stat.updatedAt)}</span>
                    <span>Created: {formatTimestamp(stat.createdAt)}</span>
                  </div>

                  <div className="pt-3 border-t border-[#232323] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
                          stat.isPublished
                            ? 'bg-[#B6FF2B]/15 text-[#B6FF2B] border border-[#B6FF2B]/30'
                            : 'bg-[#161616] text-[#A1A1A1] border border-[#232323]'
                        }`}
                      >
                        {stat.isPublished ? 'Published' : 'Hidden'}
                      </span>
                      <button
                        type="button"
                        disabled={togglingId === stat.id}
                        onClick={() => handleTogglePublished(stat)}
                        className="p-1.5 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-white cursor-pointer"
                        title={stat.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {stat.isPublished ? (
                          <Eye className="w-3.5 h-3.5 text-[#B6FF2B]" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {canReorderDirectly && (
                        <>
                          <button
                            type="button"
                            disabled={isFirst || Boolean(reorderingId)}
                            onClick={() => handleMoveOrder(stat, 'up')}
                            className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-[#B6FF2B] disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isLast || Boolean(reorderingId)}
                            onClick={() => handleMoveOrder(stat, 'down')}
                            className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-[#B6FF2B] disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEdit(stat)}
                        className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-[#B6FF2B] cursor-pointer"
                        title="Edit Statistic"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItem(stat)}
                        className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-red-400 cursor-pointer"
                        title="Delete Statistic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Statistic Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0F0F0F] border border-[#232323] rounded-3xl overflow-hidden shadow-2xl my-auto">
            <div className="px-6 py-5 border-b border-[#232323] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-display">
                  {isCreating ? 'Add Statistic' : 'Edit Statistic'}
                </h2>
                <p className="text-xs text-[#A1A1A1]">
                  Configure value, prefix, suffix, title, optional description, display order, and visibility.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-xl text-[#A1A1A1] hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {/* Live Metric Preview */}
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#232323] space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1A1]">
                  Live Metric Preview
                </p>
                <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-black border border-[#232323] text-center space-y-1">
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono-tabular">
                    {editingItem.prefix && <span>{editingItem.prefix}</span>}
                    <span>{editingItem.value?.trim() || '99.9'}</span>
                    {editingItem.suffix && (
                      <span className="text-xl text-[#B6FF2B] ml-1">{editingItem.suffix}</span>
                    )}
                  </div>
                  <div className="text-xs font-medium font-mono uppercase tracking-wider text-[#A1A1A1]">
                    {editingItem.title?.trim() || 'STATISTIC TITLE'}
                  </div>
                  {editingItem.description?.trim() && (
                    <p className="text-[11px] text-[#A1A1A1]/80 max-w-md pt-0.5">
                      {editingItem.description.trim()}
                    </p>
                  )}
                </div>
              </div>

              {/* Prefix / Value / Suffix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                    Prefix (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={editingItem.prefix ?? ''}
                    onChange={(e) => setEditingItem({ ...editingItem, prefix: e.target.value })}
                    placeholder="e.g. $ or < "
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                    Value <span className="text-[#B6FF2B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={40}
                    value={editingItem.value || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                    placeholder="e.g. 99.9, 700, 4.2"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                    Suffix (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={editingItem.suffix ?? ''}
                    onChange={(e) => setEditingItem({ ...editingItem, suffix: e.target.value })}
                    placeholder="e.g. %, ms, x, M+"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                  Title <span className="text-[#B6FF2B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Production Uptime Standard"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                  Description (Optional, max 240 chars)
                </label>
                <textarea
                  rows={2}
                  maxLength={240}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Optional concise context displayed beneath the statistic label..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    value={editingItem.order ?? 0}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        order: parseInt(e.target.value || '0', 10)
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-2.5 pt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isPublished ?? true}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isPublished: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#B6FF2B] rounded cursor-pointer"
                  />
                  <span className="text-xs font-medium text-white">
                    Published (Visible on Public Website)
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#232323] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#232323] text-xs sm:text-sm font-medium text-[#A1A1A1] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B6FF2B] hover:bg-[#9FE61A] disabled:opacity-50 text-black text-xs sm:text-sm font-semibold font-display cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isSaving
                      ? 'Saving...'
                      : isCreating
                        ? 'Create Statistic'
                        : 'Save Changes'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F0F] border border-[#232323] rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Delete Statistic
                </h3>
                <p className="text-xs sm:text-sm text-[#A1A1A1] mt-1">
                  Are you sure you want to permanently remove{' '}
                  <strong className="text-white">
                    {deletingItem.prefix || ''}
                    {deletingItem.value}
                    {deletingItem.suffix || ''} — {deletingItem.title}
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl border border-[#232323] text-xs sm:text-sm text-[#A1A1A1] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Statistic'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
