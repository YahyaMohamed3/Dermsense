import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Scan, Sun, Moon, LogOut, BarChart3, Home, Shield, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from "../../lib/utils";
import Logo from '../ui/Logo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/');
    closeMobileMenu();
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4 mr-2" strokeWidth={1.5} /> },
    { name: 'Scan', path: '/scan', icon: <Scan className="w-4 h-4 mr-2" strokeWidth={1.5} /> },
    ...(isAuthenticated ? [
      { name: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-4 h-4 mr-2" strokeWidth={1.5} /> }
    ] : [])
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-slate-900/80 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group" onClick={closeMobileMenu}>
          <div className="relative">
            <Logo className="w-10 h-10 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute -inset-1 bg-secondary-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl text-white">DermaSense</span>
            <span className="text-xs text-secondary-400 -mt-1">AI Skin Analysis</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors relative group',
                  isActive 
                    ? 'text-secondary-400' 
                    : 'text-slate-300 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.icon}
                  {link.name}
                  {isActive && (
                    <motion.span 
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 bg-slate-800/80 -z-10 rounded-lg"
                      transition={{ type: "spring", duration: 0.6 }}
                    />
                  )}
                  <span className="absolute inset-0 rounded-lg bg-slate-800/0 group-hover:bg-slate-800/40 transition-colors -z-10"></span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors mr-2"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
              </motion.div>
            </AnimatePresence>
          </button>
          
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-2">
              <Link 
                to="/dashboard" 
                className="btn btn-outline btn-md px-4 py-2"
              >
                <BarChart3 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-md px-4 py-2 text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20"
              >
                <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link 
                to="/scan" 
                className="btn btn-primary btn-md px-4 py-2"
              >
                <Scan className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Scan Now
              </Link>
              <Link 
                to="/login" 
                className="btn btn-outline btn-md px-4 py-2"
              >
                Clinical Login
              </Link>
            </div>
          )}

          <button
            onClick={toggleMobileMenu}
            className="inline-flex md:hidden items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? <X className="block h-6 w-6" strokeWidth={1.5} /> : <Menu className="block h-6 w-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-slate-900 shadow-lg border-t border-slate-800"
          >
            <div className="pt-2 pb-4 space-y-1 px-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 rounded-md text-base font-medium',
                      isActive
                        ? 'bg-primary-900/30 text-primary-300'
                        : 'hover:bg-slate-800 text-slate-300'
                    )
                  }
                  onClick={closeMobileMenu}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
              
              <div className="pt-2 border-t border-slate-800">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-error-600 hover:bg-error-900/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/scan"
                      className="flex items-center justify-center w-full btn btn-primary btn-md mb-2 px-4 py-2"
                      onClick={closeMobileMenu}
                    >
                      <Scan className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Scan Now
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center w-full btn btn-outline btn-md px-4 py-2"
                      onClick={closeMobileMenu}
                    >
                      Clinical Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}