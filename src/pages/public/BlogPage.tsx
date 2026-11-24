import React, { useState } from 'react';
import { Search, ArrowRight, X, Clock, Calendar, Tag } from 'lucide-react';
import { BlogPostItem } from '../../types/index.ts';
import { BrandTriangle } from '../../components/ui/BrandTriangle.tsx';

interface BlogPageProps {
  posts: BlogPostItem[];
  selectedSlug?: string;
  onNavigate: (page: string, slug?: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  posts,
  selectedSlug
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<BlogPostItem | null>(
    selectedSlug ? posts.find(p => p.slug === selectedSlug) || null : null
  );

  const categories = ['All', 'Engineering', 'Growth & Ads', 'CMS & Software'];

  const filteredPosts = posts.filter(post => {
    const matchesCat = activeCategory === 'All' || post.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="pt-8 sm:pt-14 pb-28 sm:pb-24 px-4 sm:px-6 lg:px-10 xl:px-12 max-w-[1560px] mx-auto space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em]">
          <BrandTriangle size={10} color="#B6FF2B" />
          <span>Darkvence Insights</span>
          <span aria-hidden="true" className="text-[#A1A1A1]">·</span>
          <span>Technical &amp; Growth Dispatches</span>
        </div>
        <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] font-display text-balance leading-[1.05]">
          Architectural Perspectives &amp; Market Research
        </h1>
        <p className="text-base sm:text-lg md:text-[1.1875rem] text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.65] max-w-[65ch] font-body">
          Deep-dive analyses on frontend performance, server-side advertising attribution, and content infrastructure from our practicing engineers.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E5E5E5] dark:border-[#232323] pb-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] rounded-xl overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs sm:text-[13px] font-mono font-medium tracking-[0.08em] rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#B6FF2B] text-black font-bold shadow-sm'
                  : 'text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#5C5C5C] dark:text-[#A1A1A1] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles &amp; topics..."
            className="w-full bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] rounded-xl pl-9 pr-4 py-2 text-sm font-body text-[#0A0A0A] dark:text-white placeholder-[#5C5C5C] dark:placeholder-[#A1A1A1] focus:outline-none focus:border-[#B6FF2B] transition-colors"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group rounded-3xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#B6FF2B] transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-black border-b border-[#E5E5E5] dark:border-[#232323]">
              <img
                src={post.coverImage}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-[13px] text-[#5C5C5C] dark:text-[#A1A1A1] font-mono font-medium">
                  <span className="font-semibold text-black dark:text-[#B6FF2B] uppercase tracking-[0.12em]">{post.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime}</span>
                </div>

                <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold text-[#0A0A0A] dark:text-white group-hover:text-[#B6FF2B] transition-colors font-display line-clamp-2 leading-[1.25]">
                  {post.title}
                </h3>

                <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] line-clamp-3 leading-[1.7] font-body">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between text-xs text-[#5C5C5C] dark:text-[#A1A1A1]">
                <span className="font-body">By {post.author.name}</span>
                <span className="text-black dark:text-[#B6FF2B] font-semibold text-[0.95rem] tracking-[0.01em] font-display group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Read Article
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative space-y-8">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 p-2 text-[#5C5C5C] hover:text-black dark:text-[#A1A1A1] dark:hover:text-white rounded-xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Metadata */}
            <div className="space-y-3 pr-10">
              <div className="flex items-center gap-2 text-xs sm:text-[13px] text-[#5C5C5C] dark:text-[#A1A1A1] font-mono">
                <BrandTriangle size={10} color="#B6FF2B" />
                <span className="font-semibold text-black dark:text-[#B6FF2B] uppercase tracking-[0.12em]">{selectedPost.category}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedPost.readTime}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedPost.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white font-display leading-[1.1]">
                {selectedPost.title}
              </h2>

              <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] italic border-l-2 border-[#B6FF2B] pl-4 py-1 leading-[1.6] font-body max-w-[65ch]">
                {selectedPost.excerpt}
              </p>
            </div>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-[#232323]">
              <img
                src={selectedPost.coverImage}
                alt={selectedPost.title}
                referrerPolicy="no-referrer"
                className="w-full h-64 sm:h-80 object-cover object-center"
              />
            </div>

            {/* Content Body */}
            <div className="max-w-none text-base text-[#0A0A0A] dark:text-[#FFFFFF] leading-[1.7] space-y-4 font-body">
              {selectedPost.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold text-[#0A0A0A] dark:text-white pt-2 font-display leading-[1.25]">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                return <p key={idx} className="max-w-[65ch]">{paragraph}</p>;
              })}
            </div>

            {/* Tags & Author */}
            <div className="pt-6 border-t border-[#E5E5E5] dark:border-[#232323] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#5C5C5C] dark:text-[#A1A1A1] mr-1" />
                {selectedPost.tags.map((t, idx) => (
                  <span key={idx} className="text-xs font-mono font-medium text-[#0A0A0A] dark:text-[#A1A1A1] bg-[#F5F5F5] dark:bg-[#161616] px-2.5 py-1 rounded-md border border-[#E5E5E5] dark:border-[#232323]">
                    {t}
                  </span>
                ))}
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white font-display">{selectedPost.author.name}</p>
                <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1] font-mono">{selectedPost.author.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
