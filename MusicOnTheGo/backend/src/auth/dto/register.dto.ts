import { IsEmail, IsString, IsNotEmpty, IsEnum, IsArray, IsOptional, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  })
  @IsEnum(UserRole, {
    message: 'role must be one of the following values: student, teacher, admin (case-insensitive)',
  })
  @IsNotEmpty()
  role: UserRole;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  instruments?: string[];

  @IsString()
  @IsOptional()
  experience?: string;

  @IsString()
  @IsOptional()
  location?: string;

  // Support legacy frontend using singular 'instrument'
  @IsString()
  @IsOptional()
  instrument?: string;
}
