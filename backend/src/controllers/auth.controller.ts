import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from '../config/env';
import { isMongoConnected } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { localDb } from '../services/storage/localDb.service';

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

    // Check if email already exists in local persistent database
    const existingLocal = localDb.getUserByEmail(cleanEmail);
    if (existingLocal) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }

    if (isMongoConnected()) {
      try {
        const existingMongo = await User.findOne({ email: cleanEmail });
        if (existingMongo) {
          return res.status(409).json({
            success: false,
            message: 'An account with this email address already exists. Please sign in.',
            code: 'EMAIL_ALREADY_EXISTS',
          });
        }
      } catch (dbErr) {
        console.warn('[DB Error during signup check]: Falling back to local disk database.');
      }
    }

    // Create user in persistent local database
    const newUser = await localDb.createUser({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      institution: institution || 'Academic Institution',
      role: 'Researcher',
      researchInterests: researchInterests || ['Autonomous AI Agents', 'LLM Factuality'],
    });

    // Mirror to Mongo if connected
    if (isMongoConnected()) {
      try {
        await User.create({
          _id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          passwordHash: password, // Mongoose pre('save') hashes it
          institution: newUser.institution,
          role: newUser.role,
          preferences: newUser.preferences,
        });
      } catch (mongoErr) {
        console.warn('[MongoDB Mirror Warning]: Created in persistent local DB, Mongo mirror deferred.');
      }
    }

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account successfully created and saved to database.',
      data: {
        token,
        user: {
          id: newUser.id,
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          institution: newUser.institution,
          preferences: newUser.preferences,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (err: any) {
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

    // 1. Try Live MongoDB if connected
    if (isMongoConnected()) {
      try {
        const mongoUser = await User.findOne({ email: cleanEmail });
        if (mongoUser) {
          const isMatch = await mongoUser.comparePassword(password);
          if (isMatch) {
            const token = jwt.sign(
              { userId: mongoUser._id.toString(), email: mongoUser.email },
              env.JWT_SECRET,
              { expiresIn: '7d' }
            );
            return res.json({
              success: true,
              message: 'Authentication successful.',
              data: {
                token,
                user: {
                  id: mongoUser._id.toString(),
                  name: mongoUser.name,
                  email: mongoUser.email,
                  role: mongoUser.role,
                  institution: mongoUser.institution,
                  preferences: mongoUser.preferences,
                  createdAt: mongoUser.createdAt,
                },
              },
            });
          } else {
            return res.status(401).json({
              success: false,
              message: 'Incorrect password. Please verify your credentials and try again.',
              code: 'INVALID_PASSWORD',
            });
          }
        }
      } catch (dbErr) {
        console.warn('[DB Error during login] Switching to persistent local storage.');
      }
    }

    // 2. Persistent Local Storage Authentication
    const localUser = localDb.getUserByEmail(cleanEmail);
    if (!localUser) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please check your email or create a new account.',
        code: 'USER_NOT_FOUND',
      });
    }

    // Verify Password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, localUser.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.',
        code: 'INVALID_PASSWORD',
      });
    }

    // Generate authenticated JWT token with persistent user ID
    const token = jwt.sign(
      { userId: localUser.id, email: localUser.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Authentication successful.',
      data: {
        token,
        user: {
          id: localUser.id,
          _id: localUser._id,
          name: localUser.name,
          email: localUser.email,
          role: localUser.role,
          institution: localUser.institution,
          preferences: localUser.preferences,
          createdAt: localUser.createdAt,
        },
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

export const logout = async (req: Request, res: Response) => {
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

    // Check Mongo if connected
    if (isMongoConnected()) {
      try {
        const user = await User.findById(req.user.userId).select('-passwordHash');
        if (user) {
          return res.json({
            success: true,
            data: {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              institution: user.institution,
              preferences: user.preferences,
              createdAt: user.createdAt,
            },
          });
        }
      } catch (dbErr) {
        console.warn('[DB Error during me check] Using persistent local storage.');
      }
    }

    // Check Persistent Local Storage
    const localUser = localDb.getUserById(req.user.userId) || localDb.getUserByEmail(req.user.email);
    if (localUser) {
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
