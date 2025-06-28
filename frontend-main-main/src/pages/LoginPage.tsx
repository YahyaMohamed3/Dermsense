import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/ui/Logo';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import NeuralNetworkModel from "../components/three/NeuralNetworkModel";
import ParticleField from "../components/three/ParticleField";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // --- LOGIC UPDATED: Replaced simulation with a real API call ---
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/clinical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: credentials.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // This handles server-side errors, like a 401 for a wrong password
        throw new Error(data.detail || 'Authentication failed. Please check your credentials.');
      }

      if (data.success) {
        // On successful authentication from the backend:
        // 1. Store the authentication state in the browser's local storage.
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'dermatologist');
        // 2. Navigate to the clinical dashboard.
        navigate('/dashboard');
      } else {
        // Handle cases where the server responds 200 OK but login is not successful
        setError(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      // This catches network errors or errors thrown from the response check
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown network error occurred.');
      }
    } finally {
      // Ensure the loading spinner is turned off
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Clinical Login | DermaSense</title>
        <meta name="description" content="Secure login for healthcare professionals" />
      </Helmet>

      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 -z-10">
          <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
            <NeuralNetworkModel count={1500} />
            <ParticleField count={800} size={30} />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              enableRotate={true}
              rotateSpeed={0.2}
              autoRotate
              autoRotateSpeed={0.3}
            />
          </Canvas>
        </div>
        
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/95 to-white/98 dark:from-slate-900/95 dark:to-slate-900/98 -z-5"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md z-10"
        >
          <div className="glass-panel rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo className="w-16 h-16" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Clinical Access
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Secure login for healthcare professionals
              </p>
            </div>

            {/* Demo Credentials Notice */}
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-primary-800 dark:text-primary-300 mb-1">
                Demo Access
              </h3>
              <p className="text-xs text-primary-700 dark:text-primary-400">
                Password: <code className="bg-primary-100 dark:bg-primary-800 px-2 py-0.5 rounded">demoday2025</code>
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-3"
                >
                  <p className="text-sm text-error-800 dark:text-error-400">{error}</p>
                </motion.div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Username / Employee ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                  <input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary btn-lg relative py-3"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Authenticating...
                  </>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                This system is for authorized healthcare professionals only. 
                All access is logged and monitored for security purposes.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}