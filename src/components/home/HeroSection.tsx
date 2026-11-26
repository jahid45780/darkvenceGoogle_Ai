import React, { useState, useCallback, useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { SiteSettings } from '../../types/index.ts';
import { BrandTriangle } from '../ui/BrandTriangle.tsx';
import { Hero3DWorkspace } from './Hero3DWorkspace.tsx';

interface HeroSectionProps {
  settings?: SiteSettings;
  onNavigate: (page: string, slug?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const parallaxRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    setMousePos({
      x: localX,
      y: localY,
    });
    if (rect.width > 0 && rect.height > 0) {
      parallaxRef.current = {
        x: (localX / rect.width) * 2 - 1,
        y: (localY / rect.height) * 2 - 1
      };
    }
  }, []);

  const line1Words = ['Engineering', 'Digital'];
  const line2Words = ['Experiences', 'That'];
  const line3Words = ['Move', 'Businesses', 'Forward.'];

  const wordVariant = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30, rotateX: 25 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.65,
        delay: shouldReduceMotion ? 0 : 0.15 + custom * 0.06,
        ease: 'easeOut' as const
      }
    })
  };

  const fadeInUp = (delay: number) => ({
    initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.7,
      delay: shouldReduceMotion ? 0 : delay,
      ease: 'easeOut' as const
    }
  });

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        parallaxRef.current = { x: 0, y: 0 };
      }}
      className="relative min-h-[680px] lg:min-h-[86vh] lg:max-h-[1000px] flex items-center justify-between overflow-hidden bg-white dark:bg-[#000000] transition-colors duration-200"
    >
      {/* ========================================================================= */}
      {/* 1. HERO BACKGROUND IMAGE WITH DARK/BLACK OVERLAY & LIME GLOWS             */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/images/darkvence-hero.webp')"
        }}
      >
        <img
          src="/images/darkvence-hero.webp"
          alt="Darkvence Digital Agency Creative Architecture"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none opacity-20 dark:opacity-80 transition-opacity duration-300"
          loading="eager"
        />

        {/* Dynamic theme gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-white/90 via-50% to-white/40 dark:from-[#000000]/98 dark:via-[#000000]/90 dark:to-[#000000]/50 transition-colors duration-200" />

        {/* Subtle geometric grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Floating Animated Ambient Lime Orbs */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              animate={{
                y: [-20, 20, -20],
                x: [-15, 15, -15],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#B6FF2B]/12 blur-[120px] pointer-events-none"
            />
            <motion.div
              animate={{
                y: [15, -20, 15],
                x: [10, -15, 10],
                scale: [1.05, 0.95, 1.05],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2
              }}
              className="absolute bottom-1/3 right-1/6 w-80 h-80 rounded-full bg-[#B6FF2B]/8 blur-[100px] pointer-events-none"
            />
          </>
        )}

        {/* Interactive mouse-following cursor light aura with Lime (Desktop only) */}
        {!shouldReduceMotion && (
          <div
            className={`hidden lg:block absolute inset-0 pointer-events-none transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(182, 255, 43, 0.12), transparent 70%)`
            }}
          />
        )}

        {/* Subtle cinematic architectural rings behind 3D showcase (Desktop) */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-1/2 right-[8%] -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-black/[0.04] dark:border-[#B6FF2B]/[0.08] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-1/2 right-[12%] -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-dashed border-black/[0.04] dark:border-white/[0.05] pointer-events-none"
        />

        {/* Floating Decorative Rounded Triangles echoing brand logo */}
        <div className="absolute top-24 right-16 hidden xl:block opacity-25 pointer-events-none">
          <BrandTriangle size={48} color="#B6FF2B" stroke />
        </div>
        <div className="absolute bottom-32 right-1/3 hidden lg:block opacity-20 pointer-events-none">
          <BrandTriangle size={32} inverted color="#B6FF2B" />
        </div>

        {/* Bottom gradient blending seamlessly */}
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#000000] dark:via-[#000000]/80 dark:to-transparent transition-colors duration-200" />
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO CONTENT & TYPOGRAPHY + RIGHT-SIDE 3D WORKSPACE                    */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-center">
          <div className="lg:col-span-6 max-w-2xl space-y-6 sm:space-y-8">
          {/* Eyebrow Label with Brand Triangle */}
          <motion.div
            {...fadeInUp(0.1)}
            className="inline-flex max-w-full items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] backdrop-blur-md shadow-sm"
          >
            <BrandTriangle size={12} color="#B6FF2B" />
            <span className="text-xs sm:text-[13px] font-mono font-medium uppercase tracking-[0.12em] text-[#0A0A0A] dark:text-[#FFFFFF] truncate">
              FULL-STACK DIGITAL AGENCY &amp; SOFTWARE ENGINEERING
            </span>
          </motion.div>

          {/* Main Headline with Word-by-Word Animated Entrance */}
          <div className="space-y-1">
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] leading-[1.05] font-display break-words">
              {/* Line 1 */}
              <span className="block overflow-hidden">
                {line1Words.map((word, idx) => (
                  <motion.span
                    key={word}
                    custom={idx}
                    initial="hidden"
                    animate="visible"
                    variants={wordVariant}
                    className="inline-block mr-2 sm:mr-3.5 text-[#0A0A0A] dark:text-white"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>

              {/* Line 2: Highlighted headline words: solid lime in dark theme. In light theme use lime highlight background behind black text (never lime text on white). Remove stray box. */}
              <span className="block overflow-hidden">
                {line2Words.map((word, idx) => (
                  <motion.span
                    key={word}
                    custom={idx + 2}
                    initial="hidden"
                    animate="visible"
                    variants={wordVariant}
                    className="inline-block mr-2 sm:mr-3.5 bg-[#B6FF2B] text-black px-2 sm:px-3 py-0.5 rounded-xl dark:bg-transparent dark:text-[#B6FF2B] dark:p-0 dark:rounded-none"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>

              {/* Line 3 */}
              <span className="block overflow-hidden">
                {line3Words.map((word, idx) => (
                  <motion.span
                    key={word}
                    custom={idx + 4}
                    initial="hidden"
                    animate="visible"
                    variants={wordVariant}
                    className="inline-block mr-2 sm:mr-3 text-[#0A0A0A] dark:text-white"
                  >
                    {word.endsWith('.') ? (
                      <>
                        {word.slice(0, -1)}
                        <span className="text-[#B6FF2B]">.</span>
                      </>
                    ) : (
                      word
                    )}
                  </motion.span>
                ))}
              </span>
            </h1>
          </div>

          {/* Supporting Description */}
          <motion.p
            {...fadeInUp(0.4)}
            className="text-base sm:text-lg md:text-[1.1875rem] text-[#5C5C5C] dark:text-[#A1A1A1] max-w-[65ch] font-normal leading-[1.65] font-body text-pretty"
          >
            {settings?.heroSubtitle ||
              'Darkvence is a premier digital agency building bespoke websites, mobile applications, headless CMS platforms, and precision performance advertising engines for ambitious brands.'}
          </motion.p>

          {/* Dual CTA Buttons: Primary Lime + Black text, Secondary outline (white border in dark, black in light) */}
          <motion.div
            {...fadeInUp(0.55)}
            className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
          >
            {/* Primary CTA: "Start a Project" */}
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              onClick={() => onNavigate('contact')}
              className="relative group px-7 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl cursor-pointer select-none transition-all duration-200 shadow-xl shadow-[#B6FF2B]/20 hover:shadow-[#B6FF2B]/35 flex items-center justify-center gap-2.5"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Secondary CTA: "Explore Our Services" (Outline) */}
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.015 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              onClick={() => onNavigate('services')}
              className="px-6 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-black dark:text-white bg-transparent hover:bg-black/5 dark:hover:bg-white/10 border border-black dark:border-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Explore Our Services</span>
              <ArrowUpRight className="w-4 h-4 text-black dark:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Minimal Trust Indicator with Brand Triangle Separators */}
          <motion.div
            {...fadeInUp(0.68)}
            className="pt-6 sm:pt-8 border-t border-[#E5E5E5] dark:border-[#232323] flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs sm:text-[13px] font-mono font-medium uppercase tracking-[0.12em] text-[#5C5C5C] dark:text-[#A1A1A1]"
          >
            <span className="text-[#0A0A0A] dark:text-white font-medium">Strategy</span>
            <BrandTriangle size={8} color="#B6FF2B" />
            <span className="text-[#0A0A0A] dark:text-white font-medium">Design</span>
            <BrandTriangle size={8} inverted color="#B6FF2B" />
            <span className="text-[#0A0A0A] dark:text-white font-medium">Development</span>
            <BrandTriangle size={8} color="#B6FF2B" />
            <span className="text-[#0A0A0A] dark:text-white font-medium">Growth</span>
          </motion.div>
          </div>

          {/* Right Column: Interactive 3D Software & Digital Marketing Workspace */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' as const }}
            className="lg:col-span-6 w-full min-w-0"
          >
            <Hero3DWorkspace
              parallaxRef={parallaxRef}
              shouldReduceMotion={Boolean(shouldReduceMotion)}
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator aligned inside main container */}
      <div className="hidden md:block absolute bottom-8 inset-x-0 z-10 pointer-events-none select-none">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="inline-flex items-center gap-2.5 text-xs font-mono font-medium tracking-[0.12em] text-[#5C5C5C] dark:text-[#A1A1A1]"
          >
            <div className="w-4 h-7 rounded-full border border-[#E5E5E5] dark:border-[#232323] flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="w-1 h-1.5 rounded-full bg-[#B6FF2B]"
              />
            </div>
            <span className="tracking-[0.12em] uppercase">Scroll to explore</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
