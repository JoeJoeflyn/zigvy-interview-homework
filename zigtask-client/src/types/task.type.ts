import type { UniqueIdentifier } from '@dnd-kit/core';
import type { TaskStatus } from './status.type';

export interface Task {
  id: UniqueIdentifier;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  orderIndex?: number;
}
