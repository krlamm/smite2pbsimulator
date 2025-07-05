import React from 'react';
import '../mute-button.css'

interface MuteButtonProps {
  isMuted: boolean;
  onToggle: () => void;
}

const MuteButton: React.FC<MuteButtonProps> = ({ isMuted, onToggle }) => {
  return (
    <button 
      className={`mute-button ${isMuted ? 'muted' : ''}`}
      onClick={onToggle}
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
    >
      <div className="mute-icon">
        {isMuted ? '🔇' : '🔊'}
      </div>
    </button>
  );
};

export default MuteButton;