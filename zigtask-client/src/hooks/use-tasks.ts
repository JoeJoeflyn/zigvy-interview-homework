import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateTask, deleteTask, createTask, getTasks } from '@/api/task';
import type { Task } from '@/types/task.type';

export function useTasks() {
  const queryClient = useQueryClient();

  const query = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Task> }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    ...query,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  };
} 