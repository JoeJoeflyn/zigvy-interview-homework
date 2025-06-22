import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ description: 'Title', example: 'Task title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description', example: 'Task description' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: TaskStatus,
    description: 'Task status',
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

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
