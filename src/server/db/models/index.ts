import mongoose, { Schema, Document } from 'mongoose';
import {
  AdminUser,
  ServiceItem,
  ProjectItem,
  BlogPostItem,
  InquiryItem,
  AboutPageData,
  SiteSettings,
  MediaItem,
  PageSeoConfig,
  PerformanceSnapshot,
  TrackingConfig,
  Testimonial,
  TrustedBrand,
  TrustedBrandsSectionSettings
} from '../../types/index.ts';

// 1. Admin Users Schema
export interface AdminUserDocument extends Omit<AdminUser, 'id'>, Document {
  id: string;
}
const AdminUserSchema = new Schema<AdminUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin', 'editor'], default: 'admin', index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    lastLogin: { type: String }
  },
  { collection: 'admin_users', timestamps: false, versionKey: false }
);
export const UserModel = mongoose.models.AdminUser || mongoose.model<AdminUserDocument>('AdminUser', AdminUserSchema);

// 2. Services Schema
export interface ServiceDocument extends Omit<ServiceItem, 'id'>, Document {
  id: string;
}
const ServiceSchema = new Schema<ServiceDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, default: '' },
    fullDescription: { type: String, default: '' },
    icon: { type: String, default: 'Globe' },
    category: { type: String },
    coverImage: { type: String },
    ogImage: { type: String },
    features: { type: [String], default: [] },
    deliverables: { type: [String], default: [] },
    process: { type: [Object] as any, default: [] },
    faqs: { type: [Object] as any, default: [] },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'draft', 'archived'], default: 'published', index: true },
    order: { type: Number, default: 0, index: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'services', timestamps: false, versionKey: false }
);
export const ServiceModel = mongoose.models.Service || mongoose.model<ServiceDocument>('Service', ServiceSchema);

// 3. Projects Schema
export interface ProjectDocument extends Omit<ProjectItem, 'id'>, Document {
  id: string;
}
const ProjectSchema = new Schema<ProjectDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    client: { type: String },
    category: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    challenge: { type: String, default: '' },
    solution: { type: String, default: '' },
    results: { type: [Object] as any, default: [] },
    technologies: { type: [String], default: [] },
    images: { type: [String], default: [] },
    projectUrl: { type: String },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
    order: { type: Number, default: 0, index: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'projects', timestamps: false, versionKey: false }
);
export const ProjectModel = mongoose.models.Project || mongoose.model<ProjectDocument>('Project', ProjectSchema);

// 4. Blog Posts Schema
export interface BlogPostDocument extends Omit<BlogPostItem, 'id'>, Document {
  id: string;
}
const BlogPostSchema = new Schema<BlogPostDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    author: { type: Schema.Types.Mixed, default: {} },
    category: { type: String, default: 'General', index: true },
    tags: { type: [String], default: [] },
    readTime: { type: String, default: '5 min read' },
    status: { type: String, enum: ['published', 'draft', 'scheduled'], default: 'published', index: true },
    publishedAt: { type: String, default: () => new Date().toISOString(), index: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'blog_posts', timestamps: false, versionKey: false }
);
export const BlogPostModel = mongoose.models.BlogPost || mongoose.model<BlogPostDocument>('BlogPost', BlogPostSchema);

// 5. Inquiries Schema
export interface InquiryDocument extends Omit<InquiryItem, 'id'>, Document {
  id: string;
}
const InquirySchema = new Schema<InquiryDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    company: { type: String },
    serviceInterested: { type: String, default: 'General Inquiry' },
    budgetRange: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'SPAM'], default: 'NEW', index: true },
    internalNotes: { type: String },
    ip: { type: String },
    sourceUrl: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'inquiries', timestamps: false, versionKey: false }
);
export const InquiryModel = mongoose.models.Inquiry || mongoose.model<InquiryDocument>('Inquiry', InquirySchema);

// 6. About Page CMS Schema
export interface AboutDocument extends Document {
  docId: string;
  data: AboutPageData;
  updatedAt: string;
}
const AboutSchema = new Schema<AboutDocument>(
  {
    docId: { type: String, required: true, unique: true, index: true, default: 'primary_about' },
    data: { type: Schema.Types.Mixed, required: true },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'about_cms', timestamps: false, versionKey: false }
);
export const AboutModel = mongoose.models.About || mongoose.model<AboutDocument>('About', AboutSchema);

// 7. Site Settings Schema
export interface SettingsDocument extends Document {
  docId: string;
  data: SiteSettings;
  updatedAt: string;
}
const SettingsSchema = new Schema<SettingsDocument>(
  {
    docId: { type: String, required: true, unique: true, index: true, default: 'primary_settings' },
    data: { type: Schema.Types.Mixed, required: true },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'site_settings', timestamps: false, versionKey: false }
);
export const SettingsModel = mongoose.models.SiteSettings || mongoose.model<SettingsDocument>('SiteSettings', SettingsSchema);

