import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useAudio } from '../hooks/useAudio';

type AudioContextType = ReturnType<typeof useAudio> & {
  unlockAudio: () => void;
};

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audio = useAudio();
  const unlockedRef = useRef(false);

  const unlockAudio = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    
    // A simple way to unlock audio is to play a silent sound on user interaction.
    const silentAudio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    silentAudio.volume = 0;
    silentAudio.play().catch(() => {});
    console.log('Audio unlocked');
  }, []);

  const contextValue = {
    ...audio,
    unlockAudio,
  };

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
};
