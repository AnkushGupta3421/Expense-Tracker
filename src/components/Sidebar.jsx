import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, FileText, Settings, X, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Expenses', path: '/expenses', icon: Receipt },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Spendly</span>
          </div>
          <button 
            type="button" 
            className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-dark-bg dark:hover:text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
          
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
