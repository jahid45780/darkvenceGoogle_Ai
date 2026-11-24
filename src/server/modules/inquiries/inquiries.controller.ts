import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/store.ts';

export const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().optional(),
  company: z.string().optional(),
  serviceInterested: z.string().optional().default('General Inquiry'),
  budgetRange: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  website_source_hp: z.string().optional() // Honeypot field
});

export const updateInquirySchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'SPAM']).optional(),
  internalNotes: z.string().optional()
});

export const inquiriesController = {
  createInquiry: async (req: Request, res: Response): Promise<void> => {
    const { website_source_hp, ...inquiryData } = req.body;

    // Honeypot spam check: if bot filled this hidden field, return success fake message but ignore
    if (website_source_hp && website_source_hp.trim().length > 0) {
      res.status(200).json({
        success: true,
        message: 'Your inquiry has been received. Our team will contact you shortly.'
      });
      return;
    }

    const created = db.createInquiry({
      ...inquiryData,
      ip: req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. A Darkvence technical partner will respond within 24 business hours.',
      data: {
        id: created.id,
        createdAt: created.createdAt
      }
    });
  },

  getAdminInquiries: async (req: Request, res: Response): Promise<void> => {
    const { status, search } = req.query;
    let inquiries = db.getInquiries();

    if (status && status !== 'ALL') {
      inquiries = inquiries.filter(i => i.status === status);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      inquiries = inquiries.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.company && i.company.toLowerCase().includes(q)) ||
        i.serviceInterested.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      data: inquiries,
      meta: {
        total: inquiries.length,
        unread: inquiries.filter(i => i.status === 'NEW').length
      }
    });
  },

  getAdminInquiryById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const inquiry = db.getInquiryById(id);

    if (!inquiry) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Inquiry not found.' }
      });
      return;
    }

    res.json({
      success: true,
      data: inquiry
    });
  },

  updateInquiry: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updated = db.updateInquiry(id, req.body);

    if (!updated) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Inquiry not found.' }
      });
      return;
    }

    res.json({
      success: true,
      data: updated
    });
  },

  deleteInquiry: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const deleted = db.deleteInquiry(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Inquiry not found.' }
      });
      return;
    }

    res.json({
      success: true,
      message: 'Inquiry removed.'
    });
  }
};
