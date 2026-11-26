export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  category?: string;
  coverImage?: string;
  ogImage?: string;
  features: string[];
  deliverables: string[];
  process: { step: string; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  featured?: boolean;
  status: 'published' | 'draft' | 'archived';
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  client?: string;
  category: 'Website Development' | 'Web Application' | 'Mobile Application' | 'CMS Development' | 'Custom Software' | 'Performance Marketing';
  description: string;
  challenge: string;
  solution: string;
  results: { metric: string; label: string }[];
  technologies: string[];
  images: string[];
  projectUrl?: string;
  featured: boolean;
  status: 'published' | 'draft';
  order: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  serviceInterested: string;
  budgetRange?: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SPAM';
  internalNotes?: string;
  ip?: string;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  readTime: string;
  status: 'published' | 'draft' | 'scheduled';
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  format: 'jpeg' | 'png' | 'webp' | 'svg';
  sizeBytes: number;
  dimensions?: { width: number; height: number };
  altText?: string;
  publicId?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface HealthStatus {
  status: 'Healthy' | 'Needs Attention' | 'Critical';
  apiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  dbStatus: 'CONNECTED' | 'DISCONNECTED';
  dbType: 'MongoDB Atlas' | 'Resilient In-Memory Fallback';
  runtime: string;
  nodeVersion: string;
  uptimeSeconds: number;
  lastChecked: string;
  failedRequestsCount: number;
  memoryUsageMb: number;
  checks: {
    name: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    message: string;
  }[];
}

export interface PageSeoConfig {
  path: string;
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: 'summary_large_image' | 'summary';
  index: boolean;
  follow: boolean;
  hasStructuredData: boolean;
}

export interface SeoAuditReport {
  lastAuditTime: string;
  totalScore: number;
  pagesAudited: number;
  passedChecks: number;
  warningsCount: number;
  criticalIssuesCount: number;
  issues: {
    page: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    recommendation: string;
  }[];
}

export interface PerformanceSnapshot {
  id?: string;
  pageUrl: string;
  device: 'desktop' | 'mobile';
  measuredAt: string;
  lcp: number;
  inp: number;
  cls: number;
  ttfb: number;
  fcp: number;
  speedIndex: number;
  suggestions: {
    title: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
  }[];
}

export interface TrackingConfig {
  ga4: {
    enabled: boolean;
    measurementId: string;
    installed: boolean;
    receivingEvents: boolean;
  };
  googleAds: {
    enabled: boolean;
    conversionId: string;
    conversionLabel: string;
    installed: boolean;
    verified: boolean;
  };
  metaPixel: {
    enabled: boolean;
    pixelId: string;
    installed: boolean;
    receivingEvents: boolean;
  };
  privacyConsent: {
    requireConsent: boolean;
    cookiePolicyUrl: string;
    privacyPolicyUrl: string;
  };
}

export interface SiteSettings {
  agencyName: string;
  tagline: string;
  logoUrl?: string;
  heroHeading: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
  };
  aboutStory: string;
  mission: string;
  values: { title: string; description: string }[];
  metrics: { value: string; label: string; suffix?: string }[];
  trustedClients: { name: string; industry: string }[];
  faqs: { id: string; question: string; answer: string; category?: string }[];
  testimonials: {
    id: string;
    clientName: string;
    role: string;
    company: string;
    quote: string;
    rating: number;
    projectCategory: string;
    isDemoSample: boolean;
  }[];
  teamMembers: {
    id: string;
    name: string;
    role: string;
    bio: string;
    avatarUrl: string;
    socials: { linkedin?: string; twitter?: string; github?: string };
  }[];
}

export interface Testimonial {
  id: string;
  name: string;
  designation: string;
  company: string;
  content: string;
  rating: number;
  image?: string;
  isActive: boolean;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrustedBrand {
  id: string;
  name: string;
  industry: string;
  description?: string;
  logoUrl?: string;
  displayOrder: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrustedBrandsSectionSettings {
  enabled: boolean;
  heading: string;
  subtitle?: string;
  layoutStyle: 'grid' | 'marquee';
  themeMode: 'auto' | 'dark' | 'light';
  updatedAt: string;
}

export interface TrustedBrandsPayload {
  settings: TrustedBrandsSectionSettings;
  brands: TrustedBrand[];
}

export interface StatisticItem {
  id: string;
  value: string;
  prefix?: string;
  suffix?: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'editor';
  createdAt?: string;
  lastLogin?: string;
}

export interface AnalyticsOverview {
  isDemoSeedData: boolean;
  stats: {
    totalInquiries: number;
    newInquiries: number;
    inProgressInquiries: number;
    completedInquiries: number;
    publishedServices: number;
    publishedProjects: number;
    publishedBlogPosts: number;
    publishedTestimonials?: number;
    publishedTrustedBrands?: number;
    publishedStatistics?: number;
  };
  serviceDistribution: {
    service: string;
    count: number;
    percentage: number;
  }[];
  timeline: {
    date: string;
    count: number;
  }[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    timestamp: string;
  }[];
}

export interface AboutTeamMember {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  bio: string;
  linkedin?: string;
  portfolio?: string;
  order: number;
  isActive: boolean;
}

export interface AboutCoreValue {
  id: string;
  title: string;
  description: string;
}

export interface AboutCompanyStat {
  id: string;
  value: string;
  label: string;
  suffix?: string;
}

export interface AboutJourneyItem {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface AboutTechCategory {
  id: string;
  category: string;
  items: string[];
}

export interface AboutWhyChooseUsItem {
  id: string;
  title: string;
  description: string;
  metric?: string;
}

export interface AboutPageData {
  hero: {
    heading: string;
    subtitle: string;
    description: string;
    image: string;
    ctaText?: string;
    ctaUrl?: string;
  };
  company: {
    name: string;
    intro: string;
    description: string;
    logoUrl?: string;
    mission: string;
    vision: string;
    yearEstablished?: string;
    values: AboutCoreValue[];
    stats: AboutCompanyStat[];
  };
  teamMembers: AboutTeamMember[];
  sectionsVisibility: {
    showJourney: boolean;
    showServices: boolean;
    showTechStack: boolean;
    showWhyChooseUs: boolean;
    showTestimonials: boolean;
  };
  journey: AboutJourneyItem[];
  techStack: AboutTechCategory[];
  whyChooseUs: AboutWhyChooseUsItem[];
  updatedAt: string;
}

