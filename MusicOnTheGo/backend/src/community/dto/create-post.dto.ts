import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { MediaType, PostLevel, Visibility } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @IsEnum(MediaType)
  @IsNotEmpty()
  mediaType: MediaType;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsNotEmpty()
  instrument: string;

  @IsEnum(PostLevel)
  @IsOptional()
  level?: PostLevel;

  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;
}
