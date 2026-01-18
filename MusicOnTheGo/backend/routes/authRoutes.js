// backend/routes/authRoutes.js - Authentication routes using Prisma
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../utils/prisma.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user (student or teacher)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, instruments, location, city, state, country, latitude, longitude } = req.body;

    // Validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: ['Email, password, name, and role are required.'],
        statusCode: 400
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Bad Request',
        message: ['password must be longer than or equal to 6 characters'],
        statusCode: 400
      });
    }

    if (!['student', 'teacher'].includes(role.toLowerCase())) {
      return res.status(400).json({
        error: 'Bad Request',
        message: ['Role must be either student or teacher'],
        statusCode: 400
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Bad Request',
        message: ['Email already registered.'],
        statusCode: 400
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with Prisma
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: role.toLowerCase(),
        instruments: instruments || [],
        location: location || '',
        city: city || '',
        state: state || '',
        country: country || '',
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'Registration failed.',
      statusCode: 500
    });
  }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required.',
        statusCode: 400
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
        statusCode: 401
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Incorrect password.',
        statusCode: 401
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'Login failed.',
      statusCode: 500
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email is required.',
        statusCode: 400
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success (security: don't reveal if email exists)
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      // Save token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires,
        },
      });

      // Send email
      await sendPasswordResetEmail(user.email, resetToken);
    }

    res.json({
      message: 'If an account with that email exists, we\'ve sent password reset instructions.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'Failed to process password reset request.',
      statusCode: 500
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token from email
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token, email, and new password are required.',
        statusCode: 400
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Bad Request',
        message: ['password must be longer than or equal to 6 characters'],
        statusCode: 400
      });
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid or expired reset token.',
        statusCode: 400
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: '',
        resetPasswordExpires: null,
      },
    });

    res.json({
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'Failed to reset password.',
      statusCode: 500
    });
  }
});

export default router;
