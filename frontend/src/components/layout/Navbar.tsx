import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Scan, Sun, Moon, LogOut, BarChart3 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from "../../lib/utils";
import Logo from '../ui/Logo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
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
    { name: 'Home', path: '/' },
    { name: 'Scan', path: '/scan', icon: <Scan className="w-4 h-4 mr-1" strokeWidth={1.5} /> },
    ...(isAuthenticated ? [
      { name: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-4 h-4 mr-1" strokeWidth={1.5} /> }
    ] : [])
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-slate-900/80 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
          <Logo className="w-8 h-8" />
          <span className="font-bold text-xl text-slate-100">DermaSense</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center text-sm font-medium transition-colors hover:text-cyan-500',
                  isActive ? 'text-cyan-500' : 'text-slate-300'
                )
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors mr-2 text-slate-400 hover:text-slate-200"
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
                {theme === 'dark' ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
              </motion.div>
            </AnimatePresence>
          </button>
          
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-2">
              <Link 
                to="/dashboard" 
                className="btn btn-outline btn-md text-cyan-500 border-cyan-500"
              >
                <BarChart3 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-md text-error-500 hover:text-error-400 hover:bg-error-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link 
                to="/scan" 
                className="btn btn-primary btn-md"
              >
                <Scan className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Scan Now
              </Link>
              <Link 
                to="/login" 
                className="btn btn-outline btn-md text-cyan-500 border-cyan-500"
              >
                Clinical Login
              </Link>
            </div>
          )}

          <button
            onClick={toggleMobileMenu}
            className="inline-flex md:hidden items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
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
            className="md:hidden glass-panel shadow-lg"
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
                        ? 'bg-cyan-500/20 text-cyan-500'
                        : 'hover:bg-slate-800 text-slate-300'
                    )
                  }
                  onClick={closeMobileMenu}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
              
              <div className="pt-2 border-t border-slate-700">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-error-500 hover:bg-error-500/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/scan"
                      className="flex items-center justify-center w-full btn btn-primary btn-md mb-2"
                      onClick={closeMobileMenu}
                    >
                      <Scan className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Scan Now
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center w-full btn btn-outline btn-md text-cyan-500 border-cyan-500"
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