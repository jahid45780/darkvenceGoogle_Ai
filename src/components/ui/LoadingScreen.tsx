import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo.tsx';
import { BrandTriangle } from './BrandTriangle.tsx';

interface LoadingScreenProps {
  isLoading: boolean;
  onFinish?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, onFinish }) => {
  const [progress, setProgress] = useState(15);
  const [visible, setVisible] = useState(true);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(100);
      return;
    }

    // Smooth progress simulation
    const timer1 = setTimeout(() => setProgress(45), 200);
    const timer2 = setTimeout(() => setProgress(78), 500);
    const timer3 = setTimeout(() => setProgress(96), 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      const exitTimer = setTimeout(
        () => {
          setVisible(false);
          if (onFinish) onFinish();
        },
        prefersReducedMotion ? 50 : 350
      );
      return () => clearTimeout(exitTimer);
    }
  }, [isLoading, onFinish, prefersReducedMotion]);

  // Failsafe timeout
  useEffect(() => {
    const failsafe = setTimeout(
      () => {
        setProgress(100);
        setVisible(false);
        if (onFinish) onFinish();
      },
      prefersReducedMotion ? 100 : 1800
    );

    return () => clearTimeout(failsafe);
  }, [onFinish, prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="darkvence-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            filter: 'blur(8px)',
            transition: { duration: 0.5, ease: 'easeOut' as const }
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#000000] select-none pointer-events-auto"
          aria-live="polite"
          aria-busy={visible}
        >
          {/* Subtle Lime Aura */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#B6FF2B]/10 rounded-full blur-[140px]" />
          </div>

          {/* Central Logo & Progress Presentation */}
          <div className="relative z-10 flex flex-col items-center px-6 max-w-sm w-full text-center space-y-7">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' as const }}
              className="relative p-2"
            >
              <BrandLogo size="lg" />
            </motion.div>

            {/* Subtitle with triangle motif */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' as const }}
              className="space-y-2"
            >
              <div className="flex items-center justify-center gap-2 text-xs sm:text-[13px] font-medium uppercase tracking-[0.12em] text-[#B6FF2B] font-mono">
                <BrandTriangle size={12} color="#B6FF2B" />
                <span>Engineering Digital Dominance</span>
                <BrandTriangle size={12} inverted color="#B6FF2B" />
              </div>
              <p className="text-xs sm:text-[13px] text-[#A1A1A1] font-mono tabular-nums">
                Initializing · {progress}%
              </p>
            </motion.div>

            {/* Strict Lime Progress Bar */}
            <div className="w-52 sm:w-64 h-[3px] bg-[#232323] rounded-full overflow-hidden p-0 relative shadow-inner">
              <motion.div
                className="h-full bg-[#B6FF2B] rounded-full shadow-[0_0_12px_rgba(182,255,43,0.8)]"
                initial={{ width: '10%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
