import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { BsSun } from 'react-icons/bs';
import { FaMoon } from 'react-icons/fa';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-slate-700 text-yellow-400 hover:bg-slate-600 focus:outline-none transition-colors duration-300"
    >
      {theme === 'light' ? <FaMoon /> : <BsSun />}
    </button>
  );
};

export default ThemeToggleButton;
