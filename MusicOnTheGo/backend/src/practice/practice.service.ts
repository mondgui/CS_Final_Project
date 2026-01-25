import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';

@Injectable()
export class PracticeService {
  constructor(private prisma: PrismaService) {}

  private calculateBadges(streak: number, totalMinutes: number, totalSessions: number) {
    const badges: any[] = [];

    // Streak badges
    if (streak >= 30) {
      badges.push({ emoji: '🔥', text: `${streak}-Day Streak`, variant: 'warning' });
    } else if (streak >= 14) {
      badges.push({ emoji: '🎯', text: `${streak}-Day Streak`, variant: 'warning' });
    } else if (streak >= 7) {
      badges.push({ emoji: '🎯', text: `${streak}-Day Streak`, variant: 'warning' });
    } else if (streak >= 5) {
      badges.push({ emoji: '🎯', text: `${streak}-Day Streak`, variant: 'warning' });
    } else if (streak >= 3) {
      badges.push({ emoji: '🎯', text: `${streak}-Day Streak`, variant: 'warning' });
    }

    // Total minutes milestones
    if (totalMinutes >= 10000) {
      badges.push({ emoji: '🏆', text: `${totalMinutes} minutes`, variant: 'success' });
    } else if (totalMinutes >= 5000) {
      badges.push({ emoji: '⭐', text: `${totalMinutes} minutes`, variant: 'success' });
    } else if (totalMinutes >= 2500) {
      badges.push({ emoji: '⭐', text: `${totalMinutes} minutes`, variant: 'success' });
    } else if (totalMinutes >= 1000) {
      badges.push({ emoji: '⏰', text: `${totalMinutes} minutes`, variant: 'success' });
    } else if (totalMinutes >= 500) {
      badges.push({ emoji: '⏰', text: `${totalMinutes} minutes`, variant: 'success' });
    } else if (totalMinutes >= 100) {
      badges.push({ emoji: '⏰', text: `${totalMinutes} minutes`, variant: 'success' });
    }

    // Encouraging titles
    const encouragingTitles = [
      { condition: totalSessions >= 50 && streak >= 7, emoji: '🌟', text: 'Dedicated Learner', variant: 'default' },
      { condition: totalSessions >= 30 && streak >= 5, emoji: '🎵', text: 'Consistent Performer', variant: 'default' },
      { condition: totalSessions >= 20, emoji: '🎼', text: 'Music Enthusiast', variant: 'default' },
      { condition: totalSessions >= 10 && streak >= 3, emoji: '🎸', text: 'Rising Star', variant: 'default' },
      { condition: totalSessions >= 5, emoji: '🎹', text: 'Getting Started', variant: 'default' },
      { condition: totalMinutes >= 500 && streak >= 5, emoji: '🎵', text: 'Dedicated Learner', variant: 'default' },
      { condition: totalMinutes >= 200 && streak >= 3, emoji: '🎵', text: 'Committed Student', variant: 'default' },
      { condition: totalSessions >= 15, emoji: '🎵', text: 'Regular Practitioner', variant: 'default' },
    ];

    for (const title of encouragingTitles) {
      if (title.condition) {
        const exists = badges.some((b) => b.text === title.text);
        if (!exists) {
          badges.push(title);
          break;
        }
      }
    }

    return badges;
  }

  private calculateStreak(sessions: any[]): number {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(checkDate);
      nextDay.setDate(checkDate.getDate() + 1);

      const hasPractice = sessions.some((s) => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= checkDate && sessionDate < nextDay;
      });

