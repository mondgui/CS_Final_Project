import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from '../websocket/socket.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private socketService: SocketService,
  ) {}

  async createBooking(studentId: string, createBookingDto: CreateBookingDto) {
    const { teacher, day, timeSlot } = createBookingDto;

    // Verify teacher exists
    const teacherUser = await this.prisma.user.findUnique({
      where: { id: teacher },
    });

    if (!teacherUser || teacherUser.role !== 'teacher') {
      throw new NotFoundException('Teacher not found.');
    }

    // Check if student has had a conversation with the teacher
    const conversationExists = await this.prisma.message.findFirst({
      where: {
        OR: [
          { senderId: studentId, recipientId: teacher },
          { senderId: teacher, recipientId: studentId },
        ],
      },
    });

    if (!conversationExists) {
      throw new ForbiddenException(
        'Please contact the teacher first before booking a lesson. This helps ensure you\'re a good fit and allows you to discuss your learning goals.',
      );
    }

    // Check if there's already an approved booking for this time slot
    const existingApproved = await this.prisma.booking.findFirst({
      where: {
        teacherId: teacher,
        day,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        status: BookingStatus.APPROVED,
      },
    });

    if (existingApproved) {
      throw new ConflictException(
        'This time slot is already booked by another student.',
      );
    }

    // Check if the same student already has a pending or approved booking for this time slot
    const existingStudentBooking = await this.prisma.booking.findFirst({
      where: {
        studentId,
        teacherId: teacher,
        day,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.APPROVED],
        },
      },
    });

    if (existingStudentBooking) {
      throw new ConflictException(
        'You already have a booking request for this time slot.',
      );
    }

    // Check if another student has a pending booking for this time slot
    const existingPending = await this.prisma.booking.findFirst({
      where: {
        teacherId: teacher,
        day,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        status: BookingStatus.PENDING,
      },
    });

    // Create the booking
    const booking = await this.prisma.booking.create({
      data: {
        studentId,
        teacherId: teacher,
        day,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        status: BookingStatus.PENDING,
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

    // Emit Socket.io events
    this.socketService.emitToUser(teacher, 'new-booking-request', booking);
    this.socketService.emitToRoom(`teacher-bookings:${teacher}`, 'booking-updated', booking);

    // If there's a conflict, return a warning
    if (existingPending) {
      return {
        ...booking,
        conflictWarning:
          'Another student has also requested this time slot. The teacher will review all requests.',
      };
    }

    return booking;
  }

  async updateBookingStatus(
    bookingId: string,
    teacherId: string,
    updateStatusDto: UpdateBookingStatusDto,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    // Ensure only the correct teacher can update
    if (booking.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized teacher.');
    }

    // If approving a booking, handle conflicts
    if (updateStatusDto.status === BookingStatus.APPROVED) {
      // Check if another booking was just approved for this slot (race condition check)
      const conflictingApproved = await this.prisma.booking.findFirst({
        where: {
          id: { not: bookingId },
          teacherId: booking.teacherId,
          day: booking.day,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: BookingStatus.APPROVED,
        },
      });

      if (conflictingApproved) {
        throw new ConflictException(
          'This time slot was just booked by another student. Please refresh and try again.',
        );
      }

      // Reject all other pending bookings for the same time slot
      await this.prisma.booking.updateMany({
        where: {
          id: { not: bookingId },
          teacherId: booking.teacherId,
          day: booking.day,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: BookingStatus.PENDING,
        },
        data: {
          status: BookingStatus.REJECTED,
        },
      });
    }

    // Update the booking status
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: updateStatusDto.status },
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

    // Emit Socket.io events
    this.socketService.emitToUser(booking.studentId, 'booking-status-changed', {
      booking: updatedBooking,
      status: updateStatusDto.status,
    });
    this.socketService.emitToRoom(`student-bookings:${booking.studentId}`, 'booking-updated', updatedBooking);
    this.socketService.emitToRoom(`teacher-bookings:${teacherId}`, 'booking-updated', updatedBooking);
    if (updateStatusDto.status === BookingStatus.APPROVED) {
      this.socketService.emitToRoom(`teacher-availability:${teacherId}`, 'availability-updated', {});
    }

    return updatedBooking;
  }

  async getStudentBookings(studentId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [bookings, totalCount] = await Promise.all([
      this.prisma.booking.findMany({
        where: { studentId },
        include: {
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
      this.prisma.booking.count({ where: { studentId } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      bookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore,
      },
    };
  }

  async getTeacherBookings(teacherId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [bookings, totalCount] = await Promise.all([
      this.prisma.booking.findMany({
        where: { teacherId },
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
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where: { teacherId } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      bookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore,
      },
    };
  }

  async deleteBooking(bookingId: string, userId: string, userRole: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
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
      throw new NotFoundException('Booking not found.');
    }

    // Check authorization
    const isOwner =
      booking.studentId === userId || booking.teacherId === userId;
    if (!isOwner && userRole !== 'admin') {
      throw new ForbiddenException('Not authorized to delete this booking.');
    }

    // Emit Socket.io events before deletion
    this.socketService.emitToUser(booking.studentId, 'booking-cancelled', {
      booking,
      cancelledBy: userRole,
    });
    this.socketService.emitToRoom(`student-bookings:${booking.studentId}`, 'booking-deleted', bookingId);
    this.socketService.emitToRoom(`teacher-bookings:${booking.teacherId}`, 'booking-deleted', bookingId);
    if (booking.status === BookingStatus.APPROVED) {
      this.socketService.emitToRoom(`teacher-availability:${booking.teacherId}`, 'availability-updated', {});
    }

    await this.prisma.booking.delete({
      where: { id: bookingId },
    });

    return { message: 'Booking deleted successfully.' };
  }
}
