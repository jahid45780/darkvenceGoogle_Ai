import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FolderGit2,
  FileText,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  UserCheck,
  Image as ImageIcon,
  Activity,
  Gauge,
  Globe,
  Share2,
  Compass,
  Quote,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { BrandLogo } from '../../components/ui/BrandLogo.tsx';

export type AdminTab =
  | 'overview'
  | 'inquiries'
  | 'about'
  | 'services'
  | 'projects'
  | 'trusted-brands'
  | 'testimonials'
  | 'blog'
  | 'media'
  | 'seo'
  | 'performance'
  | 'health'
  | 'tracking'
  | 'settings'
  | 'users';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  unreadCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  unreadCount = 0,
  children
}) => {
  const { user, logout } = useAuth();

  const navSections: {
    title?: string;
    items: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[];
  }[] = [
    {
      items: [
        { id: 'overview', label: 'Overview & KPIs', icon: <LayoutDashboard className="w-4 h-4" /> },
        {
          id: 'inquiries',
          label: 'Inquiries & CRM',
          icon: <Mail className="w-4 h-4" />,
          badge: unreadCount > 0 ? unreadCount : undefined
        }
      ]
    },
    {
      title: 'Website Content',
      items: [
        { id: 'about', label: 'About Page CMS', icon: <Compass className="w-4 h-4" /> },
        { id: 'services', label: 'Services CMS', icon: <Layers className="w-4 h-4" /> },
        { id: 'projects', label: 'Portfolio CMS', icon: <FolderGit2 className="w-4 h-4" /> },
        { id: 'trusted-brands', label: 'Trusted Brands CMS', icon: <Building2 className="w-4 h-4" /> },
        { id: 'testimonials', label: 'Testimonials CMS', icon: <Quote className="w-4 h-4" /> },
        { id: 'blog', label: 'Blog & Articles', icon: <FileText className="w-4 h-4" /> },
        { id: 'media', label: 'Media Library', icon: <ImageIcon className="w-4 h-4" /> }
      ]
    },
    {
      title: 'System & Growth',
      items: [
        { id: 'seo', label: 'SEO Command', icon: <Globe className="w-4 h-4" /> },
        { id: 'performance', label: 'Performance Center', icon: <Gauge className="w-4 h-4" /> },
        { id: 'health', label: 'Website Health', icon: <Activity className="w-4 h-4" /> },
        { id: 'tracking', label: 'Marketing & Tracking', icon: <Share2 className="w-4 h-4" /> },
        { id: 'settings', label: 'Site Settings', icon: <Settings className="w-4 h-4" /> },
        { id: 'users', label: 'Admin Accounts', icon: <UserCheck className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 xl:w-72 bg-[#0F0F0F] border-b md:border-b-0 md:border-r border-[#232323] flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-[#232323] flex items-center justify-between">
            <BrandLogo size="sm" />
            <button
              onClick={onExitAdmin}
              className="p-1.5 text-[#A1A1A1] hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Return to Public Website"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* User info */}
          <div className="px-5 py-4 border-b border-[#232323] bg-black/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black border border-[#232323] flex items-center justify-center text-[#B6FF2B] text-xs font-bold">
              {user?.name?.slice(0, 1) || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] text-[#A1A1A1] truncate font-mono">{user?.email || 'admin@darkvence.com'}</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-4">
            {navSections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="space-y-1">
                {section.title && (
                  <p className="px-3.5 pt-1 pb-1 text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-[#5C5C5C]">
                    {section.title}
                  </p>
                )}
                {section.items.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-display font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#B6FF2B] text-black font-semibold shadow-md shadow-[#B6FF2B]/20'
                          : 'text-[#A1A1A1] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-black text-[#B6FF2B]' : 'bg-[#B6FF2B] text-black'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#232323] space-y-2">
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono font-medium tracking-[0.08em] uppercase text-[#A1A1A1] hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#A1A1A1]" />
            <span>View Public Agency Site</span>
          </button>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono font-medium tracking-[0.08em] uppercase text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#000000]">
        <div className="p-4 sm:p-8 xl:p-10 max-w-[1600px] mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};
