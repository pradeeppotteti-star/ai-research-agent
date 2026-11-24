import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';
import { isMongoConnected } from '../config/db';
import { localDb } from '../services/storage/localDb.service';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (isMongoConnected()) {
      try {
        const user = await User.findById(userId).select('-passwordHash');
        if (user) {
          return res.json({
            success: true,
            data: user,
          });
        }
      } catch (e) {
        console.warn('[DB Error getProfile] Falling back to persistent local DB.');
      }
    }

    const localUser = localDb.getUserById(userId) || (req.user?.email ? localDb.getUserByEmail(req.user.email) : null);
    if (!localUser) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.json({
      success: true,
      data: {
        id: localUser.id,
        _id: localUser._id,
        name: localUser.name,
        email: localUser.email,
        role: localUser.role,
        institution: localUser.institution,
        preferences: localUser.preferences,
        createdAt: localUser.createdAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, institution, preferences } = req.body;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (isMongoConnected()) {
      try {
        const user = await User.findById(userId);
        if (user) {
          if (name) user.name = name.trim();
          if (institution) user.institution = institution.trim();
          if (preferences) {
            user.preferences = {
              ...user.preferences,
              ...preferences,
            };
          }
          await user.save();
        }
      } catch (e) {
        console.warn('[DB Error updateProfile] Falling back to persistent local DB.');
      }
    }

    const updated = await localDb.updateUser(userId, { name, institution, preferences });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.json({
      success: true,
      message: 'Profile and preferences successfully updated.',
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        institution: updated.institution,
        preferences: updated.preferences,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
