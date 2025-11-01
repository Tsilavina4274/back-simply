import { z } from 'zod';
import { 
  updateProfileSchema, 
  updateSettingsSchema, 
  updateSocialSchema 
} from '../validators/userSchemas';

// Types inférés à partir des schémas Zod
export type ProfileUpdateData = z.infer<typeof updateProfileSchema>;
export type SettingsUpdateData = z.infer<typeof updateSettingsSchema>;
export type SocialUpdateData = z.infer<typeof updateSocialSchema>;

// Extension de Request pour inclure les données validées
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      validatedData?: ProfileUpdateData | SettingsUpdateData | SocialUpdateData;
    }
  }
}