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
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { AssignResourceDto } from './dto/assign-resource.dto';
import { UpdateAssignmentNoteDto } from './dto/update-assignment-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, ResourceLevel } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  async getAllResources(
    @Query('instrument') instrument?: string,
    @Query('level') level?: ResourceLevel,
    @Query('category') category?: string,
  ) {
    return this.resourcesService.getAllResources(instrument, level, category);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async getTeacherResources(@CurrentUser() user: { id: string }) {
    return this.resourcesService.getTeacherResources(user.id);
  }

  @Get('assigned')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async getAssignedResources(@CurrentUser() user: { id: string }) {
    return this.resourcesService.getStudentAssignedResources(user.id);
  }

  @Get('personal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async getPersonalResources(@CurrentUser() user: { id: string }) {
    return this.resourcesService.getStudentPersonalResources(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async createResource(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreateResourceDto,
  ) {
    return this.resourcesService.createResource(user.id, createDto);
  }

  @Post('personal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async createPersonalResource(
    @CurrentUser() user: { id: string },
    @Body() createDto: CreateResourceDto,
  ) {
    return this.resourcesService.createPersonalResource(user.id, createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async updateResource(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() updateDto: UpdateResourceDto,
  ) {
    return this.resourcesService.updateResource(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async deleteResource(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.resourcesService.deleteResource(id, user.id);
  }

  @Delete('personal/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.student)
  async deletePersonalResource(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.resourcesService.deleteResource(id, user.id);
  }

  @Post(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async assignResource(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() assignDto: AssignResourceDto,
  ) {
    return this.resourcesService.assignResource(id, user.id, assignDto);
  }

  @Delete(':id/assign/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async unassignResource(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.resourcesService.unassignResource(id, studentId, user.id);
  }

  @Get('assignments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async getAssignments(@CurrentUser() user: { id: string }) {
    return this.resourcesService.getTeacherAssignments(user.id);
  }

  @Put(':id/assign/:studentId/note')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async updateAssignmentNote(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: { id: string },
    @Body() updateDto: UpdateAssignmentNoteDto,
  ) {
    return this.resourcesService.updateAssignmentNote(
      id,
      studentId,
      user.id,
      updateDto,
    );
  }

  @Delete(':id/assign/:studentId/note')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.teacher)
  async deleteAssignmentNote(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.resourcesService.deleteAssignmentNote(id, studentId, user.id);
  }
}
