import { IsInt, IsString, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreatePracticeSessionDto {
  @IsInt()
  @Min(1)
  minutes: number;

  @IsString()
  @IsNotEmpty()
  focus: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  date?: string;

  @IsOptional()
  startTime?: string;

  @IsOptional()
  endTime?: string;
}
