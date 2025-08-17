import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { BsSun } from 'react-icons/bs';
import { FaMoon } from 'react-icons/fa';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center w-18 h-9 rounded-full p-1 transition-all duration-300 ease-in-out transform hover:scale-105
        ${isDark 
          ? 'bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 hover:from-purple-800 hover:via-blue-800 hover:to-indigo-800 shadow-lg shadow-purple-500/25' 
          : 'bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 hover:from-orange-300 hover:via-yellow-300 hover:to-orange-400 shadow-lg shadow-orange-400/25'
        }
        focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-60 border border-opacity-30
        ${isDark ? 'border-cyan-400' : 'border-orange-200'}
      `}
    >
      {/* Animated slider pill */}
      <div
        className={`
          relative w-7 h-7 rounded-full shadow-xl transform transition-all duration-500 ease-out flex items-center justify-center
          ${isDark 
            ? 'translate-x-0 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-400' 
            : 'translate-x-9 bg-gradient-to-br from-white to-gray-100 border-2 border-orange-300'
          }
        `}
      >
        {/* Glowing effect */}
        <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isDark ? 'bg-cyan-400/20' : 'bg-orange-400/20'}`} />
        
        {isDark ? (
          <FaMoon className="text-cyan-300 text-sm z-10 drop-shadow-sm" />
        ) : (
          <BsSun className="text-orange-600 text-sm z-10 drop-shadow-sm" />
        )}
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${!isDark ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/10 to-orange-300/10" />
        </div>
      </div>
      
      {/* Side indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <div className={`transition-all duration-300 ${isDark ? 'opacity-0 scale-75' : 'opacity-40 scale-90'}`}>
          <FaMoon className="text-white text-xs drop-shadow-md" />
        </div>
        <div className={`transition-all duration-300 ${!isDark ? 'opacity-0 scale-75' : 'opacity-40 scale-90'}`}>
          <BsSun className="text-cyan-200 text-xs drop-shadow-md" />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggleButton;
