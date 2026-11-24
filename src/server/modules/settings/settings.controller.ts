import { Request, Response } from 'express';
import { db } from '../../db/store.ts';

export const settingsController = {
  getSettings: async (req: Request, res: Response): Promise<void> => {
    const settings = db.getSettings();
    res.json({
      success: true,
      data: settings
    });
  },

  updateSettings: async (req: Request, res: Response): Promise<void> => {
    const updated = db.updateSettings(req.body);
    res.json({
      success: true,
      data: updated,
      message: 'Site configuration updated successfully.'
    });
  }
};
