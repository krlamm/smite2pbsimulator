import React from 'react';
import MuteButton from './MuteButton';
import ThemeToggleButton from './ThemeToggleButton';
import ProfileDropdown from './ProfileDropdown';
import { useUserProfile } from '../../auth/hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, userProfile } = useUserProfile();
  const navigate = useNavigate();

  return (
    <div className="bg-dark-blue flex justify-between items-center px-5 border-b-2 border-light-blue shadow-lg">
      <div className="flex-1"></div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold tracking-[2px] text-gold text-center text-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          SMITE 2 PICK/BAN SIMULATOR
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-chaos text-2xl text-shadow-border-glow">BETA - NOT FINAL</div>
          <MuteButton />
          <ThemeToggleButton />
        </div>
      </div>
      <div className="flex-1 flex justify-end">
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
