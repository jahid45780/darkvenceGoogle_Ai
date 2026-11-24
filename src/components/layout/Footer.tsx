import React from 'react';
import { ArrowUpRight, Mail, Phone, MapPin } from 'lucide-react';
import { FaWhatsapp, FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import { motion, useReducedMotion } from 'motion/react';
import { SiteSettings } from '../../types/index.ts';
import { BrandLogo } from '../ui/BrandLogo.tsx';
import { BrandTriangle } from '../ui/BrandTriangle.tsx';
import { WHATSAPP_CONFIG } from '../../config/whatsapp.ts';

interface FooterProps {
  settings?: SiteSettings;
  onNavigate: (page: string, slug?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const shouldReduceMotion = useReducedMotion();

  const socialLinks = [
    { name: 'LinkedIn', icon: FaLinkedin, href: settings?.socialLinks?.linkedin || 'https://linkedin.com' },
    { name: 'Twitter', icon: FaTwitter, href: settings?.socialLinks?.twitter || 'https://twitter.com' },
    { name: 'GitHub', icon: FaGithub, href: settings?.socialLinks?.github || 'https://github.com' }
  ];

  return (
    <footer className="relative bg-white dark:bg-[#000000] border-t border-[#E5E5E5] dark:border-[#232323] pt-16 pb-28 md:pb-12 text-[#5C5C5C] dark:text-[#A1A1A1] transition-colors duration-200 overflow-hidden">
      {/* Subtle top luminous lime gradient hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B6FF2B]/35 to-transparent pointer-events-none" />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-14 border-b border-[#E5E5E5] dark:border-[#232323]">
          {/* Col 1 & 2: Agency Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" />
            <p className="text-base text-[#5C5C5C] dark:text-[#A1A1A1] max-w-sm leading-[1.7] font-body">
              {settings?.tagline || 'Engineering Digital Dominance'} — We build bespoke websites, mobile applications, CMS platforms, and precision performance advertising engines for ambitious brands.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono font-medium tracking-[0.12em]">
              <span className="inline-flex items-center gap-1.5 text-[#0A0A0A] dark:text-white">
                <span className="w-2 h-2 rounded-full bg-[#B6FF2B] animate-pulse" />
                ACCEPTING Q3/Q4 CLIENT ENGAGEMENTS
              </span>
            </div>

            {/* Social Icons */}
            <div className="pt-3 flex items-center gap-3">
              {socialLinks.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <motion.a
                    key={idx}
                    whileHover={shouldReduceMotion ? {} : { y: -2 }}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${s.name}`}
                    className="w-9 h-9 rounded-xl bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] flex items-center justify-center text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-black dark:hover:text-[#B6FF2B] hover:border-[#B6FF2B] transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.12em] font-medium text-[#0A0A0A] dark:text-white mb-4 font-mono flex items-center gap-1.5">
              <BrandTriangle size={8} color="#B6FF2B" />
              <span>NAVIGATION</span>
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors cursor-pointer"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors cursor-pointer"
                >
                  About Agency
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('portfolio')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors cursor-pointer"
                >
                  Featured Portfolio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors cursor-pointer"
                >
                  Insights &amp; Articles
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors cursor-pointer"
                >
                  Start a Project
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Services */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.12em] font-medium text-[#0A0A0A] dark:text-white mb-4 font-mono flex items-center gap-1.5">
              <BrandTriangle size={8} color="#B6FF2B" />
              <span>CORE CAPABILITIES</span>
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('services', 'website-development')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors text-left cursor-pointer"
                >
                  Website Development
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'mobile-app-development')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors text-left cursor-pointer"
                >
                  Mobile Applications
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'cms-development')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors text-left cursor-pointer"
                >
                  Headless CMS
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'google-ads-management')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors text-left cursor-pointer"
                >
                  Google Ads Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'facebook-instagram-ads')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors text-left cursor-pointer"
                >
                  Meta Ads &amp; CAPI
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services', 'custom-software-solutions')}
                  className="hover:text-black dark:hover:text-[#B6FF2B] transition-colors text-left cursor-pointer"
                >
                  Custom Software
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Office */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.12em] font-medium text-[#0A0A0A] dark:text-white mb-4 font-mono flex items-center gap-1.5">
              <BrandTriangle size={8} color="#B6FF2B" />
              <span>CONTACT &amp; OFFICES</span>
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B6FF2B] shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=S%2F8%20Nurjahan%20Road%2C%20Mohammadpur%2C%20Dhaka-1207%2C%20Bangladesh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-black dark:hover:text-white transition-colors leading-relaxed"
                  title="Open office location in Google Maps"
                >
                  {settings?.officeAddress || 'S/8 Nurjahan Road, Mohammadpur, Dhaka-1207, Bangladesh'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B6FF2B] shrink-0" />
                <a
                  href={`mailto:${settings?.contactEmail || 'contact@darkvence.com'}`}
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  {settings?.contactEmail || 'contact@darkvence.com'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#B6FF2B] shrink-0" />
                <a
                  href="tel:+8801893383187"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  {settings?.contactPhone || '+880 1893-383187'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <FaWhatsapp className="w-4 h-4 text-[#25D366] shrink-0" />
                <a
                  href={WHATSAPP_CONFIG.getChatUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors flex items-center gap-1.5"
                  title="Chat on WhatsApp"
                >
                  <span>Chat on WhatsApp</span>
                  <ArrowUpRight className="w-3 h-3 text-[#5C5C5C]" />
                </a>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#0A0A0A] dark:text-[#B6FF2B] hover:underline font-medium font-mono tracking-[0.12em] uppercase"
                >
                  <span>Admin CMS Portal</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C5C5C] dark:text-[#A1A1A1]">
          <p>© {new Date().getFullYear()} Darkvence Digital Agency. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Engineering Digital Dominance</span>
            <button
              onClick={() => onNavigate('admin')}
              className="hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              System Management
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
