import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from '../config/env';
import { isMongoConnected } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { localDb } from '../services/storage/localDb.service';

interface SerializableUser {
  id?: string;
  _id?: string | { toString(): string };
  name?: string;
  email?: string;
  role?: string;
  institution?: string;
  preferences?: any;
  createdAt?: Date | string;
}

function resolveUserId(user: SerializableUser): string {
  return user.id || (user._id ? user._id.toString() : '');
}

function serializeUser(user: SerializableUser) {
  const id = resolveUserId(user);
  return {
    id,
    _id: id,
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'Researcher',
    institution: user.institution,
    preferences: user.preferences,
    createdAt: user.createdAt,
  };
}

function signAuthToken(user: SerializableUser): string {
  return jwt.sign(
    {
      userId: resolveUserId(user),
      email: user.email,
      name: user.name,
      role: user.role,
      institution: user.institution,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, institution, researchInterests } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required.',
        code: 'VALIDATION_ERROR',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const cleanInstitution = institution || 'Academic Institution';
    const interests = researchInterests || ['Autonomous AI Agents', 'LLM Factuality'];

    if (isMongoConnected()) {
      const existingMongo = await User.findOne({ email: cleanEmail });
      if (existingMongo) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in.',
          code: 'EMAIL_ALREADY_EXISTS',
        });
      }

      const mongoUser = await User.create({
        name: cleanName,
        email: cleanEmail,
        passwordHash: password, // Hashed in UserSchema pre('save')
        institution: cleanInstitution,
        role: 'Researcher',
        preferences: {
          researchInterests: interests,
          preferredDomains: ['Computer Science', 'Artificial Intelligence'],
          preferredYearRange: { start: 2020, end: 2026 },
          defaultPaperCount: 5,
          preferredSources: ['arXiv', 'Semantic Scholar', 'OpenAlex', 'Crossref', 'Google Scholar', 'IEEE Xplore'],
        },
      });

      // Keep local fallback in sync if writable during local dev
      if (!localDb.getUserByEmail(cleanEmail)) {
        try {
          await localDb.createUser({
            id: mongoUser._id.toString(),
            name: mongoUser.name,
            email: mongoUser.email,
            password,
            institution: mongoUser.institution,
            role: mongoUser.role,
            researchInterests: interests,
          });
        } catch {
          // Non-fatal in read-only or serverless environments
        }
      }

      const token = signAuthToken(mongoUser);
      return res.status(201).json({
        success: true,
        message: 'Account successfully created and saved to database.',
        data: {
          token,
          user: serializeUser(mongoUser),
        },
      });
    }

    // Fallback when MongoDB is unavailable (offline local dev / tests)
    const existingLocal = localDb.getUserByEmail(cleanEmail);
    if (existingLocal) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }

    const newUser = await localDb.createUser({
      name: cleanName,
      email: cleanEmail,
      password,
      institution: cleanInstitution,
      role: 'Researcher',
      researchInterests: interests,
    });

    const token = signAuthToken(newUser);
    return res.status(201).json({
      success: true,
      message: 'Account successfully created.',
      data: {
        token,
        user: serializeUser(newUser),
      },
    });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }
    console.error('[Signup Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Signup failed.',
      code: 'SIGNUP_FAILED',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        code: 'VALIDATION_ERROR',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected()) {
      let mongoUser = await User.findOne({ email: cleanEmail });

      // One-time seamless migration for accounts created in localDb prior to MongoDB connection
      if (!mongoUser) {
        const legacyLocal = localDb.getUserByEmail(cleanEmail);
        if (legacyLocal && legacyLocal.passwordHash) {
          const legacyMatch = await bcrypt.compare(password, legacyLocal.passwordHash);
          if (!legacyMatch) {
            return res.status(401).json({
              success: false,
              message: 'Incorrect password. Please verify your credentials and try again.',
              code: 'INVALID_PASSWORD',
            });
          }
          mongoUser = await User.create({
            _id: legacyLocal.id,
            name: legacyLocal.name,
            email: legacyLocal.email,
            passwordHash: legacyLocal.passwordHash,
            role: legacyLocal.role,
            institution: legacyLocal.institution,
            preferences: legacyLocal.preferences,
          });
        }
      }

      if (!mongoUser) {
        return res.status(401).json({
          success: false,
          message: 'No account found with this email. Please check your email or create a new account.',
          code: 'USER_NOT_FOUND',
        });
      }

      const isMatch = await mongoUser.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please verify your credentials and try again.',
          code: 'INVALID_PASSWORD',
        });
      }

      const token = signAuthToken(mongoUser);
      return res.json({
        success: true,
        message: 'Authentication successful.',
        data: {
          token,
          user: serializeUser(mongoUser),
        },
      });
    }

    // Fallback local storage authentication when MongoDB is unavailable
    const localUser = localDb.getUserByEmail(cleanEmail);
    if (!localUser) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please check your email or create a new account.',
        code: 'USER_NOT_FOUND',
      });
    }

    if (!localUser.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Account credentials need to be reset. Please sign up or contact support.',
        code: 'INVALID_PASSWORD',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, localUser.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.',
        code: 'INVALID_PASSWORD',
      });
    }

    const token = signAuthToken(localUser);
    return res.json({
      success: true,
      message: 'Authentication successful.',
      data: {
        token,
        user: serializeUser(localUser),
      },
    });
  } catch (err: any) {
    console.error('[Login Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Login failed.',
      code: 'LOGIN_FAILED',
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Successfully logged out.',
  });
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (isMongoConnected()) {
      const user =
        (await User.findById(req.user.userId).select('-passwordHash')) ||
        (req.user.email ? await User.findOne({ email: req.user.email.toLowerCase().trim() }).select('-passwordHash') : null);

      if (user) {
        return res.json({
          success: true,
          data: serializeUser(user),
        });
      }
    }

    const localUser =
      localDb.getUserById(req.user.userId) ||
      (req.user.email ? localDb.getUserByEmail(req.user.email) : null);

    if (localUser) {
      return res.json({
        success: true,
        data: serializeUser(localUser),
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Session expired or user not found.',
      code: 'USER_NOT_FOUND',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, current password, and new password are required.',
        code: 'VALIDATION_ERROR',
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
        code: 'VALIDATION_ERROR',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected()) {
      const mongoUser = await User.findOne({ email: cleanEmail });
      if (!mongoUser) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email.',
          code: 'USER_NOT_FOUND',
        });
      }

      const isCurrentValid = await mongoUser.comparePassword(currentPassword);
      if (!isCurrentValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect.',
          code: 'INVALID_PASSWORD',
        });
      }

      mongoUser.passwordHash = newPassword;
      await mongoUser.save();
      await localDb.updateUserPassword(cleanEmail, newPassword);

      const token = signAuthToken(mongoUser);
      return res.json({
        success: true,
        message: 'Password successfully updated.',
        data: {
          token,
          user: serializeUser(mongoUser),
        },
      });
    }

    const localUser = localDb.getUserByEmail(cleanEmail);
    if (!localUser) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email.',
        code: 'USER_NOT_FOUND',
      });
    }

    if (!localUser.passwordHash || !(await bcrypt.compare(currentPassword, localUser.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
        code: 'INVALID_PASSWORD',
      });
    }

    await localDb.updateUserPassword(cleanEmail, newPassword);
    const token = signAuthToken(localUser);
    return res.json({
      success: true,
      message: 'Password successfully updated.',
      data: {
        token,
        user: serializeUser(localUser),
      },
    });
  } catch (err: any) {
    console.error('[Reset Password Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Password update failed.',
      code: 'RESET_FAILED',
    });
  }
};
