import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full flex rounded-3xl overflow-hidden glass shadow-2xl">
        
        {/* Left Side Branding */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
          {/* Abstract background blobs */}
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
              Manage teamwork <br/> seamlessly.
            </h1>
            <p className="mt-6 text-lg text-indigo-100 max-w-md">
              A premium space to track projects, assign tasks, and collaborate with your entire team in real-time.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20">
            <p className="italic text-indigo-50 font-medium">
              "The new Kanban board and real-time updates have transformed how our team delivers projects on time."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold">JD</div>
              <div>
                <p className="font-bold text-sm">Jane Doe</p>
                <p className="text-xs text-indigo-200">Product Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto h-full flex flex-col justify-center"
          >
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">Please enter your details to sign in.</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="mb-6">
                  <Alert type="error" message={error} onClose={() => setError('')} />
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Button type="submit" loading={loading} className="w-full mt-4 py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all group">
                Sign In
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                Sign up here
              </Link>
            </p>

            {/* Demo credentials */}
            <div className="mt-10 p-5 bg-indigo-50 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-300 border border-indigo-100 dark:border-gray-700 shadow-inner">
              <p className="font-bold mb-3 text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <CheckSquare size={16}/> Demo Accounts:
              </p>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center bg-white dark:bg-gray-700 p-2 rounded border border-gray-100 dark:border-gray-600">
                  <span className="font-medium">Admin</span>
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400">admin@example.com / admin123</span>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-gray-700 p-2 rounded border border-gray-100 dark:border-gray-600">
                  <span className="font-medium">Member</span>
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400">john@example.com / member123</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
