import { IsString, IsOptional } from 'class-validator';

export class UpdateAssignmentNoteDto {
  @IsString()
  @IsOptional()
  note?: string;
}
