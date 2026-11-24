import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/store.ts';

export const aboutSchema = z.object({
  hero: z.object({
    heading: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    ctaText: z.string().optional(),
    ctaUrl: z.string().optional()
  }).optional(),
  company: z.object({
    name: z.string().optional(),
    intro: z.string().optional(),
    description: z.string().optional(),
    logoUrl: z.string().optional(),
    mission: z.string().optional(),
    vision: z.string().optional(),
    yearEstablished: z.string().optional(),
    values: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string()
    })).optional(),
    stats: z.array(z.object({
      id: z.string(),
      value: z.string(),
      label: z.string(),
      suffix: z.string().optional()
    })).optional()
  }).optional(),

  teamMembers: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
    role: z.string().min(1, 'Designation is required'),
    company: z.string().optional().default('DARKVENCE'),
    avatarUrl: z.string().optional().default('/src/assets/images/hero_darkvence_digital_1790497052243.jpg'),
    bio: z.string().optional().default(''),
    linkedin: z.string().optional(),
    portfolio: z.string().optional(),
    order: z.number().optional().default(1),
    isActive: z.boolean().optional().default(true)
  })).optional(),
  sectionsVisibility: z.object({
    showJourney: z.boolean().optional().default(true),
    showServices: z.boolean().optional().default(true),
    showTechStack: z.boolean().optional().default(true),
    showWhyChooseUs: z.boolean().optional().default(true),
    showTestimonials: z.boolean().optional().default(true)
  }).optional(),
  journey: z.array(z.object({
    id: z.string(),
    year: z.string(),
    title: z.string(),
    description: z.string().optional().default('')
  })).optional(),
  techStack: z.array(z.object({
    id: z.string(),
    category: z.string(),
    items: z.array(z.string()).optional().default([])
  })).optional(),
  whyChooseUs: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional().default(''),
    metric: z.string().optional()
  })).optional()
});


export const aboutController = {
  getPublicAbout: (_req: Request, res: Response): void => {
    try {
      const data = db.getAboutData();
      // For public view, filter active team members and sort by order
      const publicTeam = (data.teamMembers || [])
        .filter(m => m.isActive !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      res.json({
        success: true,
        data: {
          ...data,
          teamMembers: publicTeam
        }
      });
    } catch (err: any) {
      console.error('[getPublicAbout error]:', err);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to retrieve About page data.' }
      });
    }
  },

  getAdminAbout: (_req: Request, res: Response): void => {
    try {
      const data = db.getAboutData();
      res.json({
        success: true,
        data
      });
    } catch (err: any) {
      console.error('[getAdminAbout error]:', err);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to retrieve Admin About page data.' }
      });
    }
  },

  updateAdminAbout: (req: Request, res: Response): void => {
    try {
      const updated = db.updateAboutData(req.body);
      res.json({
        success: true,
        data: updated,
        message: 'About page configuration updated successfully.'
      });
    } catch (err: any) {
      console.error('[updateAdminAbout error]:', err);
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to persist About page updates.' }
      });
    }
  }
};
