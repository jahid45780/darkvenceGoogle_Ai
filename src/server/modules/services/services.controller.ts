import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/store.ts';

export const serviceSchema = z.object({
  title: z.string().min(2, 'Title is required (minimum 2 characters).'),
  slug: z.string().min(2, 'Slug is required.').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens.'),
  shortDescription: z.string().min(10, 'Short description is required (minimum 10 characters).'),
  fullDescription: z.string().min(20, 'Full description is required (minimum 20 characters).'),
  icon: z.string().default('Globe'),
  category: z.string().optional().default('Engineering'),
  coverImage: z.string().optional(),
  ogImage: z.string().optional(),
  features: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  process: z.array(z.object({
    step: z.string(),
    title: z.string(),
    description: z.string()
  })).default([]),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).default([]),
  featured: z.boolean().default(false),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
  order: z.number().default(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional()
});

export const serviceStatusSchema = z.object({
  status: z.enum(['published', 'draft', 'archived'])
});

export const servicesController = {
  // Public: Published only
  getPublicServices: async (req: Request, res: Response): Promise<void> => {
    const services = db.getServices(false);
    res.json({
      success: true,
      data: services
    });
  },

  getPublicServiceBySlug: async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const service = db.getServiceBySlug(slug);

    if (!service || service.status !== 'published') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found or not currently published.' }
      });
      return;
    }

    res.json({
      success: true,
      data: service
    });
  },

  // Admin: All
  getAdminServices: async (req: Request, res: Response): Promise<void> => {
    const services = db.getServices(true);
    res.json({
      success: true,
      data: services
    });
  },

  getAdminServiceById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const service = db.getServiceById(id);

    if (!service) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Service with id '${id}' not found.` }
      });
      return;
    }

    res.json({
      success: true,
      data: service
    });
  },

  createService: async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.body;

    // Check duplicate slug
    const existing = db.getServiceBySlug(slug);
    if (existing) {
      res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_SLUG', message: `A service with the slug '${slug}' already exists. Please choose a unique URL slug.` }
      });
      return;
    }

    const created = db.createService(req.body);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Service created successfully.'
    });
  },

  updateService: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { slug } = req.body;

    // Check if service exists
    const existing = db.getServiceById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Service with id '${id}' not found.` }
      });
      return;
    }

    // Check duplicate slug if slug is being updated
    if (slug && slug !== existing.slug) {
      const slugClash = db.getServiceBySlug(slug);
      if (slugClash && slugClash.id !== id) {
        res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE_SLUG', message: `A service with the slug '${slug}' already exists.` }
        });
        return;
      }
    }

    const updated = db.updateService(id, req.body);
    res.json({
      success: true,
      data: updated,
      message: 'Service updated successfully.'
    });
  },

  updateServiceStatus: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    const existing = db.getServiceById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Service with id '${id}' not found.` }
      });
      return;
    }

    const updated = db.updateService(id, { status });
    res.json({
      success: true,
      data: updated,
      message: `Service status set to '${status}'.`
    });
  },

  deleteService: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = db.getServiceById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found.' }
      });
      return;
    }

    // Safe deletion check - check if any projects link to this service
    const projects = db.getProjects(true);
    const relatedProjects = projects.filter(p => p.category === existing.title || p.title.toLowerCase().includes(existing.title.toLowerCase()));

    const deleted = db.deleteService(id);
    if (!deleted) {
      res.status(500).json({
        success: false,
        error: { code: 'DELETE_FAILED', message: 'Failed to delete service.' }
      });
      return;
    }

    res.json({
      success: true,
      message: 'Service deleted successfully.',
      relatedProjectsCount: relatedProjects.length
    });
  }
};
