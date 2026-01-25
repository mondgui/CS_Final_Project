import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TimeSlotDto {
  @IsString()
  @IsNotEmpty()
  start: string;

  @IsString()
  @IsNotEmpty()
  end: string;
}

export class CreateAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  day: string; // Day name (e.g., "Monday") or date string (YYYY-MM-DD)

  @IsOptional()
  date?: string; // Optional specific date

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots: TimeSlotDto[];
}
