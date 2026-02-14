// backend/routes/adminRoutes.js - Converted to use Prisma
import express from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get(
  "/stats",
  authMiddleware,
  async (req, res) => {
    try {
      const { timeRange = '30days' } = req.query;
      const now = new Date();
      
      let days = 30;
      let aggregationUnit = 'day';
      
      switch (timeRange) {
        case '7days':
          days = 7;
          aggregationUnit = 'day';
          break;
        case '30days':
          days = 30;
          aggregationUnit = 'day';
          break;
        case '90days':
          days = 90;
          aggregationUnit = 'day';
          break;
        case '6months':
          days = 180;
          aggregationUnit = 'week';
          break;
        case '1year':
          days = 365;
          aggregationUnit = 'month';
          break;
      }
      
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Basic counts - run sequentially to avoid connection pool exhaustion
      const totalUsers = await prisma.user.count();
      const students = await prisma.user.count({ where: { role: "student" } });
      const teachers = await prisma.user.count({ where: { role: "teacher" } });
      const totalBookings = await prisma.booking.count();
      const pendingBookings = await prisma.booking.count({ where: { status: "PENDING" } });
      const approvedBookings = await prisma.booking.count({ where: { status: "APPROVED" } });
      const rejectedBookings = await prisma.booking.count({ where: { status: "REJECTED" } });
      const totalMessages = await prisma.message.count();
      const totalPracticeSessions = await prisma.practiceSession.count();
      const totalResources = await prisma.resource.count();
      const totalCommunityPosts = await prisma.communityPost.count();

      // User growth over time
      const userGrowthData = [];
      // Query all users created since startDate (no upper limit to catch new users)
      const usersInRange = await prisma.user.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      if (aggregationUnit === 'day') {
        const growthMap = new Map();
        usersInRange.forEach(user => {
          // Use UTC date to match database timestamps (Prisma stores as UTC)
          const userDate = new Date(user.createdAt);
          const dateStr = userDate.toISOString().split('T')[0];
          growthMap.set(dateStr, (growthMap.get(dateStr) || 0) + 1);
        });
        
        // Generate data for all days in range, including today
        // Use UTC for all date operations to match database
        const today = new Date();
        const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(todayUTC);
          date.setUTCDate(date.getUTCDate() - i);
          date.setUTCHours(0, 0, 0, 0);
          const dateStr = date.toISOString().split('T')[0];
          userGrowthData.push({
            date: dateStr,
            count: growthMap.get(dateStr) || 0,
          });
        }
      } else if (aggregationUnit === 'week') {
        const growthMap = new Map();
        usersInRange.forEach(user => {
          const userDate = new Date(user.createdAt);
          const dayOfWeek = userDate.getDay();
          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          const weekStart = new Date(userDate);
          weekStart.setDate(weekStart.getDate() + diff);
          weekStart.setHours(0, 0, 0, 0);
          const weekKey = weekStart.toISOString().split('T')[0];
          growthMap.set(weekKey, (growthMap.get(weekKey) || 0) + 1);
        });
        
        const weeks = 26;
        for (let i = weeks - 1; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(weekStart.getDate() - (i * 7));
          weekStart.setHours(0, 0, 0, 0);
          const dayOfWeek = weekStart.getDay();
          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          weekStart.setDate(weekStart.getDate() + diff);
          const weekKey = weekStart.toISOString().split('T')[0];
          userGrowthData.push({
            date: weekKey,
            count: growthMap.get(weekKey) || 0,
          });
        }
      } else if (aggregationUnit === 'month') {
        const growthMap = new Map();
        usersInRange.forEach(user => {
          const userDate = new Date(user.createdAt);
          const monthStart = new Date(userDate.getFullYear(), userDate.getMonth(), 1);
          const monthKey = monthStart.toISOString().split('T')[0];
          growthMap.set(monthKey, (growthMap.get(monthKey) || 0) + 1);
        });
        
        const months = 12;
        for (let i = months - 1; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          monthStart.setHours(0, 0, 0, 0);
          const monthKey = monthStart.toISOString().split('T')[0];
          userGrowthData.push({
            date: monthKey,
            count: growthMap.get(monthKey) || 0,
          });
        }
      }

      // Active users (based on bookings and messages)
      const [activeStudents7Days, activeTeachers7Days, activeSenders7Days, newUsers7Days] = await Promise.all([
        prisma.booking.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { studentId: true },
          distinct: ['studentId'],
        }),
        prisma.booking.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { teacherId: true },
          distinct: ['teacherId'],
        }),
        prisma.message.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { senderId: true },
          distinct: ['senderId'],
        }),
        prisma.user.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { id: true },
        }),
      ]);

      const allActiveIds7Days = new Set([
        ...activeStudents7Days.map(b => b.studentId),
        ...activeTeachers7Days.map(b => b.teacherId),
        ...activeSenders7Days.map(m => m.senderId),
        ...newUsers7Days.map(u => u.id),
      ]);

      const [activeStudents30Days, activeTeachers30Days, activeSenders30Days, newUsers30Days] = await Promise.all([
        prisma.booking.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { studentId: true },
          distinct: ['studentId'],
        }),
        prisma.booking.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { teacherId: true },
          distinct: ['teacherId'],
        }),
        prisma.message.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { senderId: true },
          distinct: ['senderId'],
        }),
        prisma.user.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { id: true },
        }),
      ]);

      const allActiveIds30Days = new Set([
        ...activeStudents30Days.map(b => b.studentId),
        ...activeTeachers30Days.map(b => b.teacherId),
        ...activeSenders30Days.map(m => m.senderId),
        ...newUsers30Days.map(u => u.id),
      ]);

      // Top instruments and locations
      const allUsers = await prisma.user.findMany({
        select: { 
          instruments: true,
          location: true,
          city: true,
          state: true,
          country: true,
        },
      });
      const instrumentCounts = {};
      allUsers.forEach(user => {
        if (user.instruments && Array.isArray(user.instruments)) {
          user.instruments.forEach(instrument => {
            if (instrument) {
              instrumentCounts[instrument] = (instrumentCounts[instrument] || 0) + 1;
            }
          });
        }
      });
      const topInstruments = Object.entries(instrumentCounts)
        .map(([instrument, count]) => ({ instrument, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top locations - check multiple location fields
      const locationCounts = {};
      allUsers.forEach(user => {
        // Try location field first, then city, then city + country combination
        let locationStr = '';
        if (user.location && user.location.trim()) {
          locationStr = user.location.trim();
        } else if (user.city && user.city.trim()) {
          // If city exists, combine with country if available
          locationStr = user.city.trim();
          if (user.country && user.country.trim()) {
            locationStr += `, ${user.country.trim()}`;
          } else if (user.state && user.state.trim()) {
            locationStr += `, ${user.state.trim()}`;
          }
        } else if (user.country && user.country.trim()) {
          locationStr = user.country.trim();
        }
        
        if (locationStr) {
          locationCounts[locationStr] = (locationCounts[locationStr] || 0) + 1;
        }
      });
      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      const usersWithLocation = Object.values(locationCounts).reduce((sum, count) => sum + count, 0);
      const usersWithoutLocation = totalUsers - usersWithLocation;

      // Teacher-Student ratios
      const teacherBookings = await prisma.booking.findMany({
        select: { teacherId: true, studentId: true },
      });
      const teacherStudentMap = new Map();
      teacherBookings.forEach(booking => {
        if (!teacherStudentMap.has(booking.teacherId)) {
          teacherStudentMap.set(booking.teacherId, new Set());
        }
        teacherStudentMap.get(booking.teacherId).add(booking.studentId);
      });
      
      const teachersWithStudents = teacherStudentMap.size;
      const teachersWithNoStudents = teachers - teachersWithStudents;
      const avgStudentsPerTeacher = teachersWithStudents > 0
        ? Array.from(teacherStudentMap.values()).reduce((sum, set) => sum + set.size, 0) / teachersWithStudents
        : 0;

      // Completed profile
      const completedProfile = await prisma.user.count({
        where: {
          OR: [
            { instruments: { isEmpty: false } },
            { location: { not: "" } },
          ],
        },
      });

      const studentsWithBooking = await prisma.booking.findMany({
        select: { studentId: true },
        distinct: ['studentId'],
      });
      const teachersWithBooking = await prisma.booking.findMany({
        select: { teacherId: true },
        distinct: ['teacherId'],
      });
      const usersWithFirstBooking = studentsWithBooking.length + teachersWithBooking.length;

      res.json({
        totalUsers,
        students,
        teachers,
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        totalMessages,
        totalPracticeSessions,
        totalResources,
        totalCommunityPosts,
        userGrowthData: userGrowthData,
        activeUsers7Days: allActiveIds7Days.size,
        activeUsers30Days: allActiveIds30Days.size,
        inactiveUsers7Days: totalUsers - allActiveIds7Days.size,
        inactiveUsers30Days: totalUsers - allActiveIds30Days.size,
        topInstruments,
        topLocations,
        usersWithLocation,
        usersWithoutLocation,
        teachersWithStudents,
        teachersWithNoStudents,
        avgStudentsPerTeacher: Math.round(avgStudentsPerTeacher * 10) / 10,
        completedProfile,
        usersWithFirstBooking,
        onboardingFunnel: {
          signedUp: totalUsers,
          completedProfile,
          firstBooking: usersWithFirstBooking,
        },
      });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/admin/bookings
 * Get all bookings with pagination
 */
router.get("/bookings", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count(),
    ]);

    res.json({
      bookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/messages
 * Get all conversations grouped by participants
 */
router.get("/messages", authMiddleware, async (req, res) => {
  try {
    // Get all messages with sender and recipient info
    const allMessages = await prisma.message.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group messages by conversation (roomId or sender-recipient pair)
    const conversationsMap = new Map();
    
    allMessages.forEach((message) => {
      // Use roomId if available, otherwise generate from sender/recipient IDs
      const roomId = message.roomId || [message.senderId, message.recipientId].sort().join('_');
      
      if (!conversationsMap.has(roomId)) {
        conversationsMap.set(roomId, {
          roomId,
          participant1: message.sender,
          participant2: message.recipient,
          messages: [],
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unreadCount: 0,
          totalMessages: 0,
        });
      }
      
      const conversation = conversationsMap.get(roomId);
      conversation.messages.push(message);
      conversation.totalMessages++;
      
      // Count unread messages (assuming unread from recipient's perspective)
      if (!message.read) {
        conversation.unreadCount++;
      }
      
      // Update last message if this is newer
      if (new Date(message.createdAt) > new Date(conversation.lastMessageAt)) {
        conversation.lastMessage = message;
        conversation.lastMessageAt = message.createdAt;
      }
    });

    // Convert map to array and sort by last message date
    const conversations = Array.from(conversationsMap.values())
      .map((conv) => ({
        roomId: conv.roomId,
        participant1: conv.participant1,
        participant2: conv.participant2,
        lastMessage: {
          id: conv.lastMessage.id,
          text: conv.lastMessage.text,
          senderId: conv.lastMessage.senderId,
          recipientId: conv.lastMessage.recipientId,
          read: conv.lastMessage.read,
          createdAt: conv.lastMessage.createdAt,
        },
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount,
        totalMessages: conv.totalMessages,
      }))
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.json({
      conversations,
      total: conversations.length,
    });
  } catch (err) {
    console.error("Error fetching admin conversations:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/messages/:roomId
 * Get all messages in a specific conversation
 */
router.get("/messages/:roomId", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const messages = await prisma.message.findMany({
      where: {
        roomId: roomId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching conversation messages:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/practice-sessions
 * Get all practice sessions with pagination
 */
router.get("/practice-sessions", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [sessions, totalCount] = await Promise.all([
      prisma.practiceSession.findMany({
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
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.practiceSession.count(),
    ]);

    res.json({
      sessions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/community-posts
 * Get all community posts with pagination
 */
router.get("/community-posts", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [posts, totalCount] = await Promise.all([
      prisma.communityPost.findMany({
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              role: true,
            },
          },
          likes: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.communityPost.count(),
    ]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          instruments: true,
          location: true,
          profileImage: true,
          createdAt: true,
          about: true,
          goals: true,
          weeklyGoal: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/analytics/usage
 * App usage: most and least used screens/features (for polishing or deprioritizing)
 */
router.get("/analytics/usage", authMiddleware, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);

    const rows = await prisma.$queryRaw`
      SELECT name,
             COUNT(*)::int AS views,
             COUNT(DISTINCT "userId")::int AS "uniqueUsers"
      FROM "AppEvent"
      WHERE "createdAt" >= ${startDate}
      GROUP BY name
      ORDER BY views DESC
    `;

    res.json({
      period: { days, from: startDate.toISOString() },
      byName: rows,
    });
  } catch (err) {
    console.error("Admin analytics/usage error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (admin only)
 */
router.delete("/users/:id", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/admin/bookings/:id
 * Delete a booking (admin only)
 */
router.delete("/bookings/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.booking.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Booking deleted successfully." });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "Booking not found." });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/admin/messages/:id
 * Delete a message (admin only)
 */
router.delete("/messages/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.message.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Message deleted successfully." });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "Message not found." });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/admin/community-posts/:id
 * Delete a community post (admin only)
 */
router.delete("/community-posts/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.communityPost.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Post deleted successfully." });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "Post not found." });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/admin/practice-sessions/:id
 * Delete a practice session (admin only)
 */
router.delete("/practice-sessions/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.practiceSession.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Practice session deleted successfully." });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "Practice session not found." });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/admin/bulk-message
 * Send bulk messages to multiple users
 */
router.post("/bulk-message", authMiddleware, async (req, res) => {
  try {
    const { userIds, message } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "User IDs array is required and must not be empty." });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message text is required." });
    }

    const adminId = req.user.id;

    // Create messages for all recipients
    const messages = userIds.map((userId) => ({
      senderId: adminId,
      recipientId: userId,
      text: message.trim(),
      read: false,
    }));

    // Use createMany for bulk insert
    const result = await prisma.message.createMany({
      data: messages,
    });

    res.json({
      message: `Successfully sent ${result.count} message(s).`,
      count: result.count,
    });
  } catch (err) {
    console.error("Error sending bulk messages:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/search
 * Global search across all entities
 */
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({
        users: [],
        bookings: [],
        messages: [],
        practiceSessions: [],
        communityPosts: [],
        resources: [],
      });
    }

    const searchTerm = q.trim();
    const limitNum = parseInt(limit);

    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
      },
      take: limitNum,
    });

    // Search bookings (by status)
    const bookings = await prisma.booking.findMany({
      where: {
        status: { contains: searchTerm, mode: 'insensitive' },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    // Filter bookings by student/teacher name
    const filteredBookings = bookings.filter(booking => {
      const studentName = booking.student?.name || '';
      const teacherName = booking.teacher?.name || '';
      return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             booking.status.toLowerCase().includes(searchTerm.toLowerCase());
    }).slice(0, limitNum);

    // Search messages
    const messages = await prisma.message.findMany({
      where: {
        text: { contains: searchTerm, mode: 'insensitive' },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    // Search practice sessions
    const practiceSessions = await prisma.practiceSession.findMany({
      where: {
        notes: { contains: searchTerm, mode: 'insensitive' },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: limitNum,
      orderBy: { date: 'desc' },
    });

    const filteredSessions = practiceSessions.filter(session => {
      const studentName = session.student?.name || '';
      return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (session.notes && session.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    }).slice(0, limitNum);

    // Search community posts
    const communityPosts = await prisma.communityPost.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    // Search resources
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      users,
      bookings: filteredBookings,
      messages,
      practiceSessions: filteredSessions,
      communityPosts,
      resources,
    });
  } catch (err) {
    console.error('Error in global search:', err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/inquiries
 * Get all inquiries with pagination (admin only)
 */
router.get("/inquiries", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [inquiries, totalCount] = await Promise.all([
      prisma.inquiry.findMany({
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              role: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.inquiry.count(),
    ]);

    res.json(inquiries);
  } catch (err) {
    console.error("Error fetching admin inquiries:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
