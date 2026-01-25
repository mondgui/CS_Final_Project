import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ResourceType, ResourceLevel } from '@prisma/client';

export class UpdateResourceDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  externalUrl?: string;

  @IsEnum(ResourceType)
  @IsOptional()
  fileType?: ResourceType;

  @IsInt()
  @Min(0)
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  instrument?: string;

  @IsEnum(ResourceLevel)
  @IsOptional()
  level?: ResourceLevel;

  @IsString()
  @IsOptional()
  category?: string;
}
