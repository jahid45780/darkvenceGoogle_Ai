import React, { useState } from 'react';
import { Share2, TrendingUp, ShieldCheck, CheckCircle2, AlertCircle, Save, ExternalLink, Activity } from 'lucide-react';
import { TrackingConfig } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminTrackingPageProps {
  tracking: TrackingConfig | null;
  onRefresh: () => void;
}

export const AdminTrackingPage: React.FC<AdminTrackingPageProps> = ({ tracking, onRefresh }) => {
  const [formData, setFormData] = useState<TrackingConfig>(
    tracking || {
      ga4: { enabled: true, measurementId: 'G-DKVENCE2026', installed: true, receivingEvents: false },
      googleAds: { enabled: true, conversionId: 'AW-1122334455', conversionLabel: 'AbCdEfGhIjKlMnOpQr', installed: true, verified: false },
      metaPixel: { enabled: true, pixelId: '892304918239012', installed: true, receivingEvents: false },
      privacyConsent: { requireConsent: true, cookiePolicyUrl: '/privacy', privacyPolicyUrl: '/privacy' }
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await api.updateTracking(formData);
      setSuccess(true);
      onRefresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update tracking config.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Analytics &amp; Conversion Tracking Hub</h1>
          <p className="text-xs text-slate-400 mt-1">Configure Google Analytics 4, Google Ads conversion tags, and Meta Pixel with privacy consent governance.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Configurations...' : 'Save Tracking Setup'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Tracking settings updated successfully. Client tag initializers reloaded.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Verification Notice */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs text-slate-400">
        <Activity className="w-4 h-4 text-[#B6FF2B] shrink-0 mt-0.5" />
        <p>
          <strong className="text-white">Strict Verification Integrity:</strong> Integration status distinguishes between <span className="text-[#B6FF2B] font-mono">Installed</span> and <span className="text-[#B6FF2B] font-mono">Receiving Real Events</span>. Synthetic test events must be verified in Meta Events Manager and GA4 DebugView before status converts to verified.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        {/* Module 1: Google Analytics 4 */}
        <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Google Analytics 4 (GA4)</h3>
                <p className="text-[11px] text-slate-400">Official gtag.js telemetry for route changes and client events.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ga4.enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  ga4: { ...formData.ga4, enabled: e.target.checked }
                })}
                className="rounded accent-[#B6FF2B] focus:ring-0"
              />
              <span className="font-semibold text-slate-300">Enable GA4</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Measurement ID</label>
              <input
                type="text"
                value={formData.ga4.measurementId}
                onChange={(e) => setFormData({
                  ...formData,
                  ga4: { ...formData.ga4, measurementId: e.target.value }
                })}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Current Integration Status</label>
              <div className="flex items-center gap-3 py-2 text-slate-300 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Installed
                </span>
                <span className="text-slate-500">·</span>
                <span className={formData.ga4.receivingEvents ? 'text-emerald-400' : 'text-slate-500'}>
                  {formData.ga4.receivingEvents ? 'Receiving Events' : 'Awaiting First Event'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-1 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300">Standard Instrumented Events:</p>
            <ul className="list-disc pl-4 space-y-0.5 font-mono">
              <li>contact_form_submit_success (fires on valid inquiry submission)</li>
              <li>project_cta_click (fires when visitor clicks discovery buttons)</li>
              <li>service_inquiry_start (fires when user opens detailed service modal)</li>
            </ul>
          </div>
        </div>

        {/* Module 2: Google Ads Conversion Tracking */}
        <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black border border-[#232323] text-[#B6FF2B] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Google Ads Conversion Tracking</h3>
                <p className="text-[11px] text-slate-400">Conversion tag targeting qualified inbound leads and project proposals.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.googleAds.enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  googleAds: { ...formData.googleAds, enabled: e.target.checked }
                })}
                className="rounded accent-[#B6FF2B] focus:ring-0"
              />
              <span className="font-semibold text-slate-300">Enable Google Ads</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Conversion ID</label>
              <input
                type="text"
                value={formData.googleAds.conversionId}
                onChange={(e) => setFormData({
                  ...formData,
                  googleAds: { ...formData.googleAds, conversionId: e.target.value }
                })}
                placeholder="AW-XXXXXXXXXX"
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Conversion Label</label>
              <input
                type="text"
                value={formData.googleAds.conversionLabel}
                onChange={(e) => setFormData({
                  ...formData,
                  googleAds: { ...formData.googleAds, conversionLabel: e.target.value }
                })}
                placeholder="AbCdEfGhIjKlMnOpQr"
                className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Module 3: Meta Pixel */}
        <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black border border-[#232323] text-[#B6FF2B] flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Meta Pixel &amp; CAPI Route</h3>
                <p className="text-[11px] text-slate-400">Client-side pixel and server-side Conversions API integration.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.metaPixel.enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  metaPixel: { ...formData.metaPixel, enabled: e.target.checked }
                })}
                className="rounded accent-[#B6FF2B] focus:ring-0"
              />
              <span className="font-semibold text-slate-300">Enable Meta Pixel</span>
            </label>
          </div>

          <div className="space-y-1 pt-2">
            <label className="font-semibold text-slate-300">Meta Pixel ID</label>
            <input
              type="text"
              value={formData.metaPixel.pixelId}
              onChange={(e) => setFormData({
                ...formData,
                metaPixel: { ...formData.metaPixel, pixelId: e.target.value }
              })}
              placeholder="123456789012345"
              className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
        </div>

        {/* Module 4: Privacy & Consent Governance */}
        <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black border border-[#232323] text-[#B6FF2B] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Privacy &amp; Cookie Consent Governance</h3>
                <p className="text-[11px] text-slate-400">Consent banner gating to prevent unauthorized telemetry tracking.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacyConsent.requireConsent}
                onChange={(e) => setFormData({
                  ...formData,
                  privacyConsent: { ...formData.privacyConsent, requireConsent: e.target.checked }
                })}
                className="rounded accent-[#B6FF2B] focus:ring-0"
              />
              <span className="font-semibold text-slate-300">Enforce Consent Gating</span>
            </label>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            When enabled, optional marketing tracking (GA4 and Meta Pixel) will not initialize in the client browser until the visitor explicitly clicks "Accept Cookies" on the public consent banner.
          </p>
        </div>
      </form>
    </div>
  );
};
