"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const validation_1 = require("../middleware/validation");
const userSchemas_1 = require("../validators/userSchemas");
const apiResponse_1 = require("../utils/apiResponse");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
// Admin-style CRUD for users (employees)
// GET /users - list all users
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany();
        const formatted = users.map((u) => (0, apiResponse_1.formatUserResponse)(u));
        (0, apiResponse_1.sendSuccess)(res, formatted);
    }
    catch (err) {
        (0, apiResponse_1.sendError)(res, err);
    }
});
// POST /users - create a new user
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { name, email, job, phone, role, avatar, department, joinDate, status, performance } = req.body;
        if (!email)
            return (0, apiResponse_1.sendError)(res, 'Email is required', 400);
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing)
            return (0, apiResponse_1.sendError)(res, 'Email already used', 400);
        const password = req.body.password || 'change_me_123';
        const hashed = await bcryptjs_1.default.hash(password, 10);
        // Map department -> city, map status/performance to dedicated columns
        const createData = {
            name,
            email,
            password: hashed,
            job,
            phone,
            role,
            ...(avatar ? { avatar } : {}),
            ...(department ? { city: department } : {}),
            ...(joinDate ? { createdAt: new Date(joinDate) } : {}),
            ...(status ? { status } : {}),
            ...(performance !== undefined ? { performance: Number(performance) } : {})
        };
        const user = await prisma_1.default.user.create({ data: createData });
        (0, apiResponse_1.sendSuccess)(res, (0, apiResponse_1.formatUserResponse)(user), 'User created', 201);
    }
    catch (err) {
        (0, apiResponse_1.sendError)(res, err);
    }
});
// PUT /users/:id - update a user by id
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    const id = req.params.id;
    try {
        const data = req.body;
        // Build an object with only allowed Prisma fields (map frontend names)
        const updateData = {};
        // Basic direct mappings
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.job !== undefined)
            updateData.job = data.job;
        if (data.role !== undefined)
            updateData.role = data.role;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.avatar !== undefined)
            updateData.avatar = data.avatar;
        // department -> city
        if (data.department !== undefined)
            updateData.city = data.department;
        // joinDate -> createdAt
        if (data.joinDate !== undefined) {
            try {
                updateData.createdAt = new Date(data.joinDate);
            }
            catch (e) {
                // ignore invalid date, do not set
            }
        }
        // password (if provided) should be hashed
        if (data.password) {
            updateData.password = await bcryptjs_1.default.hash(data.password, 10);
        }
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.performance !== undefined)
            updateData.performance = Number(data.performance);
        const updated = await prisma_1.default.user.update({ where: { id }, data: updateData });
        (0, apiResponse_1.sendSuccess)(res, (0, apiResponse_1.formatUserResponse)(updated));
    }
    catch (err) {
        (0, apiResponse_1.sendError)(res, err);
    }
});
// DELETE /users/:id - delete a user by id
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    const id = req.params.id;
    try {
        await prisma_1.default.user.delete({ where: { id } });
        (0, apiResponse_1.sendSuccess)(res, { id }, 'User deleted');
    }
    catch (err) {
        (0, apiResponse_1.sendError)(res, err);
    }
});
// Middleware de vérification d'authentification avec type checking
const checkAuth = (req, res, next) => {
    const userId = req.user?.id;
    if (!userId)
        return (0, apiResponse_1.sendError)(res, 'Not authenticated', 401);
    req.userId = userId;
    next();
};
// GET /users/me - Obtenir le profil complet
router.get('/me', auth_1.requireAuth, checkAuth, async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId }
        });
        if (!user) {
            return (0, apiResponse_1.sendError)(res, 'User not found', 404);
        }
        (0, apiResponse_1.sendSuccess)(res, (0, apiResponse_1.formatUserResponse)(user));
    }
    catch (err) {
        (0, apiResponse_1.sendError)(res, err);
    }
});
// PUT /users/me - Mettre à jour le profil
// Helper pour la mise à jour du profil
async function updateUserProfile(userId, data, avatarPath) {
    return prisma_1.default.user.update({
        where: { id: userId },
        data: {
            ...data,
            ...(avatarPath && { avatar: avatarPath })
        }
    });
}
router.put('/me', auth_1.requireAuth, checkAuth, upload_1.upload.single('avatar'), (0, validation_1.validateRequest)(userSchemas_1.updateProfileSchema), async (req, res) => {
    try {
        const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
        const updatedUser = await updateUserProfile(req.userId, req.validatedData, avatarPath);
        (0, apiResponse_1.sendSuccess)(res, (0, apiResponse_1.formatUserResponse)(updatedUser));
    }
    catch (err) {
        (0, apiResponse_1.sendError)(res, 'Erreur lors de la mise à jour du profil', 500);
    }
});
// PUT /users/me/settings - Mettre à jour les paramètres
// Helper pour la mise à jour des settings
async function updateUserSettings(userId, settings) {
    return prisma_1.default.user.update({
        where: { id: userId },
        data: settings
    });
}
router.put('/me/settings', auth_1.requireAuth, checkAuth, (0, validation_1.validateRequest)(userSchemas_1.updateSettingsSchema), async (req, res) => {
    try {
        const updatedUser = await updateUserSettings(req.userId, req.validatedData);
        (0, apiResponse_1.sendSuccess)(res, (0, apiResponse_1.formatUserResponse)(updatedUser));
    }
    catch (err) {
        (0, apiResponse_1.sendError)(res, 'Erreur lors de la mise à jour des paramètres', 500);
    }
});
// PUT /users/me/social - Mettre à jour les réseaux sociaux
// Helper pour la mise à jour des réseaux sociaux
async function updateUserSocial(userId, social) {
    return prisma_1.default.user.update({
        where: { id: userId },
        data: social
    });
}
router.put('/me/social', auth_1.requireAuth, checkAuth, (0, validation_1.validateRequest)(userSchemas_1.updateSocialSchema), async (req, res) => {
    try {
        const updatedUser = await updateUserSocial(req.userId, req.validatedData);
        (0, apiResponse_1.sendSuccess)(res, (0, apiResponse_1.formatUserResponse)(updatedUser));
    }
    catch (err) {
        (0, apiResponse_1.sendError)(res, 'Erreur lors de la mise à jour des réseaux sociaux', 500);
    }
});
exports.default = router;
