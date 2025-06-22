import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from 'lib/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
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

  async findAll({ userId, status }: { userId: number; status?: TaskStatus }) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
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

  async update(userId: number, dto: UpdateTaskDto) {
    const { taskId, status, newIndex, title, description, dueDate } = dto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Get the task we're moving
      const task = await tx.task.findUniqueOrThrow({
        where: { userId, id: taskId },
      });

      const isSameStatus = task.status === status;
      const oldIndex = task.orderIndex;

      if (isSameStatus && newIndex === oldIndex) {
        return task; // No movement needed
      }

      // 2. Temporarily set the task's order to -1 to avoid voilate unique constraint
      await tx.task.update({
        where: { id: taskId },
        data: { orderIndex: -1 },
      });

      // 3. If changing status, update tasks in the old status
      if (!isSameStatus) {
        // Decrement orderIndex for tasks after the oldIndex in the old status
        const tasksToDecrement = await tx.task.findMany({
          where: {
            userId,
            status: task.status,
            orderIndex: { gt: oldIndex },
          },
          orderBy: { orderIndex: 'asc' },
        });
        for (const t of tasksToDecrement) {
          await tx.task.update({
            where: { id: t.id },
            data: { orderIndex: t.orderIndex - 1 },
          });
        }
      }

      // 4. Make space in the target status
      if (isSameStatus) {
        if (newIndex > oldIndex) {
          // Moving down within the same status: decrement orderIndex for tasks between oldIndex+1 and newIndex (inclusive)
          const tasksToDecrement = await tx.task.findMany({
            where: {
              userId,
              status,
              orderIndex: { gt: oldIndex, lte: newIndex },
            },
            orderBy: { orderIndex: 'asc' },
          });
          for (const t of tasksToDecrement) {
            await tx.task.update({
              where: { id: t.id },
              data: { orderIndex: t.orderIndex - 1 },
            });
          }
        } else {
          // Moving up within the same status: increment orderIndex for tasks between newIndex and oldIndex-1 (inclusive)
          const tasksToIncrement = await tx.task.findMany({
            where: {
              userId,
              status,
              orderIndex: { gte: newIndex, lt: oldIndex },
            },
            orderBy: { orderIndex: 'desc' },
          });
          for (const t of tasksToIncrement) {
            await tx.task.update({
              where: { id: t.id },
              data: { orderIndex: t.orderIndex + 1 },
            });
          }
        }
      } else {
        // Moving to a different status: increment orderIndex for tasks in the new status with orderIndex >= newIndex
        const tasksToIncrement = await tx.task.findMany({
          where: {
            userId,
            status,
            orderIndex: { gte: newIndex },
          },
          orderBy: { orderIndex: 'desc' },
        });
        await Promise.all(
          tasksToIncrement.map((t) =>
            tx.task.update({
              where: { id: t.id },
              data: { orderIndex: t.orderIndex + 1 },
            }),
          ),
        );
      }

      // 5. Update the task to its final position and status
      return tx.task.update({
        where: { id: taskId },
        data: {
          status,
          orderIndex: newIndex,
          ...(title && { title }),
          ...(description && { description }),
          // Only update dueDate if it's not undefined, if null it mean remove the dueDate
          ...(dueDate !== undefined ? { dueDate } : {}),
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
