import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PostLevel, Visibility } from '@prisma/client';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  instrument?: string;

  @IsEnum(PostLevel)
  @IsOptional()
  level?: PostLevel;

  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;
}
