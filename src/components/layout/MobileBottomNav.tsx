import React, { useState } from 'react';
import {
  Home,
  Layers,
  Briefcase,
  BookOpen,
  MessageSquare,
  Compass,
  X,
  Shield,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_CONFIG } from '../../config/whatsapp.ts';
import { BrandTriangle } from '../ui/BrandTriangle.tsx';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigate: (page: string, slug?: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate
}) => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'portfolio', label: 'Work', icon: Briefcase },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'contact', label: 'Contact', icon: MessageSquare },
  ];

  const handleTabClick = (pageId: string) => {
    setDrawerOpen(false);
    onNavigate(pageId);
  };

  return (
    <>
      {/* Secondary Drawer Sheet for Mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative bg-white dark:bg-[#0F0F0F] border-t border-[#E5E5E5] dark:border-[#232323] rounded-t-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-bottom duration-250">
            {/* Header & Close */}
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#232323] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] flex items-center justify-center">
                  <BrandTriangle size={14} color="#B6FF2B" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">Quick Navigation</h3>
                  <p className="text-[10px] text-[#5C5C5C] dark:text-[#A1A1A1]">Explore Darkvence Agency</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Theme Appearance Switcher */}
            <div className="p-3.5 rounded-2xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black dark:bg-[#000000] border border-[#232323] flex items-center justify-center text-[#B6FF2B]">
                  {isDark ? <Sun className="w-4 h-4 text-[#B6FF2B]" /> : <Moon className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                    Appearance
                  </p>
                  <p className="text-[10px] text-[#5C5C5C] dark:text-[#A1A1A1]">
                    Currently in {isDark ? 'Dark Mode' : 'Light Mode'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#B6FF2B] text-black shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-black" /> : <Moon className="w-3.5 h-3.5 text-black" />}
                <span>{isDark ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleTabClick('about')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                  currentPage === 'about'
                    ? 'bg-[#B6FF2B] text-black border-[#B6FF2B] font-bold'
                    : 'bg-[#F5F5F5] dark:bg-[#161616] border-[#E5E5E5] dark:border-[#232323] text-[#0A0A0A] dark:text-white'
                }`}
              >
                <Compass className="w-4 h-4 text-[#B6FF2B] shrink-0" />
                <div>
                  <p className="text-xs font-semibold">About Agency</p>
                  <p className="text-[10px] opacity-75">Our engineering DNA</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('admin')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                  currentPage === 'admin'
                    ? 'bg-[#B6FF2B] text-black border-[#B6FF2B] font-bold'
                    : 'bg-[#F5F5F5] dark:bg-[#161616] border-[#E5E5E5] dark:border-[#232323] text-[#0A0A0A] dark:text-white'
                }`}
              >
                <Shield className="w-4 h-4 text-[#B6FF2B] shrink-0" />
                <div>
                  <p className="text-xs font-semibold">
                    {isAuthenticated ? 'Admin Panel' : 'Admin CMS'}
                  </p>
                  <p className="text-[10px] opacity-75">Control center</p>
                </div>
              </button>
            </div>

            {/* Direct Contact info in Drawer */}
            <div className="p-4 rounded-2xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] space-y-3">
              <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white uppercase tracking-wider">
                Direct Contact
              </p>
              <div className="space-y-2 text-xs">
                <a
                  href="mailto:contact@darkvence.com"
                  className="flex items-center gap-2.5 text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-black dark:hover:text-[#B6FF2B] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#B6FF2B]" />
                  <span>contact@darkvence.com</span>
                </a>
                <a
                  href="tel:+8801893383187"
                  className="flex items-center gap-2.5 text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-black dark:hover:text-[#B6FF2B] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B6FF2B] shrink-0" />
                  <span>+880 1893-383187</span>
                </a>
                <a
                  href={WHATSAPP_CONFIG.getChatUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-[#25D366] transition-colors"
                >
                  <FaWhatsapp className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                  <span>Chat on WhatsApp (+880 1893-383187)</span>
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=S%2F8%20Nurjahan%20Road%2C%20Mohammadpur%2C%20Dhaka-1207%2C%20Bangladesh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-black dark:hover:text-[#B6FF2B] transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#B6FF2B] shrink-0 mt-0.5" />
                  <span>S/8 Nurjahan Road, Mohammadpur, Dhaka-1207</span>
                </a>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => handleTabClick('contact')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#B6FF2B] hover:bg-[#9FE61A] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#B6FF2B]/20 active:scale-98 transition-transform cursor-pointer"
            >
              <span>Start Your Project</span>
              <ArrowUpRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      )}

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#000000]/95 backdrop-blur-2xl border-t border-[#E5E5E5] dark:border-[#232323] shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-10px_35px_rgba(0,0,0,0.8)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 transition-colors duration-200"
      >
        <div className="max-w-md mx-auto px-3">
          <div className="flex items-center justify-between gap-1">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentPage === tab.id;
              const isContact = tab.id === 'contact';

              if (isContact) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative group transition-all cursor-pointer"
                  >
                    <div
                      className={`relative flex items-center justify-center w-11 h-7 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#B6FF2B] text-black shadow-md shadow-[#B6FF2B]/30'
                          : 'bg-[#B6FF2B]/15 text-black dark:text-[#B6FF2B] border border-[#B6FF2B]/30 hover:bg-[#B6FF2B]/25'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] mt-1 font-display tracking-tight font-semibold ${
                        isActive ? 'text-black dark:text-[#B6FF2B]' : 'text-[#5C5C5C] dark:text-[#A1A1A1]'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-colors focus:outline-none cursor-pointer"
                >
                  <div
                    className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#B6FF2B]/15 text-black dark:text-[#B6FF2B]'
                        : 'text-[#5C5C5C] hover:text-[#0A0A0A] dark:text-[#A1A1A1] dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {isActive && (
                      <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#B6FF2B] shadow-[0_0_8px_#B6FF2B]" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-1 font-display tracking-tight ${
                      isActive ? 'text-black dark:text-white font-bold' : 'text-[#5C5C5C] dark:text-[#A1A1A1] font-medium'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}

            {/* Extra Menu Trigger Button for secondary options */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-colors focus:outline-none cursor-pointer ${
                drawerOpen ? 'text-black dark:text-[#B6FF2B]' : 'text-[#5C5C5C] hover:text-[#0A0A0A] dark:text-[#A1A1A1] dark:hover:text-white'
              }`}
              title="More Options"
            >
              <div
                className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-all ${
                  drawerOpen || currentPage === 'about'
                    ? 'bg-black/5 dark:bg-white/10 text-black dark:text-[#B6FF2B]'
                    : 'text-[#5C5C5C] dark:text-[#A1A1A1]'
                }`}
              >
                <Compass className="w-4 h-4" />
                {currentPage === 'about' && (
                  <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#B6FF2B] shadow-[0_0_8px_#B6FF2B]" />
                )}
              </div>
              <span className="text-[11px] mt-1 font-display font-medium tracking-tight text-[#5C5C5C] dark:text-[#A1A1A1]">More</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
