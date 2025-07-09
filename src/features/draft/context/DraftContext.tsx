import React, { createContext, useContext } from 'react';
import { useDraft } from '../hooks/useDraft';

type DraftContextType = ReturnType<typeof useDraft>;

const DraftContext = createContext<DraftContextType | null>(null);

export const useDraftContext = () => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error('useDraftContext must be used within a DraftProvider');
  }
  return context;
};

export const DraftProvider: React.FC<{ children: React.ReactNode; mode: 'standard' | 'freedom' }> = ({ children, mode }) => {
  const draft = useDraft(mode);
  return <DraftContext.Provider value={draft}>{children}</DraftContext.Provider>;
};
