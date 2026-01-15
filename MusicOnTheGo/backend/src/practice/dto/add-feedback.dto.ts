import { IsString, IsOptional } from 'class-validator';

export class AddFeedbackDto {
  @IsString()
  @IsOptional()
  teacherFeedback?: string;
}
