import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/store.ts';

const ID_PATTERN = /^[a-zA-Z0-9_-]{3,80}$/;

const cleanAffix = (val: string) => val.replace(/[\r\n\t\0]/g, '');

export const statisticSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, 'Statistic value is required.')
    .max(40, 'Statistic value must be 40 characters or fewer.'),
  prefix: z
    .string()
    .max(20, 'Prefix must be 20 characters or fewer.')
    .transform(cleanAffix)
    .optional()
    .default(''),
  suffix: z
    .string()
    .max(20, 'Suffix must be 20 characters or fewer.')
    .transform(cleanAffix)
    .optional()
    .default(''),
  title: z
    .string()
    .trim()
    .min(2, 'Statistic title is required (minimum 2 characters).')
    .max(100, 'Statistic title must be 100 characters or fewer.'),
  description: z
    .string()
    .trim()
    .max(240, 'Description must be 240 characters or fewer.')
    .optional()
    .default(''),
  order: z.coerce
    .number()
    .int('Display order must be a whole number.')
    .min(0, 'Display order cannot be negative.')
    .max(9999, 'Display order cannot exceed 9999.')
    .default(0),
  isPublished: z.boolean().default(true)
});

export const statisticUpdateSchema = statisticSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update a statistic.'
  });

export const statisticReorderSchema = z.object({
  orderedIds: z
    .array(
      z
        .string()
        .trim()
        .regex(ID_PATTERN, 'Each statistic ID must be a valid identifier.')
    )
    .min(1, 'At least one statistic ID is required for reordering.')
});

export const statisticsController = {
  // Public: returns published statistics sorted by order ascending
  getPublicStatistics: async (_req: Request, res: Response): Promise<void> => {
    const statistics = db.getStatistics(false);
    res.json({
      success: true,
      data: statistics
    });
  },

  // Admin: returns all statistics (published and unpublished) sorted by order ascending
  getAdminStatistics: async (_req: Request, res: Response): Promise<void> => {
    const statistics = db.getStatistics(true);
    res.json({
      success: true,
      data: statistics
    });
  },

  // Admin: get single statistic by id
  getAdminStatisticById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!ID_PATTERN.test(id)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid statistic identifier format.' }
      });
      return;
    }

    const existing = db.getStatisticById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Statistic with id '${id}' not found.` }
      });
      return;
    }

    res.json({
      success: true,
      data: existing
    });
  },

  // Admin: create statistic
  createStatistic: async (req: Request, res: Response): Promise<void> => {
    try {
      const existingAll = db.getStatistics(true);
      const nextOrder =
        req.body.order !== undefined
          ? req.body.order
          : existingAll.length > 0
            ? Math.max(...existingAll.map((s) => s.order ?? 0)) + 1
            : 1;

      const created = await db.createStatistic({
        ...req.body,
        order: nextOrder
      });

      res.status(201).json({
        success: true,
        data: created,
        message: 'Statistic created successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: err?.message || 'Failed to create statistic.'
        }
      });
    }
  },

  // Admin: update statistic fields / visibility
  updateStatistic: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!ID_PATTERN.test(id)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid statistic identifier format.' }
      });
      return;
    }

    const existing = db.getStatisticById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Statistic with id '${id}' not found.` }
      });
      return;
    }

    try {
      const updated = await db.updateStatistic(id, req.body);
      res.json({
        success: true,
        data: updated,
        message: 'Statistic updated successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: err?.message || 'Failed to update statistic.'
        }
      });
    }
  },

  // Admin: delete statistic
  deleteStatistic: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!ID_PATTERN.test(id)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid statistic identifier format.' }
      });
      return;
    }

    const existing = db.getStatisticById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Statistic with id '${id}' not found.` }
      });
      return;
    }

    try {
      const deleted = await db.deleteStatistic(id);
      if (!deleted) {
        res.status(500).json({
          success: false,
          error: { code: 'DELETE_FAILED', message: 'Failed to delete statistic.' }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Statistic deleted successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: err?.message || 'Failed to delete statistic.'
        }
      });
    }
  },

  // Admin: reorder statistics cleanly
  reorderStatistics: async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderedIds } = req.body as { orderedIds: string[] };
      const reordered = await db.reorderStatistics(orderedIds);
      res.json({
        success: true,
        data: reordered,
        message: 'Statistics order updated successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'REORDER_FAILED',
          message: err?.message || 'Failed to reorder statistics.'
        }
      });
    }
  }
};
