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
import { PracticeService } from './practice.service';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateRecordingDto } from './dto/create-recording.dto';
import { AddFeedbackDto } from './dto/add-feedback.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async createPracticeSession(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreatePracticeSessionDto,
  ) {
    return this.practiceService.createPracticeSession(user.id, createDto);
  }

  @Get('sessions/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async getMyPracticeSessions(@CurrentUser() user: { id: string }) {
    return this.practiceService.getStudentPracticeSessions(user.id);
  }

  @Get('stats/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async getMyPracticeStats(@CurrentUser() user: { id: string }) {
    return this.practiceService.getStudentPracticeStats(user.id);
  }

  @Get('sessions/student/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async getStudentPracticeSessions(
    @Param('studentId') studentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.practiceService.getTeacherStudentPracticeSessions(
      user.id,
      studentId,
    );
  }

  @Get('stats/student/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async getStudentPracticeStats(
    @Param('studentId') studentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.practiceService.getTeacherStudentPracticeStats(
      user.id,
      studentId,
    );
  }

  // Goal endpoints
  @Post('goals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async createGoal(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreateGoalDto,
  ) {
    return this.practiceService.createGoal(user.id, createDto);
  }

  @Get('goals/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async getMyGoals(@CurrentUser() user: { id: string }) {
    return this.practiceService.getStudentGoals(user.id);
  }

  @Put('goals/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async updateGoal(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() updateDto: UpdateGoalDto,
  ) {
    return this.practiceService.updateGoal(id, user.id, updateDto);
  }

  @Delete('goals/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async deleteGoal(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.practiceService.deleteGoal(id, user.id);
  }

  @Get('goals/student/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async getStudentGoals(
    @Param('studentId') studentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.practiceService.getTeacherStudentGoals(user.id, studentId);
  }

  // Recording endpoints
  @Post('recordings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async createRecording(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreateRecordingDto,
  ) {
    return this.practiceService.createRecording(user.id, createDto);
  }

  @Get('recordings/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async getMyRecordings(@CurrentUser() user: { id: string }) {
    return this.practiceService.getStudentRecordings(user.id);
  }

  @Get('recordings/student/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async getStudentRecordings(
    @Param('studentId') studentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.practiceService.getTeacherStudentRecordings(user.id, studentId);
  }

  @Put('recordings/:id/feedback')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async addRecordingFeedback(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() feedbackDto: AddFeedbackDto,
  ) {
    return this.practiceService.addRecordingFeedback(
      id,
      user.id,
      feedbackDto.teacherFeedback || '',
    );
  }
}
