import React, { useEffect } from 'react';
import { Menu, Plus, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ setMobileMenuOpen, onAddClick }) => {
  const { user } = useAuth();
  const [isDark, setIsDark] = React.useState(false);

  useEffect(() => {
    // Check initial system preference or local storage
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
        <button
          onClick={onAddClick}
          className="btn btn-primary gap-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-800" aria-hidden="true" />

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-md">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
              {user?.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
