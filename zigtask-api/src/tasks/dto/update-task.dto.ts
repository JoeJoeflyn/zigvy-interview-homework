import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateTaskDto {
  @ApiProperty({ description: 'Task ID', example: 1 })
  @IsNumber()
  @Min(1)
  taskId: number;

  @ApiProperty({
    description: 'Task status',
    example: 'TODO',
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    description: 'New index for reordering',
    example: 1,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  newIndex?: number;

  @ApiProperty({
    description: 'Task title',
    example: 'Task title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Task description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Due date of the task',
    example: '2025-12-31T23:59:59.999Z',
    format: 'date-time',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;
}
