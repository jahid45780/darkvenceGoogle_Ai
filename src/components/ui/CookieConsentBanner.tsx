import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { BrandTriangle } from './BrandTriangle.tsx';

interface CookieConsentBannerProps {
  onConsentChange?: (analyticsAllowed: boolean) => void;
  onOpenPrivacyPolicy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onConsentChange,
  onOpenPrivacyPolicy
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: true
  });

  useEffect(() => {
    const stored = localStorage.getItem('darkvence_cookie_consent');
    if (!stored) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(stored);
        if (onConsentChange) onConsentChange(!!parsed.analytics);
      } catch (e) {
        // Fallback
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = { essential: true, analytics: true, marketing: true, timestamp: new Date().toISOString() };
    localStorage.setItem('darkvence_cookie_consent', JSON.stringify(consent));
    setShowBanner(false);
    if (onConsentChange) onConsentChange(true);
  };

  const handleRejectAll = () => {
    const consent = { essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString() };
    localStorage.setItem('darkvence_cookie_consent', JSON.stringify(consent));
    setShowBanner(false);
    if (onConsentChange) onConsentChange(false);
  };

  const handleSavePreferences = () => {
    const consent = { ...preferences, timestamp: new Date().toISOString() };
    localStorage.setItem('darkvence_cookie_consent', JSON.stringify(consent));
    setShowPreferences(false);
    setShowBanner(false);
    if (onConsentChange) onConsentChange(preferences.analytics);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-in">
        <div className="p-5 rounded-2xl bg-white/95 dark:bg-[#0F0F0F]/95 backdrop-blur-md border border-[#E5E5E5] dark:border-[#232323] shadow-2xl shadow-black/40 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] text-[#B6FF2B] shrink-0">
              <Cookie className="w-5 h-5 text-[#B6FF2B]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <BrandTriangle size={10} color="#B6FF2B" />
                <h4 className="text-xs sm:text-[13px] font-medium text-[#0A0A0A] dark:text-white font-mono uppercase tracking-[0.12em]">
                  Privacy &amp; Telemetry
                </h4>
              </div>
              <p className="text-xs font-body text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.6]">
                We use strictly necessary cookies to ensure technical integrity and anonymized telemetry to optimize Core Web Vitals.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2 px-3 text-xs font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-colors cursor-pointer shadow-sm shadow-[#B6FF2B]/20"
            >
              Accept All
            </button>
            <button
              onClick={handleRejectAll}
              className="py-2 px-3 text-xs font-semibold tracking-[0.01em] font-display text-[#0A0A0A] dark:text-white bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border border-black/20 dark:border-white/20 rounded-xl transition-colors cursor-pointer"
            >
              Essential Only
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="text-xs font-mono font-medium tracking-[0.04em] text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-black dark:hover:text-[#B6FF2B] underline cursor-pointer w-full text-center mt-1"
            >
              Manage Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowPreferences(false)}
              className="absolute top-5 right-5 p-1.5 text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-black dark:hover:text-white rounded-lg bg-black/5 dark:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold text-[#0A0A0A] dark:text-white font-display leading-[1.25]">
              Cookie &amp; Privacy Preferences
            </h3>

            <div className="space-y-3 text-xs">
              {/* Essential */}
              <div className="p-3.5 rounded-xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold font-display text-[#0A0A0A] dark:text-white">Strictly Necessary</p>
                  <p className="text-[#5C5C5C] dark:text-[#A1A1A1] text-xs font-body">Session security and technical load balancing.</p>
                </div>
                <span className="text-xs font-mono text-[#B6FF2B] bg-black px-2 py-0.5 rounded uppercase font-medium tracking-[0.08em]">Always Active</span>
              </div>

              {/* Analytics */}
              <div className="p-3.5 rounded-xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold font-display text-[#0A0A0A] dark:text-white">Performance &amp; Analytics</p>
                  <p className="text-[#5C5C5C] dark:text-[#A1A1A1] text-xs font-body">Core Web Vitals telemetry and aggregated route speeds.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="rounded accent-[#B6FF2B] cursor-pointer w-4 h-4"
                />
              </div>

              {/* Marketing */}
              <div className="p-3.5 rounded-xl bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold font-display text-[#0A0A0A] dark:text-white">Advertising Attribution</p>
                  <p className="text-[#5C5C5C] dark:text-[#A1A1A1] text-xs font-body">Conversion measurement tags for campaign optimization.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="rounded accent-[#B6FF2B] cursor-pointer w-4 h-4"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#232323] flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 text-xs font-mono font-medium tracking-[0.08em] uppercase text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-black dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2 text-xs font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
