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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async createReview(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(user.id, createDto);
  }

  @Get('teacher/:teacherId')
  async getTeacherReviews(
    @Param('teacherId') teacherId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.getTeacherReviews(teacherId, page, limit);
  }

  @Get('teacher/:teacherId/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async getMyReviewForTeacher(
    @Param('teacherId') teacherId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.reviewsService.getStudentReviewForTeacher(teacherId, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async updateReview(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() updateDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async deleteReview(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.reviewsService.deleteReview(id, user.id);
  }
}
