import { IsString, IsNotEmpty } from 'class-validator';

export class TimeSlotDto {
  @IsString()
  @IsNotEmpty()
  start: string;

  @IsString()
  @IsNotEmpty()
  end: string;
}

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  teacher: string;

  @IsString()
  @IsNotEmpty()
  day: string;

  @IsNotEmpty()
  timeSlot: TimeSlotDto;
}
