import type { TaskStatus } from './status.type';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  orderIndex?: number;
}
