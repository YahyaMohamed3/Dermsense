import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, UserCheck } from 'lucide-react';
// --- FIX: Import the unified 'api' object ---
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    if (name === 'confirmPassword') setConfirmTouched(true);
    if (name === 'password') setPasswordTouched(true);
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // --- FIX: Use the new api.signup method ---
      const response = await api.signup({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      });

      setSuccess(response.message);
      toast.success(response.message);
      
      // --- FIX: Redirect to the login page after success ---
      setTimeout(() => {
        navigate('/PateintLogIn');
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during signup';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    toast.error("Google signup is not implemented yet.");
  };

  // Password match logic
  const passwordsEntered = formData.password && formData.confirmPassword;
  const passwordsMatch = formData.password === formData.confirmPassword && passwordsEntered;
  const showMatchStatus =
    (confirmTouched || passwordTouched) && formData.confirmPassword.length > 0;

  // Generate particles for background animation
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center p-4 relative overflow-hidden mt-24">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Animated network grid */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <motion.path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating geometric shapes */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 border border-blue-400/20 rounded-full"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-24 h-24 border border-blue-300/20"
        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        animate={{
          rotate: -360,
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10 mt-4"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 pt-14 pb-14 px-8 relative overflow-hidden"
             style={{
               borderRadius: '2rem 1rem 2rem 1rem',
               background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
             }}>
          
          {/* Flowing background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-50" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8 relative z-10"
          >
            <motion.div 
              className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-6 flex items-center justify-center relative overflow-hidden"
              style={{ borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <UserCheck className="w-10 h-10 text-white" />
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-blue-200/80">Join us and start your journey</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500/30 p-3 mb-6 backdrop-blur-sm"
              style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
            >
              <p className="text-red-200 text-sm text-center">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/20 border border-green-500/30 p-3 mb-6 backdrop-blur-sm"
              style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
            >
              <p className="text-green-200 text-sm text-center">{success}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <label className="text-white text-sm font-medium mb-2 block">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 transition-colors duration-300 group-focus-within:text-blue-200" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 pl-12 pr-4 py-4 text-white placeholder-blue-200/60 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 backdrop-blur-sm"
                  style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <label className="text-white text-sm font-medium mb-2 block">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 transition-colors duration-300 group-focus-within:text-blue-200" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 pl-12 pr-4 py-4 text-white placeholder-blue-200/60 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 backdrop-blur-sm"
                  style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <label className="text-white text-sm font-medium mb-2 block">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 transition-colors duration-300 group-focus-within:text-blue-200" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 pl-12 pr-12 py-4 text-white placeholder-blue-200/60 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 backdrop-blur-sm"
                  style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-200 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <label className="text-white text-sm font-medium mb-2 block">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 transition-colors duration-300 group-focus-within:text-blue-200" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={() => setConfirmTouched(true)}
                  className="w-full bg-white/5 border border-white/20 pl-12 pr-12 py-4 text-white placeholder-blue-200/60 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 backdrop-blur-sm"
                  style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-200 transition-colors duration-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Live Password Match Status */}
              {showMatchStatus && (
                <div className="mt-2 transition-all">
                  {passwordsMatch ? (
                    <span className="text-green-400 bg-green-900/30 px-3 py-1 rounded-xl text-xs font-medium">
                      ✅ Passwords match
                    </span>
                  ) : (
                    <span className="text-red-400 bg-red-900/30 px-3 py-1 rounded-xl text-xs font-medium">
                      ❌ Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold py-4 px-6 transition-all duration-500 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{ borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }}
              />
              <div className="relative z-10 flex items-center space-x-2">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 relative z-10"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-r from-transparent via-gray-900/50 to-transparent text-blue-200/80">
                  Or continue with
                </span>
              </div>
            </div>

            <motion.button
              onClick={handleGoogleSignup}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 inline-flex justify-center items-center py-4 px-6 border border-white/20 shadow-sm bg-white/5 text-white font-medium hover:bg-white/10 transition-all duration-500 backdrop-blur-sm relative overflow-hidden group"
              style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
            >
              <motion.div
                className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
              />
              <div className="relative z-10 flex items-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </div>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 text-center relative z-10"
          >
            <p className="text-blue-200/80">
              Already have an account?{' '}
              <Link
                to="/PateintLogIn"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
              >
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;