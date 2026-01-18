// backend/routes/teacherRoutes.js - Converted to use Prisma
import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

/**
 * GET /api/teachers
 * PUBLIC — Get all teachers
 */
router.get("/", async (req, res) => {
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
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/teachers/:id
 * PUBLIC — Get a single teacher by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const teacher = await prisma.user.findFirst({
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
    res.status(500).json({ message: err.message });
  }
});

export default router;
