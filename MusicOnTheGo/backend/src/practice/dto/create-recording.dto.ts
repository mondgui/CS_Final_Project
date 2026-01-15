import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRecordingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  studentNotes?: string;

  @IsString()
  @IsOptional()
  teacher?: string;
}
