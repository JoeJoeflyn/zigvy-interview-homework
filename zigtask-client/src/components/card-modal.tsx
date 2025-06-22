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
import type { TaskFormValues } from '@/schema/task.schema';
import { taskSchema } from '@/schema/task.schema';
import { TASK_STATUS } from '@/types/status.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';

interface CardModalProps {
  initialValues?: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
  triggerLabel?: string;
  isEdit?: boolean;
  children?: ReactNode;
}

export function CardModal({
  initialValues = {
    title: '',
    description: '',
    status: 'TODO',
    dueDate: '',
    orderIndex: undefined,
  },
  onSubmit,
  triggerLabel = 'Add card',
  isEdit = false,
  children,
}: CardModalProps) {
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

    // Remove dueDate if empty string or falsy
    if (!submitValues.dueDate) {
      delete submitValues.dueDate;
    }

    onSubmit(submitValues);
    reset();
    setIsOpen(false); // Close the modal after submission
  };

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
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register('status')}
                className="border rounded p-2"
              >
                {TASK_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errors.status && (
                <span className="text-red-500 text-xs">
                  {errors.status.message}
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
