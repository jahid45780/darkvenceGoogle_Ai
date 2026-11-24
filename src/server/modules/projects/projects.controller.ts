import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/store.ts';

export const projectSchema = z.object({
  title: z.string().min(2, 'Title is required.'),
  slug: z.string().min(2, 'Slug is required.'),
  client: z.string().optional(),
  category: z.enum([
    'Website Development',
    'Mobile Application',
    'CMS Development',
    'Custom Software',
    'Performance Marketing'
  ]),
  description: z.string().min(10, 'Description is required.'),
  challenge: z.string().min(10, 'Challenge description is required.'),
  solution: z.string().min(10, 'Solution description is required.'),
  results: z.array(z.object({
    metric: z.string(),
    label: z.string()
  })).default([]),
  technologies: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1, 'At least one project image is required.'),
  projectUrl: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['published', 'draft']).default('published'),
  order: z.number().default(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional()
});

export const projectsController = {
  getPublicProjects: async (req: Request, res: Response): Promise<void> => {
    const category = req.query.category as string;
    let projects = db.getProjects(false);

    if (category && category !== 'All') {
      projects = projects.filter(p => p.category === category);
    }

    res.json({
      success: true,
      data: projects
    });
  },

  getPublicProjectBySlug: async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const project = db.getProjectBySlug(slug);

    if (!project || project.status !== 'published') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project case study not found.' }
      });
      return;
    }

    res.json({
      success: true,
      data: project
    });
  },

  getAdminProjects: async (req: Request, res: Response): Promise<void> => {
    const projects = db.getProjects(true);
    res.json({
      success: true,
      data: projects
    });
  },

  createProject: async (req: Request, res: Response): Promise<void> => {
    const created = db.createProject(req.body);
    res.status(201).json({
      success: true,
      data: created
    });
  },

  updateProject: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updated = db.updateProject(id, req.body);

    if (!updated) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found.' }
      });
      return;
    }

    res.json({
      success: true,
      data: updated
    });
  },

  deleteProject: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const deleted = db.deleteProject(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found.' }
      });
      return;
    }

    res.json({
      success: true,
      message: 'Project deleted successfully.'
    });
  }
};
