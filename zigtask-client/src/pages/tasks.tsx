import { useState } from 'react';
import { KanbanBoard } from '@/components/kanban-board';
import { Navbar } from '@/components/navbar';

export default function Tasks() {
  const [search, setSearch] = useState('');
  const [dueDate, setDueDate] = useState('');

  return (
    <div>
      <Navbar />
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="flex flex-col md:flex-row flex-wrap gap-3 items-end bg-muted/50 rounded-lg px-2 py-3 sm:px-4 shadow-sm w-full max-w-xl">
            <div className="flex flex-col w-full md:w-auto">
              <label htmlFor="search" className="text-xs font-medium mb-1">
                Search
              </label>
              <div className="flex gap-1 w-full">
                <input
                  id="search"
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border rounded px-2 py-1 min-w-[140px] w-full md:w-auto"
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
            <div className="flex flex-col w-full md:w-auto">
              <label htmlFor="dueDate" className="text-xs font-medium mb-1">
                Due Date
              </label>
              <div className="flex gap-1 w-full">
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="border rounded px-2 py-1 min-w-[120px] w-full md:w-auto"
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
