import React from 'react';
import MuteButton from './MuteButton';

const Header = () => {
  return (
    <div className="bg-dark-blue flex justify-center items-center px-5 border-b-2 border-light-blue shadow-lg">
      <div className="flex flex-row gap-4 whitespace-nowrap items-center justify-center w-2/5">
        <div className="text-2xl font-bold tracking-[2px] text-gold text-center text-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          SMITE 2 PICK/BAN SIMULATOR
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-chaos text-2xl text-shadow-border-glow">BETA - NOT FINAL</div>
          <MuteButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
