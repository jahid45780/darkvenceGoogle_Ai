import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  Smartphone,
  LayoutGrid,
  TrendingUp,
  Share2,
  Cpu,
  ChevronDown,
  Layers,
  Zap,
  Lock,
  Sparkles,
  Code2,
  Database,
  Cloud,
  Terminal,
  Star,
  Activity,
  Check,
  Quote,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  ServiceItem,
  ProjectItem,
  SiteSettings,
  Testimonial,
  TrustedBrand,
  TrustedBrandsPayload,
  StatisticItem
} from '../../types/index.ts';
import { HeroSection } from '../../components/home/HeroSection.tsx';
import { BrandTriangle } from '../../components/ui/BrandTriangle.tsx';

interface HomePageProps {
  settings?: SiteSettings;
  services: ServiceItem[];
  projects: ProjectItem[];
  testimonials: Testimonial[];
  testimonialsLoading: boolean;
  testimonialsError: string | null;
  onRetryTestimonials?: () => void;
  trustedBrandsData: TrustedBrandsPayload | null;
  trustedBrandsLoading: boolean;
  trustedBrandsError: string | null;
  onRetryTrustedBrands?: () => void;
  statistics: StatisticItem[];
  statisticsLoading: boolean;
  statisticsError: string | null;
  onRetryStatistics?: () => void;
  onNavigate: (page: string, slug?: string) => void;
}

