import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async createBooking(
    @CurrentUser() user: { id: string },
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(user.id, createBookingDto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async updateBookingStatus(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() updateStatusDto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateBookingStatus(id, user.id, updateStatusDto);
  }

  @Get('student/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async getStudentBookings(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.bookingsService.getStudentBookings(user.id, page, limit);
  }

  @Get('teacher/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async getTeacherBookings(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.bookingsService.getTeacherBookings(user.id, page, limit);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBooking(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.bookingsService.deleteBooking(id, user.id, user.role);
  }
}
