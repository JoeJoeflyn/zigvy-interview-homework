import { api } from '@/lib/api';
import type { TaskFormValues } from '@/schema/task.schema';
import type { Task } from '@/types/task.type';

export async function createTask(data: TaskFormValues) {
  // Ensure status is uppercased and spaces replaced with underscores
  const status = typeof data.status === 'string' ? data.status.toUpperCase().replace(' ', '_') : data.status;
  const payload = { ...data, status };
  return api.post('/tasks', payload);
}

export async function updateTask(id: number, data: Partial<TaskFormValues>) {
  return api.patch(`/tasks/${id}`, data);
}

export async function deleteTask(id: number) {
  return api.delete(`/tasks/${id}`);
}

export async function getTasks(): Promise<Task[]> {
  return api.get('/tasks') as Promise<Task[]>;
}
