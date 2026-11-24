import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/store.ts';

const safeImageSchema = z
  .string()
  .trim()
  .optional()
  .default('')
  .refine(
    (val) =>
      !val ||
      val.startsWith('http://') ||
      val.startsWith('https://') ||
      val.startsWith('/uploads/') ||
      val.startsWith('/assets/') ||
      val.startsWith('/src/assets/') ||
      val.startsWith('/images/') ||
      val.startsWith('data:image/'),
    'Image must be a valid HTTP/HTTPS URL or uploaded image asset path.'
  );

export const testimonialSchema = z.object({
  name: z.string().trim().min(2, 'Client name is required (minimum 2 characters).').max(100, 'Client name must be 100 characters or fewer.'),
  designation: z.string().trim().min(2, 'Client designation/role is required (minimum 2 characters).').max(120, 'Designation must be 120 characters or fewer.'),
  company: z.string().trim().min(1, 'Company name is required.').max(120, 'Company name must be 120 characters or fewer.'),
  content: z.string().trim().min(10, 'Testimonial text must be at least 10 characters.').max(2000, 'Testimonial text must be 2000 characters or fewer.'),
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5.').max(5, 'Rating must be between 1 and 5.').default(5),
  image: safeImageSchema,
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0, 'Display order cannot be negative.').max(9999).default(0)
});

export const testimonialUpdateSchema = testimonialSchema.partial();

export const testimonialStatusSchema = z
  .object({
    isActive: z.boolean().optional(),
    isPublished: z.boolean().optional()
  })
  .refine((data) => data.isActive !== undefined || data.isPublished !== undefined, {
    message: 'At least one status field (isActive or isPublished) must be provided.'
  });

export const testimonialsController = {
  // Public: Active and published testimonials only, ordered by displayOrder
  getPublicTestimonials: async (req: Request, res: Response): Promise<void> => {
    const testimonials = db.getTestimonials(false);
    res.json({
      success: true,
      data: testimonials
    });
  },

  // Admin: All testimonials
  getAdminTestimonials: async (req: Request, res: Response): Promise<void> => {
    const testimonials = db.getTestimonials(true);
    res.json({
      success: true,
      data: testimonials
    });
  },

  getAdminTestimonialById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const testimonial = db.getTestimonialById(id);

    if (!testimonial) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Testimonial with id '${id}' not found.` }
      });
      return;
    }

    res.json({
      success: true,
      data: testimonial
    });
  },

  createTestimonial: async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await db.createTestimonial(req.body);
      res.status(201).json({
        success: true,
        data: created,
        message: 'Testimonial created successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'CREATE_FAILED', message: err?.message || 'Failed to create testimonial.' }
      });
    }
  },

  updateTestimonial: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = db.getTestimonialById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Testimonial with id '${id}' not found.` }
      });
      return;
    }

    try {
      const updated = await db.updateTestimonial(id, req.body);
      res.json({
        success: true,
        data: updated,
        message: 'Testimonial updated successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: err?.message || 'Failed to update testimonial.' }
      });
    }
  },

  updateTestimonialStatus: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = db.getTestimonialById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Testimonial with id '${id}' not found.` }
      });
      return;
    }

    try {
      const updated = await db.updateTestimonial(id, req.body);
      res.json({
        success: true,
        data: updated,
        message: 'Testimonial visibility updated successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'STATUS_UPDATE_FAILED', message: err?.message || 'Failed to update testimonial status.' }
      });
    }
  },

  deleteTestimonial: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = db.getTestimonialById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Testimonial with id '${id}' not found.` }
      });
      return;
    }

    try {
      const deleted = await db.deleteTestimonial(id);
      if (!deleted) {
        res.status(500).json({
          success: false,
          error: { code: 'DELETE_FAILED', message: 'Failed to delete testimonial.' }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Testimonial deleted successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'DELETE_FAILED', message: err?.message || 'Failed to delete testimonial.' }
      });
    }
  }
};
