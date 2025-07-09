import React, { createContext, useContext } from 'react';
import { useAudio } from '../hooks/useAudio';

type AudioContextType = ReturnType<typeof useAudio>;

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
  return <AudioContext.Provider value={audio}>{children}</AudioContext.Provider>;
};
