// backend/routes/reviewRoutes.js - Converted to use Prisma
import express from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Helper function to update teacher's average rating and review count
async function updateTeacherRating(teacherId) {
  const reviews = await prisma.review.findMany({
    where: { teacherId },
  });
  
  if (reviews.length === 0) {
    await prisma.user.update({
      where: { id: teacherId },
      data: {
        averageRating: null,
        reviewCount: 0,
      },
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  const reviewCount = reviews.length;

  await prisma.user.update({
    where: { id: teacherId },
    data: {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
    },
  });
}

/**
 * POST /api/reviews
 * STUDENT: Create or update a review for a teacher
 */
router.post("/", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const { teacherId, rating, comment, bookingId } = req.body;

    if (!teacherId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: "Teacher ID and rating (1-5) are required." 
      });
    }

    // Verify that the student has at least one booking with this teacher
    const booking = await prisma.booking.findFirst({
      where: {
        teacherId,
        studentId: req.user.id,
        status: "APPROVED",
      },
    });

    if (!booking) {
      return res.status(403).json({ 
        message: "You can only review teachers you have booked lessons with." 
      });
    }

    // Check if review already exists (to allow updates)
    let review = await prisma.review.findUnique({
      where: {
        teacherId_studentId: {
          teacherId,
          studentId: req.user.id,
        },
      },
    });

    let isNewReview = false;

    if (review) {
      // Update existing review
      review = await prisma.review.update({
        where: { id: review.id },
        data: {
          rating,
          comment: comment || "",
          bookingId: bookingId || booking.id,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });
    } else {
      // Create new review
      isNewReview = true;
      review = await prisma.review.create({
        data: {
          teacherId,
          studentId: req.user.id,
          rating,
          comment: comment || "",
          bookingId: bookingId || booking.id,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });
    }

    // Update teacher's average rating
    await updateTeacherRating(teacherId);

    res.status(isNewReview ? 201 : 200).json(review);
  } catch (err) {
    console.error("[Reviews] Error in POST /api/reviews:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/reviews/teacher/:teacherId
 * Get all reviews for a specific teacher
 */
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { teacherId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: { teacherId },
      }),
    ]);

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + reviews.length < totalCount,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/reviews/teacher/:teacherId/me
 * STUDENT: Get their own review for a specific teacher
 */
router.get("/teacher/:teacherId/me", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const { teacherId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        teacherId_studentId: {
          teacherId,
          studentId: req.user.id,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/reviews/:id
 * STUDENT: Update their own review
 */
router.put("/:id", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (review.studentId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const updateData = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5." });
      }
      updateData.rating = rating;
    }

    if (comment !== undefined) {
      updateData.comment = comment;
    }

    const updatedReview = await prisma.review.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Update teacher's average rating
    await updateTeacherRating(review.teacherId);

    res.json(updatedReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/reviews/:id
 * STUDENT: Delete their own review
 */
router.delete("/:id", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (review.studentId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const teacherId = review.teacherId;

    await prisma.review.delete({
      where: { id: req.params.id },
    });

    // Update teacher's average rating
    await updateTeacherRating(teacherId);

    res.json({ message: "Review deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
