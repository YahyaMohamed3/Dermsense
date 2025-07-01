import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar'; // <-- Adjust the import if your path differs

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    password: ''
  });
  const [showPassword, setShowPassword] = useState(true); // Show by default
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- Handles only password field, no username ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ password: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://dermsense-1067130927657.us-central1.run.app/api/auth/login/clinical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: credentials.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed. Please check your credentials.');
      }

      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', 'clinician');
        localStorage.setItem('isClinicalAuthenticated', 'true');
        window.dispatchEvent(new Event('authChange'));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown network error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate particles for background animation
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 8,
  }));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute bg-blue-400/20 rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              animate={{
                y: [0, -120, 0],
                x: [0, Math.random() * 50 - 25, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Animated network connections */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <defs>
              <pattern id="network" width="80" height="80" patternUnits="userSpaceOnUse">
                <motion.circle
                  cx="40"
                  cy="40"
                  r="2"
                  fill="rgb(59, 130, 246)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.line
                  x1="40"
                  y1="40"
                  x2="80"
                  y2="40"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.line
                  x1="40"
                  y1="40"
                  x2="40"
                  y2="80"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#network)" />
          </svg>
        </div>

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-16 right-16 w-28 h-28 border border-blue-400/30"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-16 left-16 w-20 h-20 border border-blue-300/30 rounded-full"
          animate={{
            rotate: -360,
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 14,
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
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 relative overflow-hidden"
               style={{
                 borderRadius: '2rem 1rem 2rem 1rem',
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
               }}>
            {/* Flowing background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-60" />

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
                <LogIn className="w-10 h-10 text-white" />
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Clinician Access</h1>
              <p className="text-blue-200/80">Secure clinical login</p>
            </motion.div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-200 mb-1">
                Demo Access
              </h3>
              <p className="text-xs text-blue-100">
                Password: <code className="bg-blue-800 px-2 py-0.5 rounded">demoday2025</code>
              </p>
            </div>

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

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <label className="text-white text-sm font-medium mb-2 block">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 transition-colors duration-300 group-focus-within:text-blue-200" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={credentials.password}
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

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
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
                      <span>Access Dashboard</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </div>
              </motion.button>
            </form>

            <div className="mt-6 pt-6 border-t border-blue-800/50">
              <p className="text-xs text-blue-200/60 text-center">
                This system is for authorized clinicians only.<br />
                All access is logged and monitored for security purposes.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
