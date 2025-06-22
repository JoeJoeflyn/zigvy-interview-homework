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
import type { TaskStatus } from '@/types/status.type';
import { useState, type ReactNode } from 'react';

export interface TaskFormValues {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string; // ISO string
  orderIndex?: number;
}

interface CardModalProps {
  initialValues?: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
  triggerLabel?: ReactNode;
  isEdit?: boolean;
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
}: CardModalProps) {
  const [form, setForm] = useState<TaskFormValues>(initialValues);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog>
      <form onSubmit={handleSubmit}>
        <DialogTrigger asChild>
          <Button variant="outline">{triggerLabel}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit card' : 'Add card'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Edit this card's details."
                : 'Add a new card to your column.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="border rounded p-2 min-h-[60px]"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border rounded p-2"
                required
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate ? form.dueDate.slice(0, 10) : ''}
                onChange={handleChange}
              />
            </div>
            {typeof form.orderIndex !== 'undefined' && (
              <input type="hidden" name="orderIndex" value={form.orderIndex} />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">
              {isEdit ? 'Save changes' : 'Add card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
