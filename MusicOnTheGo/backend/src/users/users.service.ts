import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        instruments: true,
        experience: true,
        location: true,
        about: true,
        profileImage: true,
        rate: true,
        specialties: true,
        averageRating: true,
        reviewCount: true,
        skillLevel: true,
        learningMode: true,
        ageGroup: true,
        availability: true,
        goals: true,
        weeklyGoal: true,
        pushNotificationsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        instruments: true,
        experience: true,
        location: true,
        about: true,
        profileImage: true,
        rate: true,
        specialties: true,
        averageRating: true,
        reviewCount: true,
        skillLevel: true,
        learningMode: true,
        ageGroup: true,
        availability: true,
        goals: true,
        weeklyGoal: true,
        pushNotificationsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const updates: any = {};

    // Shared fields
    if (updateProfileDto.name !== undefined) updates.name = updateProfileDto.name;
    if (updateProfileDto.instruments !== undefined) updates.instruments = updateProfileDto.instruments;
    if (updateProfileDto.location !== undefined) updates.location = updateProfileDto.location;
    if (updateProfileDto.profileImage !== undefined) updates.profileImage = updateProfileDto.profileImage;

    // Student fields
    if (updateProfileDto.weeklyGoal !== undefined) updates.weeklyGoal = updateProfileDto.weeklyGoal;
    if (updateProfileDto.skillLevel !== undefined) updates.skillLevel = updateProfileDto.skillLevel;
    if (updateProfileDto.learningMode !== undefined) updates.learningMode = updateProfileDto.learningMode;
    if (updateProfileDto.ageGroup !== undefined) updates.ageGroup = updateProfileDto.ageGroup;
    if (updateProfileDto.availability !== undefined) updates.availability = updateProfileDto.availability;
    if (updateProfileDto.goals !== undefined) updates.goals = updateProfileDto.goals;

    // Teacher fields
    if (updateProfileDto.experience !== undefined) updates.experience = updateProfileDto.experience;
    if (updateProfileDto.rate !== undefined) updates.rate = updateProfileDto.rate;
    if (updateProfileDto.about !== undefined) updates.about = updateProfileDto.about;
    if (updateProfileDto.specialties !== undefined) updates.specialties = updateProfileDto.specialties;

    // Preferences
    if (updateProfileDto.pushNotificationsEnabled !== undefined) {
      updates.pushNotificationsEnabled = updateProfileDto.pushNotificationsEnabled;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        instruments: true,
        experience: true,
        location: true,
        about: true,
        profileImage: true,
        rate: true,
        specialties: true,
        averageRating: true,
        reviewCount: true,
        skillLevel: true,
        learningMode: true,
        ageGroup: true,
        availability: true,
        goals: true,
        weeklyGoal: true,
        pushNotificationsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    // Trim passwords
    const trimmedNewPassword = String(newPassword).trim();
    const trimmedCurrentPassword = String(currentPassword).trim();

    if (trimmedNewPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long.');
    }

    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(trimmedCurrentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(trimmedNewPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully.' };
  }

  async getAllTeachers(page: number = 1, limit: number = 20, instrument?: string, city?: string) {
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'teacher',
    };

    if (instrument) {
      where.instruments = {
        has: instrument,
      };
    }

    if (city) {
      // Prisma doesn't support case-insensitive search directly
      // We'll use a case-sensitive contains for now
      // In production, consider using full-text search or a search service
      where.location = {
        contains: city,
      };
    }

    const [teachers, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          instruments: true,
          experience: true,
          location: true,
          email: true,
          createdAt: true,
          rate: true,
          about: true,
          specialties: true,
          profileImage: true,
          averageRating: true,
          reviewCount: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      teachers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore,
      },
    };
  }

  async getTeacherById(id: string) {
    const teacher = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'teacher',
      },
      select: {
        id: true,
        name: true,
        instruments: true,
        experience: true,
        location: true,
        email: true,
        createdAt: true,
        rate: true,
        about: true,
        specialties: true,
        profileImage: true,
        averageRating: true,
        reviewCount: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found.');
    }

    return teacher;
  }
}
