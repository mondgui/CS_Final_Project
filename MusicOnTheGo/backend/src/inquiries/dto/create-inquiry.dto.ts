import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { InquiryLevel, LessonType, AgeGroup } from '@prisma/client';

export class CreateInquiryDto {
  @IsString()
  @IsNotEmpty()
  teacher: string;

  @IsString()
  @IsNotEmpty()
  instrument: string;

  @IsEnum(InquiryLevel)
  @IsNotEmpty()
  level: InquiryLevel;

  @IsEnum(AgeGroup)
  @IsOptional()
  ageGroup?: AgeGroup;

  @IsEnum(LessonType)
  @IsNotEmpty()
  lessonType: LessonType;

  @IsString()
  @IsNotEmpty()
  availability: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  goals?: string;

  @IsString()
  @IsOptional()
  guardianName?: string;

  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @IsString()
  @IsOptional()
  guardianEmail?: string;
}
