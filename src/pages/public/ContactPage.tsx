import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  Send,
  MessageSquare,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { SiteSettings } from '../../types/index.ts';
import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_CONFIG } from '../../config/whatsapp.ts';
import { BrandTriangle } from '../../components/ui/BrandTriangle.tsx';

interface ContactPageProps {
  settings?: SiteSettings;
  preselectedService?: string;
  onNavigate?: (page: string) => void;
}

const OFFICIAL_ADDRESS = 'S/8 Nurjahan Road, Mohammadpur, Dhaka-1207, Bangladesh';
const OFFICIAL_PHONE = '+880 1893-383187';
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(OFFICIAL_ADDRESS)}`;
const MAPS_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(OFFICIAL_ADDRESS)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

export const ContactPage: React.FC<ContactPageProps> = ({ settings, preselectedService }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceInterested: preselectedService || 'Website Development',
    budgetRange: '$25,000 - $50,000',
    message: '',
    website_source_hp: '' // Bot honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const servicesList = [
    'Website Development',
    'Mobile Application Development',
    'CMS Development',
    'Google Ads Management',
    'Facebook and Instagram Ads Management',
    'Custom Software and Digital Solutions'
  ];

  const budgetTiers = [
    '< $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000 - $100,000',
    '$100,000+'
  ];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(OFFICIAL_ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const scrollToForm = () => {
    const formElement = document.getElementById('contact-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const input = document.getElementById('inquiry-name') as HTMLInputElement | null;
        input?.focus();
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid work email address.');
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMessage('Please describe your project scope or objectives (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.submitInquiry(formData);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        serviceInterested: 'Website Development',
        budgetRange: '$25,000 - $50,000',
        message: '',
        website_source_hp: ''
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-6 sm:pt-10 pb-28 sm:pb-24 px-4 sm:px-6 lg:px-10 xl:px-12 max-w-[1560px] mx-auto space-y-16 sm:space-y-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-4 sm:pt-8 pb-6 border-b border-[#E5E5E5] dark:border-[#232323]">
        <div className="max-w-3xl space-y-5">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] text-[#0A0A0A] dark:text-white text-xs sm:text-[13px] font-mono font-medium uppercase tracking-[0.12em]">
            <BrandTriangle size={10} color="#B6FF2B" />
            <span>GET IN TOUCH</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-[#0A0A0A] dark:text-white tracking-[-0.02em] leading-[1.05] font-display">
            Let's Build Something Exceptional<span className="text-[#B6FF2B]">.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg md:text-[1.1875rem] text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.65] max-w-[65ch] font-body text-pretty">
            Whether you need bespoke software development, high-performance web applications, native mobile experiences, or high-converting digital marketing systems, our team is ready to engineer your solution.
          </p>

          {/* Quick CTA to Form, WhatsApp & Response Guarantee */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#B6FF2B] hover:bg-[#9FE61A] text-black text-[0.95rem] font-semibold tracking-[0.01em] font-display shadow-lg shadow-[#B6FF2B]/20 active:scale-98 transition-all cursor-pointer"
            >
              <span>Discuss Your Project Scope</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <a
              href={WHATSAPP_CONFIG.getChatUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#25D366] text-[#0A0A0A] dark:text-white text-[0.95rem] font-semibold tracking-[0.01em] font-display shadow-sm hover:bg-[#25D366]/5 active:scale-98 transition-all cursor-pointer group"
              title="Open WhatsApp chat with DARKVENCE"
            >
              <FaWhatsapp className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" />
              <span>Chat on WhatsApp</span>
            </a>

            <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#5C5C5C] dark:text-[#A1A1A1]">
              <Clock className="w-4 h-4 text-[#B6FF2B]" />
              <span>TECHNICAL REVIEW &amp; PROPOSAL WITHIN 24 HOURS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTACT INFORMATION CARDS */}
      <section aria-label="Official Contact Channels" className="space-y-6">
        <div>
          <h2 className="text-xs uppercase tracking-widest font-semibold text-[#5C5C5C] dark:text-[#A1A1A1] font-mono flex items-center gap-2">
            <BrandTriangle size={10} color="#B6FF2B" />
            <span>Direct Communication Channels</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Official Address */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#B6FF2B] shadow-sm flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] text-[#B6FF2B] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-mono uppercase font-semibold text-black dark:text-[#B6FF2B]">
                  Headquarters &amp; Studio
                </p>
                <h3 className="text-sm sm:text-base font-bold text-[#0A0A0A] dark:text-white leading-snug">
                  {OFFICIAL_ADDRESS}
                </h3>
              </div>
              <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1]">
                Centrally situated in Mohammadpur, Dhaka. In-person discovery meetings by appointment.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-[#E5E5E5] dark:border-[#232323] flex items-center justify-between">
              <a
                href={MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] dark:text-[#B6FF2B] hover:underline transition-colors"
                title="Open address in Google Maps"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="p-1.5 text-[#5C5C5C] hover:text-black dark:text-[#A1A1A1] dark:hover:text-white transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                title="Copy address to clipboard"
                aria-label="Copy address"
              >
                {copiedAddress ? <Check className="w-3.5 h-3.5 text-[#B6FF2B]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Card 2: Official Phone Number */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#B6FF2B] shadow-sm flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] text-[#B6FF2B] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-mono uppercase font-semibold text-black dark:text-[#B6FF2B]">
                  Phone &amp; WhatsApp Line
                </p>
                <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white font-mono-tabular">
                  {OFFICIAL_PHONE}
                </h3>
              </div>
              <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1]">
                Direct commercial and technical support lines available Sunday through Thursday.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-[#E5E5E5] dark:border-[#232323] flex flex-col gap-2">
              <a
                href={WHATSAPP_CONFIG.getChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow-md shadow-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-98"
                title="Chat on WhatsApp"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href="tel:+8801893383187"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#5C5C5C] hover:text-black dark:text-[#A1A1A1] dark:hover:text-[#B6FF2B] transition-colors pt-0.5"
              >
                <span>Call Directly (+880)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: Project Inquiries */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#B6FF2B] shadow-sm flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] text-[#B6FF2B] flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-mono uppercase font-semibold text-black dark:text-[#B6FF2B]">
                  Project Inquiries
                </p>
                <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white">
                  Technical Discovery
                </h3>
              </div>
              <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1]">
                Share your architectural requirements or growth goals to receive a scoped roadmap.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-[#E5E5E5] dark:border-[#232323]">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] dark:text-[#B6FF2B] hover:underline transition-colors cursor-pointer"
              >
                <span>Fill Project Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 4: Official Email */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#B6FF2B] shadow-sm flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] text-[#B6FF2B] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-mono uppercase font-semibold text-black dark:text-[#B6FF2B]">
                  Official Email
                </p>
                <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white">
                  {settings?.contactEmail || 'contact@darkvence.com'}
                </h3>
              </div>
              <p className="text-xs text-[#5C5C5C] dark:text-[#A1A1A1]">
                For RFP submissions, enterprise partnerships, or commercial contracts.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-[#E5E5E5] dark:border-[#232323]">
              <a
                href={`mailto:${settings?.contactEmail || 'contact@darkvence.com'}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] dark:text-[#B6FF2B] hover:underline transition-colors"
              >
                <span>Write to Us</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONTACT FORM & ENGAGEMENT GUARANTEES */}
      <section id="contact-form" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] shadow-xl relative overflow-hidden">
            {/* Top radiant bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#B6FF2B]" />

            {submitSuccess ? (
              <div className="py-12 sm:py-16 text-center space-y-6 animate-fade-in" role="status">
                <div className="w-16 h-16 rounded-2xl bg-black dark:bg-[#161616] border border-[#232323] text-[#B6FF2B] flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9 text-[#B6FF2B]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] dark:text-white font-display">
                    Inquiry Transmitted Successfully
                  </h3>
                  <p className="text-sm text-[#5C5C5C] dark:text-[#A1A1A1] max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to DARKVENCE. Your project brief has been registered in our CRM. A senior technical partner will review your requirements and follow up within 24 business hours.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="px-6 py-3 text-xs sm:text-sm font-bold text-black bg-[#B6FF2B] hover:bg-[#9FE61A] rounded-xl transition-all shadow-md shadow-[#B6FF2B]/20 cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0A0A0A] dark:text-white font-display">
                    Send Us a Message
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5C5C5C] dark:text-[#A1A1A1]">
                    Fill in your details below and we will get back to you with architectural guidance.
                  </p>
                </div>

                {/* Honeypot field */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website_source_hp">Do not fill this field</label>
                  <input
                    type="text"
                    id="website_source_hp"
                    name="website_source_hp"
                    value={formData.website_source_hp}
                    onChange={(e) => setFormData({ ...formData, website_source_hp: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="inquiry-name" className="text-xs sm:text-sm font-semibold font-body text-[#0A0A0A] dark:text-white">
                      Full Name <span className="text-[#B6FF2B]">*</span>
                    </label>
                    <input
                      id="inquiry-name"
                      type="text"
                      required
                      placeholder="e.g. Alex Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] rounded-xl px-4 py-3 text-sm font-body text-[#0A0A0A] dark:text-white placeholder-[#5C5C5C] dark:placeholder-[#A1A1A1] focus:outline-none focus:border-[#B6FF2B] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="inquiry-email" className="text-xs sm:text-sm font-semibold font-body text-[#0A0A0A] dark:text-white">
                      Work Email <span className="text-[#B6FF2B]">*</span>
                    </label>
                    <input
                      id="inquiry-email"
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] rounded-xl px-4 py-3 text-sm font-body text-[#0A0A0A] dark:text-white placeholder-[#5C5C5C] dark:placeholder-[#A1A1A1] focus:outline-none focus:border-[#B6FF2B] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="inquiry-phone" className="text-xs sm:text-sm font-semibold font-body text-[#0A0A0A] dark:text-white">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="inquiry-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] rounded-xl px-4 py-3 text-sm font-body text-[#0A0A0A] dark:text-white placeholder-[#5C5C5C] dark:placeholder-[#A1A1A1] focus:outline-none focus:border-[#B6FF2B] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="inquiry-company" className="text-xs sm:text-sm font-semibold font-body text-[#0A0A0A] dark:text-white">
                      Company / Organization
                    </label>
                    <input
                      id="inquiry-company"
                      type="text"
                      placeholder="Acme Corp"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] rounded-xl px-4 py-3 text-sm font-body text-[#0A0A0A] dark:text-white placeholder-[#5C5C5C] dark:placeholder-[#A1A1A1] focus:outline-none focus:border-[#B6FF2B] transition-colors"
                    />
                  </div>
                </div>

                {/* Service of Interest */}
                <div className="space-y-1.5">
                  <label htmlFor="inquiry-service" className="text-xs sm:text-sm font-semibold font-body text-[#0A0A0A] dark:text-white">
                    Primary Service of Interest <span className="text-[#B6FF2B]">*</span>
                  </label>
                  <select
                    id="inquiry-service"
                    value={formData.serviceInterested}
                    onChange={(e) => setFormData({ ...formData, serviceInterested: e.target.value })}
                    className="w-full bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] rounded-xl px-4 py-3 text-sm font-body text-[#0A0A0A] dark:text-white focus:outline-none focus:border-[#B6FF2B] transition-colors cursor-pointer"
                  >
                    {servicesList.map((svc) => (
                      <option key={svc} value={svc} className="bg-white dark:bg-[#0F0F0F]">
                        {svc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Range selector */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold font-body text-[#0A0A0A] dark:text-white block">
                    Estimated Project Investment
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {budgetTiers.map((tier) => (
                      <button
                        type="button"
                        key={tier}
                        onClick={() => setFormData({ ...formData, budgetRange: tier })}
                        className={`py-2 px-3 text-xs sm:text-[13px] font-mono font-medium tracking-[0.04em] rounded-xl border text-center transition-all cursor-pointer ${
                          formData.budgetRange === tier
                            ? 'bg-[#B6FF2B] border-[#B6FF2B] text-black shadow-sm font-bold'
                            : 'bg-[#F5F5F5] dark:bg-[#161616] border-[#E5E5E5] dark:border-[#232323] text-[#5C5C5C] dark:text-[#A1A1A1] hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#B6FF2B]'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="inquiry-message" className="text-xs sm:text-sm font-semibold font-body text-[#0A0A0A] dark:text-white">
                    Project Overview &amp; Requirements <span className="text-[#B6FF2B]">*</span>
                  </label>
                  <textarea
                    id="inquiry-message"
                    required
                    rows={4}
                    placeholder="Tell us about your system requirements, timeline, current tech stack, or specific challenges..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#232323] rounded-xl px-4 py-3 text-sm font-body text-[#0A0A0A] dark:text-white placeholder-[#5C5C5C] dark:placeholder-[#A1A1A1] focus:outline-none focus:border-[#B6FF2B] transition-colors resize-none leading-relaxed"
                  />
                  <span className="text-xs font-body text-[#5C5C5C] dark:text-[#A1A1A1]">Minimum 10 characters required.</span>
                </div>

                {/* Submit button: Primary Lime */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-[0.95rem] font-semibold tracking-[0.01em] font-display text-black bg-[#B6FF2B] hover:bg-[#9FE61A] active:scale-[0.99] disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-[#B6FF2B]/20 flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4 text-black" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar: Commitments & Studio SLA */}
        <div className="lg:col-span-5 space-y-6">
          {/* Studio Standards Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] shadow-sm space-y-6">
            <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold font-display text-[#0A0A0A] dark:text-white leading-[1.25]">
              The DARKVENCE Guarantee
            </h3>
            <p className="text-base font-body text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.7] max-w-[65ch]">
              Every client engagement begins with rigorous discovery and absolute data privacy. Here is our working commitment:
            </p>

            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] text-[#B6FF2B] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#B6FF2B]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display text-[#0A0A0A] dark:text-white">Mutual NDA Protection</h4>
                  <p className="text-sm font-body text-[#5C5C5C] dark:text-[#A1A1A1] leading-relaxed mt-0.5">
                    Your proprietary codebase, business models, and architectures remain completely confidential.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] text-[#B6FF2B] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#B6FF2B]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display text-[#0A0A0A] dark:text-white">24-Hour Scoping Turnaround</h4>
                  <p className="text-sm font-body text-[#5C5C5C] dark:text-[#A1A1A1] leading-relaxed mt-0.5">
                    Receive technical feasibility feedback and a realistic sprint proposal without delay.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-black dark:bg-[#161616] border border-[#232323] text-[#B6FF2B] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#B6FF2B]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display text-[#0A0A0A] dark:text-white">Direct Principal Access</h4>
                  <p className="text-sm font-body text-[#5C5C5C] dark:text-[#A1A1A1] leading-relaxed mt-0.5">
                    Work directly with seasoned software architects and growth directors, not outsourced middlemen.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Consultation Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#25D366] shadow-sm space-y-4 relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-[#25D366]/30">
                  <FaWhatsapp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0A0A0A] dark:text-white font-display">
                    Fast-Track on WhatsApp
                  </h4>
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium tracking-[0.08em] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                    <span>Real-Time Technical Chat</span>
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm font-body text-[#5C5C5C] dark:text-[#A1A1A1] leading-relaxed">
              Prefer direct messaging? Message our engineering lead on WhatsApp for instant scope discussions, technical consultations, or NDA requests.
            </p>

            <a
              href={WHATSAPP_CONFIG.getChatUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white text-[0.95rem] font-semibold tracking-[0.01em] font-display shadow-lg shadow-[#25D366]/25 transition-all group"
            >
              <FaWhatsapp className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Chat on WhatsApp</span>
              <ArrowUpRight className="w-4 h-4 opacity-80" />
            </a>

            <div className="flex items-center justify-between text-xs font-mono font-medium text-[#5C5C5C] dark:text-[#A1A1A1] pt-1 border-t border-[#E5E5E5] dark:border-[#232323]">
              <span>Official: +880 1893-383187</span>
              <span>Sunday – Thursday</span>
            </div>
          </div>

          {/* Location Quick Snippet Card */}
          <div className="p-6 rounded-3xl bg-[#F5F5F5] dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em]">
              <MapPin className="w-3.5 h-3.5 text-[#B6FF2B]" />
              <span>Dhaka Studio Location</span>
            </div>
            <p className="text-base font-semibold text-[#0A0A0A] dark:text-white font-display leading-snug">
              {OFFICIAL_ADDRESS}
            </p>
            <p className="text-sm font-body text-[#5C5C5C] dark:text-[#A1A1A1] leading-relaxed">
              Mohammadpur is one of Dhaka's most central tech and commercial hubs with direct connectivity to Dhanmondi, Mirpur, and Gulshan.
            </p>
            <div className="pt-2">
              <a
                href={MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium tracking-[0.08em] uppercase text-[#0A0A0A] dark:text-[#B6FF2B] hover:underline"
              >
                <span>Open in Google Maps App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE GOOGLE MAP SECTION */}
      <section aria-label="Interactive Studio Map" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono font-medium text-[#0A0A0A] dark:text-white uppercase tracking-[0.12em]">
              <MapPin className="w-3.5 h-3.5 text-[#B6FF2B]" />
              <span>Interactive Map</span>
            </div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[#0A0A0A] dark:text-white font-display leading-[1.1] tracking-[-0.02em]">
              Visit Our Mohammadpur Studio
            </h2>
            <p className="text-base sm:text-lg font-body text-[#5C5C5C] dark:text-[#A1A1A1] leading-[1.65] max-w-[65ch]">
              Interactive map centered at {OFFICIAL_ADDRESS}
            </p>
          </div>

          <a
            href={MAPS_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F0F0F] border border-[#E5E5E5] dark:border-[#232323] hover:border-[#B6FF2B] text-[#0A0A0A] dark:text-white text-[0.95rem] font-semibold tracking-[0.01em] font-display transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
          >
            <MapPin className="w-4 h-4 text-[#B6FF2B]" />
            <span>Get Directions</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#5C5C5C]" />
          </a>
        </div>

        {/* Map Container */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5E5E5] dark:border-[#232323] shadow-lg bg-black">
          {/* Top Bar inside Map Frame */}
          <div className="px-5 py-3.5 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#232323] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#0A0A0A] dark:text-white font-medium">
              <span className="w-2 h-2 rounded-full bg-[#B6FF2B] animate-pulse" />
              <span className="font-semibold font-display text-[#0A0A0A] dark:text-white">DARKVENCE Office Location:</span>
              <span className="hidden sm:inline font-mono">{OFFICIAL_ADDRESS}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyAddress}
                className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[#5C5C5C] hover:text-black dark:text-[#A1A1A1] dark:hover:text-white transition-colors cursor-pointer"
              >
                {copiedAddress ? <Check className="w-3 h-3 text-[#B6FF2B]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAddress ? 'Copied' : 'Copy Address'}</span>
              </button>

              <span className="text-[#E5E5E5] dark:text-[#232323]">|</span>

              <a
                href={MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-medium text-black dark:text-[#B6FF2B] hover:underline inline-flex items-center gap-1 uppercase tracking-wider"
              >
                <span>Navigate</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="w-full h-[360px] sm:h-[440px] md:h-[480px] xl:h-[520px] relative bg-slate-200 dark:bg-black">
            <iframe
              title="DARKVENCE Studio Location Map — Mohammadpur, Dhaka"
              src={MAPS_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
