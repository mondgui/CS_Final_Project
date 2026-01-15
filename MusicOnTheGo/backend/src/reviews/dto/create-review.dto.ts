import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsOptional()
  teacherId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  bookingId?: string;
}
