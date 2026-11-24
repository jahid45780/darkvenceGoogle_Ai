import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Code2,
  Linkedin,
  Globe,
  LayoutGrid,
  Columns
} from 'lucide-react';
import { SiteSettings, AboutPageData } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { BrandTriangle } from '../../components/ui/BrandTriangle.tsx';

interface AboutPageProps {
  settings?: SiteSettings;
  aboutData?: AboutPageData;
  onNavigate: (page: string, slug?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, aboutData: initialAboutData, onNavigate }) => {
  const [data, setData] = useState<AboutPageData | null>(initialAboutData || null);
  const [, setLoading] = useState<boolean>(!initialAboutData);
  const [layoutMode, setLayoutMode] = useState<'bento' | 'grid'>('bento');

  useEffect(() => {
    if (initialAboutData) {
      setData(initialAboutData);
      setLoading(false);
      return;
    }

    let isMounted = true;
    api.getAbout()
      .then(res => {
        if (isMounted && res) {
          setData(res);
        }
      })
      .catch(err => {
        console.warn('[AboutPage] Using fallback settings:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialAboutData]);

  const heroHeading = data?.hero?.heading || 'Where Technical Precision Meets Conversion Design';
  const heroSubtitle = data?.hero?.subtitle || 'Digital Systems & Engineering';
  const heroDesc = data?.hero?.description || settings?.aboutStory || 'Founded on the principle that digital experiences must balance aesthetic restraint with raw computational efficiency, Darkvence works alongside technology founders, scaling e-commerce brands, and forward-thinking enterprises.';
  const heroImage = data?.hero?.image || '/src/assets/images/hero_darkvence_digital_1790497052243.jpg';
  const heroCtaText = data?.hero?.ctaText || 'Work With Our Team';
  const heroCtaUrl = data?.hero?.ctaUrl || 'contact';

  const companyName = data?.company?.name || settings?.agencyName || 'DARKVENCE';
  const companyMission = data?.company?.mission || settings?.mission || 'To eliminate digital mediocrity by merging rigorous software engineering with conversion-focused design.';
  const companyVision = data?.company?.vision || 'To architect resilient, high-speed digital foundations that give ambitious companies an enduring competitive advantage.';
  const companyYear = data?.company?.yearEstablished || '2021';

  const stats = data?.company?.stats || [
    { id: '1', value: '99.9%', label: 'Production Uptime Standard', suffix: '' },
    { id: '2', value: '< 700', label: 'Average Core Web Vitals FCP', suffix: 'ms' },
    { id: '3', value: '4.2x', label: 'Client Pipeline Growth Multiple', suffix: '' },
    { id: '4', value: '$45M+', label: 'Client Revenue Transacted', suffix: '' }
  ];

  const values = data?.company?.values || [
    { id: 'v1', title: 'Sub-Second Speed', description: 'Every millisecond of latency is lost revenue. We optimize assets, code paths, and edge caches relentlessly.' },
    { id: 'v2', title: 'Aesthetic Restraint', description: 'We ban generic templates and empty decorations in favor of deliberate typography and whitespace.' },
    { id: 'v3', title: 'Radical Transparency', description: 'Clean git commits, transparent sprints, open architectural decisions, and zero vendor lock-in.' },
    { id: 'v4', title: 'Quantified Outcomes', description: 'Code without business impact is an indulgence. Every project is measured against customer conversion.' }
  ];

  const teamMembers = (data?.teamMembers || []).filter(m => m.isActive !== false);

  const showJourney = data?.sectionsVisibility?.showJourney !== false && (data?.journey?.length ?? 0) > 0;
  const showTechStack = data?.sectionsVisibility?.showTechStack !== false && (data?.techStack?.length ?? 0) > 0;
  const showWhyChooseUs = data?.sectionsVisibility?.showWhyChooseUs !== false && (data?.whyChooseUs?.length ?? 0) > 0;

  return (
    <div className="pt-8 sm:pt-14 pb-28 sm:pb-24 px-4 sm:px-6 lg:px-10 xl:px-12 max-w-[1560px] mx-auto space-y-24">
      {/* 1. HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em]">
            <BrandTriangle size={10} color="#B6FF2B" />
            <span>About {companyName}</span>
            <span aria-hidden="true" className="text-[#A1A1A1]">·</span>
            <span>{heroSubtitle}</span>
          </div>

          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] font-display text-balance leading-[1.05]">
            {heroHeading}
          </h1>

          <p className="text-base sm:text-lg md:text-[1.1875rem] text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.65] max-w-[65ch] font-body">
            {heroDesc}
          </p>

          <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] max-w-[65ch] font-body">
            {data?.company?.description || 'We reject the traditional agency churn of disposable websites, fragile templates, and unmeasured ad vanity metrics. We operate as an embedded technical partner, building modular software architectures and performance funnels designed to withstand scale.'}
          </p>

          <div className="pt-4 flex items-center gap-4">
            <button
              onClick={() => onNavigate(heroCtaUrl)}
              className="px-6 py-3 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 flex items-center gap-2 cursor-pointer"
            >
              <span>{heroCtaText}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
            <button
              onClick={() => onNavigate('portfolio')}
              className="px-6 py-3 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-[#0A0A0A] dark:text-white border border-black dark:border-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Explore Portfolio
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-[#232323] bg-white dark:bg-[#0F0F0F] p-2 shadow-2xl">
            <img
              src={heroImage}
              alt={`${companyName} Headquarters & Studio`}
              referrerPolicy="no-referrer"
              className="w-full h-80 sm:h-96 object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/hero_darkvence_digital_1790497052243.jpg';
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. STATISTICAL PROOF STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-2xl bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323]">
        {stats.map((stat, idx) => (
          <div key={stat.id || idx} className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] dark:text-white font-display tabular-nums">
              {stat.value}
              {stat.suffix && <span className="text-xs font-bold text-[#B6FF2B] ml-1">{stat.suffix}</span>}
            </div>
            <div className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1] font-mono uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 3. MISSION & STRATEGIC PRINCIPLES */}
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em]">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>Mission</span>
              <span aria-hidden="true" className="text-[#A1A1A1]">·</span>
              <span>Est. {companyYear}</span>
            </div>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#0A0A0A] dark:text-white font-display leading-[1.2]">
              Eliminating Digital Mediocrity
            </h2>
            <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
              {companyMission}
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em]">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>Vision Statement</span>
            </div>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#0A0A0A] dark:text-white font-display leading-[1.2]">
              Enduring Competitive Advantage
            </h2>
            <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
              {companyVision}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em] flex items-center justify-center gap-2">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>Core Principles</span>
              <BrandTriangle size={10} inverted color="#B6FF2B" />
            </div>
            <h3 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[#0A0A0A] dark:text-white font-display leading-[1.2]">
              The Principles That Direct Our Code
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => (
              <div
                key={val.id || idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] space-y-3 shadow-sm hover:border-[#B6FF2B] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] flex items-center justify-center text-[#B6FF2B]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-lg font-semibold text-[#0A0A0A] dark:text-white font-display leading-[1.3]">{val.title}</h4>
                <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. TEAM LEADERSHIP PROFILES */}
      <div className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E5E5] dark:border-[#232323] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em]">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>Studio Leadership</span>
              <span aria-hidden="true" className="text-[#A1A1A1]">·</span>
              <span>Engineering &amp; Architecture</span>
            </div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white font-display tracking-[-0.02em] leading-[1.1]">
              Leadership &amp; Architecture
            </h2>
            <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] max-w-[65ch] font-body leading-[1.7]">
              Accessible senior principals, system architects, and full-stack developers directing client projects without layers of management.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-xs sm:text-[13px] text-[#5C5C5C] dark:text-[#A1A1A1] font-mono font-medium hidden md:block">
              {teamMembers.length} {teamMembers.length === 1 ? 'Principal' : 'Principals'} Active
            </div>

            {/* Layout Switcher */}
            {teamMembers.length >= 3 && (
              <div className="flex items-center gap-1 p-1 bg-[#F5F5F5] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#232323]">
                <button
                  type="button"
                  onClick={() => setLayoutMode('bento')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-display ${
                    layoutMode === 'bento'
                      ? 'bg-[#B6FF2B] text-black shadow-sm font-bold'
                      : 'text-[#5C5C5C] hover:text-[#0A0A0A] dark:text-[#A1A1A1] dark:hover:text-white'
                  }`}
                  aria-label="Spotlight Bento Layout"
                  title="Featured Spotlight Layout"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Spotlight</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('grid')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-display ${
                    layoutMode === 'grid'
                      ? 'bg-[#B6FF2B] text-black shadow-sm font-bold'
                      : 'text-[#5C5C5C] hover:text-[#0A0A0A] dark:text-[#A1A1A1] dark:hover:text-white'
                  }`}
                  aria-label="Balanced Grid Layout"
                  title="Aligned Multi-Column Grid Layout"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BENTO SPOTLIGHT PRESENTATION */}
        {layoutMode === 'bento' && teamMembers.length >= 3 ? (
          <div className="space-y-8">
            {(() => {
              const lead = teamMembers[0];
              const remaining = teamMembers.slice(1);

              return (
                <>
                  <div className="rounded-3xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] p-6 sm:p-8 lg:p-10 shadow-sm hover:border-[#B6FF2B] transition-all duration-200 group relative">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                      {/* Portrait */}
                      <div className="lg:col-span-5 relative">
                        <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] lg:max-h-[540px] w-full rounded-2xl overflow-hidden bg-black border border-[#E5E5E5] dark:border-[#232323] relative shadow-inner">
                          <img
                            src={lead.avatarUrl}
                            alt={lead.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/src/assets/images/hero_darkvence_digital_1790497052243.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                            <span className="font-mono text-[11px] bg-black/80 px-2.5 py-1 rounded-md border border-white/15">
                              01 · Studio Leadership
                            </span>
                            <span className="text-[11px] font-mono text-[#A1A1A1]">
                              {lead.company || companyName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dossier */}
                      <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#0A0A0A] dark:text-white uppercase tracking-wider">
                            <BrandTriangle size={10} color="#B6FF2B" />
                            <span>Principal Leadership</span>
                            <span aria-hidden="true" className="text-[#A1A1A1]">·</span>
                            <span>{lead.company || companyName}</span>
                          </div>

                          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A0A0A] dark:text-white font-display tracking-tight">
                            {lead.name}
                          </h3>

                          <p className="text-sm sm:text-base font-semibold text-black dark:text-[#B6FF2B]">
                            {lead.role}
                          </p>

                          <p className="text-sm sm:text-base text-[#5C5C5C] dark:text-[#A1A1A1] leading-relaxed pt-2">
                            {lead.bio}
                          </p>
                        </div>

                        {/* Interactive Credentials & Social Actions */}
                        <div className="pt-6 border-t border-[#E5E5E5] dark:border-[#232323] flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-xs text-[#5C5C5C] dark:text-[#A1A1A1] font-mono">
                            <ShieldCheck className="w-4 h-4 text-[#B6FF2B] shrink-0" />
                            <span>Direct Architectural &amp; Technical Oversight</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {lead.linkedin && (
                              <a
                                href={lead.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 text-xs font-semibold rounded-xl text-[#0A0A0A] dark:text-white hover:text-black hover:bg-[#B6FF2B] dark:hover:bg-[#B6FF2B] dark:hover:text-black bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] transition-colors flex items-center gap-1.5"
                              >
                                <Linkedin className="w-3.5 h-3.5" />
                                <span>LinkedIn Profile</span>
                              </a>
                            )}
                            {lead.portfolio && (
                              <a
                                href={lead.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 text-xs font-semibold rounded-xl text-[#0A0A0A] dark:text-white hover:text-black hover:bg-[#B6FF2B] dark:hover:bg-[#B6FF2B] dark:hover:text-black bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] transition-colors flex items-center gap-1.5"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                <span>Portfolio</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remaining Leaders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                    {remaining.map((member, idx) => (
                      <div
                        key={member.id}
                        className="flex flex-col h-full bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] rounded-2xl p-6 shadow-sm hover:border-[#B6FF2B] transition-all duration-200 group"
                      >
                        <div className="aspect-[16/10] sm:aspect-[4/3] w-full rounded-xl overflow-hidden bg-black border border-[#E5E5E5] dark:border-[#232323] relative shrink-0">
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/src/assets/images/hero_darkvence_digital_1790497052243.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                            <span className="font-mono text-[10px] bg-black/80 px-2 py-0.5 rounded border border-white/10">
                              0{idx + 2} · Leadership
                            </span>
                            <span className="text-[10px] font-mono text-[#A1A1A1]">
                              {member.company || companyName}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between pt-5 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-bold text-[#0A0A0A] dark:text-white font-display">
                                {member.name}
                              </h4>
                              <span className="text-[11px] font-mono text-[#5C5C5C] dark:text-[#A1A1A1]">
                                {member.company || companyName}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-black dark:text-[#B6FF2B]">
                              {member.role}
                            </p>
                            <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1] leading-relaxed pt-1">
                              {member.bio}
                            </p>
                          </div>

                          <div className="mt-auto pt-4 border-t border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between">
                            <span className="text-[11px] font-mono text-[#5C5C5C] dark:text-[#A1A1A1]">
                              Direct Architect
                            </span>
                            <div className="flex items-center gap-3">
                              {member.linkedin && (
                                <a
                                  href={member.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#5C5C5C] hover:text-black dark:text-[#A1A1A1] dark:hover:text-[#B6FF2B] transition-colors flex items-center gap-1"
                                  title={`View ${member.name} on LinkedIn`}
                                >
                                  <Linkedin className="w-3.5 h-3.5" />
                                  <span>LinkedIn</span>
                                </a>
                              )}
                              {member.portfolio && (
                                <a
                                  href={member.portfolio}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#5C5C5C] hover:text-black dark:text-[#A1A1A1] dark:hover:text-[#B6FF2B] transition-colors flex items-center gap-1"
                                  title={`View ${member.name} portfolio`}
                                >
                                  <Globe className="w-3.5 h-3.5" />
                                  <span>Portfolio</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {teamMembers.map((member, idx) => (
              <div
                key={member.id}
                className="flex flex-col h-full bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] rounded-2xl p-6 shadow-sm hover:border-[#B6FF2B] transition-all duration-200 group"
              >
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-black border border-[#E5E5E5] dark:border-[#232323] relative shrink-0">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/hero_darkvence_digital_1790497052243.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="font-mono text-[10px] bg-black/80 px-2 py-0.5 rounded border border-white/10">
                      0{idx + 1} · {idx === 0 ? 'Lead' : 'Architecture'}
                    </span>
                    <span className="text-[10px] font-mono text-[#A1A1A1]">
                      {member.company || companyName}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between pt-5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white font-display">
                        {member.name}
                      </h3>
                      <span className="text-[11px] font-mono text-[#5C5C5C] dark:text-[#A1A1A1]">
                        {member.company || companyName}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-black dark:text-[#B6FF2B]">
                      {member.role}
                    </p>
                    <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1] leading-relaxed pt-1 line-clamp-4 min-h-[4rem]">
                      {member.bio}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#5C5C5C] dark:text-[#A1A1A1]">
                      {member.company || companyName}
                    </span>
                    <div className="flex items-center gap-3">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#5C5C5C] hover:text-black dark:text-[#A1A1A1] dark:hover:text-[#B6FF2B] transition-colors flex items-center gap-1"
                          title={`View ${member.name} on LinkedIn`}
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {member.portfolio && (
                        <a
                          href={member.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#5C5C5C] hover:text-black dark:text-[#A1A1A1] dark:hover:text-[#B6FF2B] transition-colors flex items-center gap-1"
                          title={`View ${member.name} portfolio`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Portfolio</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. COMPANY JOURNEY / TIMELINE */}
      {showJourney && (
        <div className="space-y-10">
          <div className="border-b border-[#E5E5E5] dark:border-[#232323] pb-6">
            <div className="text-xs font-semibold text-[#0A0A0A] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>Studio Evolution</span>
            </div>
            <h2 className="text-3xl font-bold text-[#0A0A0A] dark:text-white font-display">
              Our Journey &amp; Milestones
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data!.journey.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] space-y-3 relative shadow-sm hover:border-[#B6FF2B] transition-colors"
              >
                <div className="text-xl font-mono font-bold text-[#B6FF2B] tabular-nums">
                  {item.year}
                </div>
                <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white font-display">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TECHNOLOGY STACK */}
      {showTechStack && (
        <div className="space-y-8">
          <div className="border-b border-[#E5E5E5] dark:border-[#232323] pb-6">
            <div className="text-xs font-semibold text-[#0A0A0A] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>Infrastructure</span>
            </div>
            <h2 className="text-3xl font-bold text-[#0A0A0A] dark:text-white font-display">
              Production Tech Stack &amp; Tooling
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data!.techStack.map((cat, idx) => (
              <div
                key={cat.id || idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] space-y-4 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#B6FF2B]" />
                  <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white font-display">{cat.category}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 text-xs font-mono rounded-lg bg-[#F5F5F5] dark:bg-[#161616] text-[#0A0A0A] dark:text-[#A1A1A1] border border-[#E5E5E5] dark:border-[#232323]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. WHY CHOOSE US */}
      {showWhyChooseUs && (
        <div className="space-y-8">
          <div className="border-b border-[#E5E5E5] dark:border-[#232323] pb-6">
            <div className="text-xs font-semibold text-[#0A0A0A] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BrandTriangle size={10} color="#B6FF2B" />
              <span>Engineering Value</span>
            </div>
            <h2 className="text-3xl font-bold text-[#0A0A0A] dark:text-white font-display">
              Why Forward-Thinking Teams Choose {companyName}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data!.whyChooseUs.map((wcu, idx) => (
              <div
                key={wcu.id || idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] space-y-3 shadow-sm hover:border-[#B6FF2B] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white font-display">{wcu.title}</h3>
                  {wcu.metric && (
                    <span className="text-[11px] font-mono text-black bg-[#B6FF2B] px-2 py-0.5 rounded font-bold">
                      {wcu.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1] leading-relaxed">
                  {wcu.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. STRATEGIC BOTTOM CTA */}
      <div className="p-8 sm:p-12 rounded-3xl bg-black text-white border border-[#232323] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white font-display leading-[1.2]">
            Have a Complex Engineering or Growth Challenge?
          </h3>
          <p className="text-base text-[#A1A1A1] font-body leading-[1.7] max-w-[65ch]">
            Our principal software architects and growth strategists are available for initial technical discovery sessions.
          </p>
        </div>
        <button
          onClick={() => onNavigate('contact')}
          className="px-6 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 whitespace-nowrap cursor-pointer"
        >
          Book Technical Discovery
        </button>
      </div>
    </div>
  );
};
