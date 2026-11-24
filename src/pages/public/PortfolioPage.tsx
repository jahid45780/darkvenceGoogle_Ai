import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { ProjectItem } from '../../types/index.ts';
import { BrandTriangle } from '../../components/ui/BrandTriangle.tsx';

interface PortfolioPageProps {
  projects: ProjectItem[];
  selectedSlug?: string;
  onNavigate: (page: string, slug?: string) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  projects,
  selectedSlug,
  onNavigate
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    selectedSlug ? projects.find(p => p.slug === selectedSlug) || null : null
  );

  const categories = [
    'All',
    'Website Development',
    'Mobile Application',
    'CMS Development',
    'Custom Software'
  ];

  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="pt-8 sm:pt-14 pb-28 sm:pb-24 px-4 sm:px-6 lg:px-10 xl:px-12 max-w-[1560px] mx-auto space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em]">
          <BrandTriangle size={10} color="#B6FF2B" />
          <span>Selected Case Studies</span>
          <span aria-hidden="true" className="text-[#A1A1A1]">·</span>
          <span>Sample Production Work</span>
        </div>
        <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] font-display text-balance leading-[1.05]">
          Engineering Artifacts &amp; Impact
        </h1>
        <p className="text-base sm:text-lg md:text-[1.1875rem] text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.65] max-w-[65ch] font-body">
          Explore how we solve mission-critical architectural challenges, eliminate latency, and drive verifiable customer acquisition.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] rounded-xl overflow-x-auto max-w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs sm:text-[13px] font-mono font-medium tracking-[0.08em] rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#B6FF2B] text-black font-bold shadow-sm'
                : 'text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="group rounded-3xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#B6FF2B] transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="aspect-[16/10] w-full overflow-hidden relative bg-black border-b border-[#E5E5E5] dark:border-[#232323]">
              <img
                src={project.images[0]}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="text-xs font-mono font-medium uppercase tracking-[0.12em] text-black bg-[#B6FF2B] px-3 py-1 rounded-md shadow-sm">
                  {project.category}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-[13px] text-[#5C5C5C] dark:text-[#A1A1A1] font-mono font-medium">
                  <span>{project.client}</span>
                  <span className="text-xs text-black dark:text-[#B6FF2B] font-mono font-medium uppercase tracking-[0.12em]">Case Study</span>
                </div>

                <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold text-[#0A0A0A] dark:text-white group-hover:text-[#B6FF2B] transition-colors font-display leading-[1.25]">
                  {project.title}
                </h3>

                <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] line-clamp-2 leading-[1.7] font-body">
                  {project.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#232323] space-y-3">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  {project.results.map((res, rIdx) => (
                    <div key={rIdx}>
                      <span className="text-base sm:text-lg font-bold text-[#0A0A0A] dark:text-white font-mono-tabular font-display">
                        {res.metric}
                      </span>
                      <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1] truncate font-mono">
                        {res.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-[#0A0A0A] dark:text-[#B6FF2B] group-hover:underline">
                  <span>Read Architecture Breakdown</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative space-y-8">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 p-2 text-[#5C5C5C] hover:text-black dark:text-[#A1A1A1] dark:hover:text-white rounded-xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="space-y-3 pr-10">
              <div className="flex items-center gap-2 text-xs sm:text-[13px] text-[#5C5C5C] dark:text-[#A1A1A1] font-mono">
                <BrandTriangle size={10} color="#B6FF2B" />
                <span className="font-semibold text-black dark:text-[#B6FF2B] uppercase tracking-[0.12em]">{selectedProject.category}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedProject.client}</span>
              </div>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white font-display leading-[1.1]">
                {selectedProject.title}
              </h2>
              <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] max-w-[65ch] font-body">
                {selectedProject.description}
              </p>
            </div>

            {/* Gallery Image */}
            <div className="rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-[#232323]">
              <img
                src={selectedProject.images[0]}
                alt={selectedProject.title}
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover object-center"
              />
            </div>

            {/* Challenge & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#E5E5E5] dark:border-[#232323]">
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-[0.12em] font-medium font-mono text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                  <BrandTriangle size={8} color="#B6FF2B" />
                  <span>THE ARCHITECTURAL CHALLENGE</span>
                </h4>
                <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
                  {selectedProject.challenge}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-[0.12em] font-medium font-mono text-black dark:text-[#B6FF2B] flex items-center gap-1.5">
                  <BrandTriangle size={8} color="#B6FF2B" />
                  <span>THE DARKVENCE SOLUTION</span>
                </h4>
                <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] font-body">
                  {selectedProject.solution}
                </p>
              </div>
            </div>

            {/* Quantitative Outcomes */}
            <div className="space-y-3 pt-4 border-t border-[#E5E5E5] dark:border-[#232323]">
              <h4 className="text-xs uppercase tracking-[0.12em] font-medium font-mono text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                <BrandTriangle size={8} color="#B6FF2B" />
                <span>QUANTIFIED OUTCOMES</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {selectedProject.results.map((res, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323]">
                    <span className="text-2xl font-bold text-[#0A0A0A] dark:text-white font-mono-tabular font-display">
                      {res.metric}
                    </span>
                    <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1] mt-1 font-mono">{res.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-3 pt-4 border-t border-[#E5E5E5] dark:border-[#232323]">
              <h4 className="text-xs uppercase tracking-[0.12em] font-medium font-mono text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                <BrandTriangle size={8} color="#B6FF2B" />
                <span>ARCHITECTURAL STACK</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono font-medium text-[#0A0A0A] dark:text-[#A1A1A1] bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] px-3 py-1.5 rounded-lg"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA action */}
            <div className="pt-6 border-t border-[#E5E5E5] dark:border-[#232323] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[#5C5C5C] dark:text-[#A1A1A1] uppercase tracking-[0.08em]">INTERESTED IN SIMILAR ARCHITECTURAL RESULTS?</p>
                <p className="text-base font-semibold font-display text-[#0A0A0A] dark:text-white">Let us evaluate your current system.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  onNavigate('contact');
                }}
                className="w-full sm:w-auto px-6 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-colors shadow-lg shadow-[#B6FF2B]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Initiate Similar Project</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
