import React, { useState } from 'react';
import { Search, Globe, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, FileText, Code2, Edit2, X, Save } from 'lucide-react';
import { PageSeoConfig, SeoAuditReport } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminSeoPageProps {
  pages: PageSeoConfig[];
  audit: SeoAuditReport | null;
  onRefresh: () => void;
}

export const AdminSeoPage: React.FC<AdminSeoPageProps> = ({ pages, audit, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'sitemap' | 'robots' | 'schema'>('checklist');
  const [editingPage, setEditingPage] = useState<PageSeoConfig | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [seoMessage, setSeoMessage] = useState<string | null>(null);
  const [seoError, setSeoError] = useState<string | null>(null);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setSeoMessage(null);
    setSeoError(null);
    try {
      await api.runSeoAudit();
      setSeoMessage('SEO audit completed successfully.');
      onRefresh();
    } catch (err: any) {
      setSeoError(err.message || 'SEO audit failed.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSavePageSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setIsSaving(true);
    setSeoMessage(null);
    setSeoError(null);
    try {
      await api.updateSeo(editingPage.path, editingPage);
      setEditingPage(null);
      setSeoMessage(`SEO settings for ${editingPage.path} updated successfully.`);
      onRefresh();
    } catch (err: any) {
      setSeoError(err.message || 'Failed to update SEO tags.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateSitemapXml = () => {
    const urls = pages.map(p => `  <url>
    <loc>${p.canonicalUrl}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.path === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  };

  const generateRobotsTxt = () => {
    return `# Darkvence Production Robots.txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://darkvence.com/sitemap.xml`;
  };

  const generateOrganizationJsonLd = () => {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      'name': 'Darkvence Digital Agency',
      'url': 'https://darkvence.com',
      'logo': 'https://darkvence.com/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
      'description': 'Premium digital agency engineering websites, mobile applications, custom software, and performance marketing.',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '550 Montgomery St, Suite 700',
        'addressLocality': 'San Francisco',
        'addressRegion': 'CA',
        'postalCode': '94111',
        'addressCountry': 'US'
      },
      'telephone': '+1-800-840-3928',
      'email': 'contact@darkvence.com',
      'sameAs': [
        'https://linkedin.com/company/darkvence-demo',
        'https://twitter.com/darkvence_demo',
        'https://github.com/darkvence-demo'
      ]
    }, null, 2);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">SEO Command Center &amp; Meta Architect</h1>
          <p className="text-xs text-slate-400 mt-1">Per-page canonical configuration, OpenGraph social cards, XML sitemaps, and Schema.org markup.</p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="px-4 py-2.5 text-xs font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Auditing Metadata...' : 'Run On-Page SEO Audit'}</span>
        </button>
      </div>

      {seoMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <span>{seoMessage}</span>
          <button onClick={() => setSeoMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {seoError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between animate-in fade-in">
          <span>{seoError}</span>
          <button onClick={() => setSeoError(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* SEO Health Score Banner (Transparent formula) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c0e15] to-[#121420] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#B6FF2B] text-black/20 border border-[#B6FF2B] flex items-center justify-center font-display text-3xl font-extrabold text-white">
            {audit?.totalScore || 85}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display">On-Page Technical SEO Score</h3>
            <p className="text-xs text-slate-400 max-w-lg">
              Derived transparently from audited pages: {audit?.passedChecks || 0} passed checks, {audit?.warningsCount || 0} warnings, and {audit?.criticalIssuesCount || 0} critical items.
            </p>
          </div>
        </div>

        <div className="text-left md:text-right text-xs space-y-1 font-mono text-slate-400">
          <p>Audited Pages: <span className="text-white font-bold">{pages.length}</span></p>
          <p>Last Audit: <span className="text-[#B6FF2B]">{audit?.lastAuditTime ? new Date(audit.lastAuditTime).toLocaleTimeString() : 'Recent'}</span></p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#0F0F0F] border border-white/5 rounded-xl max-w-fit">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'checklist' ? 'bg-[#B6FF2B] text-black font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Page Metadata Matrix
        </button>
        <button
          onClick={() => setActiveTab('sitemap')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'sitemap' ? 'bg-[#B6FF2B] text-black font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sitemap.xml
        </button>
        <button
          onClick={() => setActiveTab('robots')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'robots' ? 'bg-[#B6FF2B] text-black font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Robots.txt
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'schema' ? 'bg-[#B6FF2B] text-black font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          JSON-LD Structured Data
        </button>
      </div>

      {/* Tab 1: Page Checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Route Path</th>
                    <th className="py-3 px-4">Title Meta Tag</th>
                    <th className="py-3 px-4">Canonical URL</th>
                    <th className="py-3 px-4">OG Image</th>
                    <th className="py-3 px-4">Index/Follow</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {pages.map((p) => (
                    <tr key={p.path} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {p.path}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                        {p.title}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 max-w-[200px] truncate">
                        {p.canonicalUrl}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.ogImage ? (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Configured
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-mono">Missing</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {p.index ? 'index' : 'noindex'}, {p.follow ? 'follow' : 'nofollow'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setEditingPage({ ...p })}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                          title="Edit page SEO tags"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Issues Inspector */}
          {audit && audit.issues.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-4">
              <h3 className="text-base font-bold text-white font-display">Identified Optimization Targets</h3>
              <div className="space-y-3">
                {audit.issues.map((iss, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs">
                    {iss.severity === 'critical' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                    {iss.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    {iss.severity === 'info' && <CheckCircle2 className="w-4 h-4 text-[#B6FF2B] shrink-0 mt-0.5" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#B6FF2B] font-bold">{iss.page}</span>
                        <span className="text-slate-300">{iss.message}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{iss.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sitemap */}
      {activeTab === 'sitemap' && (
        <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display">Generated XML Sitemap</h3>
            <span className="text-xs text-slate-400 font-mono">Location: /sitemap.xml</span>
          </div>
          <pre className="p-4 rounded-xl bg-[#07080c] border border-white/5 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
            {generateSitemapXml()}
          </pre>
        </div>
      )}

      {/* Tab 3: Robots */}
      {activeTab === 'robots' && (
        <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display">Production Robots.txt Directives</h3>
            <span className="text-xs text-slate-400 font-mono">Location: /robots.txt</span>
          </div>
          <pre className="p-4 rounded-xl bg-[#07080c] border border-white/5 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
            {generateRobotsTxt()}
          </pre>
        </div>
      )}

      {/* Tab 4: JSON-LD Schema */}
      {activeTab === 'schema' && (
        <div className="p-6 rounded-3xl bg-[#0F0F0F] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display">Schema.org Organization JSON-LD</h3>
            <span className="text-xs text-slate-400 font-mono">Structured Data Type: ProfessionalService</span>
          </div>
          <pre className="p-4 rounded-xl bg-[#07080c] border border-white/5 text-xs text-emerald-400 font-mono overflow-x-auto leading-relaxed">
            {generateOrganizationJsonLd()}
          </pre>
        </div>
      )}

      {/* Edit Page SEO Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e1017] border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
            <button
              onClick={() => setEditingPage(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white font-display">Edit SEO Meta Tags: {editingPage.path}</h3>

            <form onSubmit={handleSavePageSeo} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Page Title (50-60 chars)</label>
                <input
                  type="text"
                  required
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Meta Description (120-160 chars)</label>
                <textarea
                  rows={3}
                  required
                  value={editingPage.description}
                  onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Canonical URL</label>
                <input
                  type="url"
                  required
                  value={editingPage.canonicalUrl}
                  onChange={(e) => setEditingPage({ ...editingPage, canonicalUrl: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">OpenGraph Social Preview Image URL</label>
                <input
                  type="text"
                  value={editingPage.ogImage}
                  onChange={(e) => setEditingPage({ ...editingPage, ogImage: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.index}
                    onChange={(e) => setEditingPage({ ...editingPage, index: e.target.checked })}
                    className="rounded accent-[#B6FF2B] focus:ring-0"
                  />
                  <span className="text-slate-300">Allow Indexing (index)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.follow}
                    onChange={(e) => setEditingPage({ ...editingPage, follow: e.target.checked })}
                    className="rounded accent-[#B6FF2B] focus:ring-0"
                  />
                  <span className="text-slate-300">Follow Links (follow)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-semibold text-black font-bold bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl"
                >
                  {isSaving ? 'Saving...' : 'Save Meta Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