const TestimonialAvatar: React.FC<{ name: string; image?: string }> = ({ name, image }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'DV';

  if (image && !imgError) {
    return (
      <img
        src={image}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="w-11 h-11 rounded-full object-cover border border-[#E5E5E5] dark:border-[#232323] bg-[#F5F5F5] dark:bg-[#161616] shrink-0"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="w-11 h-11 rounded-full bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] flex items-center justify-center text-xs font-bold font-display text-[#0A0A0A] dark:text-[#B6FF2B] shrink-0"
    >
      {initials}
    </div>
  );
};

const TrustedBrandCard: React.FC<{
  brand: TrustedBrand;
  surfaceMode: 'auto' | 'dark' | 'light';
  reduceMotion: boolean;
}> = ({ brand, surfaceMode, reduceMotion }) => {
  const [logoError, setLogoError] = useState(false);

  const cardClass =
    surfaceMode === 'dark'
      ? 'bg-[#161616] border-[#232323] text-white'
      : surfaceMode === 'light'
        ? 'bg-white border-[#E5E5E5] text-[#0A0A0A]'
        : 'bg-white dark:bg-[#161616] border-[#E5E5E5] dark:border-[#232323] text-[#0A0A0A] dark:text-white';

  const mutedClass =
    surfaceMode === 'dark'
      ? 'text-[#A1A1A1]'
      : surfaceMode === 'light'
        ? 'text-[#5C5C5C]'
        : 'text-[#5C5C5C] dark:text-[#A1A1A1]';

  return (
    <motion.div
      whileHover={reduceMotion ? {} : { y: -2 }}
      className={`h-full flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl border shadow-sm hover:border-[#B6FF2B] transition-all duration-200 min-w-0 ${cardClass}`}
      title={brand.description || `${brand.name} · ${brand.industry}`}
    >
      {brand.logoUrl && !logoError && (
        <div className="h-8 flex items-center justify-center mb-2.5 max-w-[130px]">
          <img
            src={brand.logoUrl}
            alt={`${brand.name} logo`}
            referrerPolicy="no-referrer"
            onError={() => setLogoError(true)}
            className="max-h-8 max-w-[130px] w-auto object-contain"
          />
        </div>
      )}
      <span className="text-xs sm:text-sm font-bold tracking-tight font-display text-center truncate max-w-full">
        {brand.name}
      </span>
      <span className={`text-[10px] uppercase tracking-wider mt-1 text-center truncate max-w-full font-mono ${mutedClass}`}>
        {brand.industry}
      </span>
      {brand.description && (
        <span className={`text-[11px] mt-1.5 text-center line-clamp-2 max-w-full font-body leading-snug ${mutedClass}`}>
          {brand.description}
        </span>
      )}
    </motion.div>
  );
};

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  services,
  projects,
  testimonials,
  testimonialsLoading,
  testimonialsError,
  onRetryTestimonials,
  trustedBrandsData,
  trustedBrandsLoading,
  trustedBrandsError,
  onRetryTrustedBrands,
  statistics,
  statisticsLoading,
  statisticsError,
  onRetryStatistics,
  onNavigate
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<string | null>(settings?.faqs?.[0]?.id || null);
  const [portfolioCategory, setPortfolioCategory] = useState<string>('All');
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const trustedBrands = trustedBrandsData?.brands || [];

  // Duplicate brands enough times per half-track so even 1-4 dynamic brands fill ultra-wide viewports seamlessly
  const marqueeTrackBrands = useMemo(() => {
    if (trustedBrands.length === 0) return [];
    const repeatCount = Math.max(2, Math.ceil(10 / trustedBrands.length));
    const expanded: TrustedBrand[] = [];
    for (let i = 0; i < repeatCount; i++) {
      expanded.push(...trustedBrands);
    }
    return expanded;
  }, [trustedBrands]);

  const marqueeDurationClass =
    marqueeTrackBrands.length <= 10
      ? '[animation-duration:34s]'
      : marqueeTrackBrands.length <= 14
        ? '[animation-duration:44s]'
        : marqueeTrackBrands.length <= 20
          ? '[animation-duration:56s]'
          : '[animation-duration:72s]';

  const getServiceIcon = (iconName: string) => {
    const iconClass = "w-5 h-5 text-[#B6FF2B]";
    switch (iconName) {
      case 'Globe': return <Globe className={iconClass} />;
      case 'Smartphone': return <Smartphone className={iconClass} />;
      case 'LayoutGrid': return <LayoutGrid className={iconClass} />;
      case 'TrendingUp': return <TrendingUp className={iconClass} />;
      case 'Share2': return <Share2 className={iconClass} />;
      case 'Cpu': return <Cpu className={iconClass} />;
      case 'Layers': return <Layers className={iconClass} />;
      case 'Activity': return <Activity className={iconClass} />;
      default: return <Sparkles className={iconClass} />;
    }
  };

  const sectionAnimation = {
    initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.65, ease: 'easeOut' as const }
  };

  const projectCategories = ['All', 'Website Development', 'Mobile Application', 'CMS Development', 'Custom Software'];
  const filteredProjects = portfolioCategory === 'All'
    ? projects.filter(p => p.featured || true).slice(0, 4)
    : projects.filter(p => p.category === portfolioCategory).slice(0, 4);

  const displayServices = services.slice(0, 8);

  const techStack = [
    { name: 'React 19 & Next.js', role: 'Frontend Architecture', icon: Code2, desc: 'Sub-second server-rendered views with zero hydration bottlenecks.' },
    { name: 'TypeScript', role: 'Type Safety & Contracts', icon: Terminal, desc: 'Zero runtime type regressions across client and API boundaries.' },
    { name: 'Node.js & Express', role: 'Backend Services', icon: Cpu, desc: 'High-throughput micro-services with strict Zod validation pipelines.' },
    { name: 'MongoDB Atlas', role: 'Persistent Cloud Data', icon: Database, desc: 'Enterprise document cluster with automatic failover and scale.' },
    { name: 'Tailwind CSS v4', role: 'Utility Design System', icon: Layers, desc: 'Zero runtime CSS overhead with modern theme token synchronization.' },
    { name: 'Cloudflare & Vercel', role: 'Global Edge Network', icon: Cloud, desc: 'Worldwide edge caching, SSL termination, and DDoS defense.' }
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-28 sm:pb-24 overflow-x-hidden">
      {/* 1. HIGH-IMPACT HERO SECTION */}
      <HeroSection settings={settings} onNavigate={onNavigate} />

      {/* 2. TRUSTED BY / CLIENT BRAND STRIP (Dynamic CMS Infinite RTL Marquee) */}
      {(() => {
        const brandSettings = trustedBrandsData?.settings;
        const brands = trustedBrands;
        const surfaceMode = brandSettings?.themeMode || 'auto';

        // Hide entire section when globally disabled
        if (!trustedBrandsLoading && !trustedBrandsError && brandSettings && !brandSettings.enabled) {
          return null;
        }

        // Hide cleanly if loaded successfully with zero active & published brands
        if (!trustedBrandsLoading && !trustedBrandsError && brands.length === 0) {
          return null;
        }

        const sectionSurfaceClass =
          surfaceMode === 'dark'
            ? 'border-[#232323] bg-[#0F0F0F]'
            : surfaceMode === 'light'
              ? 'border-[#E5E5E5] bg-[#F5F5F5]'
              : 'border-[#E5E5E5] dark:border-[#232323] bg-[#F5F5F5] dark:bg-[#0F0F0F]';

        const headingColorClass =
          surfaceMode === 'dark'
            ? 'text-[#A1A1A1]'
            : surfaceMode === 'light'
              ? 'text-[#5C5C5C]'
              : 'text-[#5C5C5C] dark:text-[#A1A1A1]';

        const gridColsClass =
          brands.length === 1
            ? 'grid-cols-1 max-w-xs mx-auto'
            : brands.length === 2
              ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
              : brands.length === 3
                ? 'grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto'
                : brands.length === 4
                  ? 'grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5';

        return (
          <motion.section
            {...sectionAnimation}
            className={`border-y py-10 backdrop-blur-md transition-colors overflow-hidden ${sectionSurfaceClass}`}
          >
            {trustedBrandsLoading ? (
              <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
                <div className="space-y-6" aria-busy="true" aria-label="Loading trusted brands">
                  <div className="h-4 w-72 max-w-full mx-auto rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className="h-20 rounded-xl border border-[#E5E5E5] dark:border-[#232323] bg-white/70 dark:bg-[#161616] animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : trustedBrandsError ? (
              <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center py-2">
                  <p className={`text-xs sm:text-sm font-body ${headingColorClass}`}>
                    {trustedBrandsError}
                  </p>
                  {onRetryTrustedBrands && (
                    <button
                      type="button"
                      onClick={onRetryTrustedBrands}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#B6FF2B] hover:bg-[#9FE61A] text-black text-xs font-semibold font-display transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
                  <div className="text-center mb-7 space-y-2">
                    <p
                      className={`text-xs uppercase tracking-[0.2em] font-mono font-semibold flex items-center justify-center gap-2 mx-auto ${headingColorClass}`}
                    >
                      <BrandTriangle size={10} color="#B6FF2B" />
                      <span>
                        {brandSettings?.heading ||
                          'Trusted By Ambitious Brands & Venture-Backed Companies'}
                      </span>
                      <BrandTriangle size={10} inverted color="#B6FF2B" />
                    </p>
                    {brandSettings?.subtitle && (
                      <p className={`text-xs sm:text-sm font-body mx-auto ${headingColorClass}`}>
                        {brandSettings.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {shouldReduceMotion ? (
                  <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
                    <div className={`grid ${gridColsClass} gap-3 sm:gap-6 items-stretch justify-center`}>
                      {brands.map((brand) => (
                        <TrustedBrandCard
                          key={brand.id}
                          brand={brand}
                          surfaceMode={surfaceMode}
                          reduceMotion={true}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="trusted-marquee-viewport w-full py-2"
                    aria-label={brandSettings?.heading || 'Trusted Brands'}
                  >
                    <div className={`animate-trusted-marquee ${marqueeDurationClass}`}>
                      {/* Primary Track */}
                      <div className="flex shrink-0 items-stretch gap-4 sm:gap-6 pr-4 sm:pr-6">
                        {marqueeTrackBrands.map((brand, idx) => (
                          <div
                            key={`track-a-${brand.id}-${idx}`}
                            className="w-[190px] sm:w-[225px] md:w-[250px] shrink-0"
                          >
                            <TrustedBrandCard
                              brand={brand}
                              surfaceMode={surfaceMode}
                              reduceMotion={false}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Seamless Duplicate Track */}
                      <div
                        aria-hidden="true"
                        className="flex shrink-0 items-stretch gap-4 sm:gap-6 pr-4 sm:pr-6"
                      >
                        {marqueeTrackBrands.map((brand, idx) => (
                          <div
                            key={`track-b-${brand.id}-${idx}`}
                            className="w-[190px] sm:w-[225px] md:w-[250px] shrink-0"
                          >
                            <TrustedBrandCard
                              brand={brand}
                              surfaceMode={surfaceMode}
                              reduceMotion={false}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.section>
        );
      })()}

      {/* 3. AGENCY INTRODUCTION / MANIFESTO */}
      <motion.section {...sectionAnimation} className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-[#FFFFFF] uppercase tracking-[0.12em]">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>The Darkvence Philosophy</span>
              <span aria-hidden="true" className="text-[#A1A1A1]">·</span>
              <span>Engineering Over Decoration</span>
            </div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] font-display text-balance leading-[1.1]">
              Architects of High-Yield Digital Infrastructure.
            </h2>
            <p className="text-base sm:text-lg text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.65] max-w-[65ch] font-body">
              Most digital agencies treat software as an afterthought and design as superficial window dressing. We believe high-performance code and deliberate conversion design are the ultimate drivers of enterprise equity.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#232323] bg-[#F5F5F5] dark:bg-[#0F0F0F] shadow-sm">
                <div className="flex items-center gap-2 text-[#0A0A0A] dark:text-white font-semibold font-display text-sm mb-1">
                  <Check className="w-4 h-4 text-[#B6FF2B]" />
                  <span>Zero Tech Debt Guarantee</span>
                </div>
                <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
                  Modular TypeScript, audited API contracts, and clean component hierarchies built to outlast agency handovers.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#232323] bg-[#F5F5F5] dark:bg-[#0F0F0F] shadow-sm">
                <div className="flex items-center gap-2 text-[#0A0A0A] dark:text-white font-semibold font-display text-sm mb-1">
                  <Check className="w-4 h-4 text-[#B6FF2B]" />
                  <span>Direct Principal Access</span>
                </div>
                <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
                  You collaborate directly with senior software architects and creative directors—never junior account intermediaries.
                </p>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-[#0A0A0A] dark:text-[#B6FF2B] hover:underline transition-colors group cursor-pointer"
              >
                <span>Read our full agency story &amp; values</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] dark:border-[#232323]">
                <div className="text-xs font-mono text-[#5C5C5C] dark:text-[#A1A1A1] uppercase tracking-wider flex items-center gap-2">
                  <BrandTriangle size={10} color="#B6FF2B" />
                  <span>Quality Invariants</span>
                </div>
                <span className="text-xs font-mono text-black bg-[#B6FF2B] px-2.5 py-0.5 rounded-lg font-bold">
                  100% Verified
                </span>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-black dark:bg-[#161616] border border-[#232323] flex items-center justify-center text-[#B6FF2B] shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#0A0A0A] dark:text-white block">Sub-Second Execution</span>
                    <span className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1]">Core Web Vitals FCP &lt; 700ms across mobile and desktop viewports.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-black dark:bg-[#161616] border border-[#232323] flex items-center justify-center text-[#B6FF2B] shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#0A0A0A] dark:text-white block">Bank-Grade Security</span>
                    <span className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1]">Strict HTTP headers, cryptographic password hashing, and honeypot traps.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-black dark:bg-[#161616] border border-[#232323] flex items-center justify-center text-[#B6FF2B] shrink-0 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#0A0A0A] dark:text-white block">Full Attribution CAPI</span>
                    <span className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1]">Server-side conversion tracking for Google Ads and Meta Pixel.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. QUANTITATIVE BENCHMARKS */}
      <motion.section {...sectionAnimation} className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] shadow-sm relative overflow-hidden">
          {statisticsLoading ? (
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
              aria-busy="true"
              aria-label="Loading statistics"
            >
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="px-3 space-y-2.5 flex flex-col items-center">
                  <div className="h-9 sm:h-11 w-28 rounded-xl bg-black/10 dark:bg-white/10 animate-pulse" />
                  <div className="h-3.5 w-36 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                </div>
              ))}
            </div>
          ) : statisticsError ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center py-2">
              <p className="text-xs sm:text-sm text-[#5C5C5C] dark:text-[#A1A1A1] font-body">
                {statisticsError}
              </p>
              {onRetryStatistics && (
                <button
                  type="button"
                  onClick={onRetryStatistics}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#B6FF2B] hover:bg-[#9FE61A] text-black text-xs font-semibold font-display transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          ) : statistics.length === 0 ? (
            <div className="text-center py-3 space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-[#5C5C5C] dark:text-[#A1A1A1]">
                No performance benchmarks published yet.
              </p>
            </div>
          ) : (
            (() => {
              const orderedStats = [...statistics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              const gridColsClass =
                orderedStats.length === 1
                  ? 'grid-cols-1 max-w-md mx-auto'
                  : orderedStats.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : orderedStats.length === 3
                      ? 'grid-cols-1 sm:grid-cols-3'
                      : 'grid-cols-2 md:grid-cols-4';
              return (
                <div
                  className={`grid ${gridColsClass} gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5] dark:divide-[#232323]`}
                >
                  {orderedStats.map((metric) => (
                    <div key={metric.id} className="pt-4 md:pt-0 px-3 space-y-1">
                      <div className="text-3xl sm:text-5xl font-extrabold text-[#0A0A0A] dark:text-white tracking-tight font-mono-tabular">
                        {metric.prefix && <span>{metric.prefix}</span>}
                        <span>{metric.value}</span>
                        {metric.suffix && (
                          <span className="text-xl sm:text-2xl text-[#B6FF2B] ml-1">
                            {metric.suffix}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1] font-medium font-mono uppercase tracking-wider">
                        {metric.title}
                      </div>
                      {metric.description && (
                        <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1]/85 font-body leading-relaxed pt-0.5 max-w-[26ch] mx-auto">
                          {metric.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </motion.section>

      {/* 5. PREMIUM SERVICES BENTO GRID */}
      <motion.section {...sectionAnimation} className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-3">
            <div className="text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em] flex items-center gap-2">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>Core Capabilities &amp; Software Solutions</span>
            </div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] leading-[1.1] font-display">
              Engineered for Speed, Conversion &amp; Scale
            </h2>
            <p className="text-[#5C5C5C] dark:text-[#A1A1A1] text-base leading-[1.7] max-w-[65ch] font-body">
              We do not offer generic digital packages. Each capability is executed by senior engineers and growth specialists with deep domain mastery.
            </p>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-[#0A0A0A] dark:text-[#B6FF2B] hover:underline transition-colors group cursor-pointer whitespace-nowrap"
          >
            <span>View All Detailed Services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Bento-grid of Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayServices.map((service, index) => (
            <motion.div
              key={service.id}
              whileHover={shouldReduceMotion ? {} : { y: -4 }}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
              onClick={() => onNavigate('services', service.slug)}
              className="group p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#B6FF2B] flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200"
            >
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] group-hover:border-[#B6FF2B] transition-colors">
                    {getServiceIcon(service.icon)}
                  </div>
                  <span className="text-xs sm:text-[13px] font-mono font-medium text-[#5C5C5C] dark:text-[#A1A1A1]">
                    0{index + 1}.
                  </span>
                </div>

                <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold text-[#0A0A0A] dark:text-white group-hover:text-[#B6FF2B] transition-colors font-display leading-[1.25]">
                  {service.title}
                </h3>

                <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] line-clamp-3 font-body">
                  {service.shortDescription}
                </p>

                {/* Clean unboxed metadata with bullet points */}
                <ul className="space-y-1.5 pt-2">
                  {service.features.slice(0, 3).map((feat, fIdx) => (
                    <li key={fIdx} className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] flex items-center gap-2 font-body">
                      <BrandTriangle size={8} color="#B6FF2B" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between text-[0.95rem] font-semibold font-display text-[#5C5C5C] dark:text-[#A1A1A1] group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors relative z-10">
                <span>Explore Deliverables</span>
                <ArrowUpRight className="w-4 h-4 text-[#B6FF2B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 6. FEATURED PORTFOLIO PROJECTS */}
      <motion.section {...sectionAnimation} className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em] flex items-center gap-2">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>Selected Case Studies</span>
            </div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] leading-[1.1] font-display">
              Proven Architectural Proof
            </h2>
            <p className="text-[#5C5C5C] dark:text-[#A1A1A1] text-base leading-[1.7] max-w-[65ch] font-body">
              Concrete challenges solved through deliberate engineering and conversion-oriented design.
            </p>
          </div>
          <button
            onClick={() => onNavigate('portfolio')}
            className="inline-flex items-center gap-2 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-[#0A0A0A] dark:text-[#B6FF2B] hover:underline transition-colors group cursor-pointer whitespace-nowrap"
          >
            <span>View All Case Studies</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] rounded-xl overflow-x-auto max-w-fit mb-10">
          {projectCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setPortfolioCategory(cat)}
              className={`px-4 py-2 text-xs sm:text-[13px] font-mono font-medium tracking-[0.08em] rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                portfolioCategory === cat
                  ? 'bg-[#B6FF2B] text-black shadow-sm font-bold'
                  : 'text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-[#0A0A0A] dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-10">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              whileHover={shouldReduceMotion ? {} : { y: -3 }}
              onClick={() => onNavigate('portfolio', project.slug)}
              className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#B6FF2B] transition-all duration-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center cursor-pointer shadow-sm hover:shadow-xl"
            >
              {/* Image side */}
              <div className={`lg:col-span-6 rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-[#232323] aspect-[16/10] w-full ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <img
                  src={project.images[0]}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Text side */}
              <div className={`lg:col-span-6 space-y-5 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="flex items-center gap-2 text-xs sm:text-[13px] text-[#5C5C5C] dark:text-[#A1A1A1] font-mono font-medium tracking-[0.08em]">
                  <span className="font-semibold text-black dark:text-[#B6FF2B]">{project.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{project.client}</span>
                </div>

                <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold text-[#0A0A0A] dark:text-white group-hover:text-[#B6FF2B] transition-colors font-display leading-[1.25]">
                  {project.title}
                </h3>

                <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body max-w-[65ch]">
                  {project.description}
                </p>

                {/* Quantitative results */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E5E5E5] dark:border-[#232323]">
                  {project.results.map((res, rIdx) => (
                    <div key={rIdx} className="min-w-0">
                      <p className="text-base sm:text-2xl font-bold text-[#0A0A0A] dark:text-white font-mono-tabular truncate font-display">
                        {res.metric}
                      </p>
                      <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1] leading-tight mt-0.5 truncate font-mono">
                        {res.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {project.technologies.slice(0, 4).map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-xs font-mono font-medium text-[#0A0A0A] dark:text-[#A1A1A1] border border-[#E5E5E5] dark:border-[#232323] bg-[#F5F5F5] dark:bg-[#161616] px-2.5 py-1 rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 7. OUR DEVELOPMENT PROCESS */}
      <motion.section {...sectionAnimation} className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em] flex items-center justify-center gap-2">
            <BrandTriangle size={10} color="#B6FF2B" />
            <span>Operational Rigor</span>
            <BrandTriangle size={10} inverted color="#B6FF2B" />
          </div>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] leading-[1.1] font-display">
            How We Partner &amp; Deliver
          </h2>
          <p className="text-[#5C5C5C] dark:text-[#A1A1A1] text-base leading-[1.7] max-w-[65ch] mx-auto font-body">
            From technical discovery to continuous scaling, our process eliminates ambiguity and delivers verifiable results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Technical Discovery',
              desc: 'We map system architecture, audit bottlenecks, and formulate conversion metrics before committing a single line of code.'
            },
            {
              step: '02',
              title: 'Interactive Prototyping',
              desc: 'High-fidelity wireframes and clickable prototypes validated across target viewports and user journeys.'
            },
            {
              step: '03',
              title: 'Sprint Development',
              desc: 'Clean, modular engineering in bi-weekly sprints with continuous staging access and transparent git commits.'
            },
            {
              step: '04',
              title: 'Stress Testing & Launch',
              desc: 'Automated CI/CD testing, Core Web Vitals optimization, server-side tracking verification, and seamless DNS cutover.'
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={shouldReduceMotion ? {} : { y: -3 }}
              className="p-6 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] relative space-y-4 shadow-sm hover:border-[#B6FF2B] transition-all duration-200"
            >
              <div className="text-3xl sm:text-4xl font-bold text-[#B6FF2B] font-mono-tabular font-display">
                {item.step}
              </div>
              <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold text-[#0A0A0A] dark:text-white font-display leading-[1.25]">
                {item.title}
              </h3>
              <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 8. WHY CHOOSE DARKVENCE */}
      <motion.section {...sectionAnimation} className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="p-6 sm:p-10 lg:p-16 rounded-3xl bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] relative overflow-hidden shadow-sm">
          <div className="max-w-3xl mb-12 space-y-3">
            <span className="text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em] flex items-center gap-2">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>The Darkvence Standard</span>
            </span>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] leading-[1.1] font-display">
              Why Forward-Thinking Leaders Choose Us
            </h2>
            <p className="text-[#5C5C5C] dark:text-[#A1A1A1] text-base leading-[1.7] max-w-[65ch] font-body">
              We treat software engineering and performance marketing as primary drivers of enterprise value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] flex items-center justify-center text-[#B6FF2B]">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-semibold text-[#0A0A0A] dark:text-white font-display leading-[1.3]">Sub-Second Speed</h4>
              <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
                Zero bloated themes or unwieldy plugins. We engineer lean React &amp; Next.js bundles achieving 95+ Core Web Vitals across every viewport.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] flex items-center justify-center text-[#B6FF2B]">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-semibold text-[#0A0A0A] dark:text-white font-display leading-[1.3]">End-to-End Modern Architecture</h4>
              <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
                Clean architectural separation of concerns. From validated backend services to predictable frontend stores, our code is built to scale.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] flex items-center justify-center text-[#B6FF2B]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-semibold text-[#0A0A0A] dark:text-white font-display leading-[1.3]">Signal-Driven Advertising</h4>
              <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
                We bridge development and paid media with server-side Meta CAPI and Google Ads tracking to minimize acquisition costs and maximize ROAS.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] flex items-center justify-center text-[#B6FF2B]">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-semibold text-[#0A0A0A] dark:text-white font-display leading-[1.3]">100% IP Ownership</h4>
              <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
                You own all production code repositories, Figma design assets, and cloud deployment pipelines with complete documentation.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 9. DYNAMIC CLIENT TESTIMONIALS */}
      <motion.section {...sectionAnimation} className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 space-y-3">
          <div className="text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em] flex items-center justify-center gap-2">
            <BrandTriangle size={10} color="#B6FF2B" />
            <span>Client Testimonials</span>
            <BrandTriangle size={10} inverted color="#B6FF2B" />
          </div>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] leading-[1.1] font-display">
            Direct Perspectives on Darkvence
          </h2>
          <p className="text-[#5C5C5C] dark:text-[#A1A1A1] text-base leading-[1.7] max-w-[65ch] mx-auto font-body">
            Verified perspectives from engineering leads and founders who partnered with our studio.
          </p>
        </div>

        {testimonialsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" aria-label="Loading client testimonials">
            {[0, 1, 2].map((skeletonIdx) => (
              <div
                key={skeletonIdx}
                className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] space-y-6 animate-pulse"
              >
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((starIdx) => (
                    <div key={starIdx} className="w-4 h-4 rounded bg-[#E5E5E5] dark:bg-[#232323]" />
                  ))}
                </div>
                <div className="space-y-2.5">
                  <div className="h-4 w-full rounded bg-[#E5E5E5] dark:bg-[#232323]" />
                  <div className="h-4 w-5/6 rounded bg-[#E5E5E5] dark:bg-[#232323]" />
                  <div className="h-4 w-4/6 rounded bg-[#E5E5E5] dark:bg-[#232323]" />
                </div>
                <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#232323] flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#E5E5E5] dark:bg-[#232323] shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 w-32 rounded bg-[#E5E5E5] dark:bg-[#232323]" />
                    <div className="h-3 w-44 rounded bg-[#E5E5E5] dark:bg-[#232323]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : testimonialsError ? (
          <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] text-center space-y-4 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <Quote className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-[#0A0A0A] dark:text-white font-display">
                Unable to Load Client Testimonials
              </h3>
              <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] mx-auto font-body">
                {testimonialsError}
              </p>
            </div>
            {onRetryTestimonials && (
              <button
                type="button"
                onClick={onRetryTestimonials}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B6FF2B] hover:bg-[#9FE61A] text-black text-sm font-semibold font-display transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Loading</span>
              </button>
            )}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="max-w-xl mx-auto p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] text-center space-y-3 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] text-[#B6FF2B] flex items-center justify-center mx-auto">
              <Quote className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#0A0A0A] dark:text-white font-display">
              No Client Testimonials Published Yet
            </h3>
            <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] mx-auto font-body leading-relaxed">
              Verified partner reviews will appear here as soon as they are published from the studio CMS.
            </p>
          </div>
        ) : (
          <div
            className={
              testimonials.length === 1
                ? 'grid grid-cols-1 max-w-xl mx-auto gap-6'
                : testimonials.length === 2
                  ? 'grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 items-stretch'
                  : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch'
            }
          >
            {testimonials.map((t) => {
              const clampedRating = Math.min(5, Math.max(1, Math.round(t.rating || 5)));
              return (
                <motion.article
                  key={t.id}
                  whileHover={shouldReduceMotion ? {} : { y: -3 }}
                  className="w-full min-w-0 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] flex flex-col justify-between gap-6 shadow-sm hover:border-[#B6FF2B] transition-all duration-200"
                >
                  <div className="space-y-4 min-w-0">
                    <div
                      className="flex items-center gap-1"
                      aria-label={`${clampedRating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 shrink-0 ${
                            star <= clampedRating
                              ? 'fill-[#B6FF2B] text-[#B6FF2B]'
                              : 'text-[#E5E5E5] dark:text-[#232323]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-base text-[#0A0A0A] dark:text-[#FFFFFF] leading-[1.7] italic font-body break-words whitespace-normal max-w-none">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <TestimonialAvatar name={t.name} image={t.image} />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-[#0A0A0A] dark:text-white font-display break-words">
                          {t.name}
                        </h4>
                        <p className="text-xs sm:text-[13px] text-[#5C5C5C] dark:text-[#A1A1A1] font-mono break-words whitespace-normal max-w-none">
                          {t.designation}
                          {t.company ? ` · ${t.company}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] text-black bg-[#B6FF2B] px-2.5 py-0.5 rounded font-mono font-semibold uppercase tracking-[0.08em]">
                      Verified
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* 10. MODERN TECHNOLOGY STACK SHOWCASE */}
      <motion.section {...sectionAnimation} className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em] flex items-center justify-center gap-2">
            <BrandTriangle size={10} color="#B6FF2B" />
            <span>Technology Foundation</span>
            <BrandTriangle size={10} inverted color="#B6FF2B" />
          </div>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] leading-[1.1] font-display">
            Built on Battle-Tested Modern Standards
          </h2>
          <p className="text-[#5C5C5C] dark:text-[#A1A1A1] text-base leading-[1.7] max-w-[65ch] mx-auto font-body">
            We intentionally choose tools that maximize velocity, ensure complete type safety, and eliminate latency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={idx}
                whileHover={shouldReduceMotion ? {} : { y: -3 }}
                className="p-6 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#B6FF2B] transition-all duration-200 shadow-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] flex items-center justify-center text-[#B6FF2B]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#0A0A0A] dark:text-white font-display leading-[1.3]">{tech.name}</h4>
                  <span className="text-xs font-mono font-medium text-[#5C5C5C] dark:text-[#A1A1A1] uppercase tracking-[0.12em]">{tech.role}</span>
                </div>
                <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
                  {tech.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 11. FAQ ACCORDION */}
      <motion.section {...sectionAnimation} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="text-center mb-12 space-y-3">
          <div className="text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em] flex items-center justify-center gap-2">
            <BrandTriangle size={10} color="#B6FF2B" />
            <span>Inquiries &amp; Clarity</span>
            <BrandTriangle size={10} inverted color="#B6FF2B" />
          </div>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] leading-[1.1] font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-[#5C5C5C] dark:text-[#A1A1A1] text-base leading-[1.7] max-w-[65ch] mx-auto font-body">
            Direct answers on engagements, timelines, pricing, and our engineering workflow.
          </p>
        </div>

        <div className="space-y-3">
          {(settings?.faqs || []).map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-[#E5E5E5] dark:border-[#232323] bg-white dark:bg-[#0F0F0F] overflow-hidden transition-colors shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full py-4 px-6 text-left flex items-center justify-between text-base font-semibold font-display text-[#0A0A0A] dark:text-white hover:text-[#B6FF2B] dark:hover:text-[#B6FF2B] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#B6FF2B] transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1 text-base text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body border-t border-[#E5E5E5] dark:border-[#232323] max-w-[65ch]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* 12. HIGH-CONVERTING CTA SECTION */}
      <motion.section {...sectionAnimation} className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="p-8 sm:p-14 lg:p-16 rounded-3xl bg-black border border-[#232323] text-center relative overflow-hidden shadow-2xl text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(182,255,43,0.1),transparent_70%)] pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161616] border border-[#232323] text-xs sm:text-[13px] font-mono font-medium tracking-[0.12em] uppercase text-white">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>Available for Q3/Q4 Partnerships</span>
            </div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-white font-display text-balance leading-[1.1]">
              Ready to Build Your Permanent Competitive Advantage?
            </h2>
            <p className="text-base sm:text-lg text-[#A1A1A1] leading-[1.65] max-w-[65ch] mx-auto font-body">
              Whether architecting a bespoke web application, scaling paid customer acquisition, or modernizing your headless CMS, let us engineer your vision.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                onClick={() => onNavigate('contact')}
                className="px-8 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl shadow-lg shadow-[#B6FF2B]/20 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>Schedule a Discovery Call</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                onClick={() => onNavigate('portfolio')}
                className="px-6 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-white hover:text-black hover:bg-white bg-transparent border border-white rounded-xl transition-all cursor-pointer"
              >
                Review Case Studies
              </motion.button>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
