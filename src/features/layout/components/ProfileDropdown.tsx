import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { signOut } from 'firebase/auth';
import { User } from 'firebase/auth';
import { UserProfile } from '../../../types';

interface ProfileDropdownProps {
  user: User;
  userProfile: UserProfile | null;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded focus:outline-none"
      >
        <span>{userProfile?.displayName || user.email}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-700 rounded-md shadow-lg z-10">
          <div className="py-1">
            <div className="px-4 py-2">
              <span className="text-sm text-gray-400">Player ID</span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={user.uid}
                  readOnly
                  className="w-full bg-gray-800 text-white text-xs rounded px-2 py-1 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="border-t border-gray-600 my-1"></div>
            <button
              onClick={() => navigate('/profile')}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
