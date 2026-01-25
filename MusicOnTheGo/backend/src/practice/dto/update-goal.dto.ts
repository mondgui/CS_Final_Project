import { IsString, IsOptional, IsDateString, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class UpdateGoalDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsDateString()
  @IsOptional()
  targetDate?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  weeklyMinutes?: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
