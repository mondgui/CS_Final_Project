import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TimeSlotDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

export class UpdateAvailabilityDto {
  @IsString()
  @IsOptional()
  day?: string;

  @IsOptional()
  date?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsOptional()
  timeSlots?: TimeSlotDto[];
}
