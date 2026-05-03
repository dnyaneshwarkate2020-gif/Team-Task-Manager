import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Edit, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';

export default function KanbanCard({ task, onEdit, onDelete, isAdmin, currentUserId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { ...task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const canModify = isAdmin || task.assignedTo?._id === currentUserId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing mb-3 group transition-all relative overflow-hidden",
        isDragging && "opacity-50 ring-2 ring-indigo-500 shadow-lg scale-105 z-50"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug">
          {task.title}
        </h3>
        
        {/* Actions - visible on hover */}
        {canModify && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              className="p-1 text-gray-500 hover:text-indigo-600 rounded bg-gray-50 dark:bg-gray-700"
            >
              <Edit size={14} />
            </button>
            {isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
                className="p-1 text-gray-500 hover:text-red-600 rounded bg-gray-50 dark:bg-gray-700"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1">
          {task.projectId?.name && (
            <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
              {task.projectId.name}
            </span>
          )}
          {task.dueDate && (
            <div className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-red-500 font-medium" : "text-gray-400")}>
              <Clock size={12} />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {task.assignedTo && (
          <div
            className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
            title={task.assignedTo.name}
          >
            {task.assignedTo.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
