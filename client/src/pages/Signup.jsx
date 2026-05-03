import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Alert from '../components/Alert';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'member',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signup(formData.name, formData.email, formData.password, formData.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full flex rounded-3xl overflow-hidden glass shadow-2xl">
        
        {/* Left Side Branding */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <CheckSquare size={32} className="text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight">TaskManager</span>
            </div>
            
            <h1 className="text-5xl font-extrabold mt-16 leading-tight">
              Start <br/> collaborating <br/> today.
            </h1>
            <p className="mt-6 text-lg text-indigo-100 max-w-md">
              Create an account to join projects, manage your tasks, and communicate with your team effortlessly.
            </p>
          </div>
          
          {/* Visual abstract graphic */}
          <div className="relative z-10 mt-12 grid grid-cols-2 gap-4">
            <div className="h-24 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 p-4">
              <div className="w-1/2 h-2 bg-indigo-200/50 rounded mb-2"></div>
              <div className="w-full h-2 bg-indigo-200/30 rounded mb-4"></div>
              <div className="flex justify-end"><div className="w-6 h-6 rounded-full bg-indigo-400"></div></div>
            </div>
            <div className="h-24 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 p-4 mt-8">
              <div className="w-1/3 h-2 bg-purple-200/50 rounded mb-2"></div>
              <div className="w-2/3 h-2 bg-purple-200/30 rounded mb-4"></div>
              <div className="flex justify-end"><div className="w-6 h-6 rounded-full bg-purple-400"></div></div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl relative">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto h-full flex flex-col justify-center"
          >
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Join the workspace to get started.</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="mb-6">
                  <Alert type="error" message={error} onClose={() => setError('')} />
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <Input
                  label="Confirm"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={[
                  { value: 'member', label: 'Member' },
                  { value: 'admin', label: 'Admin (Workspace Manager)' },
                ]}
              />

              <Button type="submit" loading={loading} className="w-full mt-6 py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all group">
                Sign Up
                <UserPlus size={18} className="ml-2 group-hover:scale-110 transition-transform" />
              </Button>
            </form>

            <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
