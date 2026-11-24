import React, { useEffect, useState, useRef } from 'react';

interface ScrollProgressBarProps {
  className?: string;
  triggerKey?: string | number;
}

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({ className = '', triggerKey }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const activeModalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      // Check if an inner scrollable modal is currently active
      if (
        activeModalRef.current &&
        document.body.contains(activeModalRef.current) &&
        activeModalRef.current.scrollHeight > activeModalRef.current.clientHeight + 40
      ) {
        const el = activeModalRef.current;
        const maxScroll = el.scrollHeight - el.clientHeight;
        const currentProgress = Math.min(Math.max(el.scrollTop / maxScroll, 0), 1);
        setProgress(currentProgress);
        setIsVisible(currentProgress > 0.005);
        ticking = false;
        return;
      }

      // Default: Window / Document scroll calculation
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollableDistance = docHeight - winHeight;

      if (scrollableDistance <= 20) {
        setProgress(0);
        setIsVisible(false);
        ticking = false;
        return;
      }

      const currentProgress = Math.min(Math.max(scrollTop / scrollableDistance, 0), 1);
      setProgress(currentProgress);
      setIsVisible(currentProgress > 0.005);
      ticking = false;
    };

    const handleScroll = (e?: Event) => {
      if (e?.target && e.target instanceof HTMLElement) {
        const target = e.target;
        if (
          target !== document.documentElement &&
          target !== document.body &&
          target.scrollHeight > target.clientHeight + 40
        ) {
          activeModalRef.current = target;
        } else {
          activeModalRef.current = null;
        }
      } else {
        activeModalRef.current = null;
      }

      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    activeModalRef.current = null;
    updateProgress();

    const timer = setTimeout(updateProgress, 250);

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleScroll);
      clearTimeout(timer);
    };
  }, [triggerKey]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] pointer-events-none h-[3px] w-full transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-black/5 dark:bg-white/5" />

      {/* Strict Lime Progress fill bar */}
      <div
        className="h-full w-full origin-left bg-[#B6FF2B] shadow-[0_0_12px_rgba(182,255,43,0.85)] transition-transform duration-75 ease-out relative"
        style={{
          transform: `scaleX(${progress})`,
          willChange: 'transform'
        }}
      >
        {/* Subtle luminous flare at the leading edge */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#B6FF2B]" />
      </div>
    </div>
  );
};
