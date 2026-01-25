// backend/routes/inquiryRoutes.js - Converted to use Prisma
import express from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendPushNotification } from "../utils/pushNotificationService.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get io instance from server (will be set by server.js)
let io = null;
export function setSocketIO(socketIO) {
  io = socketIO;
}

// Attach setSocketIO to router so it's accessible via default import
router.setSocketIO = setSocketIO;

/**
 * POST /api/inquiries
 * STUDENT: Send inquiry to a teacher
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      teacher,
      instrument,
      level,
      ageGroup,
      lessonType,
      availability,
      message,
      goals,
      guardianName,
      guardianPhone,
      guardianEmail,
    } = req.body;

    if (!teacher || !instrument || !level || !lessonType || !availability) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        studentId: req.user.id,
        teacherId: teacher,
        instrument,
        level: level, // InquiryLevel enum
        ageGroup: ageGroup || null, // AgeGroup enum (optional)
        lessonType: lessonType, // LessonType enum
        availability,
        message: message || "",
        goals: goals || "",
        guardianName: guardianName || "",
        guardianPhone: guardianPhone || "",
        guardianEmail: guardianEmail || "",
        status: "sent",
      },
    });

    // Emit Socket.io event for real-time notification
    if (io) {
      io.to(`user:${teacher}`).emit("new-inquiry", inquiry);
    }

    // Get student name for notification
    const student = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { name: true },
    });

    // Send push notification to teacher
    await sendPushNotification(teacher, {
      title: "New Lesson Inquiry",
      body: `${student?.name || "A student"} sent you an inquiry for ${instrument} lessons`,
      data: {
        type: "inquiry",
        inquiryId: inquiry.id,
        studentId: req.user.id,
      },
    });

    res.status(201).json(inquiry);
  } catch (err) {
    console.error("Inquiry creation error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/inquiries/teacher/me
 * TEACHER: View inquiries sent to them
 */
router.get(
  "/teacher/me",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const inquiries = await prisma.inquiry.findMany({
        where: { teacherId: req.user.id },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(inquiries);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/inquiries/unread-count
 * TEACHER: Get count of unread inquiries
 */
router.get(
  "/unread-count",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const count = await prisma.inquiry.count({
        where: {
          teacherId: req.user.id,
          status: "sent",
        },
      });

      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/inquiries/:id/read
 * TEACHER: Mark inquiry as read
 */
router.put(
  "/:id/read",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: req.params.id },
      });

      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found." });
      }

      if (inquiry.teacherId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      // Only update to "read" if status is still "sent"
      if (inquiry.status === "sent") {
        const updatedInquiry = await prisma.inquiry.update({
          where: { id: req.params.id },
          data: { status: "read" },
        });
        res.json(updatedInquiry);
      } else {
        res.json(inquiry);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/inquiries/:id/responded
 * TEACHER: Mark inquiry as responded
 */
router.put(
  "/:id/responded",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: req.params.id },
      });

      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found." });
      }

      if (inquiry.teacherId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const updatedInquiry = await prisma.inquiry.update({
        where: { id: req.params.id },
        data: { status: "responded" },
      });

      res.json(updatedInquiry);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
