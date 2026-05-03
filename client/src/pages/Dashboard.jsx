import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FolderKanban,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await tasksAPI.getDashboardStats();
        setStats(res.data.data.stats);
        setMyTasks(res.data.data.myTasks);
        setRecentTasks(res.data.data.recentTasks);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: ListTodo,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Completed',
      value: stats?.completedTasks || 0,
      icon: CheckCircle,
      gradient: 'from-emerald-400 to-green-600',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressTasks || 0,
      icon: TrendingUp,
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      label: 'Overdue',
      value: stats?.overdueTasks || 0,
      icon: AlertTriangle,
      gradient: 'from-rose-500 to-red-600',
    },
    {
      label: 'Projects',
      value: stats?.projectCount || 0,
      icon: FolderKanban,
      gradient: 'from-fuchsia-500 to-purple-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          Here's your mission control for today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              variants={itemVariants}
              key={stat.label}
              className="glass rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Background gradient blob for effect */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="flex flex-col gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} p-0.5 shadow-lg`}>
                  <div className="w-full h-full bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-[10px] flex items-center justify-center">
                    <Icon className="text-white drop-shadow-md" size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* My Tasks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between bg-white/30 dark:bg-gray-800/30">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="text-indigo-500" size={20} />
              My Tasks
            </h2>
            <Link
              to="/tasks"
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
            >
              View all board
            </Link>
          </div>
          <div className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
            {myTasks.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">You're all caught up!</p>
              </div>
            ) : (
              myTasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="px-8 py-5 flex items-center justify-between gap-4 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors group cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
                        {task.projectId?.name}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <Clock size={12} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-3xl overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="text-purple-500" size={20} />
              Recent Team Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
            {recentTasks.length === 0 ? (
              <p className="p-12 text-gray-500 text-center font-medium">No recent activity</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task._id} className="px-8 py-5 hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-bold text-purple-500 uppercase tracking-wider bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded">
                          {task.projectId?.name}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                           <div className="w-5 h-5 bg-gradient-to-tr from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-[10px] text-white">
                             {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                           </div>
                           {task.assignedTo?.name || 'Unassigned'}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
