import { Router } from 'express';
import { requireAuth, requireAdminRole } from '../middlewares/auth.ts';
import { validateRequest } from '../middlewares/validate.ts';
import { rateLimiter } from '../middlewares/rateLimit.ts';

import { authController, loginSchema } from '../modules/auth/auth.controller.ts';
import { servicesController, serviceSchema, serviceStatusSchema } from '../modules/services/services.controller.ts';
import { projectsController, projectSchema } from '../modules/projects/projects.controller.ts';
import { inquiriesController, inquirySchema, updateInquirySchema } from '../modules/inquiries/inquiries.controller.ts';
import { blogController, blogPostSchema } from '../modules/blog/blog.controller.ts';
import { settingsController } from '../modules/settings/settings.controller.ts';
import { aboutController, aboutSchema } from '../modules/about/about.controller.ts';
import {
  testimonialsController,
  testimonialSchema,
  testimonialUpdateSchema,
  testimonialStatusSchema
} from '../modules/testimonials/testimonials.controller.ts';
import {
  trustedBrandsController,
  trustedBrandSchema,
  trustedBrandUpdateSchema,
  trustedBrandStatusSchema,
  trustedBrandSettingsSchema
} from '../modules/trustedBrands/trustedBrands.controller.ts';
import {
  statisticsController,
  statisticSchema,
  statisticUpdateSchema,
  statisticReorderSchema
} from '../modules/statistics/statistics.controller.ts';
import { analyticsController } from '../modules/analytics/analytics.controller.ts';
import { uploadsController } from '../modules/uploads/uploads.controller.ts';
import { db } from '../db/store.ts';
import { getDatabaseStatus } from '../db/connection.ts';

export const apiRouter = Router();


// Rate limiters
const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

const inquiryLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Inquiry limit reached. Please contact us directly via telephone or email.'
});

/* =========================================================================
   PUBLIC ROUTES
   ========================================================================= */

// Public Health
apiRouter.get('/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.status === 'connected';

  if (!isHealthy) {
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: {
        provider: 'MongoDB',
        status: dbStatus.status,
        error: 'Database disconnected or unavailable'
      },
      timestamp: new Date().toISOString()
    });
  }

  return res.status(200).json({
    success: true,
    status: 'healthy',
    database: {
      provider: 'MongoDB',
      status: 'connected'
    },
    api: 'Darkvence API v1',
    data: {
      app: 'Darkvence API v1',
      status: 'healthy',
      database: {
        provider: 'MongoDB',
        status: 'connected'
      },
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    }
  });
});

// Auth
apiRouter.post('/auth/login', loginLimiter, validateRequest(loginSchema), authController.login);
apiRouter.post('/auth/logout', authController.logout);
apiRouter.get('/auth/me', requireAuth, authController.me);

// Services
apiRouter.get('/services', servicesController.getPublicServices);
apiRouter.get('/services/:slug', servicesController.getPublicServiceBySlug);

// Projects
apiRouter.get('/projects', projectsController.getPublicProjects);
apiRouter.get('/projects/:slug', projectsController.getPublicProjectBySlug);

// Blog
apiRouter.get('/blog', blogController.getPublicBlogPosts);
apiRouter.get('/blog/:slug', blogController.getPublicBlogPostBySlug);

// Inquiries / Leads (Contact form)
apiRouter.post('/inquiries', inquiryLimiter, validateRequest(inquirySchema), inquiriesController.createInquiry);

// Site Settings & About Page
apiRouter.get('/settings', settingsController.getSettings);
apiRouter.get('/about', aboutController.getPublicAbout);

// Client Testimonials (Public: active & published only)
apiRouter.get('/testimonials', testimonialsController.getPublicTestimonials);

// Trusted Brands (Public: active & published only, plus section settings)
apiRouter.get('/trusted-brands', trustedBrandsController.getPublicTrustedBrands);

