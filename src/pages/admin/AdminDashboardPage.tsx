import React from 'react';
import {
  Mail,
  Layers,
  FolderGit2,
  FileText,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Quote,
  Building2,
  BarChart3
} from 'lucide-react';
import { AnalyticsOverview } from '../../types/index.ts';
import { BrandTriangle } from '../../components/ui/BrandTriangle.tsx';

interface AdminDashboardPageProps {
  analytics: AnalyticsOverview | null;
  onNavigateTab: (
    tab: 'overview' | 'services' | 'projects' | 'trusted-brands' | 'statistics' | 'testimonials' | 'blog' | 'inquiries' | 'settings'
  ) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  analytics,
  onNavigateTab
}) => {
  const stats = analytics?.stats || {
    totalInquiries: 0,
    newInquiries: 0,
    inProgressInquiries: 0,
    completedInquiries: 0,
    publishedServices: 0,
    publishedProjects: 0,
    publishedBlogPosts: 0
  };

  const timeline = analytics?.timeline || [];
  const maxTimelineCount = Math.max(...timeline.map(t => t.count), 5);
  const serviceDist = analytics?.serviceDistribution || [];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232323] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Executive Agency Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A1] mt-1">
            Real-time pipeline metrics, editorial CMS status, and incoming client requests.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 bg-black border border-[#232323] px-3 py-1.5 rounded-xl text-xs text-[#B6FF2B]">
          <span className="w-2 h-2 rounded-full bg-[#B6FF2B] animate-pulse" />
          <span>MongoDB Operational</span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Inquiries */}
        <div
          onClick={() => onNavigateTab('inquiries')}
          className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#232323] hover:border-[#B6FF2B] transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between text-[#A1A1A1]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inquiries</span>
            <div className="p-2 rounded-xl bg-black border border-[#232323] text-[#B6FF2B]">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono-tabular">
              {stats.totalInquiries}
            </span>
            {stats.newInquiries > 0 && (
              <span className="text-xs font-bold text-black bg-[#B6FF2B] px-2 py-0.5 rounded">
                {stats.newInquiries} unread
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#A1A1A1]">
            {stats.inProgressInquiries} in progress · {stats.completedInquiries} closed
          </p>
        </div>

        {/* Published Services */}
        <div
          onClick={() => onNavigateTab('services')}
          className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#232323] hover:border-[#B6FF2B] transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between text-[#A1A1A1]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Services</span>
            <div className="p-2 rounded-xl bg-black border border-[#232323] text-[#B6FF2B]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono-tabular">
              {stats.publishedServices}
            </span>
            <span className="text-xs font-medium text-[#A1A1A1]">Published</span>
          </div>
          <p className="text-[11px] text-[#A1A1A1]">CMS-governed offerings</p>
        </div>

        {/* Published Case Studies */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#232323] hover:border-[#B6FF2B] transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between text-[#A1A1A1]">
            <span className="text-xs font-semibold uppercase tracking-wider">Case Studies</span>
            <div className="p-2 rounded-xl bg-black border border-[#232323] text-[#B6FF2B]">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono-tabular">
              {stats.publishedProjects}
            </span>
            <span className="text-xs font-medium text-[#A1A1A1]">Live Projects</span>
          </div>
          <p className="text-[11px] text-[#A1A1A1]">Filterable portfolio showcases</p>
        </div>

        {/* Published Blog Articles */}
        <div
          onClick={() => onNavigateTab('blog')}
          className="p-6 rounded-2xl bg-[#0F0F0F] border border-[#232323] hover:border-[#B6FF2B] transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between text-[#A1A1A1]">
            <span className="text-xs font-semibold uppercase tracking-wider">Articles &amp; Insights</span>
            <div className="p-2 rounded-xl bg-black border border-[#232323] text-[#B6FF2B]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono-tabular">
              {stats.publishedBlogPosts}
            </span>
            <span className="text-xs font-medium text-[#A1A1A1]">Published</span>
          </div>
          <p className="text-[11px] text-[#A1A1A1]">Thought leadership pieces</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0F0F0F] border border-[#232323] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-display">Inbound Lead Velocity</h3>
              <p className="text-xs text-[#A1A1A1]">Inquiries logged over the past 7 days</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#B6FF2B]" />
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-[#232323]">
            {timeline.map((item, idx) => {
              const heightPercent = Math.max(10, Math.round((item.count / maxTimelineCount) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-[#A1A1A1] group-hover:text-white transition-colors">
                    {item.count}
                  </span>
                  <div className="w-full max-w-[36px] bg-[#161616] rounded-t-md overflow-hidden relative group-hover:bg-[#232323] transition-colors">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-[#B6FF2B] rounded-t-md transition-all duration-300"
                    />
                  </div>
                  <span className="text-[10px] text-[#A1A1A1] truncate w-full text-center font-mono">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Interest Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0F0F0F] border border-[#232323] space-y-6">
          <div>
            <h3 className="text-base font-bold text-white font-display">Service Inquiry Distribution</h3>
            <p className="text-xs text-[#A1A1A1]">Demand breakdown by commercial offering</p>
          </div>

          <div className="space-y-4 pt-2">
            {serviceDist.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium truncate max-w-[200px]">{item.service}</span>
                  <span className="text-[#A1A1A1] font-mono-tabular">{item.percentage}% ({item.count})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#161616] overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className="h-full bg-[#B6FF2B] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick CMS Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0F0F0F] border border-[#232323] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display">Recent Activity &amp; Inbound Inquiries</h3>
            <button
              onClick={() => onNavigateTab('inquiries')}
              className="text-xs text-[#B6FF2B] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Open Full CRM</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#232323]">
            {(analytics?.recentActivity || []).map((act) => (
              <div key={act.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">{act.title}</p>
                  <p className="text-[#A1A1A1]">{act.subtitle}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[#A1A1A1] font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-[#B6FF2B]" />
                  <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick CMS Action Cards */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0F0F0F] border border-[#232323] space-y-4">
          <h3 className="text-base font-bold text-white font-display">Quick CMS Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => onNavigateTab('services')}
              className="w-full p-3 rounded-xl bg-[#161616] border border-[#232323] hover:border-[#B6FF2B] text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#B6FF2B]" />
                <span className="text-xs font-semibold text-white">Manage Services</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#A1A1A1]" />
            </button>

            <button
              onClick={() => onNavigateTab('projects')}
              className="w-full p-3 rounded-xl bg-[#161616] border border-[#232323] hover:border-[#B6FF2B] text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-4 h-4 text-[#B6FF2B]" />
                <span className="text-xs font-semibold text-white">Create / Edit Project</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#A1A1A1]" />
            </button>

            <button
              onClick={() => onNavigateTab('blog')}
              className="w-full p-3 rounded-xl bg-[#161616] border border-[#232323] hover:border-[#B6FF2B] text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#B6FF2B]" />
                <span className="text-xs font-semibold text-white">Publish Blog Article</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#A1A1A1]" />
            </button>

            <button
              onClick={() => onNavigateTab('trusted-brands')}
              className="w-full p-3 rounded-xl bg-[#161616] border border-[#232323] hover:border-[#B6FF2B] text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#B6FF2B]" />
                <span className="text-xs font-semibold text-white">Manage Trusted Brands</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#A1A1A1]" />
            </button>

            <button
              onClick={() => onNavigateTab('statistics')}
              className="w-full p-3 rounded-xl bg-[#161616] border border-[#232323] hover:border-[#B6FF2B] text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-[#B6FF2B]" />
                <span className="text-xs font-semibold text-white">Manage Statistics</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#A1A1A1]" />
            </button>

            <button
              onClick={() => onNavigateTab('testimonials')}
              className="w-full p-3 rounded-xl bg-[#161616] border border-[#232323] hover:border-[#B6FF2B] text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Quote className="w-4 h-4 text-[#B6FF2B]" />
                <span className="text-xs font-semibold text-white">Manage Testimonials</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#A1A1A1]" />
            </button>

            <button
              onClick={() => onNavigateTab('settings')}
              className="w-full p-3 rounded-xl bg-[#161616] border border-[#232323] hover:border-[#B6FF2B] text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-[#B6FF2B]" />
                <span className="text-xs font-semibold text-white">Edit Site Copy &amp; FAQs</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#A1A1A1]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
