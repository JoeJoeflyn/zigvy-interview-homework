import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'core/decorator/auth.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { FilterTasksDto } from './dto/filter-tasks.dto';

@Auth()
@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.sub, createTaskDto);
  }

  @Get()
  findAll(@Request() req, @Query() filter: FilterTasksDto) {
    return this.tasksService.findAll(req.user.sub, filter);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: number) {
    return this.tasksService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(req.user.sub, id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: number) {
    return this.tasksService.delete(req.user.sub, id);
  }
}
