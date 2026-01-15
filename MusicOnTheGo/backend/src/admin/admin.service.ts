import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BulkMessageDto } from './dto/bulk-message.dto';
import { BookingStatus, UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats(timeRange: string = '30days') {
    const now = new Date();
    let days = 30;
    let aggregationUnit: 'day' | 'week' | 'month' = 'day';

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

    // Basic counts
    const [
      totalUsers,
      students,
      teachers,
      totalBookings,
      pendingBookings,
      approvedBookings,
      totalMessages,
      totalPracticeSessions,
      totalResources,
      totalCommunityPosts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.student } }),
      this.prisma.user.count({ where: { role: UserRole.teacher } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      this.prisma.booking.count({ where: { status: BookingStatus.APPROVED } }),
      this.prisma.message.count(),
      this.prisma.practiceSession.count(),
      this.prisma.resource.count(),
      this.prisma.communityPost.count(),
    ]);

    // User growth data (simplified - would need more complex aggregation for full implementation)
    const userGrowthData: any[] = [];
    // TODO: Implement proper aggregation based on aggregationUnit
    // For now, return empty array - can be enhanced later

    // Active users (users with bookings/messages in last 7/30 days)
    const activeStudentIds7Days = await this.prisma.booking.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { studentId: true },
    });
    const activeTeacherIds7Days = await this.prisma.booking.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { teacherId: true },
    });
    const activeMessageSenderIds7Days = await this.prisma.message.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { senderId: true },
    });
    const newUsers7Days = await this.prisma.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { id: true },
    });

    const allActiveIds7Days = new Set([
      ...activeStudentIds7Days.map((b) => b.studentId),
      ...activeTeacherIds7Days.map((b) => b.teacherId),
      ...activeMessageSenderIds7Days.map((m) => m.senderId),
      ...newUsers7Days.map((u) => u.id),
    ]);

    const activeStudentIds30Days = await this.prisma.booking.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { studentId: true },
    });
    const activeTeacherIds30Days = await this.prisma.booking.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { teacherId: true },
    });
    const activeMessageSenderIds30Days = await this.prisma.message.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { senderId: true },
    });
    const newUsers30Days = await this.prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { id: true },
    });

    const allActiveIds30Days = new Set([
      ...activeStudentIds30Days.map((b) => b.studentId),
      ...activeTeacherIds30Days.map((b) => b.teacherId),
      ...activeMessageSenderIds30Days.map((m) => m.senderId),
      ...newUsers30Days.map((u) => u.id),
    ]);

    // Top instruments
    const allUsers = await this.prisma.user.findMany({
      select: { instruments: true, location: true },
    });
    const instrumentCounts: Record<string, number> = {};
    allUsers.forEach((user) => {
      if (user.instruments && Array.isArray(user.instruments)) {
        user.instruments.forEach((instrument) => {
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

    // Top locations
    const locationCounts: Record<string, number> = {};
    allUsers.forEach((user) => {
      if (user.location && user.location.trim()) {
        const location = user.location.trim();
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });
    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const usersWithLocation = Object.values(locationCounts).reduce(
      (sum, count) => sum + count,
      0,
    );
    const usersWithoutLocation = totalUsers - usersWithLocation;

    // Teacher-Student ratios
    const teachersWithBookings = await this.prisma.booking.findMany({
      select: { teacherId: true },
    });
    const uniqueTeacherIds = new Set(teachersWithBookings.map((b) => b.teacherId));
    const teacherStudentCounts = await this.prisma.booking.groupBy({
      by: ['teacherId'],
      _count: {
        studentId: true,
      },
    });

    const teachersWithNoStudents = teachers - uniqueTeacherIds.size;
    const avgStudentsPerTeacher =
      teachersWithBookings.length > 0
        ? teacherStudentCounts.reduce(
            (sum, t) => sum + t._count.studentId,
            0,
          ) / teachersWithBookings.length
        : 0;

    // Profile completion
    const completedProfile = await this.prisma.user.count({
      where: {
        OR: [
          { instruments: { isEmpty: false } },
          { location: { not: '' } },
        ],
      },
    });

    const studentsWithBookings = await this.prisma.booking.findMany({
      select: { studentId: true },
    });
    const teachersWithBookingsCount = await this.prisma.booking.findMany({
      select: { teacherId: true },
    });
    const uniqueStudentIds = new Set(studentsWithBookings.map((b) => b.studentId));
    const uniqueTeacherIdsCount = new Set(teachersWithBookingsCount.map((b) => b.teacherId));
    const usersWithFirstBooking = uniqueStudentIds.size + uniqueTeacherIdsCount.size;

    return {
      totalUsers,
      students,
      teachers,
      totalBookings,
      pendingBookings,
      approvedBookings,
      totalMessages,
      totalPracticeSessions,
      totalResources,
      totalCommunityPosts,
      userGrowth: userGrowthData,
      activeUsers7Days: allActiveIds7Days.size,
      activeUsers30Days: allActiveIds30Days.size,
      inactiveUsers7Days: totalUsers - allActiveIds7Days.size,
      inactiveUsers30Days: totalUsers - allActiveIds30Days.size,
      topInstruments,
      topLocations,
      usersWithLocation,
      usersWithoutLocation,
      teachersWithStudents: uniqueTeacherIds.size,
      teachersWithNoStudents,
      avgStudentsPerTeacher: Math.round(avgStudentsPerTeacher * 10) / 10,
      teacherStudentCounts: teacherStudentCounts.map((t) => ({
        teacherId: t.teacherId,
        studentCount: t._count.studentId,
      })),
      signedUp: totalUsers,
      completedProfile,
      usersWithFirstBooking,
      onboardingFunnel: {
        signedUp: totalUsers,
        completedProfile,
        firstBooking: usersWithFirstBooking,
      },
    };
  }

  async getAllUsers(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          instruments: true,
          location: true,
          profileImage: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getAllBookings(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [bookings, totalCount] = await Promise.all([
      this.prisma.booking.findMany({
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
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count(),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getAllMessages(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [messages, totalCount] = await Promise.all([
      this.prisma.message.findMany({
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
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.message.count(),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getAllPracticeSessions(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [sessions, totalCount] = await Promise.all([
      this.prisma.practiceSession.findMany({
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
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.practiceSession.count(),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getAllCommunityPosts(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [posts, totalCount] = await Promise.all([
      this.prisma.communityPost.findMany({
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
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.communityPost.count(),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async deleteUser(userId: string, adminId: string) {
    if (userId === adminId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully.' };
  }

  async deleteBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    await this.prisma.booking.delete({
      where: { id: bookingId },
    });

    return { message: 'Booking deleted successfully.' };
  }

  async deleteMessage(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });

    return { message: 'Message deleted successfully.' };
  }

  async deleteCommunityPost(postId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    await this.prisma.communityPost.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully.' };
  }

  async deletePracticeSession(sessionId: string) {
    const session = await this.prisma.practiceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Practice session not found.');
    }

    await this.prisma.practiceSession.delete({
      where: { id: sessionId },
    });

    return { message: 'Practice session deleted successfully.' };
  }

  async globalSearch(query: string, limit: number = 5) {
    if (!query || query.trim().length === 0) {
      return {
        users: [],
        bookings: [],
        messages: [],
        practiceSessions: [],
        communityPosts: [],
        resources: [],
      };
    }

    const searchTerm = query.trim();

    // Search users
    const users = await this.prisma.user.findMany({
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
      take: limit,
    });

    // Search bookings - check if search term matches enum values
    const statusValues = ['PENDING', 'APPROVED', 'REJECTED'];
    const matchingStatus = statusValues.find(
      (s) => s.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { day: { contains: searchTerm, mode: 'insensitive' } },
          ...(matchingStatus ? [{ status: matchingStatus as any }] : []),
        ],
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
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Search messages
    const messages = await this.prisma.message.findMany({
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
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Search practice sessions
    const practiceSessions = await this.prisma.practiceSession.findMany({
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
      take: limit,
      orderBy: { date: 'desc' },
    });

    // Search community posts
    const communityPosts = await this.prisma.communityPost.findMany({
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
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Search resources
    const resources = await this.prisma.resource.findMany({
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
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      users,
      bookings,
      messages,
      practiceSessions,
      communityPosts,
      resources,
    };
  }

  async sendBulkMessage(adminId: string, bulkMessageDto: BulkMessageDto) {
    const { userIds, message } = bulkMessageDto;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new BadRequestException(
        'User IDs array is required and must not be empty.',
      );
    }

    if (!message || !message.trim()) {
      throw new BadRequestException('Message text is required.');
    }

    // Verify all user IDs exist
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: { id: true },
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException('One or more user IDs are invalid.');
    }

    // Create messages for all recipients
    const messages = userIds.map((userId) => ({
      senderId: adminId,
      recipientId: userId,
      text: message.trim(),
      read: false,
    }));

    const createdMessages = await this.prisma.message.createMany({
      data: messages,
    });

    return {
      message: `Successfully sent ${createdMessages.count} message(s).`,
      count: createdMessages.count,
    };
  }

  async getFilteredUsers(filters: any) {
    const {
      role,
      instrument,
      signupDateFrom,
      signupDateTo,
      activityLevel,
      hasProfile,
      hasBooking,
    } = filters;

    const where: any = {};

    if (role && role !== 'all') {
      where.role = role as UserRole;
    }

    if (instrument && instrument !== 'all') {
      where.instruments = {
        has: instrument,
      };
    }

    if (signupDateFrom || signupDateTo) {
      where.createdAt = {};
      if (signupDateFrom) {
        where.createdAt.gte = new Date(signupDateFrom);
      }
      if (signupDateTo) {
        where.createdAt.lte = new Date(signupDateTo);
      }
    }

    if (hasProfile === 'true') {
      where.OR = [
        { instruments: { isEmpty: false } },
        { location: { not: '' } },
      ];
    }

    let users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        instruments: true,
        location: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by activity level
    if (activityLevel && activityLevel !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      );

      if (activityLevel === 'active') {
        const activeStudentIds = await this.prisma.booking.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { studentId: true },
        });
        const activeTeacherIds = await this.prisma.booking.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { teacherId: true },
        });
        const activeMessageSenderIds = await this.prisma.message.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { senderId: true },
        });
        const newUserIds = await this.prisma.user.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { id: true },
        });

        const activeIds = new Set([
          ...activeStudentIds.map((b) => b.studentId),
          ...activeTeacherIds.map((b) => b.teacherId),
          ...activeMessageSenderIds.map((m) => m.senderId),
          ...newUserIds.map((u) => u.id),
        ]);

        users = users.filter((user) => activeIds.has(user.id));
      } else if (activityLevel === 'inactive') {
        const activeStudentIds = await this.prisma.booking.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { studentId: true },
        });
        const activeTeacherIds = await this.prisma.booking.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { teacherId: true },
        });
        const activeMessageSenderIds = await this.prisma.message.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { senderId: true },
        });
        const newUserIds = await this.prisma.user.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { id: true },
        });

        const activeIds = new Set([
          ...activeStudentIds.map((b) => b.studentId),
          ...activeTeacherIds.map((b) => b.teacherId),
          ...activeMessageSenderIds.map((m) => m.senderId),
          ...newUserIds.map((u) => u.id),
        ]);

        users = users.filter((user) => !activeIds.has(user.id));
      }
    }

    // Filter by has booking
    if (hasBooking === 'true') {
      const studentsWithBookings = await this.prisma.booking.findMany({
        select: { studentId: true },
      });
      const teachersWithBookings = await this.prisma.booking.findMany({
        select: { teacherId: true },
      });
      const allUsersWithBookings = new Set([
        ...studentsWithBookings.map((b) => b.studentId),
        ...teachersWithBookings.map((b) => b.teacherId),
      ]);

      users = users.filter((user) => allUsersWithBookings.has(user.id));
    }

    return {
      users,
      count: users.length,
    };
  }
}
