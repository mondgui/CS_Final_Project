import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { ResourceType, ResourceLevel } from '@prisma/client';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

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
  @IsNotEmpty()
  fileType: ResourceType;

  @IsInt()
  @Min(0)
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsNotEmpty()
  instrument: string;

  @IsEnum(ResourceLevel)
  @IsNotEmpty()
  level: ResourceLevel;

  @IsString()
  @IsOptional()
  category?: string;
}
