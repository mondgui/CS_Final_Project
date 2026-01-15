import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createInquiry(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreateInquiryDto,
  ) {
    return this.inquiriesService.createInquiry(user.id, createDto);
  }

  @Get('teacher/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async getTeacherInquiries(@CurrentUser() user: { id: string }) {
    return this.inquiriesService.getTeacherInquiries(user.id);
  }

  @Put(':id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.inquiriesService.markInquiryAsRead(id, user.id);
  }

  @Put(':id/responded')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async markAsResponded(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.inquiriesService.markInquiryAsResponded(id, user.id);
  }
}
