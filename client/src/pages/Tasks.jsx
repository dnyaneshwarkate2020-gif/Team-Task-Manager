import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, projectsAPI, usersAPI } from '../services/api';
import { Plus, Filter } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Alert from '../components/Alert';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';

const Tasks = () => {
  const { isAdmin, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTask, setActiveTask] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    projectId: '',
    status: '',
    assignedTo: '',
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
    assignedTo: '',
    projectId: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [projectsRes] = await Promise.all([projectsAPI.getAll()]);
      setProjects(projectsRes.data.data);

      if (isAdmin) {
        const usersRes = await usersAPI.getAll();
        setUsers(usersRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load data');
    }
  };

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.status) params.status = filters.status;
      if (filters.assignedTo) params.assignedTo = filters.assignedTo;

      const res = await tasksAPI.getAll(params);
      setTasks(res.data.data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
        assignedTo: task.assignedTo?._id || '',
        projectId: task.projectId?._id || '',
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        status: 'todo',
        dueDate: '',
        assignedTo: '',
        projectId: projects[0]?._id || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingTask) {
        await tasksAPI.update(editingTask._id, taskForm);
        setSuccess('Task updated');
      } else {
        await tasksAPI.create(taskForm);
        setSuccess('Task created');
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await tasksAPI.delete(id);
      setSuccess('Task deleted');
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveTask(tasks.find((t) => t._id === active.id));
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    // For sorting inside same column or moving to new column
    // The over.id might be a taskId or a columnId
    const overId = over.id;
    const isOverAColumn = ['todo', 'in-progress', 'completed'].includes(overId);
    
    let newStatus;
    if (isOverAColumn) {
      newStatus = overId;
    } else {
      const overTask = tasks.find(t => t._id === overId);
      if (overTask) {
        newStatus = overTask.status;
      } else {
        return;
      }
    }

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await tasksAPI.updateStatus(taskId, newStatus);
    } catch (err) {
      setError('Failed to move task');
      // Revert optimism
      fetchTasks();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'completed', title: 'Completed' },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Board</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Drag and drop tasks to change their status
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} />
            New Task
          </Button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 shrink-0">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mb-4 shrink-0">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-500" />
          <span className="font-medium text-gray-700 dark:text-gray-200">Filters</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Select
            value={filters.projectId}
            onChange={(e) =>
              setFilters({ ...filters, projectId: e.target.value })
            }
            options={[
              { value: '', label: 'All Projects' },
              ...projects.map((p) => ({ value: p._id, label: p.name })),
            ]}
          />
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: '', label: 'All Status' },
              { value: 'todo', label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
          {isAdmin && (
            <Select
              value={filters.assignedTo}
              onChange={(e) =>
                setFilters({ ...filters, assignedTo: e.target.value })
              }
              options={[
                { value: '', label: 'All Users' },
                ...users.map((u) => ({ value: u._id, label: u.name })),
              ]}
            />
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max">
            {columns.map((col) => (
              <div key={col.id} className="w-[350px] shrink-0 h-full">
                <KanbanColumn
                  id={col.id}
                  title={col.title}
                  tasks={tasks.filter((t) => t.status === col.id)}
                  onEdit={handleOpenModal}
                  onDelete={handleDelete}
                  isAdmin={isAdmin}
                  currentUserId={user?._id}
                />
              </div>
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <KanbanCard
                task={activeTask}
                isAdmin={isAdmin}
                currentUserId={user?._id}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="Task title"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Description
            </label>
            <textarea
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              placeholder="Task description"
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
          </div>

          <Select
            label="Project"
            value={taskForm.projectId}
            onChange={(e) =>
              setTaskForm({ ...taskForm, projectId: e.target.value })
            }
            options={[
              { value: '', label: 'Select Project' },
              ...projects.map((p) => ({ value: p._id, label: p.name })),
            ]}
            required
          />

          <Select
            label="Status"
            value={taskForm.status}
            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
            options={[
              { value: 'todo', label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
          />

          <Input
            label="Due Date"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) =>
              setTaskForm({ ...taskForm, dueDate: e.target.value })
            }
          />

          <Select
            label="Assign To"
            value={taskForm.assignedTo}
            onChange={(e) =>
              setTaskForm({ ...taskForm, assignedTo: e.target.value })
            }
            options={[
              { value: '', label: 'Unassigned' },
              ...users.map((u) => ({ value: u._id, label: u.name })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingTask ? 'Update' : 'Create'} Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
