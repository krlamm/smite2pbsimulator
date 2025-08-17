import React, { createContext, useContext } from 'react';
import { useDraft } from '../hooks/useDraft';
import { useFirestoreDraft } from '../hooks/useFirestoreDraft';
import usePresence from '../hooks/usePresence';
import { TeamState, Draft } from '../../../types';

interface DraftContextValue {
  draftId?: string;
  mode: 'standard' | 'freedom';
  characters: any[];
  phase: string;
  currentTeam: 'A' | 'B' | '';
  picks: TeamState;
  bans: TeamState;
  aspects: TeamState;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  isMyTurn?: boolean;
  handleCharacterSelect: (character: any) => void;
  handleUndo: () => void;
  handleClear: () => void;
  handleReset?: () => void;
  handleLeave?: () => Promise<void>;
  handleDragStart: (e: React.DragEvent, character: any) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, team: 'A' | 'B', type: 'pick' | 'ban', index: number) => void;
  handleStandardDrop: (e: React.DragEvent, team: 'A' | 'B', type: 'pick' | 'ban', index: number) => void;
  toggleAspect: (team: 'A' | 'B', index: number) => void;
  initialState?: Draft | null;
  currentUser?: any;
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
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  // These are optional and only used for real-time mode
  initialState?: Draft | null; 
  draftId?: string;
  currentUser?: any;
}

export const DraftProvider: React.FC<DraftProviderProps> = ({ children, mode, initialState, draftId, currentUser, teamAName, teamBName, teamAColor, teamBColor }) => {
  // Conditionally use the correct hook based on whether this is a real-time draft
  const draft = draftId
    ? useFirestoreDraft({ mode, initialState, draftId, currentUser })
    : useDraft({ mode, initialState });

  // Initialize presence tracking for real-time drafts
  usePresence(currentUser?.uid, draftId);

  const contextValue = {
    ...draft,
    draftId,
    initialState, // Expose initialState
    currentUser,  // Expose currentUser
    teamAName,
    teamBName,
    teamAColor,
    teamBColor,
  };

  return <DraftContext.Provider value={contextValue as any}>{children}</DraftContext.Provider>;
};
