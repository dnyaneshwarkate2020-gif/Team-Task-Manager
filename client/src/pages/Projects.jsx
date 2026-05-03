import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, usersAPI } from '../services/api';
import { Plus, Calendar, Users, Trash2, Edit, Eye } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Alert from '../components/Alert';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    members: [],
  });

  useEffect(() => {
    fetchProjects();
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description || '',
        deadline: project.deadline
          ? new Date(project.deadline).toISOString().split('T')[0]
          : '',
        members: project.members?.map((m) => m._id) || [],
      });
    } else {
      setEditingProject(null);
      setFormData({ name: '', description: '', deadline: '', members: [] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProject) {
        await projectsAPI.update(editingProject._id, formData);
        setSuccess('Project updated successfully');
      } else {
        await projectsAPI.create(formData);
        setSuccess('Project created successfully');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project? All tasks will be deleted.')) {
      return;
    }

    try {
      await projectsAPI.delete(id);
      setSuccess('Project deleted successfully');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleMember = (userId) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()}>
            <Plus size={20} />
            New Project
          </Button>
        )}
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

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <p className="text-gray-500">No projects found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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

                {/* Member avatars */}
                {project.members?.length > 0 && (
                  <div className="flex -space-x-2 mb-4">
                    {project.members.slice(0, 5).map((member) => (
                      <div
                        key={member._id}
                        className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center border-2 border-white"
                        title={member.name}
                      >
                        <span className="text-xs font-medium text-indigo-600">
                          {member.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    ))}
                    {project.members.length > 5 && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-xs font-medium text-gray-600">
                          +{project.members.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Link
                    to={`/projects/${project._id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </Link>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleOpenModal(project)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter project name"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Project description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Input
            label="Deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) =>
              setFormData({ ...formData, deadline: e.target.value })
            }
          />

          {/* Member selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Members
            </label>
            <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
              {users
                .filter((u) => u.role === 'member')
                .map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.members.includes(user._id)}
                      onChange={() => toggleMember(user._id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{user.name}</span>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </label>
                ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingProject ? 'Update' : 'Create'} Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
