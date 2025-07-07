import React, { useState, useRef, useEffect } from 'react';
import '../mute-button.css'

interface MuteButtonProps {
  isMuted: boolean;
  onToggle: () => void;
  volume: number;
  onVolumeChange: (newVolume: number) => void;
}

const MuteButton: React.FC<MuteButtonProps> = ({ isMuted, onToggle, volume, onVolumeChange }) => {
  const [showSlider, setShowSlider] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowSlider(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setShowSlider(false);
    }, 4000); // Linger for 4 seconds
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    onVolumeChange(newVolume);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="mute-button-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className={`mute-button ${isMuted ? 'muted' : ''}`}
        onClick={onToggle}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      >
        <div className="mute-icon">
          {isMuted ? '🔇' : '🔊'}
        </div>
      </button>
      {showSlider && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleSliderChange}
          className="volume-slider"
          onMouseEnter={handleMouseEnter} // Keep slider visible if mouse re-enters slider
        />
      )}
    </div>
  );
};

export default MuteButton;