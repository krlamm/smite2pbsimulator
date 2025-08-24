import { gods } from '../constants/gods';
import { Character, Draft } from '../types';

export const initializeCharacters = (): Character[] => {
  return gods;
};

export const convertNamesToCharacters = (names: string[]): Character[] => {
  return names.map(name => 
    gods.find(god => god.name === name) || gods[0]
  );
};

export const getInitialDraftState = (preservedDraft?: Draft): Partial<Draft> => {
  if (preservedDraft) {
    return preservedDraft;
  }

  return {
    picks: { A: [], B: [] },
    bans: { A: [], B: [] },
    currentTurn: 'A',
    currentPhase: 'banning',
    mode: 'standard'
  };
};

export const getActivePickIndices = (
  pickOrder: any[], 
  currentPickIndex: number, 
  teamKey: string, 
  status: string
): number[] => {
  const activeIndices: number[] = [];
  
  if (status === 'picking' && currentPickIndex < pickOrder.length) {
    const currentTeam = pickOrder[currentPickIndex].team;
    if (teamKey === currentTeam) {
      for (let i = currentPickIndex; i < pickOrder.length; i++) {
        if (pickOrder[i].team === currentTeam && pickOrder[i].type === 'pick') {
          activeIndices.push(i);
        } else {
          break;
        }
      }
    }
  } else if (status === 'banning' && pickOrder[currentPickIndex]?.team === teamKey) {
    activeIndices.push(currentPickIndex);
  }
  
  return activeIndices;
};

export const getTeamPickOrderIndices = (pickOrder: any[], teamKey: string): number[] => {
  const indices = pickOrder
    .map((p, index) => ({ ...p, originalIndex: index }))
    .filter(p => p.type === 'pick' && p.team === teamKey)
    .map(p => p.originalIndex);
  
  // Ensure we have 5 slots
  while (indices.length < 5) {
    indices.push(-1);
  }
  
  return indices;
};