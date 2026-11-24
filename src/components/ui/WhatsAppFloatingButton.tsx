import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_CONFIG } from '../../config/whatsapp.ts';

export const WhatsAppFloatingButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const whatsappUrl = WHATSAPP_CONFIG.getChatUrl();

  return (
    <aside
      aria-label="Instant WhatsApp Assistance"
      className="fixed z-40 right-4 bottom-[calc(4.85rem+env(safe-area-inset-bottom,0px))] md:right-7 md:bottom-7 pointer-events-auto"
    >
      <div className="relative flex items-center justify-end">
        {/* Tooltip: "Chat with us on WhatsApp" */}
        <div
          role="tooltip"
          id="whatsapp-tooltip"
          className={`absolute right-full mr-3.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-display font-medium whitespace-nowrap shadow-xl backdrop-blur-md transition-all duration-200 pointer-events-none ${
            isHovered
              ? 'opacity-100 translate-x-0 scale-100'
              : 'opacity-0 translate-x-2 scale-95'
          } bg-white text-[#0A0A0A] dark:bg-[#0F0F0F] dark:text-white border border-[#E5E5E5] dark:border-[#232323] shadow-black/20`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Chat with us on WhatsApp</span>
          </div>
          {/* Tooltip triangle tail pointing right */}
          <span
            className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-white dark:bg-[#0F0F0F] border-r border-t border-[#E5E5E5] dark:border-[#232323]"
            aria-hidden="true"
          />
        </div>

        {/* Floating Action Button - Authentic WhatsApp Green */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-describedby="whatsapp-tooltip"
          aria-label="Chat with us on WhatsApp (+880 1893-383187)"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.6)] hover:bg-[#20ba59] active:scale-95 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
        >
          {/* Icon */}
          <FaWhatsapp className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200 group-hover:scale-105" />

          {/* Active Status Badge indicator */}
          <span
            aria-hidden="true"
            className="absolute top-0 right-0 w-3 h-3 bg-[#B6FF2B] border-2 border-white dark:border-[#000000] rounded-full shadow-sm"
          />
        </a>
      </div>
    </aside>
  );
};
