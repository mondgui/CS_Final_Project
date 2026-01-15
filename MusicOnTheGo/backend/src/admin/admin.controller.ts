import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { BulkMessageDto } from './dto/bulk-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats(@Query('timeRange') timeRange?: string) {
    return this.adminService.getStats(timeRange);
  }

  @Get('users')
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getAllUsers(page, limit);
  }

  @Get('users/filtered')
  async getFilteredUsers(
    @Query('role') role?: string,
    @Query('instrument') instrument?: string,
    @Query('signupDateFrom') signupDateFrom?: string,
    @Query('signupDateTo') signupDateTo?: string,
    @Query('activityLevel') activityLevel?: string,
    @Query('hasProfile') hasProfile?: string,
    @Query('hasBooking') hasBooking?: string,
  ) {
    return this.adminService.getFilteredUsers({
      role,
      instrument,
      signupDateFrom,
      signupDateTo,
      activityLevel,
      hasProfile,
      hasBooking,
    });
  }

  @Get('bookings')
  async getAllBookings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getAllBookings(page, limit);
  }

  @Get('messages')
  async getAllMessages(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getAllMessages(page, limit);
  }

  @Get('practice-sessions')
  async getAllPracticeSessions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getAllPracticeSessions(page, limit);
  }

  @Get('community-posts')
  async getAllCommunityPosts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getAllCommunityPosts(page, limit);
  }

  @Get('search')
  async globalSearch(
    @Query('q') query?: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.globalSearch(query || '', limit);
  }

  @Post('bulk-message')
  async sendBulkMessage(
    @CurrentUser() user: { id: string },
    @Body() bulkMessageDto: BulkMessageDto,
  ) {
    return this.adminService.sendBulkMessage(user.id, bulkMessageDto);
  }

  @Delete('users/:id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.adminService.deleteUser(id, user.id);
  }

  @Delete('bookings/:id')
  async deleteBooking(@Param('id') id: string) {
    return this.adminService.deleteBooking(id);
  }

  @Delete('messages/:id')
  async deleteMessage(@Param('id') id: string) {
    return this.adminService.deleteMessage(id);
  }

  @Delete('community-posts/:id')
  async deleteCommunityPost(@Param('id') id: string) {
    return this.adminService.deleteCommunityPost(id);
  }

  @Delete('practice-sessions/:id')
  async deletePracticeSession(@Param('id') id: string) {
    return this.adminService.deletePracticeSession(id);
  }
}
