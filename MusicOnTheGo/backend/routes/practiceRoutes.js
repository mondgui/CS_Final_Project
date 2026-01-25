// backend/routes/practiceRoutes.js - Converted to use Prisma
import express from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * Calculate badges based on student achievements
 */
function calculateBadges(streak, totalMinutes, totalSessions) {
  const badges = [];

  // Streak badges
  if (streak >= 30) {
    badges.push({ emoji: "🔥", text: `${streak}-Day Streak`, variant: "warning" });
  } else if (streak >= 14) {
    badges.push({ emoji: "🎯", text: `${streak}-Day Streak`, variant: "warning" });
  } else if (streak >= 7) {
    badges.push({ emoji: "🎯", text: `${streak}-Day Streak`, variant: "warning" });
  } else if (streak >= 5) {
    badges.push({ emoji: "🎯", text: `${streak}-Day Streak`, variant: "warning" });
  } else if (streak >= 3) {
    badges.push({ emoji: "🎯", text: `${streak}-Day Streak`, variant: "warning" });
  }

  // Total minutes milestones
  if (totalMinutes >= 10000) {
    badges.push({ emoji: "🏆", text: `${totalMinutes} minutes`, variant: "success" });
  } else if (totalMinutes >= 5000) {
    badges.push({ emoji: "⭐", text: `${totalMinutes} minutes`, variant: "success" });
  } else if (totalMinutes >= 2500) {
    badges.push({ emoji: "⭐", text: `${totalMinutes} minutes`, variant: "success" });
  } else if (totalMinutes >= 1000) {
    badges.push({ emoji: "⏰", text: `${totalMinutes} minutes`, variant: "success" });
  } else if (totalMinutes >= 500) {
    badges.push({ emoji: "⏰", text: `${totalMinutes} minutes`, variant: "success" });
  } else if (totalMinutes >= 100) {
    badges.push({ emoji: "⏰", text: `${totalMinutes} minutes`, variant: "success" });
  }

  // Encouraging titles
  const encouragingTitles = [
    { condition: totalSessions >= 50 && streak >= 7, emoji: "🌟", text: "Dedicated Learner", variant: "default" },
    { condition: totalSessions >= 30 && streak >= 5, emoji: "🎵", text: "Consistent Performer", variant: "default" },
    { condition: totalSessions >= 20, emoji: "🎼", text: "Music Enthusiast", variant: "default" },
    { condition: totalSessions >= 10 && streak >= 3, emoji: "🎸", text: "Rising Star", variant: "default" },
    { condition: totalSessions >= 5, emoji: "🎹", text: "Getting Started", variant: "default" },
    { condition: totalMinutes >= 500 && streak >= 5, emoji: "🎵", text: "Dedicated Learner", variant: "default" },
    { condition: totalMinutes >= 200 && streak >= 3, emoji: "🎵", text: "Committed Student", variant: "default" },
    { condition: totalSessions >= 15, emoji: "🎵", text: "Regular Practitioner", variant: "default" },
  ];

  for (const title of encouragingTitles) {
    if (title.condition) {
      const exists = badges.some(b => b.text === title.text);
      if (!exists) {
        badges.push(title);
        break;
      }
    }
  }

  return badges;
}

// ========== PRACTICE SESSIONS ==========

/**
 * POST /api/practice/sessions
 * STUDENT: Create a practice session
 */
