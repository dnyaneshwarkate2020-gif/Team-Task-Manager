import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ id, title, tasks, onEdit, onDelete, isAdmin, currentUserId }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 w-full h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide text-sm">
          {title}
        </h2>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-2">
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
