import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/store.ts';

export const blogPostSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  slug: z.string().min(3, 'Slug is required.'),
  excerpt: z.string().min(10, 'Excerpt is required.'),
  content: z.string().min(20, 'Content is required.'),
  coverImage: z.string().min(1, 'Cover image is required.'),
  author: z.object({
    name: z.string(),
    role: z.string(),
    avatar: z.string().optional()
  }),
  category: z.string().min(2, 'Category is required.'),
  tags: z.array(z.string()).default([]),
  readTime: z.string().default('5 min read'),
  status: z.enum(['published', 'draft', 'scheduled']).default('published'),
  publishedAt: z.string().default(new Date().toISOString()),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional()
});

export const blogController = {
  getPublicBlogPosts: async (req: Request, res: Response): Promise<void> => {
    const { category, search, tag } = req.query;
    let posts = db.getBlogPosts(false);

    if (category && category !== 'All') {
      posts = posts.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (tag) {
      posts = posts.filter(p => p.tags.some(t => t.toLowerCase() === (tag as string).toLowerCase()));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      data: posts
    });
  },

  getPublicBlogPostBySlug: async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const post = db.getBlogPostBySlug(slug);

    if (!post || post.status !== 'published') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Article not found.' }
      });
      return;
    }

    res.json({
      success: true,
      data: post
    });
  },

  getAdminBlogPosts: async (req: Request, res: Response): Promise<void> => {
    const posts = db.getBlogPosts(true);
    res.json({
      success: true,
      data: posts
    });
  },

  createBlogPost: async (req: Request, res: Response): Promise<void> => {
    const created = db.createBlogPost(req.body);
    res.status(201).json({
      success: true,
      data: created
    });
  },

  updateBlogPost: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updated = db.updateBlogPost(id, req.body);

    if (!updated) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Article not found.' }
      });
      return;
    }

    res.json({
      success: true,
      data: updated
    });
  },

  deleteBlogPost: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const deleted = db.deleteBlogPost(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Article not found.' }
      });
      return;
    }

    res.json({
      success: true,
      message: 'Article removed successfully.'
    });
  }
};
