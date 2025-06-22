import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { Task } from '@/types/task.type';
import {
  type Announcements,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { hasDraggableData } from '../lib/draggable-data';
import type { Column } from './board-column';
import { BoardColumn, BoardContainer } from './board-column';
import { TaskCard } from './task-card';
import { useTasks } from '@/hooks/use-tasks';

const defaultCols = [
  {
    id: 'todo' as const,
    title: 'Todo',
  },
  {
    id: 'in-progress' as const,
    title: 'In progress',
  },
  {
    id: 'completed' as const,
    title: 'Completed',
  },
] satisfies Column[];

export type ColumnId = (typeof defaultCols)[number]['id'];

// Map TaskStatus to ColumnId and vice versa
const statusToColumnId = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const;

export function KanbanBoard({ filters }: { filters?: { search?: string; dueDate?: string } }) {
  const pickedUpTaskColumn = useRef<ColumnId | null>(null);
  const columnsId = useMemo(() => defaultCols.map((col) => col.id), [defaultCols]);

  // Use the combined hook for fetching and mutations
  const {
    data: tasks = [],
    isLoading,
    updateTaskMutation,
  } = useTasks(filters);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  function getDraggingTaskData(taskId: UniqueIdentifier, columnId: ColumnId) {
    const tasksInColumn = tasks.filter(
      (task) => statusToColumnId[task.status] === columnId,
    );
    const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
    const column = defaultCols.find((col) => col.id === columnId);
    return {
      tasksInColumn,
      taskPosition,
      column,
    };
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === 'Column') {
        const startColumnIdx = columnsId.findIndex((id) => id === active.id);
        const startColumn = defaultCols[startColumnIdx];
        return `Picked up Column ${startColumn?.title} at position: ${
          startColumnIdx + 1
        } of ${columnsId.length}`;
      } else if (active.data.current?.type === 'Task') {
        pickedUpTaskColumn.current =
          statusToColumnId[active.data.current.task.status];
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          active.id,
          pickedUpTaskColumn.current as ColumnId,
        );
        return `Picked up Task ${
          active.data.current.task.title
        } at position: ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;

      if (
        active.data.current?.type === 'Column' &&
        over.data.current?.type === 'Column'
      ) {
        const overColumnIdx = columnsId.findIndex((id) => id === over.id);
        return `Column ${active.data.current.column.title} was moved over ${
          over.data.current.column.title
        } at position ${overColumnIdx + 1} of ${columnsId.length}`;
      } else if (
        active.data.current?.type === 'Task' &&
        over.data.current?.type === 'Task'
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          statusToColumnId[over.data.current.task.status],
        );
        if (
          statusToColumnId[over.data.current.task.status] !==
          pickedUpTaskColumn.current
        ) {
          return `Task ${
            active.data.current.task.title
          } was moved over column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskColumn.current = null;
        return;
      }
      if (
        active.data.current?.type === 'Column' &&
        over.data.current?.type === 'Column'
      ) {
        const overColumnPosition = columnsId.findIndex((id) => id === over.id);

        return `Column ${
          active.data.current.column.title
        } was dropped into position ${overColumnPosition + 1} of ${
          columnsId.length
        }`;
      } else if (
        active.data.current?.type === 'Task' &&
        over.data.current?.type === 'Task'
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          statusToColumnId[over.data.current.task.status],
        );
        if (
          statusToColumnId[over.data.current.task.status] !==
          pickedUpTaskColumn.current
        ) {
          return `Task was dropped into column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
      pickedUpTaskColumn.current = null;
    },
    onDragCancel({ active }) {
      pickedUpTaskColumn.current = null;
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };

  return isLoading ? (
    <div className="flex flex-col items-center justify-center h-[400px] w-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-3" />
      <span className="text-muted-foreground text-base">Loading tasks...</span>
    </div>
  ) : (
    <DndContext
      accessibility={{
        announcements,
      }}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <BoardContainer>
        <SortableContext items={columnsId}>
          {defaultCols.map((col) => (
            <BoardColumn
              key={col.id}
              column={col}
              tasks={tasks.filter(
                (task) => statusToColumnId[task.status] === col.id,
              )}
            />
          ))}
        </SortableContext>
      </BoardContainer>

      {'document' in window &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <BoardColumn
                isOverlay
                column={activeColumn}
                tasks={tasks.filter(
                  (task) => statusToColumnId[task.status] === activeColumn.id,
                )}
              />
            )}
            {activeTask && <TaskCard task={activeTask} isOverlay />}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === 'Column') {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === 'Task') {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;
    if (active.data.current?.type !== 'Task') return;

    const activeId = active.id;
    const overId = over.id;

    // Only handle card-over-card drops
    if (activeId !== overId && over.data.current?.type === 'Task') {
      // Find the over task
      const overTask = tasks.find((t) => String(t.id) === String(overId));
      console.log(overTask);
      
      if (overTask) {
        updateTaskMutation.mutate({
          id: Number(activeId),
          data: {
            status: overTask.status,
            orderIndex: overTask.orderIndex,
          },
        });
      }
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;

    const isActiveATask = activeData?.type === 'Task';

    if (!isActiveATask) return;
  }
}
