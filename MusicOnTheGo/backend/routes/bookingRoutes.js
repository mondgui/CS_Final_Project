// backend/routes/bookingRoutes.js - Converted to use Prisma
import express from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get io instance from server (will be set by server.js)
let io = null;
export function setSocketIO(socketIO) {
  io = socketIO;
  console.log(`[BookingRoutes] setSocketIO called, io is now:`, io ? 'SET' : 'NULL');
}

// Attach setSocketIO to router so it's accessible via default import
router.setSocketIO = setSocketIO;

/**
 * POST /api/bookings
 * STUDENT: Create a booking request
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { teacher, day, timeSlot } = req.body;

      if (!teacher || !day || !timeSlot) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      // Extract startTime and endTime from timeSlot object
      const startTime = timeSlot.start;
      const endTime = timeSlot.end;

      // Check if student has had a conversation with the teacher
      const conversationExists = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: req.user.id, recipientId: teacher },
            { senderId: teacher, recipientId: req.user.id },
          ],
        },
      });

      if (!conversationExists) {
        return res.status(403).json({ 
          message: "Please contact the teacher first before booking a lesson. This helps ensure you're a good fit and allows you to discuss your learning goals." 
        });
      }

      // Check if there's already an approved booking for this time slot
      const existingApproved = await prisma.booking.findFirst({
        where: {
          teacherId: teacher,
          day,
          startTime,
          endTime,
          status: "APPROVED",
        },
      });

      if (existingApproved) {
        return res.status(409).json({ 
          message: "This time slot is already booked by another student." 
        });
      }

      // Check if the same student already has a pending or approved booking for this time slot
      const existingStudentBooking = await prisma.booking.findFirst({
        where: {
          studentId: req.user.id,
          teacherId: teacher,
          day,
          startTime,
          endTime,
          status: { in: ["PENDING", "APPROVED"] },
        },
      });

      if (existingStudentBooking) {
        return res.status(409).json({ 
          message: "You already have a booking request for this time slot." 
        });
      }

      // Check if another student has a pending booking for this time slot
      const existingPending = await prisma.booking.findFirst({
        where: {
          teacherId: teacher,
          day,
          startTime,
          endTime,
          status: "PENDING",
        },
      });

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          studentId: req.user.id,
          teacherId: teacher,
          day,
          startTime,
          endTime,
          status: "PENDING",
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      });

      // Emit real-time: to teacher (new pending) and to student (their Lessons list)
      console.log(`[Booking] POST - Checking io:`, io ? 'SET' : 'NULL');
      if (io) {
        const teacherIdStr = String(teacher);
        const studentIdStr = String(req.user.id);
        console.log(`[Booking] 📤 Emitting: user:${teacherIdStr}, teacher-bookings:${teacherIdStr}, student-bookings:${studentIdStr}`);
        io.to(`user:${teacherIdStr}`).emit("new-booking-request", booking);
        io.to(`teacher-bookings:${teacherIdStr}`).emit("booking-updated", booking);
        io.to(`student-bookings:${studentIdStr}`).emit("booking-updated", booking);
      } else {
        console.error("[Booking] ❌ io is NULL - cannot emit real-time events!");
      }

      // Add conflict warning if another pending booking exists
      if (existingPending) {
        return res.status(201).json({
          ...booking,
          conflictWarning: "Another student has also requested this time slot. The teacher will review all requests.",
        });
      }

      res.status(201).json(booking);
    } catch (err) {
      console.error("Booking creation error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/bookings/:id/status
 * TEACHER: Approve or reject booking
 */
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const bookingId = req.params.id;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      // Ensure only the correct teacher can update
      if (booking.teacherId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized teacher." });
      }

      // Normalize status to uppercase (Prisma enum uses uppercase)
      const normalizedStatus = status.toUpperCase();

      // If approving a booking, reject all other pending bookings for the same slot
      if (normalizedStatus === "APPROVED") {
        // Check for conflicting approved booking
        const conflictingApproved = await prisma.booking.findFirst({
          where: {
            id: { not: bookingId },
            teacherId: booking.teacherId,
            day: booking.day,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: "APPROVED",
          },
        });

        if (conflictingApproved) {
          return res.status(409).json({
            message: "This time slot was just booked by another student. Please refresh and try again.",
          });
        }

        // Reject all other pending bookings for the same time slot
        await prisma.booking.updateMany({
          where: {
            id: { not: bookingId },
            teacherId: booking.teacherId,
            day: booking.day,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: "PENDING",
          },
          data: {
            status: "REJECTED",
          },
        });
      }

      // Update booking status
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: normalizedStatus },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      });

      // Emit real-time events
      console.log(`[Booking] PUT Status - Checking io:`, io ? 'SET' : 'NULL');
      if (io) {
        const studentIdStr = String(updatedBooking.studentId);
        const teacherIdStr = String(updatedBooking.teacherId);
        
        console.log(`[Booking] 📤 Status update: user:${studentIdStr}, student-bookings:${studentIdStr}, teacher-bookings:${teacherIdStr}, status:${normalizedStatus}`);
        io.to(`user:${studentIdStr}`).emit("booking-status-changed", {
          booking: updatedBooking,
          status: normalizedStatus,
        });
        io.to(`student-bookings:${studentIdStr}`).emit("booking-updated", updatedBooking);
        io.to(`teacher-bookings:${teacherIdStr}`).emit("booking-updated", updatedBooking);
        
        if (normalizedStatus === "APPROVED") {
          io.to(`teacher-availability:${teacherIdStr}`).emit("availability-updated");
        }
      } else {
        console.error("[Booking] ❌ io is NULL - cannot emit status update events!");
      }

      res.json(updatedBooking);
    } catch (err) {
      console.error("Booking status update error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/bookings/student/me
 * STUDENT: View their own bookings
 */
router.get(
  "/student/me",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [bookings, totalCount] = await Promise.all([
        prisma.booking.findMany({
          where: { studentId: req.user.id },
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                instruments: true,
                location: true,
                rate: true,
                about: true,
                specialties: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.booking.count({
          where: { studentId: req.user.id },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;

      res.json({
        bookings,
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
  }
);

/**
 * GET /api/bookings/teacher/me
 * TEACHER: View bookings for them
 */
router.get(
  "/teacher/me",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [bookings, totalCount] = await Promise.all([
        prisma.booking.findMany({
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
          skip,
          take: limit,
        }),
        prisma.booking.count({
          where: { teacherId: req.user.id },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;

      res.json({
        bookings,
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
  }
);

/**
 * DELETE /api/bookings/:id
 * Delete a booking (teacher, student, or admin can delete)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Check authorization
    const isOwner = 
      req.user.id === booking.teacherId || 
      req.user.id === booking.studentId;
    
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this booking." });
    }

    const bookingStatus = booking.status;
    const studentId = booking.studentId;
    const teacherId = booking.teacherId;

    // Delete booking
    await prisma.booking.delete({
      where: { id: req.params.id },
    });

    // Emit real-time events
    if (io) {
      io.to(`user:${studentId}`).emit("booking-cancelled", {
        booking: { ...booking, id: req.params.id },
        cancelledBy: req.user.role,
      });
      io.to(`student-bookings:${studentId}`).emit("booking-deleted", req.params.id);
      io.to(`teacher-bookings:${teacherId}`).emit("booking-deleted", req.params.id);
      
      if (bookingStatus === "APPROVED") {
        io.to(`teacher-availability:${teacherId}`).emit("availability-updated");
      }
    }

    res.json({ message: "Booking deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
