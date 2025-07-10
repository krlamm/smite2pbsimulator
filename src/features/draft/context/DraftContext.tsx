import React, { createContext, useContext } from 'react';
import { useDraft } from '../hooks/useDraft';
import { useFirestoreDraft } from '../hooks/useFirestoreDraft';
import { TeamState } from '../../../types';

// Define a unified type for the context value, covering both hooks
interface DraftContextValue {
  mode: 'standard' | 'freedom';
  characters: any[];
  phase: string;
  currentTeam: 'A' | 'B' | '';
  picks: TeamState;
  bans: TeamState;
  handleCharacterSelect: (character: any) => void;
  handleUndo: () => void;
  handleClear: () => void;
  // Add other shared functions/state if necessary
}

const DraftContext = createContext<DraftContextValue | null>(null);

export const useDraftContext = () => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error('useDraftContext must be used within a DraftProvider');
  }
  return context;
};

// Props for the provider
interface DraftProviderProps {
  children: React.ReactNode;
  mode: 'standard' | 'freedom';
  // These are optional and only used for real-time mode
  initialState?: any; 
  draftId?: string;
}

export const DraftProvider: React.FC<DraftProviderProps> = ({ children, mode, initialState, draftId }) => {
  // Conditionally use the correct hook based on whether this is a real-time draft
  const draft = draftId 
    ? useFirestoreDraft({ mode, initialState, draftId })
    : useDraft({ mode });

  return <DraftContext.Provider value={draft as any}>{children}</DraftContext.Provider>;
};

