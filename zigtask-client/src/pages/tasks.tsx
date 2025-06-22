import { useState } from 'react';
import { KanbanBoard } from '@/components/kanban-board';
import { Navbar } from '@/components/navbar';

export default function Tasks() {
  const [search, setSearch] = useState('');
  const [dueDate, setDueDate] = useState('');

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="flex flex-wrap gap-3 items-end bg-muted/50 rounded-lg px-4 py-3 shadow-sm w-full max-w-xl">
            <div className="flex flex-col">
              <label htmlFor="search" className="text-xs font-medium mb-1">Search</label>
              <div className="flex gap-1">
                <input
                  id="search"
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="border rounded px-2 py-1 min-w-[180px]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-xs px-2 py-1 border rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="dueDate" className="text-xs font-medium mb-1">Due Date</label>
              <div className="flex gap-1">
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="border rounded px-2 py-1 min-w-[140px]"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="text-xs px-2 py-1 border rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <KanbanBoard filters={{ search, dueDate }} />
      </div>
    </div>
  );
}
