import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from '../websocket/socket.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    private prisma: PrismaService,
    private socketService: SocketService,
  ) {}

  async createAvailability(teacherId: string, createDto: CreateAvailabilityDto) {
    const { day, date, timeSlots } = createDto;

    // Verify teacher exists and is a teacher
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'teacher') {
      throw new NotFoundException('Teacher not found.');
    }

    // Create availability with time slots
    const availability = await this.prisma.availability.create({
      data: {
        teacherId,
        day,
        date: date ? new Date(date) : null,
        timeSlots: {
          create: timeSlots.map((slot) => ({
            start: slot.start,
            end: slot.end,
          })),
        },
      },
      include: {
        timeSlots: true,
      },
    });

    // Emit Socket.io event
    this.socketService.emitToRoom(`teacher-availability:${teacherId}`, 'availability-updated', {});

    return availability;
  }

  async updateAvailability(
    availabilityId: string,
    teacherId: string,
    updateDto: UpdateAvailabilityDto,
  ) {
    const availability = await this.prisma.availability.findUnique({
      where: { id: availabilityId },
      include: { timeSlots: true },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found.');
    }

    if (availability.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized.');
    }

    // Prepare update data
    const updateData: any = {};
    if (updateDto.day !== undefined) updateData.day = updateDto.day;
    if (updateDto.date !== undefined) {
      updateData.date = updateDto.date ? new Date(updateDto.date) : null;
    }

    // If timeSlots are provided, replace all existing ones
    if (updateDto.timeSlots !== undefined) {
      // Delete existing time slots
      await this.prisma.timeSlot.deleteMany({
        where: { availabilityId },
      });

      // Create new time slots
      updateData.timeSlots = {
        create: updateDto.timeSlots.map((slot) => ({
          start: slot.start,
          end: slot.end,
        })),
      };
    }

    const updated = await this.prisma.availability.update({
      where: { id: availabilityId },
      data: updateData,
      include: {
        timeSlots: true,
      },
    });

    // Emit Socket.io event
    this.socketService.emitToRoom(`teacher-availability:${teacherId}`, 'availability-updated', {});

    return updated;
  }

  async deleteAvailability(availabilityId: string, teacherId: string) {
    const availability = await this.prisma.availability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found.');
    }

    if (availability.teacherId !== teacherId) {
      throw new ForbiddenException('Unauthorized.');
    }

    await this.prisma.availability.delete({
      where: { id: availabilityId },
    });

    // Emit Socket.io event
    this.socketService.emitToRoom(`teacher-availability:${teacherId}`, 'availability-updated', {});

    return { message: 'Availability deleted.' };
  }

  async getTeacherAvailability(teacherId: string) {
    // Verify teacher exists
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found.');
    }

    // Get all availability for this teacher
    const allAvailability = await this.prisma.availability.findMany({
      where: { teacherId },
      include: { timeSlots: true },
    });

    // Filter out past dates (keep recurring weekly availability and future dates)
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    const todayStr = todayUTC.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Calculate yesterday in UTC to account for timezone differences
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);
    const yesterdayStr = yesterdayUTC.toISOString().split('T')[0];

    const availability = allAvailability.filter((item) => {
      // If day is in YYYY-MM-DD format, use it for comparison
      if (item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
        return item.day >= yesterdayStr; // Keep if yesterday, today, or future
      }
      // If it has a specific date field, check if it's in the past
      if (item.date) {
        const itemDate = new Date(item.date);
        if (isNaN(itemDate.getTime())) {
          return false; // Invalid date
        }
        const itemDateUTC = new Date(
          Date.UTC(
            itemDate.getUTCFullYear(),
            itemDate.getUTCMonth(),
            itemDate.getUTCDate(),
          ),
        );
        return itemDateUTC >= todayUTC; // Keep if today or future
      }
      // If no date field, it's recurring weekly availability - keep it
      return true;
    });

    return availability;
  }

  async getTeacherAvailabilityForStudent(teacherId: string) {
    // Verify teacher exists
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found.');
    }

    // Get all availability for this teacher
    const allAvailability = await this.prisma.availability.findMany({
      where: { teacherId },
      include: { timeSlots: true },
    });

    // Filter out past dates
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
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
        const itemDateUTC = new Date(
          Date.UTC(
            itemDate.getUTCFullYear(),
            itemDate.getUTCMonth(),
            itemDate.getUTCDate(),
          ),
        );
        return itemDateUTC >= todayUTC;
      }
      return true; // Recurring weekly
    });

    // Get all approved bookings for this teacher to filter out booked slots
    const approvedBookings = await this.prisma.booking.findMany({
      where: {
        teacherId,
        status: 'APPROVED',
      },
    });

    // Create a set of booked time slots for quick lookup
    const bookedSlots = new Set<string>();
    approvedBookings.forEach((booking) => {
      let bookingDayKey = booking.day;
      if (booking.day && /^\d{4}-\d{2}-\d{2}$/.test(booking.day)) {
        bookingDayKey = booking.day;
      }
      const key = `${bookingDayKey}-${booking.startTime}-${booking.endTime}`;
      bookedSlots.add(key);
    });

    // Filter out booked time slots from availability
    availability = availability
      .map((item) => {
        const availableTimeSlots = item.timeSlots.filter((slot) => {
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
      })
      .filter((item) => item.timeSlots.length > 0); // Only keep items with available slots

    return availability;
  }
}
