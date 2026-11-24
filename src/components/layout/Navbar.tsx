import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Shield, Menu, X, Sun, Moon, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { BrandLogo } from '../ui/BrandLogo.tsx';
import { BrandTriangle } from '../ui/BrandTriangle.tsx';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, slug?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-50 w-full transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#000000]/95 backdrop-blur-2xl border-b border-[#E5E5E5] dark:border-[#232323] shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.9)] py-2.5 sm:py-3'
            : 'bg-white/80 dark:bg-[#000000]/80 backdrop-blur-xl border-b border-[#E5E5E5]/60 dark:border-[#232323]/60 py-3.5 sm:py-4'
        }`}
      >
        {/* Subtle Lime hairline accent at very top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B6FF2B]/40 to-transparent pointer-events-none" />

        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex items-center justify-between h-11 sm:h-12">
            {/* 1. BRAND LOGO - LEFT */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => handleLinkClick('home')}
                className="flex items-center text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF2B] rounded-xl select-none py-1 group"
                aria-label="DARKVENCE Home"
              >
                <BrandLogo size="md" animateEntrance={true} />
              </button>
            </div>

            {/* 2. DESKTOP NAVIGATION LINKS - CENTER (Hidden on mobile/tablet < lg) */}
            <nav
              aria-label="Main Navigation"
              className="hidden lg:flex items-center gap-1 xl:gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] shadow-inner relative"
              onMouseLeave={() => setHoveredNav(null)}
            >
              {navLinks.map((link) => {
                const isActive = currentPage === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    onMouseEnter={() => setHoveredNav(link.id)}
                    className={`relative px-4 py-1.5 text-[0.95rem] font-medium font-display rounded-full transition-colors duration-200 cursor-pointer select-none z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF2B] whitespace-nowrap ${
                      isActive
                        ? 'text-black dark:text-black font-bold'
                        : 'text-[#5C5C5C] hover:text-[#0A0A0A] dark:text-[#A1A1A1] dark:hover:text-white'
                    }`}
                  >
                    {/* Active Lime Pill Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        className="absolute inset-0 bg-[#B6FF2B] rounded-full shadow-[0_0_15px_rgba(182,255,43,0.35)] -z-10"
                      />
                    )}

                    {/* Hover Glow sheen for non-active links */}
                    {!isActive && hoveredNav === link.id && (
                      <motion.div
                        layoutId="navbar-hover-sheen"
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-full -z-10"
                      />
                    )}

                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* 3. DESKTOP ACTIONS - RIGHT (Theme Toggle, Admin Portal, CTA) */}
            <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 shrink-0">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer select-none bg-[#F5F5F5] hover:bg-[#EBEBEB] border-[#E5E5E5] text-[#0A0A0A] dark:bg-[#0F0F0F] dark:border-[#232323] dark:text-white dark:hover:border-[#B6FF2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF2B] shadow-sm"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.div
                      key="sun-icon"
                      initial={{ rotate: -70, scale: 0.6, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={{ rotate: 70, scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center justify-center text-[#B6FF2B]"
                    >
                      <Sun className="w-4 h-4 text-[#B6FF2B]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon-icon"
                      initial={{ rotate: 70, scale: 0.6, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={{ rotate: -70, scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center justify-center text-[#0A0A0A]"
                    >
                      <Moon className="w-4 h-4 text-[#0A0A0A]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Admin Portal button */}
              <button
                onClick={() => handleLinkClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 text-[0.95rem] font-medium font-display rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                  currentPage.startsWith('admin')
                    ? 'bg-[#B6FF2B]/15 border-[#B6FF2B] text-black dark:text-[#B6FF2B] shadow-sm'
                    : 'bg-[#F5F5F5] dark:bg-[#0F0F0F] border-[#E5E5E5] dark:border-[#232323] text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#B6FF2B]'
                }`}
                title="Admin Control Center"
              >
                <Shield className="w-3.5 h-3.5 text-[#B6FF2B]" />
                <span>{isAuthenticated ? 'Dashboard' : 'Portal'}</span>
              </button>

              {/* Primary CTA Button: "Start a Project" (Strict Lime + Black text) */}
              <button
                onClick={() => handleLinkClick('contact')}
                className="relative group inline-flex items-center justify-center gap-1.5 px-4 xl:px-5 py-2 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl overflow-hidden cursor-pointer select-none transition-all duration-200 shadow-md shadow-[#B6FF2B]/20 hover:shadow-[#B6FF2B]/35 active:scale-95 whitespace-nowrap"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <span>Start a Project</span>
                  <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </button>
            </div>

            {/* 4. MOBILE / TABLET CONTROLS (< lg) */}
            <div className="flex lg:hidden items-center gap-2">
              {/* Mobile Quick Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors bg-[#F5F5F5] dark:bg-[#0F0F0F] border-[#E5E5E5] dark:border-[#232323] text-[#0A0A0A] dark:text-white cursor-pointer"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-[#B6FF2B]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#0A0A0A]" />
                )}
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] text-[#0A0A0A] dark:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF2B] cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#B6FF2B]" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE RESPONSIVE SLIDE-DOWN DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              aria-hidden="true"
            />

            {/* Mobile Navigation Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[57px] sm:top-[61px] left-0 right-0 z-50 bg-white/98 dark:bg-[#000000]/98 backdrop-blur-3xl border-b border-[#E5E5E5] dark:border-[#232323] shadow-2xl lg:hidden overflow-y-auto max-h-[calc(100vh-65px)]"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              <div className="max-w-md mx-auto px-5 py-6 space-y-5">
                {/* Navigation Links */}
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const isActive = currentPage === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => handleLinkClick(link.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[0.95rem] font-medium font-display transition-all text-left ${
                          isActive
                            ? 'bg-[#B6FF2B] text-black shadow-sm font-semibold'
                            : 'text-[#0A0A0A] dark:text-[#FFFFFF] hover:bg-[#F5F5F5] dark:hover:bg-[#0F0F0F]'
                        }`}
                      >
                        <span>{link.label}</span>
                        {isActive && (
                          <BrandTriangle size={12} color="#000000" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Theme Selector Card */}
                <div className="p-3.5 rounded-2xl bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-black dark:bg-[#161616] flex items-center justify-center text-[#B6FF2B] border border-[#232323]">
                      {isDark ? <Sun className="w-4 h-4 text-[#B6FF2B]" /> : <Moon className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold font-display text-[#0A0A0A] dark:text-white">
                        Appearance
                      </p>
                      <p className="text-xs font-body text-[#5C5C5C] dark:text-[#A1A1A1]">
                        Currently in {isDark ? 'Dark Mode' : 'Light Mode'}
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex p-1 rounded-xl bg-white dark:bg-black border border-[#E5E5E5] dark:border-[#232323]">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium font-display transition-all cursor-pointer ${
                        !isDark
                          ? 'bg-[#B6FF2B] text-black shadow-sm'
                          : 'text-[#5C5C5C] hover:text-[#0A0A0A] dark:text-[#A1A1A1] dark:hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium font-display transition-all cursor-pointer ${
                        isDark
                          ? 'bg-[#B6FF2B] text-black shadow-sm'
                          : 'text-[#5C5C5C] hover:text-[#0A0A0A] dark:text-[#A1A1A1] dark:hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Primary CTA in Mobile Menu */}
                <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#232323] space-y-3">
                  <button
                    onClick={() => handleLinkClick('contact')}
                    className="w-full py-3.5 px-4 rounded-xl font-semibold font-display text-[0.95rem] tracking-[0.01em] text-black bg-[#B6FF2B] hover:bg-[#9FE61A] flex items-center justify-center gap-2 shadow-lg shadow-[#B6FF2B]/20 active:scale-98 transition-transform cursor-pointer"
                  >
                    <span>Start a Project</span>
                    <ArrowUpRight className="w-4 h-4 text-black" />
                  </button>

                  {/* Direct Contact snippet */}
                  <div className="px-1 py-2 space-y-2 text-[11px] text-[#5C5C5C] dark:text-[#A1A1A1]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#B6FF2B] shrink-0" />
                      <a href="tel:+8801893383187" className="hover:text-black dark:hover:text-[#B6FF2B] font-medium">
                        +880 1893-383187
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#B6FF2B] shrink-0 mt-0.5" />
                      <span>S/8 Nurjahan Road, Mohammadpur, Dhaka-1207</span>
                    </div>
                  </div>

                  {/* Admin link */}
                  <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between text-xs text-[#5C5C5C] dark:text-[#A1A1A1]">
                    <button
                      onClick={() => handleLinkClick('admin')}
                      className="flex items-center gap-1.5 hover:text-black dark:hover:text-[#B6FF2B] transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#B6FF2B]" />
                      <span>{isAuthenticated ? 'Admin Dashboard' : 'Admin CMS Portal'}</span>
                    </button>

                    <span className="font-mono text-[10px] text-[#A1A1A1]">
                      DARKVENCE
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
