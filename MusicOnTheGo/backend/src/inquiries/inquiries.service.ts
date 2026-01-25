import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from '../websocket/socket.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryStatus } from '@prisma/client';

@Injectable()
export class InquiriesService {
  constructor(
    private prisma: PrismaService,
    private socketService: SocketService,
  ) {}

  async createInquiry(studentId: string, createDto: CreateInquiryDto) {
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
    } = createDto;

    if (!teacher || !instrument || !level || !lessonType || !availability) {
      throw new BadRequestException('Missing required fields.');
    }

    // Verify teacher exists
    const teacherUser = await this.prisma.user.findUnique({
      where: { id: teacher },
    });

    if (!teacherUser || teacherUser.role !== 'teacher') {
      throw new NotFoundException('Teacher not found.');
    }

    const inquiry = await this.prisma.inquiry.create({
      data: {
        studentId,
        teacherId: teacher,
        instrument,
        level,
        ageGroup: ageGroup || null,
        lessonType,
        availability,
        message: message || '',
        goals: goals || '',
        guardianName: guardianName || '',
        guardianPhone: guardianPhone || '',
        guardianEmail: guardianEmail || '',
        status: InquiryStatus.sent,
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
    });

    // Emit Socket.io event
    this.socketService.emitToUser(teacher, 'new-inquiry', inquiry);

    return inquiry;
  }

  async getTeacherInquiries(teacherId: string) {
    const inquiries = await this.prisma.inquiry.findMany({
      where: { teacherId },
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

    return inquiries;
  }

  async markInquiryAsRead(inquiryId: string, teacherId: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found.');
    }

    if (inquiry.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized.');
    }

    // Only update to "read" if status is still "sent"
    if (inquiry.status === InquiryStatus.sent) {
      const updated = await this.prisma.inquiry.update({
        where: { id: inquiryId },
        data: { status: InquiryStatus.read },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return updated;
    }

    return inquiry;
  }

  async markInquiryAsResponded(inquiryId: string, teacherId: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found.');
    }

    if (inquiry.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized.');
    }

    const updated = await this.prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: InquiryStatus.responded },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }
}