// 8. Media Library Schema
export interface MediaDocument extends Omit<MediaItem, 'id'>, Document {
  id: string;
}
const MediaSchema = new Schema<MediaDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String },
    format: { type: String, enum: ['jpeg', 'png', 'webp', 'svg'], default: 'png' },
    sizeBytes: { type: Number, default: 0 },
    dimensions: { type: Schema.Types.Mixed },
    altText: { type: String },
    uploadedBy: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'media_library', timestamps: false, versionKey: false }
);
export const MediaModel = mongoose.models.Media || mongoose.model<MediaDocument>('Media', MediaSchema);

// 9. Page SEO Configs Schema
export interface PageSeoDocument extends Document {
  path: string;
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  index: boolean;
  follow: boolean;
  hasStructuredData: boolean;
}
const PageSeoSchema = new Schema<PageSeoDocument>(
  {
    path: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    twitterCard: { type: String, default: 'summary_large_image' },
    index: { type: Boolean, default: true },
    follow: { type: Boolean, default: true },
    hasStructuredData: { type: Boolean, default: true }
  },
  { collection: 'page_seo', timestamps: false, versionKey: false }
);
export const SeoModel = mongoose.models.PageSeo || mongoose.model<PageSeoDocument>('PageSeo', PageSeoSchema);

// 10. Performance Snapshot Schema
export interface PerformanceDocument extends Document {
  id: string;
  pageUrl: string;
  device: string;
  measuredAt: string;
  lcp: number;
  inp: number;
  cls: number;
  ttfb: number;
  fcp: number;
  speedIndex: number;
  suggestions: { title: string; impact: string; description: string }[];
}
const PerformanceSchema = new Schema<PerformanceDocument>(
  {
    id: { type: String, required: true, unique: true, index: true, default: () => `perf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}` },
    pageUrl: { type: String, required: true },
    device: { type: String, enum: ['desktop', 'mobile'], default: 'desktop' },
    measuredAt: { type: String, default: () => new Date().toISOString() },
    lcp: { type: Number, default: 0 },
    inp: { type: Number, default: 0 },
    cls: { type: Number, default: 0 },
    ttfb: { type: Number, default: 0 },
    fcp: { type: Number, default: 0 },
    speedIndex: { type: Number, default: 0 },
    suggestions: { type: [Object] as any, default: [] }
  },
  { collection: 'performance_snapshots', timestamps: false, versionKey: false }
);
export const PerformanceModel = mongoose.models.Performance || mongoose.model<PerformanceDocument>('Performance', PerformanceSchema);

// 11. Tracking Config Schema
export interface TrackingDocument extends Document {
  docId: string;
  data: TrackingConfig;
  updatedAt: string;
}
const TrackingSchema = new Schema<TrackingDocument>(
  {
    docId: { type: String, required: true, unique: true, index: true, default: 'primary_tracking' },
    data: { type: Schema.Types.Mixed, required: true },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'marketing_tracking', timestamps: false, versionKey: false }
);
export const TrackingModel = mongoose.models.Tracking || mongoose.model<TrackingDocument>('Tracking', TrackingSchema);

// 12. Client Testimonials Schema
export interface TestimonialDocument extends Omit<Testimonial, 'id'>, Document {
  id: string;
}
const TestimonialSchema = new Schema<TestimonialDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'testimonials', timestamps: false, versionKey: false }
);
export const TestimonialModel = mongoose.models.Testimonial || mongoose.model<TestimonialDocument>('Testimonial', TestimonialSchema);

// 13. Trusted Brands Schema
export interface TrustedBrandDocument extends Omit<TrustedBrand, 'id'>, Document {
  id: string;
}
const TrustedBrandSchema = new Schema<TrustedBrandDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    logoUrl: { type: String, default: '', trim: true },
    displayOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'trusted_brands', timestamps: false, versionKey: false }
);
export const TrustedBrandModel =
  mongoose.models.TrustedBrand || mongoose.model<TrustedBrandDocument>('TrustedBrand', TrustedBrandSchema);

// 14. Trusted Brands Section Settings Schema
export interface TrustedBrandSettingsDocument extends Document {
  docId: string;
  data: TrustedBrandsSectionSettings;
  updatedAt: string;
}
const TrustedBrandSettingsSchema = new Schema<TrustedBrandSettingsDocument>(
  {
    docId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: 'primary_trusted_brands_settings'
    },
    data: { type: Schema.Types.Mixed, required: true },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { collection: 'trusted_brands_settings', timestamps: false, versionKey: false }
);
export const TrustedBrandSettingsModel =
  mongoose.models.TrustedBrandSettings ||
  mongoose.model<TrustedBrandSettingsDocument>('TrustedBrandSettings', TrustedBrandSettingsSchema);

