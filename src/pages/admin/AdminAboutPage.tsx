import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  ExternalLink,
  Layers,
  Users,
  Compass,
  Building2,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { AboutPageData, AboutTeamMember, AboutCoreValue, AboutCompanyStat, AboutJourneyItem, AboutTechCategory, AboutWhyChooseUsItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminAboutPageProps {
  onRefresh?: () => void;
}

type TabType = 'hero' | 'company' | 'team' | 'sections';

export const AdminAboutPage: React.FC<AdminAboutPageProps> = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [data, setData] = useState<AboutPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal for editing/adding team member
  const [editingMember, setEditingMember] = useState<AboutTeamMember | null>(null);
  const [isNewMember, setIsNewMember] = useState(false);

  // File upload state
  const [uploadingImage, setUploadingImage] = useState<string | null>(null); // 'hero' | 'company' | 'member'
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetUploadField, setTargetUploadField] = useState<'hero' | 'companyLogo' | 'member'>('hero');

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAbout();
      setData(res);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load About page CMS data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  const handleSave = async () => {
    if (!data) return;
    try {
      setSaving(true);
      setFeedback(null);
      const updated = await api.updateAdminAbout(data);
      setData(updated);
      setFeedback({ type: 'success', message: 'About page configuration saved and published successfully.' });
      if (onRefresh) onRefresh();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'File size must be under 5MB.' });
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setFeedback({ type: 'error', message: 'Please select a valid image (JPEG, PNG, WebP, SVG).' });
      return;
    }

    try {
      setUploadingImage(targetUploadField);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const uploadRes = await api.uploadImage(base64, file.name);
          const uploadedUrl = uploadRes.url;

          if (targetUploadField === 'hero') {
            setData(prev => prev ? {
              ...prev,
              hero: { ...prev.hero, image: uploadedUrl }
            } : prev);
          } else if (targetUploadField === 'companyLogo') {
            setData(prev => prev ? {
              ...prev,
              company: { ...prev.company, logoUrl: uploadedUrl }
            } : prev);
          } else if (targetUploadField === 'member' && editingMember) {
            setEditingMember(prev => prev ? { ...prev, avatarUrl: uploadedUrl } : null);
          }
          setFeedback({ type: 'success', message: 'Image uploaded successfully.' });
          setTimeout(() => setFeedback(null), 3000);
        } catch (uploadErr: any) {
          setFeedback({ type: 'error', message: uploadErr.message || 'Image upload failed.' });
        } finally {
          setUploadingImage(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to read image file.' });
      setUploadingImage(null);
    }

    // Reset input
    e.target.value = '';
  };

  const triggerUpload = (field: 'hero' | 'companyLogo' | 'member') => {
    setTargetUploadField(field);
    fileInputRef.current?.click();
  };

  // Team Member Management
  const handleOpenAddMember = () => {
    const newOrder = (data?.teamMembers?.length || 0) + 1;
    setEditingMember({
      id: `tm_${Date.now()}`,
      name: '',
      role: '',
      company: 'DARKVENCE',
      avatarUrl: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
      bio: '',
      linkedin: 'https://linkedin.com',
      portfolio: '',
      order: newOrder,
      isActive: true
    });
    setIsNewMember(true);
  };

  const handleSaveMember = () => {
    if (!editingMember || !data) return;
    if (!editingMember.name.trim() || !editingMember.role.trim()) {
      setFeedback({ type: 'error', message: 'Team member name and designation are required.' });
      return;
    }

    let updatedList = [...data.teamMembers];
    if (isNewMember) {
      updatedList.push(editingMember);
    } else {
      updatedList = updatedList.map(m => m.id === editingMember.id ? editingMember : m);
    }

    setData({ ...data, teamMembers: updatedList });
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    if (!data) return;
    if (confirm('Are you sure you want to delete this profile?')) {
      const updated = data.teamMembers.filter(m => m.id !== id);
      setData({ ...data, teamMembers: updated });
    }
  };

  const handleToggleMemberActive = (id: string) => {
    if (!data) return;
    const updated = data.teamMembers.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m);
    setData({ ...data, teamMembers: updated });
  };

  const handleMoveMember = (index: number, direction: 'up' | 'down') => {
    if (!data) return;
    const list = [...data.teamMembers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // re-assign order numbers
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setData({ ...data, teamMembers: reordered });
  };

  // Values handlers
  const handleAddValue = () => {
    if (!data) return;
    const newVal: AboutCoreValue = {
      id: `val_${Date.now()}`,
      title: 'New Core Value',
      description: 'Describe the core engineering or operational standard.'
    };
    setData({
      ...data,
      company: {
        ...data.company,
        values: [...data.company.values, newVal]
      }
    });
  };

  const handleRemoveValue = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      company: {
        ...data.company,
        values: data.company.values.filter(v => v.id !== id)
      }
    });
  };

  // Stats handlers
  const handleAddStat = () => {
    if (!data) return;
    const newStat: AboutCompanyStat = {
      id: `stat_${Date.now()}`,
      value: '100+',
      label: 'New Statistic',
      suffix: ''
    };
    setData({
      ...data,
      company: {
        ...data.company,
        stats: [...data.company.stats, newStat]
      }
    });
  };

  const handleRemoveStat = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      company: {
        ...data.company,
        stats: data.company.stats.filter(s => s.id !== id)
      }
    });
  };

  // Journey handlers
  const handleAddJourney = () => {
    if (!data) return;
    const newJ: AboutJourneyItem = {
      id: `j_${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: 'Company Milestone',
      description: 'Describe the growth or engineering achievement.'
    };
    setData({
      ...data,
      journey: [...data.journey, newJ]
    });
  };

  const handleRemoveJourney = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      journey: data.journey.filter(j => j.id !== id)
    });
  };

  // Why Choose Us handlers
  const handleAddWhy = () => {
    if (!data) return;
    const newWhy: AboutWhyChooseUsItem = {
      id: `wcu_${Date.now()}`,
      title: 'Core Advantage',
      description: 'Explain why clients choose DARKVENCE.',
      metric: 'Outcome'
    };
    setData({
      ...data,
      whyChooseUs: [...data.whyChooseUs, newWhy]
    });
  };

  const handleRemoveWhy = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      whyChooseUs: data.whyChooseUs.filter(w => w.id !== id)
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#B6FF2B] border-t-transparent rounded-full animate-spin" />
          <span>Loading About Page CMS...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-red-400">
        Failed to load About page data. Please check connection.
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-[1400px] mx-auto space-y-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B6FF2B] uppercase tracking-wider">
            <span>DARKVENCE CMS</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Content Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            About Page CMS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage hero messaging, company story, leadership profiles, and section visibility in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAboutData}
            disabled={saving}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset to saved state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] disabled:opacity-50 rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save &amp; Publish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border text-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'hero'
              ? 'bg-[#B6FF2B] text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hero &amp; Headline</span>
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'company'
              ? 'bg-[#B6FF2B] text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Company &amp; Values</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'team'
              ? 'bg-[#B6FF2B] text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team Leadership ({data.teamMembers?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'sections'
              ? 'bg-[#B6FF2B] text-black font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Journey &amp; Modules</span>
        </button>
      </div>

      {/* TAB 1: HERO SECTION */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="bg-[#0F0F0F] p-6 rounded-2xl border border-white/5 space-y-5">
            <h2 className="text-base font-bold text-white font-display">About Hero Content</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">Main Headline</label>
                <input
                  type="text"
                  value={data.hero.heading}
                  onChange={e => setData({ ...data, hero: { ...data.hero, heading: e.target.value } })}
                  placeholder="Where Technical Precision Meets Conversion Design"
                  className="w-full bg-[#131620] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF2B]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={data.hero.subtitle}
                  onChange={e => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })}
                  placeholder="Digital Systems & Engineering"
                  className="w-full bg-[#131620] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF2B]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">Main Description &amp; Agency Narrative</label>
                <textarea
                  rows={4}
                  value={data.hero.description}
                  onChange={e => setData({ ...data, hero: { ...data.hero, description: e.target.value } })}
                  placeholder="Describe Darkvence core engineering approach..."
                  className="w-full bg-[#131620] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF2B] leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Primary CTA Button Label</label>
                <input
                  type="text"
                  value={data.hero.ctaText || ''}
                  onChange={e => setData({ ...data, hero: { ...data.hero, ctaText: e.target.value } })}
                  placeholder="Work With Our Team"
                  className="w-full bg-[#131620] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF2B]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">CTA Destination Route / URL</label>
                <input
                  type="text"
                  value={data.hero.ctaUrl || ''}
                  onChange={e => setData({ ...data, hero: { ...data.hero, ctaUrl: e.target.value } })}
                  placeholder="contact"
                  className="w-full bg-[#131620] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF2B]"
                />
              </div>
            </div>

            {/* Hero Image Management */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="text-xs font-medium text-slate-300">Hero Section Showcase Image</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-48 h-28 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 relative group">
                  <img
                    src={data.hero.image || '/src/assets/images/hero_darkvence_digital_1790497052243.jpg'}
                    alt="Hero Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {uploadingImage === 'hero' && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-white">
                      <div className="w-4 h-4 border-2 border-[#B6FF2B] border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => triggerUpload('hero')}
                      className="px-3.5 py-1.5 text-xs font-medium text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Image</span>
                    </button>
                    {data.hero.image && (
                      <button
                        type="button"
                        onClick={() => setData({ ...data, hero: { ...data.hero, image: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg' } })}
                        className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-white/5 rounded-lg transition-colors cursor-pointer"
                      >
                        Reset Default
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={data.hero.image}
                    onChange={e => setData({ ...data, hero: { ...data.hero, image: e.target.value } })}
                    placeholder="/src/assets/images/..."
                    className="w-full bg-[#131620] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#B6FF2B] font-mono"
                  />
                  <p className="text-[11px] text-slate-500">
                    Supports PNG, JPEG, WebP, SVG up to 5MB. Images are stored persistently on the server.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY INFORMATION & VALUES */}
      {activeTab === 'company' && (
        <div className="space-y-6">
          {/* Company Details */}
          <div className="bg-[#0F0F0F] p-6 rounded-2xl border border-white/5 space-y-5">
            <h2 className="text-base font-bold text-white font-display">Company Identity &amp; Statements</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Company Name</label>
                <input
                  type="text"
                  value={data.company.name}
                  onChange={e => setData({ ...data, company: { ...data.company, name: e.target.value } })}
                  placeholder="DARKVENCE"
                  className="w-full bg-[#131620] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF2B]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Year Established</label>
                <input
                  type="text"
                  value={data.company.yearEstablished || ''}
                  onChange={e => setData({ ...data, company: { ...data.company, yearEstablished: e.target.value } })}
                  placeholder="2021"
                  className="w-full bg-[#131620] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF2B]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">Company Introduction</label>
                <input
                  type="text"
                  value={data.company.intro}
                  onChange={e => setData({ ...data, company: { ...data.company, intro: e.target.value } })}
                  placeholder="Engineering Digital Dominance & High-Velocity Software Systems"
                  className="w-full bg-[#131620] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF2B]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">Company Full Description &amp; Background</label>
                <textarea
                  rows={3}
                  value={data.company.description || ''}
                  onChange={e => setData({ ...data, company: { ...data.company, description: e.target.value } })}
                  placeholder="Founded on the principle that digital experiences must balance aesthetic restraint with raw computational efficiency..."
                  className="w-full bg-[#131620] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF2B] leading-relaxed"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">Mission Statement</label>

                <textarea
                  rows={2}
                  value={data.company.mission}
                  onChange={e => setData({ ...data, company: { ...data.company, mission: e.target.value } })}
                  placeholder="To eliminate digital mediocrity..."
                  className="w-full bg-[#131620] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF2B] leading-relaxed"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-slate-300">Vision Statement</label>
                <textarea
                  rows={2}
                  value={data.company.vision}
                  onChange={e => setData({ ...data, company: { ...data.company, vision: e.target.value } })}
                  placeholder="To architect resilient, high-speed digital foundations..."
                  className="w-full bg-[#131620] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF2B] leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="bg-[#0F0F0F] p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">Core Principles &amp; Values</h3>
                <p className="text-xs text-slate-400">Guiding philosophies that define DARKVENCE engineering standards.</p>
              </div>
              <button
                type="button"
                onClick={handleAddValue}
                className="px-3 py-1.5 text-xs font-medium text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Value</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {data.company.values.map((val, idx) => (
                <div key={val.id || idx} className="p-4 bg-[#11131c] rounded-xl border border-white/5 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#B6FF2B]">Principle {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(val.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                      title="Remove value"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={val.title}
                    onChange={e => {
                      const updated = [...data.company.values];
                      updated[idx].title = e.target.value;
                      setData({ ...data, company: { ...data.company, values: updated } });
                    }}
                    placeholder="Principle Title"
                    className="w-full bg-[#181b26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#B6FF2B] font-medium"
                  />
                  <textarea
                    rows={2}
                    value={val.description}
                    onChange={e => {
                      const updated = [...data.company.values];
                      updated[idx].description = e.target.value;
                      setData({ ...data, company: { ...data.company, values: updated } });
                    }}
                    placeholder="Principle description..."
                    className="w-full bg-[#181b26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#B6FF2B] leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Company Statistics */}
          <div className="bg-[#0F0F0F] p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">Company Statistics &amp; Proof Metrics</h3>
                <p className="text-xs text-slate-400">Displayed in high-impact statistical proof banners.</p>
              </div>
              <button
                type="button"
                onClick={handleAddStat}
                className="px-3 py-1.5 text-xs font-medium text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Metric</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {data.company.stats.map((stat, idx) => (
                <div key={stat.id || idx} className="p-4 bg-[#11131c] rounded-xl border border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#B6FF2B]">Metric {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStat(stat.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={stat.value}
                      onChange={e => {
                        const updated = [...data.company.stats];
                        updated[idx].value = e.target.value;
                        setData({ ...data, company: { ...data.company, stats: updated } });
                      }}
                      placeholder="99.9%"
                      className="w-full bg-[#181b26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-bold tabular-nums"
                    />
                    <input
                      type="text"
                      value={stat.suffix || ''}
                      onChange={e => {
                        const updated = [...data.company.stats];
                        updated[idx].suffix = e.target.value;
                        setData({ ...data, company: { ...data.company, stats: updated } });
                      }}
                      placeholder="Unit"
                      className="w-16 bg-[#181b26] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-300"
                    />
                  </div>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={e => {
                      const updated = [...data.company.stats];
                      updated[idx].label = e.target.value;
                      setData({ ...data, company: { ...data.company, stats: updated } });
                    }}
                    placeholder="Label (e.g. Uptime Standard)"
                    className="w-full bg-[#181b26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM LEADERSHIP PROFILES */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="bg-[#0F0F0F] p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white font-display">Leadership &amp; Founder Profiles</h2>
                <p className="text-xs text-slate-400">
                  Manage team member profiles, roles, bios, and order. Reorder profiles with the up/down controls.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddMember}
                className="px-4 py-2 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Team Member</span>
              </button>
            </div>

            {/* Team Profiles List */}
            <div className="space-y-3 pt-2">
              {data.teamMembers
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((member, index) => (
                  <div
                    key={member.id}
                    className={`p-4 rounded-xl border transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      member.isActive !== false
                        ? 'bg-[#11131c] border-white/5'
                        : 'bg-[#11131c]/50 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1 items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveMember(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-mono text-slate-400">{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleMoveMember(index, 'down')}
                          disabled={index === data.teamMembers.length - 1}
                          className="p-1 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                        <img
                          src={member.avatarUrl || '/src/assets/images/hero_darkvence_digital_1790497052243.jpg'}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white font-display">{member.name}</h4>
                          <span className="text-[11px] text-slate-400">· {member.company || 'DARKVENCE'}</span>
                          {member.isActive === false && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#B6FF2B] font-medium">{member.role}</p>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-lg">{member.bio}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleMemberActive(member.id)}
                        className={`p-2 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                          member.isActive !== false
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-slate-500 hover:bg-white/5'
                        }`}
                        title={member.isActive !== false ? 'Profile is visible' : 'Profile is hidden'}
                      >
                        {member.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingMember({ ...member });
                          setIsNewMember(false);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        Edit Profile
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADDITIONAL SECTIONS & VISIBILITY */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          {/* Section Visibility Toggles */}
          <div className="bg-[#0F0F0F] p-6 rounded-2xl border border-white/5 space-y-4">
            <h2 className="text-base font-bold text-white font-display">Module Visibility Controls</h2>
            <p className="text-xs text-slate-400">Enable or disable optional sections on the public About page.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {[
                { key: 'showJourney', label: 'Company Journey / Timeline' },
                { key: 'showTechStack', label: 'Technology Stack' },
                { key: 'showWhyChooseUs', label: 'Why Choose DARKVENCE' },
                { key: 'showServices', label: 'Engineering Services Preview' },
                { key: 'showTestimonials', label: 'Client Testimonials / Proof' }
              ].map(sec => {
                const isVisible = data.sectionsVisibility[sec.key as keyof typeof data.sectionsVisibility] !== false;
                return (
                  <div
                    key={sec.key}
                    onClick={() => {
                      setData({
                        ...data,
                        sectionsVisibility: {
                          ...data.sectionsVisibility,
                          [sec.key]: !isVisible
                        }
                      });
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isVisible
                        ? 'bg-[#161616] border-[#B6FF2B] text-white'
                        : 'bg-[#0F0F0F] border-[#232323] text-zinc-400'
                    }`}
                  >
                    <span className="text-xs font-medium">{sec.label}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isVisible ? 'bg-[#B6FF2B]/15 text-[#B6FF2B] border border-[#B6FF2B]/30' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isVisible ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Company Journey / Timeline Editor */}
          <div className="bg-[#0F0F0F] p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">Company Journey / Timeline</h3>
                <p className="text-xs text-slate-400">Milestones charting the studio's evolution.</p>
              </div>
              <button
                type="button"
                onClick={handleAddJourney}
                className="px-3 py-1.5 text-xs font-medium text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {data.journey.map((item, idx) => (
                <div key={item.id || idx} className="p-4 bg-[#11131c] rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={item.year}
                        onChange={e => {
                          const updated = [...data.journey];
                          updated[idx].year = e.target.value;
                          setData({ ...data, journey: updated });
                        }}
                        placeholder="Year"
                        className="w-24 bg-[#181b26] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-[#B6FF2B] font-mono font-bold"
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={e => {
                          const updated = [...data.journey];
                          updated[idx].title = e.target.value;
                          setData({ ...data, journey: updated });
                        }}
                        placeholder="Milestone Title"
                        className="bg-[#181b26] border border-white/10 rounded-lg px-3 py-1 text-xs text-white font-medium flex-1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveJourney(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={e => {
                      const updated = [...data.journey];
                      updated[idx].description = e.target.value;
                      setData({ ...data, journey: updated });
                    }}
                    placeholder="Milestone details..."
                    className="w-full bg-[#181b26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#B6FF2B] leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack Editor */}
          <div className="bg-[#0F0F0F] p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white font-display">Technology Stack</h3>
            <p className="text-xs text-slate-400">Core technologies and engineering frameworks.</p>

            <div className="space-y-4 pt-2">
              {data.techStack.map((cat, idx) => (
                <div key={cat.id || idx} className="p-4 bg-[#11131c] rounded-xl border border-white/5 space-y-3">
                  <input
                    type="text"
                    value={cat.category}
                    onChange={e => {
                      const updated = [...data.techStack];
                      updated[idx].category = e.target.value;
                      setData({ ...data, techStack: updated });
                    }}
                    placeholder="Category Name"
                    className="bg-[#181b26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                  />
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Technologies (comma separated)</label>
                    <input
                      type="text"
                      value={cat.items.join(', ')}
                      onChange={e => {
                        const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        const updated = [...data.techStack];
                        updated[idx].items = items;
                        setData({ ...data, techStack: updated });
                      }}
                      placeholder="React, Next.js, TypeScript..."
                      className="w-full bg-[#181b26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-[#0F0F0F] p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">Why Choose DARKVENCE</h3>
                <p className="text-xs text-slate-400">Compelling competitive differentiators.</p>
              </div>
              <button
                type="button"
                onClick={handleAddWhy}
                className="px-3 py-1.5 text-xs font-medium text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Advantage</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {data.whyChooseUs.map((wcu, idx) => (
                <div key={wcu.id || idx} className="p-4 bg-[#11131c] rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 mr-4">
                      <input
                        type="text"
                        value={wcu.title}
                        onChange={e => {
                          const updated = [...data.whyChooseUs];
                          updated[idx].title = e.target.value;
                          setData({ ...data, whyChooseUs: updated });
                        }}
                        placeholder="Advantage Title"
                        className="bg-[#181b26] border border-white/10 rounded-lg px-3 py-1 text-xs text-white font-bold flex-1"
                      />
                      <input
                        type="text"
                        value={wcu.metric || ''}
                        onChange={e => {
                          const updated = [...data.whyChooseUs];
                          updated[idx].metric = e.target.value;
                          setData({ ...data, whyChooseUs: updated });
                        }}
                        placeholder="Metric tag"
                        className="w-28 bg-[#181b26] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-[#B6FF2B] font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveWhy(wcu.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={wcu.description}
                    onChange={e => {
                      const updated = [...data.whyChooseUs];
                      updated[idx].description = e.target.value;
                      setData({ ...data, whyChooseUs: updated });
                    }}
                    placeholder="Advantage explanation..."
                    className="w-full bg-[#181b26] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#B6FF2B] leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT TEAM MEMBER */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0f17] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-base font-bold text-white font-display">
                {isNewMember ? 'Add Team Member' : 'Edit Profile: ' + editingMember.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    value={editingMember.name}
                    onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                    placeholder="e.g. Jahid Hossain"
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#B6FF2B]"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium text-slate-300">Designation / Job Title *</label>
                  <input
                    type="text"
                    value={editingMember.role}
                    onChange={e => setEditingMember({ ...editingMember, role: e.target.value })}
                    placeholder="e.g. Senior Executive / Full Stack Developer"
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#B6FF2B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Company Name</label>
                  <input
                    type="text"
                    value={editingMember.company}
                    onChange={e => setEditingMember({ ...editingMember, company: e.target.value })}
                    placeholder="DARKVENCE"
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#B6FF2B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Display Order</label>
                  <input
                    type="number"
                    value={editingMember.order}
                    onChange={e => setEditingMember({ ...editingMember, order: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#B6FF2B] tabular-nums"
                  />
                </div>
              </div>

              {/* Avatar Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                    <img
                      src={editingMember.avatarUrl || '/src/assets/images/hero_darkvence_digital_1790497052243.jpg'}
                      alt="Avatar Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <button
                      type="button"
                      onClick={() => triggerUpload('member')}
                      className="px-3 py-1.5 text-xs font-medium text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Profile Photo</span>
                    </button>
                    <input
                      type="text"
                      value={editingMember.avatarUrl}
                      onChange={e => setEditingMember({ ...editingMember, avatarUrl: e.target.value })}
                      placeholder="Image URL or uploaded path"
                      className="w-full bg-[#151824] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Short Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Short Biography</label>
                <textarea
                  rows={3}
                  value={editingMember.bio}
                  onChange={e => setEditingMember({ ...editingMember, bio: e.target.value })}
                  placeholder="Summary of experience, technical focus, and achievements..."
                  className="w-full bg-[#151824] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#B6FF2B] leading-relaxed"
                />
              </div>

              {/* Social / Portfolio Links */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">LinkedIn URL</label>
                  <input
                    type="text"
                    value={editingMember.linkedin || ''}
                    onChange={e => setEditingMember({ ...editingMember, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Portfolio / Website</label>
                  <input
                    type="text"
                    value={editingMember.portfolio || ''}
                    onChange={e => setEditingMember({ ...editingMember, portfolio: e.target.value })}
                    placeholder="https://darkvence.com"
                    className="w-full bg-[#151824] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Visibility Status */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="member-active"
                  checked={editingMember.isActive !== false}
                  onChange={e => setEditingMember({ ...editingMember, isActive: e.target.checked })}
                  className="rounded border-white/10 accent-[#B6FF2B] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="member-active" className="text-xs font-medium text-slate-300 cursor-pointer">
                  Profile is published and visible on public About page
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMember}
                className="px-5 py-2 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 cursor-pointer"
              >
                Save Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
