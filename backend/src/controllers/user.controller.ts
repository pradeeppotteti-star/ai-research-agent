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
      const user =
        (await User.findById(userId).select('-passwordHash')) ||
        (req.user?.email ? await User.findOne({ email: req.user.email.toLowerCase().trim() }).select('-passwordHash') : null);
      if (user) {
        return res.json({
          success: true,
          data: {
            id: user._id.toString(),
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            institution: user.institution,
            preferences: user.preferences,
            createdAt: user.createdAt,
          },
        });
      }
      return res.status(404).json({ success: false, message: 'User profile not found.' });
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
      const user =
        (await User.findById(userId)) ||
        (req.user?.email ? await User.findOne({ email: req.user.email.toLowerCase().trim() }) : null);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User profile not found.' });
      }

      if (name) user.name = name.trim();
      if (institution !== undefined) user.institution = String(institution).trim();
      if (preferences) {
        user.preferences = {
          ...user.preferences,
          ...preferences,
        };
      }
      await user.save();

      // Best-effort sync to localDb
      try {
        await localDb.updateUser(user._id.toString(), { name, institution, preferences });
      } catch {
        // ignore
      }

      return res.json({
        success: true,
        message: 'Profile and preferences successfully updated.',
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          institution: user.institution,
          preferences: user.preferences,
        },
      });
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
