import React, { useState, useEffect } from 'react';
import {
  Globe,
  Smartphone,
  LayoutGrid,
  TrendingUp,
  Share2,
  Cpu,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  X,
  Sparkles,
  Layers,
  Activity,
  FileCode
} from 'lucide-react';
import { ServiceItem } from '../../types/index.ts';
import { BrandTriangle } from '../../components/ui/BrandTriangle.tsx';

interface ServicesPageProps {
  services: ServiceItem[];
  selectedSlug?: string;
  onNavigate: (page: string, slug?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  selectedSlug,
  onNavigate
}) => {
  const [activeServiceSlug, setActiveServiceSlug] = useState<string | null>(selectedSlug || null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedSlug) {
      setActiveServiceSlug(selectedSlug);
    }
  }, [selectedSlug]);

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

  const publishedServices = services.filter(s => s.status === 'published');
  const activeService = publishedServices.find(s => s.slug === activeServiceSlug) || services.find(s => s.slug === activeServiceSlug);

  return (
    <div className="pt-8 sm:pt-14 pb-28 sm:pb-24 px-4 sm:px-6 lg:px-10 xl:px-12 max-w-[1560px] mx-auto space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em]">
          <BrandTriangle size={10} color="#B6FF2B" />
          <span>Darkvence Capabilities</span>
          <span aria-hidden="true" className="text-[#A1A1A1]">·</span>
          <span>End-to-End Execution</span>
        </div>
        <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] font-display text-balance leading-[1.05]">
          Technical Expertise &amp; Performance Advertising
        </h1>
        <p className="text-base sm:text-lg md:text-[1.1875rem] text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.65] max-w-[65ch] font-body">
          From modern web architectures to high-converting paid ad funnels, we provide specialized digital solutions that deliver measurable business outcomes.
        </p>
      </div>

      {/* Services Grid or Empty State */}
      {publishedServices.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] space-y-4 max-w-md mx-auto shadow-sm">
          <FileCode className="w-10 h-10 text-[#5C5C5C] dark:text-[#A1A1A1] mx-auto" />
          <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white font-display">No Published Services Currently Listed</h3>
          <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] font-body">
            Publish your agency capabilities in the Admin CMS to display them live on the public site.
          </p>
          <button
            onClick={() => onNavigate('admin')}
            className="px-5 py-2.5 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl cursor-pointer"
          >
            Open Admin CMS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {publishedServices.map((service, index) => (
            <div
              key={service.id}
              className="p-8 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#B6FF2B] transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-xl space-y-6 group cursor-pointer"
              onClick={() => setActiveServiceSlug(service.slug)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] group-hover:border-[#B6FF2B] transition-colors">
                    {getServiceIcon(service.icon)}
                  </div>
                  <span className="text-xs sm:text-[13px] font-mono font-medium text-[#5C5C5C] dark:text-[#A1A1A1]">
                    0{index + 1}.
                  </span>
                </div>

                <h2 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold text-[#0A0A0A] dark:text-white group-hover:text-[#B6FF2B] transition-colors font-display leading-[1.25]">
                  {service.title}
                </h2>

                <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] line-clamp-3 font-body">
                  {service.shortDescription}
                </p>

                <div className="pt-3 border-t border-[#E5E5E5] dark:border-[#232323] space-y-2">
                  <p className="text-xs uppercase tracking-[0.12em] font-medium font-mono text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                    <BrandTriangle size={8} color="#B6FF2B" />
                    <span>KEY CAPABILITIES</span>
                  </p>
                  <ul className="space-y-1.5">
                    {service.features.slice(0, 3).map((feat, fIdx) => (
                      <li key={fIdx} className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] flex items-start gap-2 font-body">
                        <CheckCircle2 className="w-4 h-4 text-[#B6FF2B] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveServiceSlug(service.slug);
                  }}
                  className="text-[0.95rem] font-semibold tracking-[0.01em] font-display text-[#0A0A0A] dark:text-[#B6FF2B] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Scope &amp; Process</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('contact', service.slug);
                  }}
                  className="p-2 text-[#5C5C5C] hover:text-black dark:text-[#A1A1A1] dark:hover:text-[#B6FF2B] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Inquire about this service"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Detail Modal */}
      {activeService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative space-y-8">
            {/* Close button */}
            <button
              onClick={() => setActiveServiceSlug(null)}
              className="absolute top-6 right-6 p-2 text-[#5C5C5C] hover:text-black dark:text-[#A1A1A1] dark:hover:text-white rounded-xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-3 pr-10">
              <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em]">
                <BrandTriangle size={10} color="#B6FF2B" />
                <span>Detailed Service Specification</span>
                <span aria-hidden="true" className="text-[#A1A1A1]">·</span>
                <span className="font-mono text-[#5C5C5C] dark:text-[#A1A1A1]">/{activeService.slug}</span>
              </div>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white font-display leading-[1.1]">
                {activeService.title}
              </h2>
              <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] max-w-[65ch] font-body">
                {activeService.fullDescription}
              </p>
            </div>

            {/* Cover image banner */}
            {activeService.coverImage && (
              <div className="rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-[#232323] max-h-64 w-full">
                <img
                  src={activeService.coverImage}
                  alt={activeService.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Deliverables & Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#E5E5E5] dark:border-[#232323]">
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-[0.12em] font-medium font-mono text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                  <BrandTriangle size={8} color="#B6FF2B" />
                  <span>STANDARD DELIVERABLES</span>
                </h4>
                <ul className="space-y-2">
                  {activeService.deliverables?.map((item, idx) => (
                    <li key={idx} className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] flex items-start gap-2.5 font-body">
                      <CheckCircle2 className="w-4 h-4 text-[#B6FF2B] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-[0.12em] font-medium font-mono text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                  <BrandTriangle size={8} color="#B6FF2B" />
                  <span>CORE ARCHITECTURE FEATURES</span>
                </h4>
                <ul className="space-y-2">
                  {activeService.features?.map((item, idx) => (
                    <li key={idx} className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] flex items-start gap-2.5 font-body">
                      <CheckCircle2 className="w-4 h-4 text-[#B6FF2B] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Process */}
            {activeService.process && activeService.process.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#E5E5E5] dark:border-[#232323]">
                <h4 className="text-xs uppercase tracking-[0.12em] font-medium font-mono text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                  <BrandTriangle size={8} color="#B6FF2B" />
                  <span>EXECUTION PROCESS</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {activeService.process.map((step, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] space-y-1.5">
                      <span className="text-xs font-mono text-[#B6FF2B] font-bold">{step.step}</span>
                      <h5 className="text-sm font-semibold text-[#0A0A0A] dark:text-white font-display">{step.title}</h5>
                      <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.6] font-body">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {activeService.faqs && activeService.faqs.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#E5E5E5] dark:border-[#232323]">
                <h4 className="text-xs uppercase tracking-[0.12em] font-medium font-mono text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                  <BrandTriangle size={8} color="#B6FF2B" />
                  <span>FREQUENTLY ASKED QUESTIONS</span>
                </h4>
                <div className="space-y-2">
                  {activeService.faqs.map((faq, idx) => (
                    <div key={idx} className="rounded-xl border border-[#E5E5E5] dark:border-[#232323] bg-[#F5F5F5] dark:bg-[#161616] overflow-hidden">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-sm sm:text-base font-semibold font-display text-[#0A0A0A] dark:text-white hover:text-[#B6FF2B] transition-colors cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`w-4 h-4 text-[#B6FF2B] transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaqIndex === idx && (
                        <div className="px-4 pb-4 text-sm text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body border-t border-[#E5E5E5] dark:border-[#232323] max-w-[65ch]">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA action: Primary Lime Button */}
            <div className="pt-6 border-t border-[#E5E5E5] dark:border-[#232323] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[#5C5C5C] dark:text-[#A1A1A1] uppercase tracking-[0.08em]">READY TO DISCUSS THIS TECHNICAL SCOPE?</p>
                <p className="text-base font-semibold font-display text-[#0A0A0A] dark:text-white">Engage Darkvence for your next release.</p>
              </div>
              <button
                onClick={() => {
                  const targetSlug = activeService.slug;
                  setActiveServiceSlug(null);
                  onNavigate('contact', targetSlug);
                }}
                className="w-full sm:w-auto px-6 py-3 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-colors shadow-lg shadow-[#B6FF2B]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request Scope Proposal</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
