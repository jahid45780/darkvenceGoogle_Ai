import React, { useState } from 'react';
import { Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { SiteSettings } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminSettingsPageProps {
  settings: SiteSettings;
  onRefresh: () => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ settings, onRefresh }) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await api.updateSettings(formData);
      setSuccess(true);
      onRefresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update site configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Site Settings &amp; Brand Copy CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Configure global headlines, contact metadata, and mission copy.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save All Settings'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Site settings successfully synchronized with backend store.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        {/* Section 1: Hero Settings */}
        <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
            Hero Section Configuration
          </h3>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Hero Main Headline</label>
            <input
              type="text"
              value={formData.heroHeading || ''}
              onChange={(e) => setFormData({ ...formData, heroHeading: e.target.value })}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Hero Subtitle</label>
            <textarea
              rows={2}
              value={formData.heroSubtitle || ''}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Primary CTA Label</label>
              <input
                type="text"
                value={formData.heroCtaPrimary || ''}
                onChange={(e) => setFormData({ ...formData, heroCtaPrimary: e.target.value })}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Secondary CTA Label</label>
              <input
                type="text"
                value={formData.heroCtaSecondary || ''}
                onChange={(e) => setFormData({ ...formData, heroCtaSecondary: e.target.value })}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
            Contact Channels &amp; Office Headquarters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Public Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Direct Telephone</label>
              <input
                type="text"
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Headquarters Address</label>
            <input
              type="text"
              value={formData.officeAddress || ''}
              onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
            />
          </div>
        </div>

        {/* Section 3: About & Mission */}
        <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
            About Agency &amp; Mission Narrative
          </h3>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Company Narrative</label>
            <textarea
              rows={3}
              value={formData.aboutStory || ''}
              onChange={(e) => setFormData({ ...formData, aboutStory: e.target.value })}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Mission Statement</label>
            <textarea
              rows={2}
              value={formData.mission || ''}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-white"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
