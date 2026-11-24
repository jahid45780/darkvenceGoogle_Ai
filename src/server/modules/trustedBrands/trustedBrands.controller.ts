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
    'Brand logo must be a valid HTTP/HTTPS URL or uploaded image asset path.'
  );

export const trustedBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Brand name is required (minimum 2 characters).')
    .max(100, 'Brand name must be 100 characters or fewer.'),
  industry: z
    .string()
    .trim()
    .min(2, 'Industry / category is required (minimum 2 characters).')
    .max(80, 'Industry / category must be 80 characters or fewer.'),
  description: z
    .string()
    .trim()
    .max(240, 'Short description must be 240 characters or fewer.')
    .optional()
    .default(''),
  logoUrl: safeImageSchema,
  displayOrder: z.coerce
    .number()
    .int('Display order must be a whole number.')
    .min(0, 'Display order cannot be negative.')
    .max(9999, 'Display order cannot exceed 9999.')
    .default(0),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(true)
});

export const trustedBrandUpdateSchema = trustedBrandSchema.partial();

export const trustedBrandStatusSchema = z
  .object({
    isActive: z.boolean().optional(),
    isPublished: z.boolean().optional()
  })
  .refine((data) => data.isActive !== undefined || data.isPublished !== undefined, {
    message: 'At least one status field (isActive or isPublished) must be provided.'
  });

export const trustedBrandSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  heading: z
    .string()
    .trim()
    .min(2, 'Section heading must be at least 2 characters.')
    .max(160, 'Section heading must be 160 characters or fewer.')
    .optional(),
  subtitle: z
    .string()
    .trim()
    .max(280, 'Section subtitle must be 280 characters or fewer.')
    .optional(),
  layoutStyle: z.enum(['grid', 'marquee']).optional(),
  themeMode: z.enum(['auto', 'dark', 'light']).optional()
});

export const trustedBrandsController = {
  // Public: returns section settings + active & published brands ordered by displayOrder
  getPublicTrustedBrands: async (_req: Request, res: Response): Promise<void> => {
    const settings = db.getTrustedBrandsSettings();
    const brands = settings.enabled ? db.getTrustedBrands(false) : [];
    res.json({
      success: true,
      data: {
        settings,
        brands
      }
    });
  },

  // Admin: returns section settings + all brands (including draft & inactive)
  getAdminTrustedBrands: async (_req: Request, res: Response): Promise<void> => {
    const settings = db.getTrustedBrandsSettings();
    const brands = db.getTrustedBrands(true);
    res.json({
      success: true,
      data: {
        settings,
        brands
      }
    });
  },

  // Admin: update global section settings (visibility, heading, subtitle, layout, theme)
  updateSettings: async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await db.updateTrustedBrandsSettings(req.body);
      res.json({
        success: true,
        data: updated,
        message: 'Trusted Brands section settings updated successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SETTINGS_UPDATE_FAILED',
          message: err?.message || 'Failed to update Trusted Brands section settings.'
        }
      });
    }
  },

  createBrand: async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await db.createTrustedBrand(req.body);
      res.status(201).json({
        success: true,
        data: created,
        message: 'Trusted brand created successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: err?.message || 'Failed to create trusted brand.'
        }
      });
    }
  },

  updateBrand: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = db.getTrustedBrandById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Trusted brand with id '${id}' not found.` }
      });
      return;
    }

    try {
      const updated = await db.updateTrustedBrand(id, req.body);
      res.json({
        success: true,
        data: updated,
        message: 'Trusted brand updated successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: err?.message || 'Failed to update trusted brand.'
        }
      });
    }
  },

  updateBrandStatus: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = db.getTrustedBrandById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Trusted brand with id '${id}' not found.` }
      });
      return;
    }

    try {
      const updated = await db.updateTrustedBrand(id, req.body);
      res.json({
        success: true,
        data: updated,
        message: 'Trusted brand status updated successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'STATUS_UPDATE_FAILED',
          message: err?.message || 'Failed to update trusted brand status.'
        }
      });
    }
  },

  deleteBrand: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const existing = db.getTrustedBrandById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Trusted brand with id '${id}' not found.` }
      });
      return;
    }

    try {
      const deleted = await db.deleteTrustedBrand(id);
      if (!deleted) {
        res.status(500).json({
          success: false,
          error: { code: 'DELETE_FAILED', message: 'Failed to delete trusted brand.' }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Trusted brand deleted successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: err?.message || 'Failed to delete trusted brand.'
        }
      });
    }
  }
};