      if (hasPractice) {
        streak++;
      } else if (i > 0) {
        break; // Break if we hit a day without practice (but allow today to be empty)
      }
    }

    return streak;
  }

  async createPracticeSession(studentId: string, createDto: CreatePracticeSessionDto) {
    const { minutes, focus, notes, date, startTime, endTime } = createDto;

    const session = await this.prisma.practiceSession.create({
      data: {
        studentId,
        minutes: parseInt(String(minutes)),
        focus,
        notes: notes || '',
        date: date ? new Date(date) : new Date(),
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null,
      },
    });

    return session;
  }

  async getStudentPracticeSessions(studentId: string) {
    const sessions = await this.prisma.practiceSession.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });

    return sessions;
  }

  async getStudentPracticeStats(studentId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get this week's sessions
    const thisWeekSessions = await this.prisma.practiceSession.findMany({
      where: {
        studentId,
        date: { gte: startOfWeek },
      },
    });

    const thisWeekMinutes = thisWeekSessions.reduce(
      (sum, s) => sum + s.minutes,
      0,
    );

    // Get user's weekly goal
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { weeklyGoal: true },
    });

    const weeklyGoal = user?.weeklyGoal || 0;
    const weeklyProgress =
      weeklyGoal > 0 ? Math.min((thisWeekMinutes / weeklyGoal) * 100, 100) : 0;

    // Get all sessions for streak calculation
    const allSessions = await this.prisma.practiceSession.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });

    const streak = this.calculateStreak(allSessions);
    const totalLifetimeMinutes = allSessions.reduce(
      (sum, s) => sum + s.minutes,
      0,
    );

    const badges = this.calculateBadges(
      streak,
      totalLifetimeMinutes,
      allSessions.length,
    );

    return {
      thisWeekMinutes,
      weeklyGoal,
      weeklyProgress,
      streak,
      badges,
    };
  }

  async getTeacherStudentPracticeSessions(teacherId: string, studentId: string) {
    // Verify teacher has a booking with this student
    const booking = await this.prisma.booking.findFirst({
      where: {
        teacherId,
        studentId,
        status: 'APPROVED',
      },
    });

    if (!booking) {
      throw new ForbiddenException(
        'You can only view practice sessions for your students.',
      );
    }

    const sessions = await this.prisma.practiceSession.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });

    return sessions;
  }

  async getTeacherStudentPracticeStats(teacherId: string, studentId: string) {
    // Verify teacher has a booking with this student
    const booking = await this.prisma.booking.findFirst({
      where: {
        teacherId,
        studentId,
        status: 'APPROVED',
      },
    });

    if (!booking) {
      throw new ForbiddenException(
        'You can only view practice stats for your students.',
      );
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekSessions = await this.prisma.practiceSession.findMany({
      where: {
        studentId,
        date: { gte: startOfWeek },
      },
    });

    const thisWeekMinutes = thisWeekSessions.reduce(
      (sum, s) => sum + s.minutes,
      0,
    );

    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { weeklyGoal: true },
    });

    const weeklyGoal = user?.weeklyGoal || 0;
    const weeklyProgress =
      weeklyGoal > 0 ? Math.min((thisWeekMinutes / weeklyGoal) * 100, 100) : 0;

    const allSessions = await this.prisma.practiceSession.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });

    const streak = this.calculateStreak(allSessions);
    const totalLifetimeMinutes = allSessions.reduce(
      (sum, s) => sum + s.minutes,
      0,
    );

    const badges = this.calculateBadges(
      streak,
      totalLifetimeMinutes,
      allSessions.length,
    );

    return {
      thisWeekMinutes,
      weeklyGoal,
      weeklyProgress,
      streak,
      badges,
    };
  }

  // Goal methods
  async createGoal(studentId: string, createDto: any) {
    const { title, category, targetDate, progress, weeklyMinutes } = createDto;

    if (!title || !category || !targetDate) {
      throw new BadRequestException(
        'Title, category, and target date are required.',
      );
    }

    const goal = await this.prisma.goal.create({
      data: {
        studentId,
        title,
        category,
        targetDate: new Date(targetDate),
        progress: progress || 0,
        weeklyMinutes: weeklyMinutes || 0,
        completed: false,
      },
    });

    return goal;
  }

  async getStudentGoals(studentId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    return goals;
  }

  async updateGoal(goalId: string, studentId: string, updateDto: any) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found.');
    }

    if (goal.studentId !== studentId) {
      throw new ForbiddenException('Unauthorized.');
    }

    const updateData: any = {};
    if (updateDto.progress !== undefined) updateData.progress = updateDto.progress;
    if (updateDto.completed !== undefined) updateData.completed = updateDto.completed;
    if (updateDto.title !== undefined) updateData.title = updateDto.title;
    if (updateDto.category !== undefined) updateData.category = updateDto.category;
    if (updateDto.targetDate !== undefined) updateData.targetDate = new Date(updateDto.targetDate);
    if (updateDto.weeklyMinutes !== undefined) updateData.weeklyMinutes = updateDto.weeklyMinutes;

    const updated = await this.prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    });

    return updated;
  }

  async deleteGoal(goalId: string, studentId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found.');
    }

    if (goal.studentId !== studentId) {
      throw new ForbiddenException('Unauthorized.');
    }

    await this.prisma.goal.delete({
      where: { id: goalId },
    });

    return { message: 'Goal deleted successfully.' };
  }

  async getTeacherStudentGoals(teacherId: string, studentId: string) {
    // Verify teacher has a booking with this student
    const booking = await this.prisma.booking.findFirst({
      where: {
        teacherId,
        studentId,
        status: 'APPROVED',
      },
    });

    if (!booking) {
      throw new ForbiddenException(
        'You can only view goals for your students.',
      );
    }

    const goals = await this.prisma.goal.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    return goals;
  }

  // Recording methods
  async createRecording(studentId: string, createDto: any) {
    const { title, fileUrl, duration, studentNotes, teacher } = createDto;

    if (!title) {
      throw new BadRequestException('Title is required.');
    }

    const recording = await this.prisma.recording.create({
      data: {
        studentId,
        teacherId: teacher || null,
        title,
        fileUrl: fileUrl || '',
        duration: duration || '',
        studentNotes: studentNotes || '',
        hasTeacherFeedback: false,
      },
    });

    return recording;
  }

  async getStudentRecordings(studentId: string) {
    const recordings = await this.prisma.recording.findMany({
      where: { studentId },
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

    return recordings;
  }

  async getTeacherStudentRecordings(teacherId: string, studentId: string) {
    const recordings = await this.prisma.recording.findMany({
      where: { studentId },
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

    return recordings;
  }

  async addRecordingFeedback(recordingId: string, teacherId: string, feedback: string) {
    const recording = await this.prisma.recording.findUnique({
      where: { id: recordingId },
    });

    if (!recording) {
      throw new NotFoundException('Recording not found.');
    }

    // Check if teacher has a booking with the student
    const booking = await this.prisma.booking.findFirst({
      where: {
        teacherId,
        studentId: recording.studentId,
        status: 'APPROVED',
      },
    });

    if (!booking && recording.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Unauthorized. You must be the student\'s teacher.',
      );
    }

    const updated = await this.prisma.recording.update({
      where: { id: recordingId },
      data: {
        teacherFeedback: feedback || '',
        hasTeacherFeedback: true,
        teacherId: teacherId,
      },
    });

    return updated;
  }
}
