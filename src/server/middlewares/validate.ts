import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error as any).issues || (error as any).errors || [];
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request payload failed schema validation.',
            details: issues.map((e: any) => ({
              field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
              message: e.message
            }))
          }
        });
        return;
      }
      next(error);
    }
  };
};
