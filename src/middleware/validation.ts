import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { formatZodError } from '../validators/userSchemas';
import { sendError } from '../utils/apiResponse';
import { ProfileUpdateData, SettingsUpdateData, SocialUpdateData } from '../types/userTypes';

export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: formatZodError(validation.error) });
      }
      req.validatedData = validation.data as ProfileUpdateData | SettingsUpdateData | SocialUpdateData;
      next();
    } catch (err) {
      sendError(res, err as Error, 400);
    }
  };
}