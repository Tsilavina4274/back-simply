import { Request } from 'express';
import multer from 'multer';
import { ProfileUpdateData, SettingsUpdateData, SocialUpdateData } from './userTypes';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      userId?: string;
      validatedData?: ProfileUpdateData | SettingsUpdateData | SocialUpdateData;
      file?: multer.File;
    }
  }
}