import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'lib/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createTaskDto: CreateTaskDto) {
    // Get the highest orderIndex for the user's tasks in this status
    const lastTask = await this.prisma.task.findFirst({
      where: {
        userId,
        status: createTaskDto.status,
      },
      orderBy: {
        orderIndex: 'desc',
      },
    });

    // If no task exists in this status, set orderIndex to 0, if exists, set orderIndex to lastTask.orderIndex + 1
    const orderIndex = lastTask ? lastTask.orderIndex + 1 : 0;

    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        userId,
        orderIndex,
      },
    });
  }
  async findAll(userId: number, { search, dueDate }: FilterTasksDto) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(search
          ? {
              OR: [{ title: { contains: search, mode: 'insensitive' } }],
            }
          : {}),
        ...(dueDate ? { dueDate: { equals: new Date(dueDate) } } : {}),
      },
      orderBy: [{ status: 'asc' }, { orderIndex: 'asc' }],
    });
  }

  async findOne(userId: number, id: number) {
    const task = await this.prisma.task.findUnique({
      where: { userId, id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(userId: number, taskId: number, dto: UpdateTaskDto) {
    const { status, orderIndex, title, description, dueDate } = dto;

    // update task title, description, dueDate
    if (status === undefined && orderIndex === undefined) {
      return this.prisma.task.update({
        where: { id: taskId, userId },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          // Update dueDate if it's provided (including null to remove it)
          ...(dueDate !== undefined && { dueDate }),
        },
      });
    }

    // update task status and newIndex
    return this.prisma.$transaction(async (tx) => {
      // 1. Get the task we're moving
      const task = await tx.task.findUniqueOrThrow({
        where: { id: taskId, userId },
      });

      const oldIndex = task.orderIndex;
      const isSameStatus = task.status === status;

      // If no movement needed
      if (isSameStatus && orderIndex === oldIndex) {
        return task;
      }

      // 2. Adjust the old column if status changed
      if (!isSameStatus) {
        await tx.task.updateMany({
          where: {
            userId,
            status: task.status,
            orderIndex: { gt: oldIndex },
          },
          data: { orderIndex: { decrement: 1 } },
        });
      }

      // 3. Shift tasks in the new position
      if (isSameStatus) {
        if (orderIndex > oldIndex) {
          // Moving down: decrement indices of tasks between old and new position
          await tx.task.updateMany({
            where: {
              userId,
              status,
              orderIndex: { gt: oldIndex, lte: orderIndex },
            },
            data: { orderIndex: { decrement: 1 } },
          });
        } else {
          // Moving up: increment indices of tasks between new and old position
          await tx.task.updateMany({
            where: {
              userId,
              status,
              orderIndex: { gte: orderIndex, lt: oldIndex },
            },
            data: { orderIndex: { increment: 1 } },
          });
        }
      } else {
        // Moving to a different status
        await tx.task.updateMany({
          where: {
            userId,
            status,
            orderIndex: { gte: orderIndex },
          },
          data: { orderIndex: { increment: 1 } },
        });
      }

      // 4. Finally, update the task with its new position and any other field updates
      return tx.task.update({
        where: { id: taskId },
        data: {
          status,
          orderIndex,
        },
      });
    });
  }

  async delete(userId: number, taskId: number) {
    const task = await this.prisma.task.findUniqueOrThrow({
      where: { userId, id: taskId },
    });

    // Delete the task with the given taskId
    await this.prisma.task.delete({ where: { userId, id: taskId } });

    // Shift up all tasks in the same status and after the deleted task's orderIndex
    // - It decrements the `orderIndex` of tasks with an `orderIndex > task.orderIndex
    await this.prisma.task.updateMany({
      where: {
        userId,
        status: task.status,
        orderIndex: { gt: task.orderIndex },
      },
      data: {
        orderIndex: { decrement: 1 },
      },
    });
  }
}
