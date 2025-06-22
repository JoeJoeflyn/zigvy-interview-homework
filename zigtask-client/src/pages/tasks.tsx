import { KanbanBoard } from '@/components/kanban-board';
import { Navbar } from '@/components/navbar';

export default function Tasks() {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <KanbanBoard />
      </div>
    </div>
  );
}
