import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { AssignResourceDto } from './dto/assign-resource.dto';
import { UpdateAssignmentNoteDto } from './dto/update-assignment-note.dto';
import { ResourceLevel } from '@prisma/client';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async createResource(userId: string, createDto: CreateResourceDto) {
    // Must have either fileUrl or externalUrl
    if (!createDto.fileUrl && !createDto.externalUrl) {
      throw new BadRequestException(
        'Either fileUrl or externalUrl must be provided.',
      );
    }

    const resource = await this.prisma.resource.create({
      data: {
        title: createDto.title,
        description: createDto.description || '',
        fileUrl: createDto.fileUrl || '',
        externalUrl: createDto.externalUrl || '',
        fileType: createDto.fileType,
        fileSize: createDto.fileSize || 0,
        instrument: createDto.instrument,
        level: createDto.level,
        category: createDto.category || '',
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    return resource;
  }

  async getAllResources(instrument?: string, level?: ResourceLevel, category?: string) {
    const where: any = {};

    if (instrument) where.instrument = instrument;
    if (level) where.level = level;
    if (category) where.category = category;

    const resources = await this.prisma.resource.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return resources;
  }

  async getTeacherResources(teacherId: string) {
    const resources = await this.prisma.resource.findMany({
      where: { uploadedById: teacherId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return resources;
  }

  async getStudentAssignedResources(studentId: string) {
    const resources = await this.prisma.resource.findMany({
      where: {
        assignedTo: {
          some: {
            id: studentId,
          },
        },
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get assignment notes for each resource
    const resourcesWithNotes = await Promise.all(
      resources.map(async (resource) => {
        const assignment = await this.prisma.resourceAssignment.findFirst({
          where: {
            resourceId: resource.id,
            studentId,
          },
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        });

        return {
          ...resource,
          assignmentNote: assignment?.note || '',
          assignmentTeacher: assignment?.teacher || resource.uploadedBy,
          assignmentUpdatedAt: assignment?.updatedAt || null,
        };
      }),
    );

    return resourcesWithNotes;
  }

  async updateResource(resourceId: string, userId: string, updateDto: UpdateResourceDto) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    if (resource.uploadedById !== userId) {
      throw new ForbiddenException('Unauthorized.');
    }

    const updated = await this.prisma.resource.update({
      where: { id: resourceId },
      data: updateDto,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteResource(resourceId: string, userId: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    if (resource.uploadedById !== userId) {
      throw new ForbiddenException('Unauthorized.');
    }

    await this.prisma.resource.delete({
      where: { id: resourceId },
    });

    return { message: 'Resource deleted successfully.' };
  }

  async assignResource(
    resourceId: string,
    teacherId: string,
    assignDto: AssignResourceDto,
  ) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      include: { assignedTo: true },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    if (resource.uploadedById !== teacherId) {
      throw new ForbiddenException('Unauthorized.');
    }

    // Get existing assigned student IDs
    const existingIds = resource.assignedTo.map((user) => user.id);
    const newIds = assignDto.studentIds.filter(
      (id) => !existingIds.includes(id),
    );

    // Verify all student IDs exist
    const students = await this.prisma.user.findMany({
      where: {
        id: { in: assignDto.studentIds },
        role: 'student',
      },
    });

    if (students.length !== assignDto.studentIds.length) {
      throw new BadRequestException('One or more student IDs are invalid.');
    }

    // Connect new students
    if (newIds.length > 0) {
      await this.prisma.resource.update({
        where: { id: resourceId },
        data: {
          assignedTo: {
            connect: newIds.map((id) => ({ id })),
          },
        },
      });
    }

    // Create or update ResourceAssignment records with notes
    if (assignDto.notes) {
      await Promise.all(
        assignDto.studentIds.map(async (studentId) => {
          const note = assignDto.notes?.[studentId] || '';
          await this.prisma.resourceAssignment.upsert({
            where: {
              resourceId_studentId: {
                resourceId: resourceId,
                studentId: studentId,
              },
            },
            update: {
              note: note,
              teacherId: teacherId,
            },
            create: {
              resourceId: resourceId,
              studentId: studentId,
              teacherId: teacherId,
              note: note,
            },
          });
        }),
      );
    }

    const updated = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    return updated;
  }

  async unassignResource(
    resourceId: string,
    studentId: string,
    teacherId: string,
  ) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    if (resource.uploadedById !== teacherId) {
      throw new ForbiddenException('Unauthorized.');
    }

    await this.prisma.resource.update({
      where: { id: resourceId },
      data: {
        assignedTo: {
          disconnect: { id: studentId },
        },
      },
    });

    // Delete ResourceAssignment record
    await this.prisma.resourceAssignment.deleteMany({
      where: {
        resourceId: resourceId,
        studentId: studentId,
      },
    });

    const updated = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    return updated;
  }

  async updateAssignmentNote(
    resourceId: string,
    studentId: string,
    teacherId: string,
    updateDto: UpdateAssignmentNoteDto,
  ) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    if (resource.uploadedById !== teacherId) {
      throw new ForbiddenException('Unauthorized.');
    }

    const assignment = await this.prisma.resourceAssignment.upsert({
      where: {
        resourceId_studentId: {
          resourceId: resourceId,
          studentId: studentId,
        },
      },
      update: {
        note: updateDto.note || '',
      },
      create: {
        resourceId: resourceId,
        studentId: studentId,
        teacherId: teacherId,
        note: updateDto.note || '',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    return assignment;
  }

  async deleteAssignmentNote(
    resourceId: string,
    studentId: string,
    teacherId: string,
  ) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    if (resource.uploadedById !== teacherId) {
      throw new ForbiddenException('Unauthorized.');
    }

    const assignment = await this.prisma.resourceAssignment.findUnique({
      where: {
        resourceId_studentId: {
          resourceId: resourceId,
          studentId: studentId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    const updated = await this.prisma.resourceAssignment.update({
      where: {
        resourceId_studentId: {
          resourceId: resourceId,
          studentId: studentId,
        },
      },
      data: {
        note: '',
      },
    });

    return { message: 'Note deleted successfully.', assignment: updated };
  }

  async getTeacherAssignments(teacherId: string) {
    const resources = await this.prisma.resource.findMany({
      where: {
        uploadedById: teacherId,
        assignments: {
          some: {},
        },
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        assignments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return resources.map((resource) => ({
      ...resource,
      assignments: resource.assignments.map((assignment) => ({
        student: assignment.student,
        note: assignment.note,
        updatedAt: assignment.updatedAt,
        createdAt: assignment.createdAt,
      })),
    }));
  }

  // Student can create personal resources
  async createPersonalResource(userId: string, createDto: CreateResourceDto) {
    // Must have either fileUrl or externalUrl
    if (!createDto.fileUrl && !createDto.externalUrl) {
      throw new BadRequestException(
        'Either fileUrl or externalUrl must be provided.',
      );
    }

    const resource = await this.prisma.resource.create({
      data: {
        title: createDto.title,
        description: createDto.description || '',
        fileUrl: createDto.fileUrl || '',
        externalUrl: createDto.externalUrl || '',
        fileType: createDto.fileType,
        fileSize: createDto.fileSize || 0,
        instrument: createDto.instrument || 'Other',
        level: createDto.level || ResourceLevel.Beginner,
        category: createDto.category || '',
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    return resource;
  }

  async getStudentPersonalResources(studentId: string) {
    const resources = await this.prisma.resource.findMany({
      where: { uploadedById: studentId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return resources;
  }
}
