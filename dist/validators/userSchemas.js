"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSocialSchema = exports.updateSettingsSchema = exports.updateProfileSchema = void 0;
exports.formatZodError = formatZodError;
const zod_1 = require("zod");
// Schema de base pour les champs communs
const userBaseSchema = {
    firstName: zod_1.z.string().min(2, 'Le prénom doit contenir au moins 2 caractères')
        .max(50, 'Le prénom ne doit pas dépasser 50 caractères')
        .nullable()
        .optional(),
    lastName: zod_1.z.string().min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(50, 'Le nom ne doit pas dépasser 50 caractères')
        .nullable()
        .optional(),
    phone: zod_1.z.string().regex(/^\+?[0-9\s-]{8,}$/, 'Format de téléphone invalide')
        .nullable()
        .optional(),
    bio: zod_1.z.string().max(500, 'La bio ne doit pas dépasser 500 caractères')
        .nullable()
        .optional(),
    job: zod_1.z.string().max(100, 'Le métier ne doit pas dépasser 100 caractères')
        .nullable()
        .optional(),
    country: zod_1.z.string().max(100, 'Le pays ne doit pas dépasser 100 caractères')
        .nullable()
        .optional(),
    city: zod_1.z.string().max(100, 'La ville ne doit pas dépasser 100 caractères')
        .nullable()
        .optional(),
    postalCode: zod_1.z.string().max(20, 'Le code postal ne doit pas dépasser 20 caractères')
        .nullable()
        .optional(),
    birthday: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
        .nullable()
        .optional(),
};
// Schema pour la mise à jour du profil
exports.updateProfileSchema = zod_1.z.object({
    ...userBaseSchema,
}).strict();
// Schema pour les paramètres
exports.updateSettingsSchema = zod_1.z.object({
    emailNotifications: zod_1.z.boolean().default(false),
    pushNotifications: zod_1.z.boolean().default(false),
    marketingEmails: zod_1.z.boolean().default(false),
    securityAlerts: zod_1.z.boolean().default(true),
}).strict();
// Schema pour les réseaux sociaux
exports.updateSocialSchema = zod_1.z.object({
    facebook: zod_1.z.string().url('L\'URL Facebook n\'est pas valide')
        .nullable()
        .optional(),
    twitter: zod_1.z.string().url('L\'URL Twitter n\'est pas valide')
        .nullable()
        .optional(),
    instagram: zod_1.z.string().url('L\'URL Instagram n\'est pas valide')
        .nullable()
        .optional(),
    linkedin: zod_1.z.string().url('L\'URL LinkedIn n\'est pas valide')
        .nullable()
        .optional(),
}).strict();
// Fonction helper pour formater les erreurs Zod
function formatZodError(error) {
    return error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
    }));
}
