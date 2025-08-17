import React from 'react';
import MuteButton from './MuteButton';
import ThemeToggleButton from './ThemeToggleButton';
import ProfileDropdown from './ProfileDropdown';
import { useUserProfile } from '../../auth/hooks/useUserProfile';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const Header = () => {
  const { user, userProfile } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = async () => {
    // Check if we're in a multiplayer draft and need to handle leaving
    const isDraftPath = location.pathname.startsWith('/draft/');
    
    if (isDraftPath && user) {
      // For multiplayer drafts, we should handle leaving gracefully
      // This would typically involve the same logic as the old leave button
      // For now, we'll just navigate home
      // TODO: Implement proper draft leaving logic if needed
    }
    
    navigate('/');
  };

  return (
    <div className="bg-dark-blue flex justify-between items-center px-5 border-b-2 border-light-blue shadow-lg">
      {/* Left Section - Navigation & Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleHomeClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"
          title="Return to Home"
        >
          <FaHome className="text-lg" />
          HOME
        </button>
        <div className="flex items-center gap-2">
          <MuteButton />
          <ThemeToggleButton />
        </div>
      </div>

      {/* Center Section - Title */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold tracking-[2px] text-gold text-center text-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          SMITE 2 PICK/BAN SIMULATOR
        </div>
        <div className="text-red-400 text-xl font-semibold">BETA - NOT FINAL</div>
      </div>

      {/* Right Section - Profile */}
      <div className="flex justify-end">
        {user && userProfile ? (
          <ProfileDropdown user={user} userProfile={userProfile} />
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
