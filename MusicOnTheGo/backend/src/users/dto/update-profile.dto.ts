import { IsString, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  instruments?: string[];

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  // Student fields
  @IsNumber()
  @IsOptional()
  weeklyGoal?: number;

  @IsString()
  @IsOptional()
  skillLevel?: string;

  @IsString()
  @IsOptional()
  learningMode?: string;

  @IsString()
  @IsOptional()
  ageGroup?: string;

  @IsString()
  @IsOptional()
  availability?: string;

  @IsString()
  @IsOptional()
  goals?: string;

  // Teacher fields
  @IsString()
  @IsOptional()
  experience?: string;

  @IsNumber()
  @IsOptional()
  rate?: number;

  @IsString()
  @IsOptional()
  about?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialties?: string[];

  // Preferences
  @IsBoolean()
  @IsOptional()
  pushNotificationsEnabled?: boolean;
}
