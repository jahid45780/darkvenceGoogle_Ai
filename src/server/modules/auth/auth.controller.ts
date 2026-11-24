import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../../config/index.ts';
import { db } from '../../db/store.ts';
import { AuthenticatedRequest } from '../../middlewares/auth.ts';

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.')
});

export const authController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const admin = db.findAdminByEmail(email);

    if (!admin) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid administrative email or password.' }
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid administrative email or password.' }
      });
      return;
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Set secure cookie
    res.cookie(config.cookieName, token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    res.clearCookie(config.cookieName);
    res.json({
      success: true,
      message: 'Successfully logged out.'
    });
  },

  me: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const admin = (req.user?.email && db.findAdminByEmail(req.user.email)) || db.getAdmin();
    res.json({
      success: true,
      data: {
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });
  }
};
