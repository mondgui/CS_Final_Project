import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private validateCloudinaryConfig() {
    const missing: string[] = [];
    if (!this.configService.get('CLOUDINARY_CLOUD_NAME')) {
      missing.push('CLOUDINARY_CLOUD_NAME');
    }
    if (!this.configService.get('CLOUDINARY_API_KEY')) {
      missing.push('CLOUDINARY_API_KEY');
    }
    if (!this.configService.get('CLOUDINARY_API_SECRET')) {
      missing.push('CLOUDINARY_API_SECRET');
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Server configuration error: Missing Cloudinary credentials: ${missing.join(', ')}`,
      );
    }

    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      throw new BadRequestException(
        'Cloudinary configuration error. Please check your .env file.',
      );
    }
  }

  async uploadProfileImage(file: Express.Multer.File) {
    this.validateCloudinaryConfig();

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Convert buffer to base64
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'profile-images',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
      ],
    });

    return { url: result.secure_url };
  }

  async uploadResourceFile(file: Express.Multer.File) {
    this.validateCloudinaryConfig();

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Determine file type based on mimetype
    let fileType = 'pdf';
    if (file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (file.mimetype.startsWith('audio/')) {
      fileType = 'audio';
    } else if (file.mimetype.startsWith('video/')) {
      fileType = 'video';
    }

    let result;

    if (fileType === 'video' || fileType === 'audio') {
      // For video/audio, use stream upload for better memory efficiency
      const uploadOptions = {
        folder: 'resources',
        resource_type: 'video' as const, // Cloudinary uses 'video' for both video and audio
      };

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null); // End the stream

      // Use upload_stream
      result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
        bufferStream.pipe(uploadStream);
      });
    } else {
      // For images and PDFs, use base64
      const base64File = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const uploadOptions: any = {
        folder: 'resources',
        resource_type: fileType === 'pdf' ? 'raw' : 'image',
      };

      // For images, add transformations
      if (fileType === 'image') {
        uploadOptions.transformation = [{ quality: 'auto' }];
      }

      result = await cloudinary.uploader.upload(base64File, uploadOptions);
    }

    return {
      url: result.secure_url,
      fileSize: file.size,
      fileType: fileType,
    };
  }
}
