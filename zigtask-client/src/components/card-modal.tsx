import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTasks } from '@/hooks/use-tasks';
import type { TaskFormValues } from '@/schema/task.schema';
import { taskSchema } from '@/schema/task.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface CardModalProps {
  initialValues?: TaskFormValues;
  onSubmit?: (values: TaskFormValues) => void;
  triggerLabel?: string;
  isEdit?: boolean;
  children?: ReactNode;
  taskId?: number;
}

export function CardModal({
  initialValues = {
    title: '',
    description: '',
    status: 'TODO',
    dueDate: '',
  },
  onSubmit,
  triggerLabel = 'Add card',
  isEdit = false,
  children,
  taskId,
}: CardModalProps) {
  const { updateTaskMutation } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  const onValid = (values: TaskFormValues) => {
    // Ensure status is a valid enum value and in the correct case
    const submitValues = {
      ...values,
    };

    // Set dueDate to null if empty or falsy, otherwise convert to ISO string
    if (!submitValues.dueDate) {
      (submitValues as Record<string, unknown>).dueDate = null;
    } else {
      submitValues.dueDate = new Date(submitValues.dueDate).toISOString();
    }
    // Remove orderIndex and status if editing
    let updateValues: Partial<TaskFormValues> = submitValues;
    if (isEdit) {
      const { orderIndex, status, ...rest } = submitValues;
      void orderIndex;
      void status;
      updateValues = rest;
    }

    if (isEdit && taskId) {
      updateTaskMutation.mutate({ id: taskId, data: updateValues });
    } else if (onSubmit) {
      onSubmit(submitValues);
    }
    reset();
    setIsOpen(false); // Close the modal after submission
  };

  useEffect(() => {
    if (isEdit && isOpen) {
      reset(initialValues);
    }
  }, [isEdit, isOpen, initialValues, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" onClick={() => setIsOpen(true)}>
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onValid)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit card' : 'Add card'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Edit the task details below.'
                : 'Add a new task to your board.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && (
                <span className="text-red-500 text-xs">
                  {errors.title.message}
                </span>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                className="border rounded p-2 min-h-[60px]"
              />
              {errors.description && (
                <span className="text-red-500 text-xs">
                  {errors.description.message}
                </span>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register('dueDate')} />
              {errors.dueDate && (
                <span className="text-red-500 text-xs">
                  {errors.dueDate.message}
                </span>
              )}
            </div>
            {typeof initialValues.orderIndex !== 'undefined' && (
              <input
                type="hidden"
                {...register('orderIndex', { value: initialValues.orderIndex })}
              />
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {isEdit ? 'Save changes' : 'Add card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
