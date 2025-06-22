export const TASK_STATUS = ['TODO', 'IN_PROGRESS', 'COMPLETED'] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];

export const statusToColumnId = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const;

export const columnIdToStatus = {
  todo: 'TODO',
  'in-progress': 'IN_PROGRESS',
  completed: 'COMPLETED',
} as const;