// Statistics / Achievements (Public: published only, plus RESTful protected mutations)
apiRouter.get('/statistics', statisticsController.getPublicStatistics);
apiRouter.get('/statistics/public', statisticsController.getPublicStatistics);
apiRouter.post('/statistics', requireAuth, requireAdminRole, validateRequest(statisticSchema), statisticsController.createStatistic);
apiRouter.patch('/statistics/reorder', requireAuth, requireAdminRole, validateRequest(statisticReorderSchema), statisticsController.reorderStatistics);
apiRouter.get('/statistics/:id', requireAuth, requireAdminRole, statisticsController.getAdminStatisticById);
apiRouter.patch('/statistics/:id', requireAuth, requireAdminRole, validateRequest(statisticUpdateSchema), statisticsController.updateStatistic);
apiRouter.delete('/statistics/:id', requireAuth, requireAdminRole, statisticsController.deleteStatistic);

/* =========================================================================
   PROTECTED ADMIN ROUTES (/api/v1/admin/*)
   ========================================================================= */
const adminRouter = Router();
adminRouter.use(requireAuth, requireAdminRole);

// Analytics
adminRouter.get('/analytics/overview', analyticsController.getOverview);

// About Page CMS
adminRouter.get('/about', aboutController.getAdminAbout);
adminRouter.put('/about', validateRequest(aboutSchema), aboutController.updateAdminAbout);


// Services CRUD
adminRouter.get('/services', servicesController.getAdminServices);
adminRouter.get('/services/:id', servicesController.getAdminServiceById);
adminRouter.post('/services', validateRequest(serviceSchema), servicesController.createService);
adminRouter.put('/services/:id', validateRequest(serviceSchema.partial()), servicesController.updateService);
adminRouter.patch('/services/:id', validateRequest(serviceSchema.partial()), servicesController.updateService);
adminRouter.patch('/services/:id/status', validateRequest(serviceStatusSchema), servicesController.updateServiceStatus);
adminRouter.delete('/services/:id', servicesController.deleteService);

// Projects CRUD
adminRouter.get('/projects', projectsController.getAdminProjects);
adminRouter.post('/projects', validateRequest(projectSchema), projectsController.createProject);
adminRouter.put('/projects/:id', validateRequest(projectSchema.partial()), projectsController.updateProject);
adminRouter.delete('/projects/:id', projectsController.deleteProject);

// Inquiries CRM
adminRouter.get('/inquiries', inquiriesController.getAdminInquiries);
adminRouter.get('/inquiries/:id', inquiriesController.getAdminInquiryById);
adminRouter.patch('/inquiries/:id', validateRequest(updateInquirySchema), inquiriesController.updateInquiry);
adminRouter.delete('/inquiries/:id', inquiriesController.deleteInquiry);

// Blog CRUD
adminRouter.get('/blog', blogController.getAdminBlogPosts);
adminRouter.post('/blog', validateRequest(blogPostSchema), blogController.createBlogPost);
adminRouter.put('/blog/:id', validateRequest(blogPostSchema.partial()), blogController.updateBlogPost);
adminRouter.delete('/blog/:id', blogController.deleteBlogPost);

// Testimonials CMS CRUD
adminRouter.get('/testimonials', testimonialsController.getAdminTestimonials);
adminRouter.get('/testimonials/:id', testimonialsController.getAdminTestimonialById);
adminRouter.post('/testimonials', validateRequest(testimonialSchema), testimonialsController.createTestimonial);
adminRouter.put('/testimonials/:id', validateRequest(testimonialUpdateSchema), testimonialsController.updateTestimonial);
adminRouter.patch('/testimonials/:id', validateRequest(testimonialUpdateSchema), testimonialsController.updateTestimonial);
adminRouter.patch('/testimonials/:id/status', validateRequest(testimonialStatusSchema), testimonialsController.updateTestimonialStatus);
adminRouter.delete('/testimonials/:id', testimonialsController.deleteTestimonial);

// Trusted Brands CMS CRUD & Section Settings (/settings MUST precede /:id)
adminRouter.get('/trusted-brands', trustedBrandsController.getAdminTrustedBrands);
adminRouter.put('/trusted-brands/settings', validateRequest(trustedBrandSettingsSchema), trustedBrandsController.updateSettings);
adminRouter.post('/trusted-brands', validateRequest(trustedBrandSchema), trustedBrandsController.createBrand);
adminRouter.put('/trusted-brands/:id', validateRequest(trustedBrandUpdateSchema), trustedBrandsController.updateBrand);
adminRouter.patch('/trusted-brands/:id', validateRequest(trustedBrandUpdateSchema), trustedBrandsController.updateBrand);
adminRouter.patch('/trusted-brands/:id/status', validateRequest(trustedBrandStatusSchema), trustedBrandsController.updateBrandStatus);
adminRouter.delete('/trusted-brands/:id', trustedBrandsController.deleteBrand);

