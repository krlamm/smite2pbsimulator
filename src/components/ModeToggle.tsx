import React from 'react';

interface ModeToggleProps {
  mode: 'standard' | 'freedom';
  onModeChange: (mode: 'standard' | 'freedom') => void;
}

function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle-container">
      <div className={`mode-toggle ${mode}`}>
        <div 
          className={`toggle-option ${mode === 'standard' ? 'active' : ''}`}
          onClick={() => onModeChange('standard')}
        >
          Pick/Ban
        </div>
        <div 
          className={`toggle-option ${mode === 'freedom' ? 'active' : ''}`}
          onClick={() => onModeChange('freedom')}
        >
          Free
        </div>
        <div className="slider"></div>
      </div>
    </div>
  );
}

export default ModeToggle;
