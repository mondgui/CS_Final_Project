import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsDateString()
  @IsNotEmpty()
  targetDate: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  weeklyMinutes?: number;
}