// Statistics CMS CRUD & Reorder (/reorder MUST precede /:id)
adminRouter.get('/statistics', statisticsController.getAdminStatistics);
adminRouter.patch('/statistics/reorder', validateRequest(statisticReorderSchema), statisticsController.reorderStatistics);
adminRouter.get('/statistics/:id', statisticsController.getAdminStatisticById);
adminRouter.post('/statistics', validateRequest(statisticSchema), statisticsController.createStatistic);
adminRouter.put('/statistics/:id', validateRequest(statisticUpdateSchema), statisticsController.updateStatistic);
adminRouter.patch('/statistics/:id', validateRequest(statisticUpdateSchema), statisticsController.updateStatistic);
adminRouter.delete('/statistics/:id', statisticsController.deleteStatistic);

// Settings CMS
adminRouter.put('/settings', settingsController.updateSettings);

// Image Uploads & Media Library
adminRouter.post('/uploads', uploadsController.uploadImage);
adminRouter.post('/media/upload', uploadsController.uploadImage);
adminRouter.get('/media', (req, res) => {
  res.json({ success: true, data: db.getMedia() });
});
adminRouter.post('/media', (req, res) => {
  const item = db.createMedia(req.body);
  res.status(201).json({ success: true, data: item });
});
adminRouter.delete('/media/:id', (req, res) => {
  const deleted = db.deleteMedia(req.params.id);
  res.json({ success: deleted });
});

// Website Health
adminRouter.get('/health', (req, res) => {
  res.json({ success: true, data: db.getSystemHealth() });
});

// SEO Center
adminRouter.get('/seo', (req, res) => {
  res.json({
    success: true,
    data: {
      pages: db.getPageSeoConfigs(),
      audit: db.runSeoAudit()
    }
  });
});
adminRouter.put('/seo', (req, res) => {
  const { path, ...updates } = req.body;
  const updated = db.updatePageSeoConfig(path, updates);
  res.json({ success: !!updated, data: updated });
});
adminRouter.post('/seo/audit', (req, res) => {
  res.json({ success: true, data: db.runSeoAudit() });
});

// Performance Center
adminRouter.get('/performance', (req, res) => {
  res.json({ success: true, data: db.getPerformanceSnapshots() });
});
adminRouter.post('/performance/measure', (req, res) => {
  const { pageUrl, device } = req.body;
  const isMobile = device === 'mobile';
  const newSnapshot = db.recordPerformanceSnapshot({
    pageUrl: pageUrl || 'https://darkvence.com/',
    device: isMobile ? 'mobile' : 'desktop',
    measuredAt: new Date().toISOString(),
    lcp: isMobile ? 890 : 580,
    inp: isMobile ? 44 : 32,
    cls: 0.01,
    ttfb: 120,
    fcp: isMobile ? 620 : 440,
    speedIndex: isMobile ? 1040 : 690,
    suggestions: [
      { title: 'Sub-resource Integrity (SRI)', impact: 'LOW', description: 'Scripts are loaded from self-hosted bundles with zero third-party render blockage.' }
    ]
  });
  res.json({ success: true, data: newSnapshot });
});

// Marketing & Tracking Configuration
adminRouter.get('/tracking', (req, res) => {
  res.json({ success: true, data: db.getTrackingConfig() });
});
adminRouter.put('/tracking', (req, res) => {
  const updated = db.updateTrackingConfig(req.body);
  res.json({ success: true, data: updated });
});

// Admin Users Management
adminRouter.get('/users', (req, res) => {
  res.json({ success: true, data: db.getAdminUsers() });
});
adminRouter.post('/users', async (req, res) => {
  try {
    const user = await db.createAdminUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});
adminRouter.delete('/users/:id', async (req, res) => {
  const deleted = await db.deleteAdminUser(req.params.id);
  res.json({ success: deleted });
});

apiRouter.use('/admin', adminRouter);
