import { z } from 'zod';

// Schema de base pour les champs communs
const userBaseSchema = {
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères')
             .max(50, 'Le prénom ne doit pas dépasser 50 caractères')
             .nullable()
             .optional(),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères')
            .max(50, 'Le nom ne doit pas dépasser 50 caractères')
            .nullable()
            .optional(),
  phone: z.string().regex(/^\+?[0-9\s-]{8,}$/, 'Format de téléphone invalide')
         .nullable()
         .optional(),
  bio: z.string().max(500, 'La bio ne doit pas dépasser 500 caractères')
       .nullable()
       .optional(),
  job: z.string().max(100, 'Le métier ne doit pas dépasser 100 caractères')
       .nullable()
       .optional(),
  country: z.string().max(100, 'Le pays ne doit pas dépasser 100 caractères')
           .nullable()
           .optional(),
  city: z.string().max(100, 'La ville ne doit pas dépasser 100 caractères')
        .nullable()
        .optional(),
  postalCode: z.string().max(20, 'Le code postal ne doit pas dépasser 20 caractères')
              .nullable()
              .optional(),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
            .nullable()
            .optional(),
};

// Schema pour la mise à jour du profil
export const updateProfileSchema = z.object({
  ...userBaseSchema,
}).strict();

// Schema pour les paramètres
export const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
  securityAlerts: z.boolean().default(true),
}).strict();

// Schema pour les réseaux sociaux
export const updateSocialSchema = z.object({
  facebook: z.string().url('L\'URL Facebook n\'est pas valide')
            .nullable()
            .optional(),
  twitter: z.string().url('L\'URL Twitter n\'est pas valide')
           .nullable()
           .optional(),
  instagram: z.string().url('L\'URL Instagram n\'est pas valide')
             .nullable()
             .optional(),
  linkedin: z.string().url('L\'URL LinkedIn n\'est pas valide')
            .nullable()
            .optional(),
}).strict();

// Type d'erreur de validation personnalisé
export interface ValidationError {
  field: string;
  message: string;
}

// Type pour les erreurs Zod
type ZodValidationError = {
  path: (string | number)[];
  message: string;
};

// Fonction helper pour formater les erreurs Zod
export function formatZodError(error: z.ZodError<any>): ValidationError[] {
  return error.issues.map((err): ValidationError => ({
    field: err.path.join('.'),
    message: err.message
  }));
}