// backend/routes/userRoutes.js - Converted to use Prisma
import express from "express";
import bcrypt from "bcryptjs";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * GET /api/users
 * Get all users (DEV TEST ONLY)
 */
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        instruments: true,
        location: true,
        profileImage: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/users/me
 * Get current logged-in user
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        instruments: true,
        experience: true,
        location: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        about: true,
        profileImage: true,
        rate: true,
        specialties: true,
        averageRating: true,
        reviewCount: true,
        skillLevel: true,
        learningMode: true,
        ageGroup: true,
        availability: true,
        goals: true,
        weeklyGoal: true,
        pushNotificationsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/users/me
 * Update current logged-in user profile
 */
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const updates = {};

    // Shared fields
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.instruments !== undefined) updates.instruments = req.body.instruments;
    if (req.body.location !== undefined) updates.location = req.body.location;
    if (req.body.city !== undefined) updates.city = req.body.city;
    if (req.body.state !== undefined) updates.state = req.body.state;
    if (req.body.country !== undefined) updates.country = req.body.country;
    if (req.body.latitude !== undefined) updates.latitude = req.body.latitude;
    if (req.body.longitude !== undefined) updates.longitude = req.body.longitude;
    if (req.body.profileImage !== undefined) updates.profileImage = req.body.profileImage;

    // Student fields
    if (req.body.weeklyGoal !== undefined) updates.weeklyGoal = req.body.weeklyGoal;
    if (req.body.skillLevel !== undefined) updates.skillLevel = req.body.skillLevel;
    if (req.body.learningMode !== undefined) updates.learningMode = req.body.learningMode;
    if (req.body.ageGroup !== undefined) updates.ageGroup = req.body.ageGroup;
    if (req.body.availability !== undefined) updates.availability = req.body.availability;
    if (req.body.goals !== undefined) updates.goals = req.body.goals;

    // Teacher fields
    if (req.body.experience !== undefined) updates.experience = req.body.experience;
    if (req.body.rate !== undefined) updates.rate = req.body.rate;
    if (req.body.about !== undefined) updates.about = req.body.about;
    if (req.body.specialties !== undefined) updates.specialties = req.body.specialties;

    // Notification preferences
    if (req.body.pushNotificationsEnabled !== undefined) {
      updates.pushNotificationsEnabled = req.body.pushNotificationsEnabled;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        instruments: true,
        experience: true,
        location: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        about: true,
        profileImage: true,
        rate: true,
        specialties: true,
        averageRating: true,
        reviewCount: true,
        skillLevel: true,
        learningMode: true,
        ageGroup: true,
        availability: true,
        goals: true,
        weeklyGoal: true,
        pushNotificationsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile." });
  }
});

/**
 * PUT /api/users/me/change-password
 * Change password (requires current password)
 */
router.put("/me/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    const trimmedNewPassword = String(newPassword).trim();
    const trimmedCurrentPassword = String(currentPassword).trim();

    if (trimmedNewPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(trimmedCurrentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(trimmedNewPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to change password." });
  }
});

/**
 * GET /api/users/teachers
 * Get all teachers (for student dashboard)
 */
router.get("/teachers", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = { role: "teacher" };

    if (req.query.instrument) {
      where.instruments = {
        has: req.query.instrument,
      };
    }

    if (req.query.city) {
      where.city = {
        contains: req.query.city,
        mode: 'insensitive',
      };
    }

    const [teachers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          instruments: true,
          experience: true,
          location: true,
          city: true,
          state: true,
          country: true,
          email: true,
          createdAt: true,
          rate: true,
          about: true,
          specialties: true,
          profileImage: true,
          averageRating: true,
          reviewCount: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    res.json({
      teachers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore,
      },
    });
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ message: err.message || "Server error fetching teachers." });
  }
});

/**
 * GET /api/users/teachers/:id
 * Get a single teacher by ID
 */
router.get("/teachers/:id", async (req, res) => {
  try {
    const teacher = await prisma.user.findUnique({
      where: {
        id: req.params.id,
        role: "teacher",
      },
      select: {
        id: true,
        name: true,
        instruments: true,
        experience: true,
        location: true,
        city: true,
        state: true,
        country: true,
        email: true,
        createdAt: true,
        rate: true,
        about: true,
        specialties: true,
        profileImage: true,
        averageRating: true,
        reviewCount: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    res.json(teacher);
  } catch (err) {
    console.error("Error fetching teacher by ID:", err);
    res.status(500).json({ message: err.message || "Server error fetching teacher." });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID (for chat/contacts)
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        instruments: true,
        location: true,
        profileImage: true,
        experience: true,
        rate: true,
        about: true,
        specialties: true,
        averageRating: true,
        reviewCount: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/users/teacher-only
 * Test route for teacher role
 */
router.get("/teacher-only", authMiddleware, roleMiddleware("teacher"), (req, res) => {
  res.json({ message: "Welcome Teacher! You have special access." });
});

/**
 * GET /api/users/student-only
 * Test route for student role
 */
router.get("/student-only", authMiddleware, roleMiddleware("student"), (req, res) => {
  res.json({ message: "Welcome Student! You have special access." });
});

export default router;
