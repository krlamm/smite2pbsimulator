import { useState, useEffect, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Character, TeamState } from '../../../types';
import { gods } from '../../../constants/gods';
import { useAudioContext } from '../../layout/context/AudioContext';

const pickSequence: ('blue' | 'red')[] = ['blue', 'red', 'red', 'blue', 'blue', 'red', 'red', 'blue', 'blue', 'red'];

interface UseDraftProps {
  mode: 'standard' | 'freedom';
  initialState: any;
  draftId?: string;
  currentUser?: any;
}

export const useFirestoreDraft = ({ mode, initialState, draftId, currentUser }: UseDraftProps) => {
  const [characters] = useState<Character[]>(gods);
  const { playAudio } = useAudioContext();
  const prevInitialStateRef = useRef(initialState);

  const [phase, setPhase] = useState<'BAN' | 'PICK' | 'COMPLETE'>(initialState?.phase || 'BAN');
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B' | ''>(initialState?.activeTeam === 'blue' ? 'A' : 'B');
  const [picks, setPicks] = useState<TeamState>({ A: Array(5).fill(null), B: Array(5).fill(null) });
  const [bans, setBans] = useState<TeamState>({ A: Array(3).fill(null), B: Array(3).fill(null) });
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (!initialState || !currentUser) {
      setIsMyTurn(false);
      return;
    }

    const myTeam = initialState.blueTeamUser?.uid === currentUser.uid ? 'blue' : (initialState.redTeamUser?.uid === currentUser.uid ? 'red' : null);
    setIsMyTurn(myTeam === initialState.activeTeam);

    setPhase(initialState.phase);
    setCurrentTeam(initialState.activeTeam === 'blue' ? 'A' : 'B');

    const mapNamesToCharacters = (names: string[], size: number): (Character | null)[] => {
      const characterArray = names.map(name => gods.find(g => g.name === name) || null);
      while (characterArray.length < size) characterArray.push(null);
      return characterArray;
    };

    setPicks({
      A: mapNamesToCharacters(initialState.bluePicks || [], 5),
      B: mapNamesToCharacters(initialState.redPicks || [], 5),
    });
    setBans({
      A: mapNamesToCharacters(initialState.blueBans || [], 3),
      B: mapNamesToCharacters(initialState.redBans || [], 3),
    });

    // --- Audio Playback Logic ---
    if (prevInitialStateRef.current) {
      const prevBans = new Set([...(prevInitialStateRef.current.blueBans || []), ...(prevInitialStateRef.current.redBans || [])]);
      const currentBans = [...(initialState.blueBans || []), ...(initialState.redBans || [])];
      if (currentBans.length > prevBans.size) {
        const newBan = currentBans.find(ban => !prevBans.has(ban));
        if (newBan) {
          console.log(`[Audio] Playing ban sound for: ${newBan}`);
          playAudio(newBan);
        }
      }

      const prevPicks = new Set([...(prevInitialStateRef.current.bluePicks || []), ...(prevInitialStateRef.current.redPicks || [])]);
      const currentPicks = [...(initialState.bluePicks || []), ...(initialState.redPicks || [])];
      if (currentPicks.length > prevPicks.size) {
        const newPick = currentPicks.find(pick => !prevPicks.has(pick));
        if (newPick) {
          console.log(`[Audio] Playing pick sound for: ${newPick}`);
          playAudio(newPick);
        }
      }
    }
    
    prevInitialStateRef.current = initialState;

  }, [initialState, currentUser, playAudio]);

  const handleCharacterSelect = async (character: Character) => {
    if (!isMyTurn || !draftId || mode === 'freedom') return;
    
    const draftDocRef = doc(db, 'drafts', draftId);

    let newBlueBans = [...(initialState.blueBans || [])], newRedBans = [...(initialState.redBans || [])];
    let newBluePicks = [...(initialState.bluePicks || [])], newRedPicks = [...(initialState.redPicks || [])];
    let newPhase = initialState.phase, newActiveTeam = initialState.activeTeam;

    if (initialState.phase.startsWith('BAN')) {
      if (initialState.activeTeam === 'blue' && newBlueBans.length < 3) newBlueBans.push(character.name);
      else if (initialState.activeTeam === 'red' && newRedBans.length < 3) newRedBans.push(character.name);

      const totalBans = newBlueBans.length + newRedBans.length;
      if (totalBans >= 6) {
        newPhase = 'PICK';
        newActiveTeam = 'blue';
      } else {
        newActiveTeam = initialState.activeTeam === 'blue' ? 'red' : 'blue';
      }
    } else if (initialState.phase.startsWith('PICK')) {
      if (initialState.activeTeam === 'blue' && newBluePicks.length < 5) newBluePicks.push(character.name);
      else if (initialState.activeTeam === 'red' && newRedPicks.length < 5) newRedPicks.push(character.name);
      
      const totalPicks = newBluePicks.length + newRedPicks.length;
      if (totalPicks >= 10) {
        newPhase = 'COMPLETE';
        newActiveTeam = '';
      } else {
        newActiveTeam = pickSequence[totalPicks];
      }
    }

    await updateDoc(draftDocRef, {
      phase: newPhase, activeTeam: newActiveTeam, blueBans: newBlueBans,
      redBans: newRedBans, bluePicks: newBluePicks, redPicks: newRedPicks,
      availableGods: initialState.availableGods.filter((g: string) => g !== character.name)
    });
  };

  const handleReset = async () => {
    if (!draftId) return;
    const draftDocRef = doc(db, 'drafts', draftId);
    await updateDoc(draftDocRef, {
      phase: 'BAN',
      activeTeam: 'blue',
      blueBans: [],
      redBans: [],
      bluePicks: [],
      redPicks: [],
      availableGods: gods.map(g => g.name),
    });
  };

  const handleLeave = async () => {
    if (!draftId || !currentUser) return;

    const draftDocRef = doc(db, 'drafts', draftId);
    const updateData: { blueTeamUser?: any; redTeamUser?: any } = {};

    if (initialState.blueTeamUser?.uid === currentUser.uid) {
      updateData.blueTeamUser = null;
    } else if (initialState.redTeamUser?.uid === currentUser.uid) {
      updateData.redTeamUser = null;
    }

    if (Object.keys(updateData).length > 0) {
      await updateDoc(draftDocRef, updateData);
    }
  };

  return {
    mode, characters, phase, currentTeam, picks, bans, isMyTurn,
    handleCharacterSelect,
    handleDragStart: () => {}, handleDragOver: () => {}, handleDragLeave: () => {},
    handleDrop: () => console.log("Drag-and-drop is disabled in real-time mode."),
    handleStandardDrop: () => console.log("Drag-and-drop is disabled in real-time mode."),
    handleUndo: () => console.log("Undo is disabled in real-time mode."),
    handleClear: () => console.log("Clear is disabled in real-time mode."),
    handleReset,
    handleLeave,
  };
};