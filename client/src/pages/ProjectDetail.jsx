import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, tasksAPI, usersAPI } from '../services/api';
import {
  ArrowLeft,
  Calendar,
  Users,
  Plus,
  Trash2,
  Edit,
  Clock,
} from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
    assignedTo: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectsAPI.getOne(id),
        tasksAPI.getAll({ projectId: id }),
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data);

      if (isAdmin) {
        const usersRes = await usersAPI.getAll();
        setUsers(usersRes.data.data);
      }
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTaskModal = (task = null) => {
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
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        status: 'todo',
        dueDate: '',
        assignedTo: '',
      });
    }
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = { ...taskForm, projectId: id };
      if (editingTask) {
        await tasksAPI.update(editingTask._id, data);
        setSuccess('Task updated');
      } else {
        await tasksAPI.create(data);
        setSuccess('Task created');
      }
      setIsTaskModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;

    try {
      await tasksAPI.delete(taskId);
      setSuccess('Task deleted');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await tasksAPI.updateStatus(taskId, status);
      setSuccess('Status updated');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Link to="/projects" className="text-indigo-600 hover:underline mt-2 inline-block">
          Back to projects
        </Link>
      </div>
    );
  }

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              {project.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(project.deadline).toLocaleDateString()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users size={16} />
                {project.members?.length || 0} members
              </span>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={() => handleOpenTaskModal()}>
              <Plus size={20} />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mb-6">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="bg-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 capitalize">
                {status.replace('-', ' ')}
              </h3>
              <span className="bg-gray-200 text-gray-600 text-sm px-2 py-0.5 rounded-full">
                {statusTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {statusTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white rounded-lg p-4 shadow-sm border"
                >
                  <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {task.assignedTo && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-indigo-600">
                          {task.assignedTo.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {task.assignedTo.name}
                      </span>
                    </div>
                  )}

                  {/* Status dropdown for assigned user or admin */}
                  {(isAdmin ||
                    task.assignedTo?._id === user?._id) && (
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusUpdate(task._id, e.target.value)
                      }
                      className="w-full px-3 py-1.5 text-sm border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}

                  {/* Admin actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <button
                        onClick={() => handleOpenTaskModal(task)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors ml-auto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {statusTasks.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">
                  No tasks
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <Input
            label="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="Task title"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              placeholder="Task description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
              ...project.members.map((m) => ({
                value: m._id,
                label: m.name,
              })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsTaskModalOpen(false)}
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

export default ProjectDetail;
