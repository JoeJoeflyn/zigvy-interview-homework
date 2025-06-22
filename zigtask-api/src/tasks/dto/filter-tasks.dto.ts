import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FilterTasksDto {
  @ApiProperty({ description: 'Search string for task title', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Due date (YYYY-MM-DD or ISO string)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
