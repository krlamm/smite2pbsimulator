import React from 'react';
import { useAudioContext } from '../context/AudioContext';

const MuteButton: React.FC = () => {
  const { isMuted, toggleMute, volume, handleVolumeChange } = useAudioContext();

  return (
    <div className="flex items-center gap-2.5">
      <button onClick={toggleMute} className="text-2xl">
        {isMuted ? '🔇' : '🔊'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
        className="w-24"
      />
    </div>
  );
};

export default MuteButton;
