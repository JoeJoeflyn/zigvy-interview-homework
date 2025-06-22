import { useTasks } from '@/hooks/use-tasks';
import type { TaskFormValues } from '@/schema/task.schema';
import type { TaskStatus } from '@/types/status.type';
import type { Task } from '@/types/task.type';
import { useDndContext, type UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { useCallback, useMemo } from 'react';
import { CardModal } from './card-modal';
import { TaskCard } from './task-card';
import { Card, CardContent, CardHeader } from './ui/card';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

export interface Column {
  id: UniqueIdentifier;
  title: string;
}

export type ColumnType = 'Column';

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
}

export function BoardColumn({ column, tasks, isOverlay }: BoardColumnProps) {
  const { createTaskMutation } = useTasks();
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    } satisfies ColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.title}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva(
    'h-[500px] w-[90vw] min-w-[260px] md:w-[350px] md:min-w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center overflow-hidden',
    {
      variants: {
        dragging: {
          default: 'border-2 border-transparent',
          over: 'ring-2 opacity-30',
          overlay: 'ring-2 ring-primary',
        },
      },
    },
  );

  const handleCreateCard = useCallback(
    (values: TaskFormValues) => {
      createTaskMutation.mutate({
        ...values,
        status: column.title as TaskStatus,
      });
    },
    [column],
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
      })}
    >
      <CardHeader className="p-4 font-semibold border-b-2 text-left flex flex-row items-center justify-between flex-shrink-0">
        <div>
          <CardModal triggerLabel="Add card" onSubmit={handleCreateCard} />
        </div>
        <span>{column.title}</span>
      </CardHeader>
      <ScrollArea className="h-[calc(500px-80px)]">
        <CardContent className="flex flex-col gap-2 p-2 pb-6 min-h-0">
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </CardContent>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva('px-2 md:px-0 flex lg:justify-center pb-4 overflow-x-auto md:overflow-x-visible', {
    variants: {
      dragging: {
        default: 'snap-x snap-mandatory',
        active: 'snap-none',
      },
    },
  });

  return (
    <div
      className={variations({
        dragging: dndContext.active ? 'active' : 'default',
      })}
    >
      <div className="flex gap-4 items-center flex-row justify-center">
        {children}
      </div>
    </div>
  );
}
