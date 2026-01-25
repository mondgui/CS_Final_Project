import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class BulkMessageDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsString()
  @IsNotEmpty()
  message: string;
}
