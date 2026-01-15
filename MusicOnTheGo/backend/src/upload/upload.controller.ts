import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { memoryStorage } from 'multer';
import { Express } from 'express';

// Configure multer for memory storage
const multerConfig = {
  storage: memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for profile images
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only image files are allowed!'), false);
    }
  },
};

const resourceMulterConfig = {
  storage: memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB for resources
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimes = [
      'application/pdf', // PDFs
      'image/', // Images
      'audio/', // Audio files
      'video/', // Video files
    ];

    if (allowedMimes.some((mime) => file.mimetype.startsWith(mime))) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Only PDF, image, audio, and video files are allowed!',
        ),
        false,
      );
    }
  },
};

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('profile-image')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadProfileImage(file);
  }

  @Post('resource-file')
  @UseInterceptors(FileInterceptor('file', resourceMulterConfig))
  async uploadResourceFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadResourceFile(file);
  }
}
