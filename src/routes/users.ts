import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validateRequest } from '../middleware/validation';
import { 
  updateProfileSchema, 
  updateSettingsSchema, 
  updateSocialSchema
} from '../validators/userSchemas';
import { sendSuccess, sendError, formatUserResponse } from '../utils/apiResponse';
import { 
  ProfileUpdateData, 
  SettingsUpdateData, 
  SocialUpdateData 
} from '../types/userTypes';
import bcrypt from 'bcryptjs';

const router = Router();

// Admin-style CRUD for users (employees)
// GET /users - list all users
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    const formatted = users.map((u) => formatUserResponse(u));
    sendSuccess(res, formatted);
  } catch (err) {
    sendError(res, err as Error);
  }
});

// POST /users - create a new user
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, email, job, phone, role, avatar, department, joinDate, status, performance } = req.body as any;
    if (!email) return sendError(res, 'Email is required', 400);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return sendError(res, 'Email already used', 400);

    const password = req.body.password || 'change_me_123';
    const hashed = await bcrypt.hash(password, 10);

    // Map department -> city, map status/performance to dedicated columns
    const createData: any = {
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

    const user = await prisma.user.create({ data: createData });

    sendSuccess(res, formatUserResponse(user), 'User created', 201);
  } catch (err) {
    sendError(res, err as Error);
  }
});

// PUT /users/:id - update a user by id
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const data = req.body as any;

    // Build an object with only allowed Prisma fields (map frontend names)
    const updateData: any = {};

    // Basic direct mappings
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.job !== undefined) updateData.job = data.job;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    // department -> city
    if (data.department !== undefined) updateData.city = data.department;

    // joinDate -> createdAt
    if (data.joinDate !== undefined) {
      try {
        updateData.createdAt = new Date(data.joinDate);
      } catch (e) {
        // ignore invalid date, do not set
      }
    }

    // password (if provided) should be hashed
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (data.status !== undefined) updateData.status = data.status;
    if (data.performance !== undefined) updateData.performance = Number(data.performance);

    const updated = await prisma.user.update({ where: { id }, data: updateData });
    sendSuccess(res, formatUserResponse(updated));
  } catch (err) {
    sendError(res, err as Error);
  }
});

// DELETE /users/:id - delete a user by id
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await prisma.user.delete({ where: { id } });
    sendSuccess(res, { id }, 'User deleted');
  } catch (err) {
    sendError(res, err as Error);
  }
});

// Middleware de vérification d'authentification avec type checking
const checkAuth = (req: Request & { user?: { id: string }; userId?: string }, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return sendError(res, 'Not authenticated', 401);
  req.userId = userId;
  next();
};

// GET /users/me - Obtenir le profil complet
router.get('/me', requireAuth, checkAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.userId }
    });
    
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, formatUserResponse(user));
  } catch (err) {
    sendError(res, err as Error);
  }
});

// PUT /users/me - Mettre à jour le profil
// Helper pour la mise à jour du profil
async function updateUserProfile(
  userId: string, 
  data: ProfileUpdateData, 
  avatarPath?: string
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      ...(avatarPath && { avatar: avatarPath })
    }
  });
}

router.put('/me',
  requireAuth,
  checkAuth,
  upload.single('avatar'),
  validateRequest(updateProfileSchema),
  async (req: Request, res: Response) => {
    try {
      const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
      const updatedUser = await updateUserProfile(
        req.userId!,
        req.validatedData as ProfileUpdateData,
        avatarPath
      );
      sendSuccess(res, formatUserResponse(updatedUser));
    } catch (err) {
      sendError(res, 'Erreur lors de la mise à jour du profil', 500);
    }
  }
);

// PUT /users/me/settings - Mettre à jour les paramètres
// Helper pour la mise à jour des settings
async function updateUserSettings(userId: string, settings: SettingsUpdateData) {
  return prisma.user.update({
    where: { id: userId },
    data: settings
  });
}

router.put('/me/settings',
  requireAuth,
  checkAuth,
  validateRequest(updateSettingsSchema),
  async (req: Request, res: Response) => {
    try {
      const updatedUser = await updateUserSettings(
        req.userId!,
        req.validatedData as SettingsUpdateData
      );
      sendSuccess(res, formatUserResponse(updatedUser));
    } catch (err) {
      sendError(res, 'Erreur lors de la mise à jour des paramètres', 500);
    }
  }
);

// PUT /users/me/social - Mettre à jour les réseaux sociaux
// Helper pour la mise à jour des réseaux sociaux
async function updateUserSocial(userId: string, social: SocialUpdateData) {
  return prisma.user.update({
    where: { id: userId },
    data: social
  });
}

router.put('/me/social',
  requireAuth,
  checkAuth,
  validateRequest(updateSocialSchema),
  async (req: Request, res: Response) => {
    try {
      const updatedUser = await updateUserSocial(
        req.userId!,
        req.validatedData as SocialUpdateData
      );
      sendSuccess(res, formatUserResponse(updatedUser));
    } catch (err) {
      sendError(res, 'Erreur lors de la mise à jour des réseaux sociaux', 500);
    }
  }
);

export default router;
