import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Scan, LogOut, BarChart3, Home, Shield, User } from 'lucide-react';
import { api, getAuthToken } from '../../services/api';

// Helper to check if a clinical user is logged in
function isClinician() {
  return localStorage.getItem('isClinicalAuthenticated') === 'true';
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClinicalAuth, setIsClinicalAuth] = useState(isClinician());
  const [isPatientAuth, setIsPatientAuth] = useState(!!getAuthToken());
  const navigate = useNavigate();

  // Listen to auth changes
  useEffect(() => {
    const updateAuthState = () => {
      setIsClinicalAuth(isClinician());
      setIsPatientAuth(!!getAuthToken());
    };
    window.addEventListener('authChange', updateAuthState);
    updateAuthState();
    return () => window.removeEventListener('authChange', updateAuthState);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);


  // Log out only clinical (not patient)
  const handleLogout = () => {
    api.clinicalLogout();
    setIsClinicalAuth(false);
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
    closeMobileMenu();
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4 mr-2" strokeWidth={1.5} /> },
    { name: 'Scan', path: '/scan', icon: <Scan className="w-4 h-4 mr-2" strokeWidth={1.5} /> },
    ...(isPatientAuth ? [
      { name: 'My Lesions', path: '/mylesion', icon: <BarChart3 className="w-4 h-4 mr-2" strokeWidth={1.5} /> }
    ] : [])
  ];

  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 10 + 8,
  }));

  return (
    <>
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 h-20 z-40 overflow-hidden pointer-events-none"
          >
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute bg-blue-400/10 rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                }}
                animate={{
                  x: [0, Math.random() * 30 - 15, 0],
                  y: [0, -20, 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10'
            : 'bg-transparent'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 opacity-60" />
        
        <div className="container mx-auto flex h-20 items-center justify-between px-4 relative z-10">
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeMobileMenu}>
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center relative overflow-hidden"
                style={{ borderRadius: '1rem 0.3rem 1rem 0.3rem' }}
              >
                <User className="w-6 h-6 text-white" />
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <div className="absolute -inset-1 bg-blue-400/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-white group-hover:text-blue-200 transition-colors duration-300">DermaSense</span>
              <span className="text-xs text-blue-300/80 -mt-1">AI Skin Analysis</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium transition-all duration-500 relative group ${
                    isActive 
                      ? 'text-blue-300' 
                      : 'text-blue-200/80 hover:text-white'
                  }`
                }
                style={{ borderRadius: '0.8rem 0.3rem 0.8rem 0.3rem' }}
              >
                {({ isActive }) => (
                  <>
                    {link.icon}
                    {link.name}
                    {isActive && (
                      <motion.span 
                        layoutId="navbar-active-pill"
                        className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 -z-10"
                        style={{ borderRadius: '0.8rem 0.3rem 0.8rem 0.3rem' }}
                        transition={{ type: "spring", duration: 0.6 }}
                      />
                    )}
                    <span 
                      className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-500 -z-10 backdrop-blur-sm"
                      style={{ borderRadius: '0.8rem 0.3rem 0.8rem 0.3rem' }}
                    ></span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Authentication Actions */}
            {isClinicalAuth ? (
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 hover:text-white transition-all duration-500 backdrop-blur-sm relative overflow-hidden group"
                style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
              >
                <motion.div
                  className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
                />
                <div className="relative z-10 flex items-center">
                  <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Logout
                </div>
              </motion.button>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link 
                  to="/scan" 
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-medium transition-all duration-500 relative overflow-hidden group"
                  style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
                  />
                  <div className="relative z-10 flex items-center">
                    <Scan className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Scan Now
                  </div>
                </Link>
                <Link 
                  to="/login" 
                  className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-blue-200 hover:text-white transition-all duration-500 backdrop-blur-sm relative overflow-hidden group"
                  style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
                  />
                  <div className="relative z-10 flex items-center">
                    <Shield className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Clinical Login
                  </div>
                </Link>
                <Link 
                  to="/PateintLogIn" 
                  className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-blue-200 hover:text-white transition-all duration-500 backdrop-blur-sm relative overflow-hidden group"
                  style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
                  />
                  <div className="relative z-10 flex items-center">
                    <User className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Signup / Login
                  </div> 
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex md:hidden items-center justify-center p-2 bg-white/5 hover:bg-white/10 border border-white/20 text-blue-200 hover:text-white transition-all duration-500 backdrop-blur-sm"
              style={{ borderRadius: '0.8rem 0.3rem 0.8rem 0.3rem' }}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMobileMenuOpen ? 
                    <X className="block h-6 w-6" strokeWidth={1.5} /> : 
                    <Menu className="block h-6 w-6" strokeWidth={1.5} />
                  }
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="md:hidden bg-slate-950/80 backdrop-blur-xl border-t border-white/10 relative overflow-hidden"
            >
              <div className="pt-4 pb-6 space-y-2 px-4 relative z-10">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 text-base font-medium transition-all duration-500 backdrop-blur-sm ${
                          isActive
                            ? 'bg-blue-500/20 border border-blue-500/30 text-blue-200'
                            : 'hover:bg-white/10 text-blue-200/80 hover:text-white border border-transparent hover:border-white/20'
                        }`
                      }
                      style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
                      onClick={closeMobileMenu}
                    >
                      {link.icon}
                      {link.name}
                    </NavLink>
                  </motion.div>
                ))}
                
                <div className="pt-4 border-t border-white/20 space-y-2">
                  {isClinicalAuth ? (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-base font-medium text-red-200 hover:text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-500 backdrop-blur-sm"
                      style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
                    >
                      <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Logout
                    </motion.button>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                      >
                        <Link
                          to="/PateintLogIn"
                          className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-medium transition-all duration-500"
                          style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
                          onClick={closeMobileMenu}
                        >
                          <User className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Patient Login
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <Link
                          to="/login"
                          className="flex items-center justify-center w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-blue-200 hover:text-white transition-all duration-500 backdrop-blur-sm"
                          style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem' }}
                          onClick={closeMobileMenu}
                        >
                          <Shield className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Clinical Login
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
