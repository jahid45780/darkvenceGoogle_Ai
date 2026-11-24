import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  Search,
  Eye,
  EyeOff,
  Power,
  Building2,
  ArrowUpDown,
  Image as ImageIcon,
  Save,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import {
  TrustedBrand,
  TrustedBrandsSectionSettings
} from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { BrandTriangle } from '../../components/ui/BrandTriangle.tsx';

interface AdminTrustedBrandsPageProps {
  brands: TrustedBrand[];
  sectionSettings: TrustedBrandsSectionSettings | null;
  onRefresh: () => void;
}

type StatusFilter = 'all' | 'live' | 'draft' | 'inactive';

const DEFAULT_SETTINGS: TrustedBrandsSectionSettings = {
  enabled: true,
  heading: 'Trusted By Ambitious Brands & Venture-Backed Companies',
  subtitle: 'Empowering innovative businesses with digital solutions.',
  layoutStyle: 'grid',
  themeMode: 'auto',
  updatedAt: ''
};

const getBrandInitials = (name?: string) => {
  if (!name) return 'DV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const BrandLogoBadge: React.FC<{ name: string; logoUrl?: string; size?: 'sm' | 'md' }> = ({
  name,
  logoUrl,
  size = 'sm'
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  const boxSize = size === 'md' ? 'w-14 h-14' : 'w-11 h-11';

  if (logoUrl && !imgError) {
    return (
      <div
        className={`${boxSize} rounded-xl bg-black/80 border border-[#232323] flex items-center justify-center p-1.5 overflow-hidden shrink-0`}
      >
        <img
          src={logoUrl}
          alt={`${name} logo`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`${boxSize} rounded-xl bg-[#161616] border border-[#232323] flex items-center justify-center text-xs font-bold font-display text-[#B6FF2B] shrink-0`}
    >
      {getBrandInitials(name)}
    </div>
  );
};

export const AdminTrustedBrandsPage: React.FC<AdminTrustedBrandsPageProps> = ({
  brands,
  sectionSettings,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Section Settings State
  const [settingsForm, setSettingsForm] = useState<TrustedBrandsSectionSettings>(
    sectionSettings || DEFAULT_SETTINGS
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');

  // Brand CRUD Modal State
  const [editingItem, setEditingItem] = useState<Partial<TrustedBrand> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<TrustedBrand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalLogoError, setModalLogoError] = useState(false);

  useEffect(() => {
    if (sectionSettings) {
      setSettingsForm(sectionSettings);
    }
  }, [sectionSettings]);

  const stats = useMemo(() => {
    const total = brands.length;
    const live = brands.filter((b) => b.isActive && b.isPublished).length;
    const inactiveOrDraft = total - live;
    return { total, live, inactiveOrDraft };
  }, [brands]);

  const filteredBrands = useMemo(() => {
    return [...brands]
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .filter((b) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.industry.toLowerCase().includes(q) ||
          (b.description || '').toLowerCase().includes(q);

        const matchesFilter =
          statusFilter === 'all' ||
          (statusFilter === 'live' && b.isActive && b.isPublished) ||
          (statusFilter === 'draft' && !b.isPublished) ||
          (statusFilter === 'inactive' && !b.isActive);

        return matchesSearch && matchesFilter;
      });
  }, [brands, searchQuery, statusFilter]);

  const previewBrands = useMemo(() => {
    return [...brands]
      .filter((b) => b.isActive && b.isPublished)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [brands]);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settingsForm.heading?.trim() || settingsForm.heading.trim().length < 2) {
      setError('Section heading is required (minimum 2 characters).');
      return;
    }

    setIsSavingSettings(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await api.updateTrustedBrandsSettings({
        enabled: settingsForm.enabled,
        heading: settingsForm.heading.trim(),
        subtitle: (settingsForm.subtitle || '').trim(),
        layoutStyle: settingsForm.layoutStyle || 'grid',
        themeMode: settingsForm.themeMode || 'auto'
      });
      setSettingsForm(updated);
      setSuccessMessage('Trusted Brands section settings saved and synced.');
      onRefresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to update section settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleSectionEnabled = async () => {
    const nextEnabled = !settingsForm.enabled;
    setSettingsForm((prev) => ({ ...prev, enabled: nextEnabled }));
    setIsSavingSettings(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await api.updateTrustedBrandsSettings({
        enabled: nextEnabled
      });
      setSettingsForm(updated);
      setSuccessMessage(
        nextEnabled
          ? 'Trusted Brands section is now visible on the homepage.'
          : 'Trusted Brands section is now hidden on the homepage.'
      );
      onRefresh();
    } catch (err: any) {
      setSettingsForm((prev) => ({ ...prev, enabled: !nextEnabled }));
      setError(err?.message || 'Failed to update section visibility.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreateNew = () => {
    const nextOrder =
      brands.length > 0 ? Math.max(...brands.map((b) => b.displayOrder ?? 0)) + 1 : 1;
    setEditingItem({
      name: '',
      industry: '',
      description: '',
      logoUrl: '',
      displayOrder: nextOrder,
      isActive: true,
      isPublished: true
    });
    setModalLogoError(false);
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleEdit = (item: TrustedBrand) => {
    setEditingItem({ ...item });
    setModalLogoError(false);
    setIsCreating(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      setError('Only JPEG, PNG, WebP, and SVG logo files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Brand logo file must be under 5MB.');
      return;
    }

    setIsUploadingLogo(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadImage(base64, `${editingItem?.name || 'brand'}_logo`);
        if (res?.url) {
          setModalLogoError(false);
          setEditingItem((prev) => (prev ? { ...prev, logoUrl: res.url } : null));
          setSuccessMessage('Brand logo uploaded successfully.');
        }
      } catch (err: any) {
        setError(err?.message || 'Logo upload failed.');
      } finally {
        setIsUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.name?.trim() || editingItem.name.trim().length < 2) {
      setError('Brand name is required (minimum 2 characters).');
      return;
    }
    if (!editingItem.industry?.trim() || editingItem.industry.trim().length < 2) {
      setError('Industry / category is required (minimum 2 characters).');
      return;
    }
    if (editingItem.description && editingItem.description.trim().length > 240) {
      setError('Short description must be 240 characters or fewer.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      name: editingItem.name.trim(),
      industry: editingItem.industry.trim(),
      description: (editingItem.description || '').trim(),
      logoUrl: (editingItem.logoUrl || '').trim(),
      displayOrder: Number.isFinite(Number(editingItem.displayOrder))
        ? Math.max(0, Math.round(Number(editingItem.displayOrder)))
        : 0,
      isActive: editingItem.isActive ?? true,
      isPublished: editingItem.isPublished ?? true
    };

    try {
      if (isCreating) {
        await api.createTrustedBrand(payload);
        setSuccessMessage('Trusted brand created successfully.');
      } else if (editingItem.id) {
        await api.updateTrustedBrand(editingItem.id, payload);
        setSuccessMessage('Trusted brand updated successfully.');
      }
      setEditingItem(null);
      setIsCreating(false);
      onRefresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to save trusted brand.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (
    item: TrustedBrand,
    field: 'isActive' | 'isPublished'
  ) => {
    setTogglingId(`${item.id}:${field}`);
    setError(null);
    try {
      await api.updateTrustedBrandStatus(item.id, {
        [field]: !item[field]
      });
      setSuccessMessage(
        `${item.name} ${
          field === 'isPublished'
            ? !item.isPublished
              ? 'published'
              : 'moved to draft'
            : !item.isActive
              ? 'enabled'
              : 'disabled'
        }.`
      );
      onRefresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to update brand status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    setError(null);
    try {
      await api.deleteTrustedBrand(deletingItem.id);
      setSuccessMessage(`Deleted "${deletingItem.name}" from Trusted Brands.`);
      setDeletingItem(null);
      onRefresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete brand.');
    } finally {
      setIsDeleting(false);
    }
  };

  const effectivePreviewDark =
    settingsForm.themeMode === 'dark'
      ? true
      : settingsForm.themeMode === 'light'
        ? false
        : previewTheme === 'dark';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232323] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[#B6FF2B] mb-1">
            <span>Website Content</span>
            <span className="text-[#5C5C5C]">/</span>
            <span>Trusted Brands CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Trusted Brands CMS
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A1] mt-1">
            Control homepage client brands, logos, industry categories, display order, visibility, and section copy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowLivePreview((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F0F0F] hover:bg-[#161616] border border-[#232323] hover:border-[#B6FF2B] text-white text-xs sm:text-sm font-semibold font-display transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#B6FF2B]" />
            <span>{showLivePreview ? 'Hide Live Preview' : 'Live Preview'}</span>
          </button>

          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B6FF2B] hover:bg-[#9FE61A] text-black text-xs sm:text-sm font-semibold font-display transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand</span>
          </button>
        </div>
      </div>

      {/* Feedback Banners */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between gap-3 text-red-400 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-red-300 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F0F0F] border border-[#232323]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">Total Brands</p>
          <p className="text-2xl font-bold text-white font-display mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F0F0F] border border-[#232323]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">Live on Homepage</p>
          <p className="text-2xl font-bold text-[#B6FF2B] font-display mt-1">{stats.live}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F0F0F] border border-[#232323]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">Draft / Disabled</p>
          <p className="text-2xl font-bold text-white font-display mt-1">{stats.inactiveOrDraft}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F0F0F] border border-[#232323]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">Section Visibility</p>
          <div className="flex items-center justify-between mt-1">
            <span
              className={`text-lg font-bold font-display ${
                settingsForm.enabled ? 'text-[#B6FF2B]' : 'text-[#A1A1A1]'
              }`}
            >
              {settingsForm.enabled ? 'Visible' : 'Hidden'}
            </span>
            <button
              type="button"
              onClick={handleToggleSectionEnabled}
              disabled={isSavingSettings}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                settingsForm.enabled
                  ? 'bg-[#B6FF2B]/10 border-[#B6FF2B]/40 text-[#B6FF2B] hover:bg-[#B6FF2B]/20'
                  : 'bg-[#161616] border-[#232323] text-[#A1A1A1] hover:text-white'
              }`}
            >
              {settingsForm.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Panel */}
      {showLivePreview && (
        <div className="rounded-3xl bg-[#0F0F0F] border border-[#232323] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#232323] bg-[#161616] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#B6FF2B]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                Homepage Section Live Preview
              </span>
              {!settingsForm.enabled && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                  Section Currently Hidden on Public Site
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {settingsForm.themeMode === 'auto' && (
                <div className="inline-flex rounded-lg border border-[#232323] bg-black p-0.5">
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
              )}
            </div>
          </div>

          <div
            className={`p-6 sm:p-10 transition-colors ${
              effectivePreviewDark
                ? 'bg-[#0F0F0F] text-white'
                : 'bg-[#F5F5F5] text-[#0A0A0A]'
            }`}
          >
            {!settingsForm.enabled ? (
              <div className="text-center py-8 space-y-2">
                <EyeOff className="w-6 h-6 mx-auto text-[#A1A1A1]" />
                <p className="text-sm font-display font-semibold">
                  Section Disabled Globally
                </p>
                <p className="text-xs opacity-70 max-w-md mx-auto">
                  This section is hidden from public visitors. Enable &ldquo;Show Section on Homepage&rdquo; to publish it live.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                  <p
                    className={`text-xs uppercase tracking-[0.2em] font-mono font-semibold flex items-center justify-center gap-2 ${
                      effectivePreviewDark ? 'text-[#A1A1A1]' : 'text-[#5C5C5C]'
                    }`}
                  >
                    <BrandTriangle size={10} color="#B6FF2B" />
                    <span>{settingsForm.heading || DEFAULT_SETTINGS.heading}</span>
                    <BrandTriangle size={10} inverted color="#B6FF2B" />
                  </p>
                  {settingsForm.subtitle && (
                    <p
                      className={`text-sm font-body mx-auto ${
                        effectivePreviewDark ? 'text-[#A1A1A1]' : 'text-[#5C5C5C]'
                      }`}
                    >
                      {settingsForm.subtitle}
                    </p>
                  )}
                </div>

                {previewBrands.length === 0 ? (
                  <p className="text-center text-xs font-mono opacity-70 py-4">
                    No active &amp; published brands yet. Publish a brand below to preview it here.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {previewBrands.map((b) => (
                      <div
                        key={b.id}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                          effectivePreviewDark
                            ? 'bg-[#161616] border-[#232323] text-white'
                            : 'bg-white border-[#E5E5E5] text-[#0A0A0A]'
                        }`}
                      >
                        {b.logoUrl && (
                          <img
                            src={b.logoUrl}
                            alt={b.name}
                            referrerPolicy="no-referrer"
                            className="h-7 max-w-[110px] object-contain mb-2"
                          />
                        )}
                        <span className="text-xs sm:text-sm font-bold tracking-tight font-display text-center truncate max-w-full">
                          {b.name}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider mt-0.5 text-center truncate max-w-full font-mono ${
                            effectivePreviewDark ? 'text-[#A1A1A1]' : 'text-[#5C5C5C]'
                          }`}
                        >
                          {b.industry}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Configuration Form */}
      <form
        onSubmit={handleSaveSettings}
        className="p-6 rounded-3xl bg-[#0F0F0F] border border-[#232323] space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232323] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black border border-[#232323] text-[#B6FF2B]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Section Copy &amp; Visibility Controls
              </h2>
              <p className="text-xs text-[#A1A1A1]">
                Customize heading, subtitle, layout behavior, theme surface, and global homepage visibility.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#161616] border border-[#232323] cursor-pointer">
            <input
              type="checkbox"
              checked={settingsForm.enabled}
              onChange={(e) => setSettingsForm({ ...settingsForm, enabled: e.target.checked })}
              className="w-4 h-4 accent-[#B6FF2B] rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-white">Show Section on Homepage</span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
              Section Heading <span className="text-[#B6FF2B]">*</span>
            </label>
            <input
              type="text"
              required
              value={settingsForm.heading}
              onChange={(e) => setSettingsForm({ ...settingsForm, heading: e.target.value })}
              placeholder="Trusted By Ambitious Brands & Venture-Backed Companies"
              className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
              Section Subtitle (Optional)
            </label>
            <input
              type="text"
              value={settingsForm.subtitle || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, subtitle: e.target.value })}
              placeholder="Empowering innovative businesses with digital solutions."
              className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
              Display Layout
            </label>
            <select
              value={settingsForm.layoutStyle || 'grid'}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  layoutStyle: e.target.value as 'grid' | 'marquee'
                })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none"
            >
              <option value="grid">Responsive Balanced Grid</option>
              <option value="marquee">Smooth Continuous Marquee</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
              Surface Theme Compatibility
            </label>
            <select
              value={settingsForm.themeMode || 'auto'}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  themeMode: e.target.value as 'auto' | 'dark' | 'light'
                })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none"
            >
              <option value="auto">Auto (Follows Dark/Light Toggle)</option>
              <option value="dark">Always Dark Band</option>
              <option value="light">Always Light Band</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#B6FF2B] hover:bg-[#9FE61A] disabled:opacity-50 text-black text-xs sm:text-sm font-semibold font-display transition-colors cursor-pointer"
            >
              {isSavingSettings ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSavingSettings ? 'Saving...' : 'Save Section Settings'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-[#0F0F0F] border border-[#232323] p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A1A1A1] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand name, industry, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black border border-[#232323] text-xs sm:text-sm text-white placeholder-[#5C5C5C] focus:border-[#B6FF2B] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'live', 'draft', 'inactive'] as StatusFilter[]).map((filter) => (
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

      {/* Brands List */}
      {filteredBrands.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0F0F0F] border border-[#232323] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#232323] flex items-center justify-center mx-auto text-[#B6FF2B]">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display">
              {brands.length === 0 ? 'No Trusted Brands Found' : 'No Matching Brands'}
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1A1] max-w-md mx-auto">
              {brands.length === 0
                ? 'Add your first client brand or partner logo to display in the Trusted Brands section.'
                : 'Try clearing your search term or switching the status filter.'}
            </p>
          </div>
          {brands.length === 0 && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B6FF2B] hover:bg-[#9FE61A] text-black text-xs sm:text-sm font-semibold font-display transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Brand</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden lg:block rounded-3xl bg-[#0F0F0F] border border-[#232323] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#232323] bg-[#161616]/60 text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1]">
                  <th className="py-3.5 px-5 w-20">
                    <span className="inline-flex items-center gap-1">
                      <ArrowUpDown className="w-3 h-3" /> Order
                    </span>
                  </th>
                  <th className="py-3.5 px-5">Brand</th>
                  <th className="py-3.5 px-5">Industry / Category</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5">Visibility</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232323]">
                {filteredBrands.map((b) => {
                  const isLive = b.isActive && b.isPublished;
                  return (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-mono text-xs text-[#A1A1A1]">
                        #{b.displayOrder ?? 0}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3 min-w-0">
                          <BrandLogoBadge name={b.name} logoUrl={b.logoUrl} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{b.name}</p>
                            <p className="text-[11px] font-mono text-[#A1A1A1]">
                              {b.logoUrl ? 'Custom logo set' : 'Text & monogram badge'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#161616] border border-[#232323] text-[11px] font-mono uppercase tracking-wider text-[#B6FF2B]">
                          {b.industry}
                        </span>
                      </td>
                      <td className="py-4 px-5 max-w-xs">
                        <p className="text-xs text-[#A1A1A1] line-clamp-2">
                          {b.description || '—'}
                        </p>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
                              isLive
                                ? 'bg-[#B6FF2B]/15 text-[#B6FF2B] border border-[#B6FF2B]/30'
                                : 'bg-[#161616] text-[#A1A1A1] border border-[#232323]'
                            }`}
                          >
                            {isLive ? 'Live' : !b.isActive ? 'Disabled' : 'Draft'}
                          </span>
                          <button
                            type="button"
                            disabled={togglingId === `${b.id}:isPublished`}
                            onClick={() => handleToggleStatus(b, 'isPublished')}
                            title={b.isPublished ? 'Unpublish' : 'Publish'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              b.isPublished
                                ? 'border-[#B6FF2B]/30 text-[#B6FF2B] bg-[#B6FF2B]/10 hover:bg-[#B6FF2B]/20'
                                : 'border-[#232323] text-[#A1A1A1] bg-[#161616] hover:text-white'
                            }`}
                          >
                            {b.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            disabled={togglingId === `${b.id}:isActive`}
                            onClick={() => handleToggleStatus(b, 'isActive')}
                            title={b.isActive ? 'Disable Brand' : 'Enable Brand'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              b.isActive
                                ? 'border-[#B6FF2B]/30 text-[#B6FF2B] bg-[#B6FF2B]/10 hover:bg-[#B6FF2B]/20'
                                : 'border-[#232323] text-red-400 bg-[#161616] hover:text-red-300'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(b)}
                            title="Edit Brand"
                            className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-[#B6FF2B] hover:border-[#B6FF2B] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingItem(b)}
                            title="Delete Brand"
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
            {filteredBrands.map((b) => {
              const isLive = b.isActive && b.isPublished;
              return (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-[#0F0F0F] border border-[#232323] space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <BrandLogoBadge name={b.name} logoUrl={b.logoUrl} />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{b.name}</h3>
                        <p className="text-[11px] font-mono uppercase tracking-wider text-[#B6FF2B] truncate">
                          {b.industry}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#A1A1A1] shrink-0">
                      #{b.displayOrder ?? 0}
                    </span>
                  </div>

                  {b.description && (
                    <p className="text-xs text-[#A1A1A1] line-clamp-2">{b.description}</p>
                  )}

                  <div className="pt-3 border-t border-[#232323] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
                          isLive
                            ? 'bg-[#B6FF2B]/15 text-[#B6FF2B] border border-[#B6FF2B]/30'
                            : 'bg-[#161616] text-[#A1A1A1] border border-[#232323]'
                        }`}
                      >
                        {isLive ? 'Live' : !b.isActive ? 'Disabled' : 'Draft'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(b, 'isPublished')}
                        className="p-1.5 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-white cursor-pointer"
                        title={b.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {b.isPublished ? <Eye className="w-3.5 h-3.5 text-[#B6FF2B]" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(b, 'isActive')}
                        className="p-1.5 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-white cursor-pointer"
                        title={b.isActive ? 'Disable' : 'Enable'}
                      >
                        <Power className={`w-3.5 h-3.5 ${b.isActive ? 'text-[#B6FF2B]' : 'text-red-400'}`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(b)}
                        className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-[#B6FF2B] cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItem(b)}
                        className="p-2 rounded-lg bg-[#161616] border border-[#232323] text-[#A1A1A1] hover:text-red-400 cursor-pointer"
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

      {/* Add / Edit Brand Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0F0F0F] border border-[#232323] rounded-3xl overflow-hidden shadow-2xl my-auto">
            <div className="px-6 py-5 border-b border-[#232323] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-display">
                  {isCreating ? 'Add Trusted Brand' : 'Edit Trusted Brand'}
                </h2>
                <p className="text-xs text-[#A1A1A1]">
                  Configure brand identity, category badge, optional logo, and display priority.
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

            <form onSubmit={handleSaveBrand} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {/* Live Brand Card Preview */}
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#232323] space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1A1]">
                  Card Preview
                </p>
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black border border-[#232323]">
                  {editingItem.logoUrl && !modalLogoError && (
                    <img
                      src={editingItem.logoUrl}
                      alt={editingItem.name || 'Brand preview'}
                      referrerPolicy="no-referrer"
                      onError={() => setModalLogoError(true)}
                      className="h-8 max-w-[130px] object-contain mb-2"
                    />
                  )}
                  <span className="text-sm font-bold text-white font-display text-center">
                    {editingItem.name?.trim() || 'Brand Name'}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1A1] mt-0.5 text-center">
                    {editingItem.industry?.trim() || 'INDUSTRY / CATEGORY'}
                  </span>
                  {editingItem.description?.trim() && (
                    <span className="text-[11px] text-[#A1A1A1] mt-1.5 text-center line-clamp-2 max-w-sm">
                      {editingItem.description}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                    Brand Name <span className="text-[#B6FF2B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="e.g. AuraPay Global"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                    Industry / Category <span className="text-[#B6FF2B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.industry || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, industry: e.target.value })}
                    placeholder="e.g. FINTECH"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                  Short Description (Optional, max 240 chars)
                </label>
                <textarea
                  rows={2}
                  maxLength={240}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Brief note about the partnership or digital solution..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#232323] text-sm text-white focus:border-[#B6FF2B] focus:outline-none resize-none"
                />
              </div>

              {/* Brand Logo Upload */}
              <div className="p-4 rounded-2xl bg-black border border-[#232323] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#A1A1A1] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#B6FF2B]" />
                    <span>Brand Logo (Optional)</span>
                  </label>
                  {editingItem.logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setModalLogoError(false);
                        setEditingItem({ ...editingItem, logoUrl: '' });
                      }}
                      className="text-[11px] font-mono text-red-400 hover:underline cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <BrandLogoBadge
                    name={editingItem.name || 'Brand'}
                    logoUrl={!modalLogoError ? editingItem.logoUrl : ''}
                    size="md"
                  />

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161616] hover:bg-[#232323] border border-[#232323] text-xs font-semibold text-white cursor-pointer transition-colors">
                        {isUploadingLogo ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B6FF2B]" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-[#B6FF2B]" />
                        )}
                        <span>
                          {isUploadingLogo
                            ? 'Uploading...'
                            : editingItem.logoUrl
                              ? 'Replace Logo'
                              : 'Upload Logo'}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-[#A1A1A1]">
                        PNG, SVG, WebP or JPEG (max 5MB)
                      </span>
                    </div>

                    <input
                      type="text"
                      value={editingItem.logoUrl || ''}
                      onChange={(e) => {
                        setModalLogoError(false);
                        setEditingItem({ ...editingItem, logoUrl: e.target.value });
                      }}
                      placeholder="Or paste an https:// or /uploads/ logo URL..."
                      className="w-full px-3 py-2 rounded-xl bg-[#0F0F0F] border border-[#232323] text-xs text-white focus:border-[#B6FF2B] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    value={editingItem.displayOrder ?? 0}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        displayOrder: parseInt(e.target.value || '0', 10)
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
                  <span className="text-xs font-medium text-white">Published</span>
                </label>

                <label className="flex items-center gap-2.5 pt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isActive ?? true}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#B6FF2B] rounded cursor-pointer"
                  />
                  <span className="text-xs font-medium text-white">Active</span>
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
                  disabled={isSaving || isUploadingLogo}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B6FF2B] hover:bg-[#9FE61A] disabled:opacity-50 text-black text-xs sm:text-sm font-semibold font-display cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isSaving
                      ? 'Saving...'
                      : isCreating
                        ? 'Create Brand'
                        : 'Save Changes'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F0F] border border-[#232323] rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Delete Trusted Brand
                </h3>
                <p className="text-xs sm:text-sm text-[#A1A1A1] mt-1">
                  Are you sure you want to permanently remove{' '}
                  <strong className="text-white">{deletingItem.name}</strong> ({deletingItem.industry})? This action cannot be undone.
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
                <span>{isDeleting ? 'Deleting...' : 'Delete Brand'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
