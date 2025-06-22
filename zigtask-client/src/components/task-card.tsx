import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import type { TaskFormValues } from '@/schema/task.schema';
import type { Task } from '@/types/task.type';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTasks } from '@/hooks/use-tasks';
import { cva } from 'class-variance-authority';
import { GripVertical, Trash2 } from 'lucide-react';
import { useCallback } from 'react';
import { CardModal } from './card-modal';
import { Badge } from './ui/badge';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export type TaskType = 'Task';

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const { deleteTaskMutation } = useTasks();

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: 'Task',
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva('', {
    variants: {
      dragging: {
        over: 'ring-2 opacity-30',
        overlay: 'ring-2 ring-primary',
      },
    },
  });

  // Map all fields for edit modal
  const initialValues: TaskFormValues = {
    title: task.title ?? '',
    description: task.description ?? '',
    status: task.status ?? 'TODO',
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
  };

  const handleDeleteTask = useCallback(() => {
    deleteTaskMutation.mutate(Number(task.id));
  }, [deleteTaskMutation, task.id]);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={
        variants({
          dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
        }) + ' group relative'
      }
    >
      <CardHeader className="px-3 py-3 flex flex-row justify-between items-center border-b-2 border-secondary">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            {...attributes}
            {...listeners}
            className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
          >
            <span className="sr-only">Move task</span>
            <GripVertical />
          </Button>
        </div>
        <Badge variant="outline" className="font-semibold">
          {task.title}
        </Badge>
      </CardHeader>
      <CardContent className="p-3 text-left whitespace-pre-wrap">
        {task.description}
        {task.dueDate && (
          <div className="text-xs text-muted-foreground mt-2">
            Due: {task.dueDate.slice(0, 10)}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-1 px-3 pb-2 pt-0">
        <CardModal
          isEdit
          triggerLabel="Edit"
          initialValues={initialValues}
          taskId={task.id}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteTask}
          className="text-destructive hover:bg-destructive/10"
          type="button"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