router.post(
  "/sessions",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { minutes, focus, notes, startTime, endTime } = req.body;

      if (!minutes || !focus) {
        return res.status(400).json({ message: "Minutes and focus are required." });
      }

      const session = await prisma.practiceSession.create({
        data: {
          studentId: req.user.id,
          minutes: parseInt(minutes),
          focus,
          notes: notes || "",
          date: req.body.date ? new Date(req.body.date) : new Date(),
          startTime: startTime ? new Date(startTime) : new Date(),
          endTime: endTime ? new Date(endTime) : null,
        },
      });

      res.status(201).json(session);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/practice/sessions/me
 * STUDENT: Get their own practice sessions
 */
router.get(
  "/sessions/me",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const sessions = await prisma.practiceSession.findMany({
        where: { studentId: req.user.id },
        orderBy: { date: 'desc' },
      });
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/practice/sessions/student/:studentId
 * TEACHER: Get practice sessions for a specific student
 */
router.get(
  "/sessions/student/:studentId",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const sessions = await prisma.practiceSession.findMany({
        where: { studentId: req.params.studentId },
        orderBy: { date: 'desc' },
      });
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/practice/stats/me
 * STUDENT: Get practice statistics
 */
router.get(
  "/stats/me",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const sessions = await prisma.practiceSession.findMany({
        where: {
          studentId: req.user.id,
          date: { gte: startOfWeek },
        },
      });

      const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
      
      // Get user's weekly goal
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { weeklyGoal: true },
      });
      const weeklyGoal = user?.weeklyGoal || 0;
      const weeklyProgress = weeklyGoal > 0 ? Math.min((totalMinutes / weeklyGoal) * 100, 100) : 0;

      // Calculate streak
      const allSessions = await prisma.practiceSession.findMany({
        where: { studentId: req.user.id },
        orderBy: { date: 'desc' },
      });
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(checkDate);
        nextDay.setDate(checkDate.getDate() + 1);
        
        const hasPractice = allSessions.some(s => {
          const sessionDate = new Date(s.date);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate >= checkDate && sessionDate < nextDay;
        });
        
        if (hasPractice) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      const totalLifetimeMinutes = allSessions.reduce((sum, s) => sum + s.minutes, 0);
      const badges = calculateBadges(streak, totalLifetimeMinutes, allSessions.length);

      res.json({
        thisWeekMinutes: totalMinutes,
        weeklyGoal,
        weeklyProgress,
        streak,
        badges,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/practice/stats/student/:studentId
 * TEACHER: Get practice statistics for a student
 */
router.get(
  "/stats/student/:studentId",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const sessions = await prisma.practiceSession.findMany({
        where: {
          studentId: req.params.studentId,
          date: { gte: startOfWeek },
        },
      });

      const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
      
      const user = await prisma.user.findUnique({
        where: { id: req.params.studentId },
        select: { weeklyGoal: true },
      });
      const weeklyGoal = user?.weeklyGoal || 0;
      const weeklyProgress = weeklyGoal > 0 ? Math.min((totalMinutes / weeklyGoal) * 100, 100) : 0;

      const allSessions = await prisma.practiceSession.findMany({
        where: { studentId: req.params.studentId },
        orderBy: { date: 'desc' },
      });
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(checkDate);
        nextDay.setDate(checkDate.getDate() + 1);
        
        const hasPractice = allSessions.some(s => {
          const sessionDate = new Date(s.date);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate >= checkDate && sessionDate < nextDay;
        });
        
        if (hasPractice) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      const totalLifetimeMinutes = allSessions.reduce((sum, s) => sum + s.minutes, 0);
      const badges = calculateBadges(streak, totalLifetimeMinutes, allSessions.length);

      res.json({
        thisWeekMinutes: totalMinutes,
        weeklyGoal,
        weeklyProgress,
        streak,
        badges,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ========== GOALS ==========

/**
 * POST /api/practice/goals
 * STUDENT: Create a goal
 */
router.post(
  "/goals",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { title, category, targetDate, progress, weeklyMinutes } = req.body;

      if (!title || !category || !targetDate) {
        return res.status(400).json({ message: "Title, category, and target date are required." });
      }

      const goal = await prisma.goal.create({
        data: {
          studentId: req.user.id,
          title,
          category,
          targetDate: new Date(targetDate),
          progress: progress || 0,
          weeklyMinutes: weeklyMinutes || 0,
        },
      });

      res.status(201).json(goal);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/practice/goals/me
 * STUDENT: Get their own goals
 */
router.get(
  "/goals/me",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const goals = await prisma.goal.findMany({
        where: { studentId: req.user.id },
        orderBy: { createdAt: 'desc' },
      });
      res.json(goals);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/practice/goals/:id
 * STUDENT: Update a goal
 */
router.put(
  "/goals/:id",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const goal = await prisma.goal.findUnique({
        where: { id: req.params.id },
      });

      if (!goal) {
        return res.status(404).json({ message: "Goal not found." });
      }

      if (goal.studentId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const updateData = {};
      if (req.body.progress !== undefined) updateData.progress = req.body.progress;
      if (req.body.completed !== undefined) updateData.completed = req.body.completed;
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.category !== undefined) updateData.category = req.body.category;
      if (req.body.targetDate !== undefined) updateData.targetDate = new Date(req.body.targetDate);
      if (req.body.weeklyMinutes !== undefined) updateData.weeklyMinutes = req.body.weeklyMinutes;

      const updatedGoal = await prisma.goal.update({
        where: { id: req.params.id },
        data: updateData,
      });

      res.json(updatedGoal);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/practice/goals/:id
 * STUDENT: Delete a goal
 */
router.delete(
  "/goals/:id",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const goal = await prisma.goal.findUnique({
        where: { id: req.params.id },
      });

      if (!goal) {
        return res.status(404).json({ message: "Goal not found." });
      }

      if (goal.studentId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      await prisma.goal.delete({
        where: { id: req.params.id },
      });

      res.json({ message: "Goal deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/practice/goals/student/:studentId
 * TEACHER: Get goals for a specific student
 */
router.get(
  "/goals/student/:studentId",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const goals = await prisma.goal.findMany({
        where: { studentId: req.params.studentId },
        orderBy: { createdAt: 'desc' },
      });
      res.json(goals);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ========== RECORDINGS ==========

/**
 * POST /api/practice/recordings
 * STUDENT: Create a recording
 */
router.post(
  "/recordings",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { title, fileUrl, duration, studentNotes, teacher } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Title is required." });
      }

      const recording = await prisma.recording.create({
        data: {
          studentId: req.user.id,
          teacherId: teacher || null,
          title,
          fileUrl: fileUrl || "",
          duration: duration || "",
          studentNotes: studentNotes || "",
        },
      });

      res.status(201).json(recording);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/practice/recordings/me
 * STUDENT: Get their own recordings
 */
router.get(
  "/recordings/me",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const recordings = await prisma.recording.findMany({
        where: { studentId: req.user.id },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(recordings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/practice/recordings/student/:studentId
 * TEACHER: Get recordings for a specific student
 */
router.get(
  "/recordings/student/:studentId",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const recordings = await prisma.recording.findMany({
        where: { studentId: req.params.studentId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(recordings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/practice/recordings/:id/feedback
 * TEACHER: Add feedback to a recording
 */
router.put(
  "/recordings/:id/feedback",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const { teacherFeedback } = req.body;
      const recording = await prisma.recording.findUnique({
        where: { id: req.params.id },
      });

      if (!recording) {
        return res.status(404).json({ message: "Recording not found." });
      }

      // Check if teacher has bookings with the student
      const hasBooking = await prisma.booking.findFirst({
        where: {
          teacherId: req.user.id,
          studentId: recording.studentId,
          status: "APPROVED",
        },
      });

      if (!hasBooking && recording.teacherId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized. You must be the student's teacher." });
      }

      const updatedRecording = await prisma.recording.update({
        where: { id: req.params.id },
        data: {
          teacherFeedback: teacherFeedback || "",
          hasTeacherFeedback: true,
          teacherId: req.user.id,
        },
      });

      res.json(updatedRecording);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
