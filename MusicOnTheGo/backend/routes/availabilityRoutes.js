// backend/routes/availabilityRoutes.js - Converted to use Prisma
import express from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get io instance from server (will be set by server.js)
let io = null;
export function setSocketIO(socketIO) {
  io = socketIO;
  console.log(`[AvailabilityRoutes] setSocketIO called, io is now:`, io ? 'SET' : 'NULL');
}

// Attach setSocketIO to router so it's accessible via default import
router.setSocketIO = setSocketIO;

/**
 * POST /api/availability
 * TEACHER: Create availability
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const { day, date, timeSlots } = req.body;

      if (!day || !timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
        return res.status(400).json({ message: "Day and timeSlots are required." });
      }

      // Create availability with nested timeSlots
      const availability = await prisma.availability.create({
        data: {
          teacherId: req.user.id,
          day,
          date: date ? new Date(date) : null,
          timeSlots: {
            create: timeSlots.map(slot => ({
              start: slot.start,
              end: slot.end,
            })),
          },
        },
        include: {
          timeSlots: true,
        },
      });

      // Emit real-time: teacher's own tab + students viewing this teacher's profile
      console.log(`[Availability] POST - Checking io:`, io ? 'SET' : 'NULL');
      if (io) {
        const teacherIdStr = String(req.user.id);
        console.log(`[Availability] 📤 POST: Emitting to teacher-availability:${teacherIdStr} and availability-for-teacher:${teacherIdStr}`);
        io.to(`teacher-availability:${teacherIdStr}`).emit("availability-updated");
        io.to(`availability-for-teacher:${teacherIdStr}`).emit("availability-updated");
      } else {
        console.error("[Availability] ❌ io is NULL - cannot emit real-time events!");
      }

      res.status(201).json(availability);
    } catch (err) {
      console.error("Availability creation error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/availability/:id
 * TEACHER: Update availability
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const availability = await prisma.availability.findUnique({
        where: { id: req.params.id },
        include: { timeSlots: true },
      });

      if (!availability) {
        return res.status(404).json({ message: "Availability not found." });
      }

      if (availability.teacherId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      // Update availability and timeSlots
      const updateData = {};
      if (req.body.day !== undefined) updateData.day = req.body.day;
      if (req.body.date !== undefined) {
        updateData.date = req.body.date ? new Date(req.body.date) : null;
      }

      // If timeSlots are provided, replace all existing ones
      if (req.body.timeSlots && Array.isArray(req.body.timeSlots)) {
        // Delete existing timeSlots
        await prisma.timeSlot.deleteMany({
          where: { availabilityId: req.params.id },
        });

        // Create new timeSlots
        updateData.timeSlots = {
          create: req.body.timeSlots.map(slot => ({
            start: slot.start,
            end: slot.end,
          })),
        };
      }

      const updatedAvailability = await prisma.availability.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          timeSlots: true,
        },
      });

      // Emit real-time: teacher's own tab + students viewing this teacher's profile
      if (io) {
        const teacherIdStr = String(availability.teacherId);
        console.log(`[Availability] 📤 PUT: Emitting to teacher-availability:${teacherIdStr} and availability-for-teacher:${teacherIdStr}`);
        io.to(`teacher-availability:${teacherIdStr}`).emit("availability-updated");
        io.to(`availability-for-teacher:${teacherIdStr}`).emit("availability-updated");
      } else {
        console.error("[Availability] ❌ io is NULL - cannot emit real-time events!");
      }

      res.json(updatedAvailability);
    } catch (err) {
      console.error("Availability update error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/availability/teacher/:teacherId
 * STUDENT: View availability for a teacher
 */
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const allAvailability = await prisma.availability.findMany({
      where: { teacherId: req.params.teacherId },
      include: { timeSlots: true },
    });
    
    // Filter availability: keep date-based items that are today or future, and all recurring weekly items
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const todayStr = todayUTC.toISOString().split('T')[0];
    
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);
    const yesterdayStr = yesterdayUTC.toISOString().split('T')[0];
    
    let availability = allAvailability.filter((item) => {
      if (item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
        return item.day >= yesterdayStr;
      }
      if (item.date) {
        const itemDate = new Date(item.date);
        if (isNaN(itemDate.getTime())) {
          return false;
        }
        const itemDateUTC = new Date(Date.UTC(itemDate.getUTCFullYear(), itemDate.getUTCMonth(), itemDate.getUTCDate()));
        return itemDateUTC >= todayUTC;
      }
      return true; // Recurring weekly availability
    });
    
    // Get all approved bookings for this teacher to filter out booked slots
    const approvedBookings = await prisma.booking.findMany({
      where: {
        teacherId: req.params.teacherId,
        status: "APPROVED",
      },
    });
    
    // Create a set of booked time slots for quick lookup
    const bookedSlots = new Set();
    approvedBookings.forEach((booking) => {
      let bookingDayKey = booking.day;
      if (booking.day && /^\d{4}-\d{2}-\d{2}$/.test(booking.day)) {
        bookingDayKey = booking.day;
      }
      const key = `${bookingDayKey}-${booking.startTime}-${booking.endTime}`;
      bookedSlots.add(key);
    });
    
    // Filter out booked time slots from availability
    availability = availability.map((item) => {
      const availableTimeSlots = (item.timeSlots || []).filter((slot) => {
        let itemDayKey = item.day;
        
        if (item.date) {
          if (item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
            itemDayKey = item.day;
          } else {
            const dateObj = new Date(item.date);
            if (!isNaN(dateObj.getTime())) {
              const year = dateObj.getUTCFullYear();
              const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getUTCDate()).padStart(2, '0');
              itemDayKey = `${year}-${month}-${day}`;
            }
          }
        }
        
        const key = `${itemDayKey}-${slot.start}-${slot.end}`;
        return !bookedSlots.has(key);
      });
      
      return {
        ...item,
        timeSlots: availableTimeSlots,
      };
    }).filter((item) => item.timeSlots.length > 0);
    
    res.json(availability);
  } catch (err) {
    console.error("Get availability error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/availability/:id
 * TEACHER: Delete availability
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const availability = await prisma.availability.findUnique({
        where: { id: req.params.id },
      });

      if (!availability) {
        return res.status(404).json({ message: "Not found." });
      }

      if (availability.teacherId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const teacherIdStr = String(availability.teacherId);
      await prisma.availability.delete({
        where: { id: req.params.id },
      });

      // Emit real-time: teacher's own tab + students viewing this teacher's profile
      if (io) {
        console.log(`[Availability] 📤 DELETE: Emitting to teacher-availability:${teacherIdStr} and availability-for-teacher:${teacherIdStr}`);
        io.to(`teacher-availability:${teacherIdStr}`).emit("availability-updated");
        io.to(`availability-for-teacher:${teacherIdStr}`).emit("availability-updated");
      } else {
        console.error("[Availability] ❌ io is NULL - cannot emit real-time events!");
      }

      res.json({ message: "Availability deleted." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/availability/me
 * TEACHER: Get your own availability
 */
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const allAvailability = await prisma.availability.findMany({
        where: { teacherId: req.user.id },
        include: { timeSlots: true },
      });
      
      // Filter out past dates
      const today = new Date();
      const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      const todayStr = todayUTC.toISOString().split('T')[0];
      
      const yesterdayUTC = new Date(todayUTC);
      yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);
      const yesterdayStr = yesterdayUTC.toISOString().split('T')[0];
      
      const availability = allAvailability.filter((item) => {
        if (item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
          return item.day >= yesterdayStr;
        }
        if (item.date) {
          const itemDate = new Date(item.date);
          if (isNaN(itemDate.getTime())) {
            return false;
          }
          const itemDateUTC = new Date(Date.UTC(itemDate.getUTCFullYear(), itemDate.getUTCMonth(), itemDate.getUTCDate()));
          return itemDateUTC >= todayUTC;
        }
        return true; // Recurring weekly availability
      });

      res.json(availability);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
