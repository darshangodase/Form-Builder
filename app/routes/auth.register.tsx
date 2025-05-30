import { useState, useEffect } from 'react';
import { Form, useActionData, useNavigate, Link } from '@remix-run/react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { register, clearError } from '../store/slices/authSlice';
import { motion } from 'framer-motion';
import Navbar from '~/components/Navbar';

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector(state => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/templates');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'confirmPassword' && value !== formData.password) {
        setPasswordError('Passwords do not match');
      } else if (name === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    dispatch(register(formData));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:shadow-gray-900/50"
        >
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white"
            >
              Create your account
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
            >
              Already have an account?{' '}
              <Link 
                to="/auth/login" 
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
              >
                Sign in
              </Link>
            </motion.p>
          </div>

          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
          >
            {(error || passwordError) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 border border-red-200 dark:border-red-800"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-200">{error || passwordError}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <label 
                  htmlFor="name" 
                  className={`absolute left-3 transition-all duration-200 ${
                    focusedField === 'name' || formData.name 
                      ? '-top-2 text-xs text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 px-1 z-10' 
                      : 'top-3 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className={`appearance-none relative block w-full px-3 py-3 bg-gray-50/50 dark:bg-gray-700/50 border ${
                    focusedField === 'name' 
                      ? 'border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-500 dark:ring-indigo-400' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200`}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <label 
                  htmlFor="email" 
                  className={`absolute left-3 transition-all duration-200 ${
                    focusedField === 'email' || formData.email 
                      ? '-top-2 text-xs text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 px-1 z-10' 
                      : 'top-3 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`appearance-none relative block w-full px-3 py-3 bg-gray-50/50 dark:bg-gray-700/50 border ${
                    focusedField === 'email' 
                      ? 'border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-500 dark:ring-indigo-400' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200`}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <label 
                  htmlFor="password" 
                  className={`absolute left-3 transition-all duration-200 ${
                    focusedField === 'password' || formData.password 
                      ? '-top-2 text-xs text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 px-1 z-10' 
                      : 'top-3 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`appearance-none relative block w-full px-3 py-3 bg-gray-50/50 dark:bg-gray-700/50 border ${
                    focusedField === 'password' 
                      ? 'border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-500 dark:ring-indigo-400' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200`}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <label 
                  htmlFor="confirmPassword" 
                  className={`absolute left-3 transition-all duration-200 ${
                    focusedField === 'confirmPassword' || formData.confirmPassword 
                      ? '-top-2 text-xs text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 px-1 z-10' 
                      : 'top-3 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  className={`appearance-none relative block w-full px-3 py-3 bg-gray-50/50 dark:bg-gray-700/50 border ${
                    focusedField === 'confirmPassword' 
                      ? 'border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-500 dark:ring-indigo-400' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !!passwordError}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                loading || passwordError
                  ? 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800'
              } transition-all duration-200`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </>
  );
} 