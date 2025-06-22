import { z } from "zod";
import { TASK_STATUS } from "@/types/status.type";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(TASK_STATUS),
  dueDate: z.string().optional(), // ISO string or empty
  orderIndex: z.number().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>; 