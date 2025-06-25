import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Logo from '../components/ui/Logo';
import NeuralNetworkModel from '../components/three/NeuralNetworkModel';
import ParticleField from '../components/three/ParticleField';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    setTimeout(() => {
      if (credentials.password === 'demoday2025') {
        // Store authentication state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'dermatologist');
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Use password: demoday2025');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Clinical Login | DermaSense</title>
        <meta name="description" content="Secure login for healthcare professionals" />
      </Helmet>

      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          {isMounted && (
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <NeuralNetworkModel count={1500} />
              <ParticleField count={300} size={30} />
              <OrbitControls 
                enableZoom={false} 
                enablePan={false} 
                enableRotate={true}
                rotateSpeed={0.2}
                autoRotate
                autoRotateSpeed={0.3}
              />
            </Canvas>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md z-10"
        >
          <div className="glass-panel p-8 shadow-[0_0_30px_rgba(0,246,255,0.15)]">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo className="w-12 h-12" />
              </div>
              <h1 className="text-2xl font-bold text-slate-100 mb-2">
                Clinical Access
              </h1>
              <p className="text-slate-400">
                Secure login for healthcare professionals
              </p>
            </div>

            {/* Demo Credentials Notice */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-cyan-400 mb-1">
                Demo Access
              </h3>
              <p className="text-xs text-slate-300">
                Password: <code className="bg-slate-700 px-1 rounded text-cyan-400">demoday2025</code>
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-error-500/10 border border-error-500/30 rounded-lg p-3"
                >
                  <p className="text-sm text-error-500">{error}</p>
                </motion.div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                  Username / Employee ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                  <input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-600 rounded-lg bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-slate-600 rounded-lg bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,246,255,0.4)] hover:shadow-[0_0_20px_rgba(0,246,255,0.6)] relative"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-400 text-center">
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