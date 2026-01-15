import { IsArray, IsString, IsOptional, IsObject } from 'class-validator';

export class AssignResourceDto {
  @IsArray()
  @IsString({ each: true })
  studentIds: string[];

  @IsObject()
  @IsOptional()
  notes?: Record<string, string>; // Map of studentId to note
}
