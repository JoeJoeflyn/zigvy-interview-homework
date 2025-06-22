import { api } from '@/lib/api';
import type { TaskFormValues } from '@/schema/task.schema';
import type { Task } from '@/types/task.type';

export async function createTask(data: TaskFormValues) {
  // Ensure status is uppercased and spaces replaced with underscores
  const status =
    typeof data.status === 'string'
      ? data.status.toUpperCase().replace(' ', '_')
      : data.status;
  const payload = { ...data, status };
  return api.post('/tasks', payload);
}

export async function updateTask(id: number, data: Partial<TaskFormValues>) {
  return api.patch(`/tasks/${id}`, data);
}

export async function deleteTask(id: number) {
  return api.delete(`/tasks/${id}`);
}

export async function getTasks(params?: {
  search?: string;
  dueDate?: string;
}): Promise<Task[]> {
  const baseUrl = new URL('/tasks', window.location.origin);

  // Append each parameter manually if it exists
  if (params?.search) {
    baseUrl.searchParams.append('search', params.search);
  }

  if (params?.dueDate) {
    baseUrl.searchParams.append('dueDate', params.dueDate);
  }

  // Remove origin for API client
  const relativePath = baseUrl.pathname + baseUrl.search;

  return api.get(relativePath) as Promise<Task[]>;
}
