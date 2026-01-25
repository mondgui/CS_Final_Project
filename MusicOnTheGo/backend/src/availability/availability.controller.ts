import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async createAvailability(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.createAvailability(user.id, createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async updateAvailability(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() updateDto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.updateAvailability(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async deleteAvailability(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.availabilityService.deleteAvailability(id, user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async getMyAvailability(@CurrentUser() user: { id: string }) {
    return this.availabilityService.getTeacherAvailability(user.id);
  }

  @Get('teacher/:teacherId')
  async getTeacherAvailability(@Param('teacherId') teacherId: string) {
    return this.availabilityService.getTeacherAvailabilityForStudent(teacherId);
  }
}
