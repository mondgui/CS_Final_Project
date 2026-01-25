import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  private async updateTeacherRating(teacherId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { teacherId },
    });

    if (reviews.length === 0) {
      await this.prisma.user.update({
        where: { id: teacherId },
        data: {
          averageRating: null,
          reviewCount: 0,
        },
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    const reviewCount = reviews.length;

    await this.prisma.user.update({
      where: { id: teacherId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount,
      },
    });
  }

  async createReview(studentId: string, createDto: CreateReviewDto) {
    const { teacherId, rating, comment, bookingId } = createDto;

    if (!teacherId || !rating || rating < 1 || rating > 5) {
      throw new BadRequestException(
        'Teacher ID and rating (1-5) are required.',
      );
    }

    // Verify that the student has at least one approved booking with this teacher
    const booking = await this.prisma.booking.findFirst({
      where: {
        teacherId,
        studentId,
        status: BookingStatus.APPROVED,
      },
    });

    if (!booking) {
      throw new ForbiddenException(
        'You can only review teachers you have booked lessons with.',
      );
    }

    // Check if review already exists
    const existingReview = await this.prisma.review.findUnique({
      where: {
        teacherId_studentId: {
          teacherId,
          studentId,
        },
      },
    });

    let review;
    let isNewReview = false;

    if (existingReview) {
      // Update existing review
      review = await this.prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment || '',
          bookingId: bookingId || booking.id,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });
    } else {
      // Create new review
      isNewReview = true;
      review = await this.prisma.review.create({
        data: {
          teacherId,
          studentId,
          rating,
          comment: comment || '',
          bookingId: bookingId || booking.id,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });
    }

    // Update teacher's average rating
    await this.updateTeacherRating(teacherId);

    return review;
  }

  async getTeacherReviews(teacherId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      this.prisma.review.findMany({
        where: { teacherId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { teacherId } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore,
      },
    };
  }

  async getStudentReviewForTeacher(teacherId: string, studentId: string) {
    const review = await this.prisma.review.findUnique({
      where: {
        teacherId_studentId: {
          teacherId,
          studentId,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    return review;
  }

  async updateReview(reviewId: string, studentId: string, updateDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.studentId !== studentId) {
      throw new ForbiddenException('Unauthorized.');
    }

    const updateData: any = {};
    if (updateDto.rating !== undefined) {
      if (updateDto.rating < 1 || updateDto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5.');
      }
      updateData.rating = updateDto.rating;
    }
    if (updateDto.comment !== undefined) {
      updateData.comment = updateDto.comment;
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Update teacher's average rating
    await this.updateTeacherRating(review.teacherId);

    return updated;
  }

  async deleteReview(reviewId: string, studentId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.studentId !== studentId) {
      throw new ForbiddenException('Unauthorized.');
    }

    const teacherId = review.teacherId;

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    // Update teacher's average rating
    await this.updateTeacherRating(teacherId);

    return { message: 'Review deleted successfully.' };
  }
}
