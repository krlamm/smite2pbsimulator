import { useState, useEffect } from 'react';
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
}

// This is the core of the fix. We ensure the internal state is always valid
// and carefully translate data to/from Firestore.
export const useFirestoreDraft = ({ mode, initialState, draftId }: UseDraftProps) => {
  const [characters] = useState<Character[]>(gods);
  const { playAudio } = useAudioContext();

  // These state variables will hold the data in the format the UI components expect.
  const [phase, setPhase] = useState<'BAN' | 'PICK' | 'COMPLETE'>(initialState.phase);
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>(initialState.activeTeam === 'blue' ? 'A' : 'B');
  const [picks, setPicks] = useState<TeamState>({ A: Array(5).fill(null), B: Array(5).fill(null) });
  const [bans, setBans] = useState<TeamState>({ A: Array(3).fill(null), B: Array(3).fill(null) });

  // This effect is the key. It syncs the robust internal state with the simple array data from Firestore.
  useEffect(() => {
    if (!initialState) return;

    setPhase(initialState.phase);
    setCurrentTeam(initialState.activeTeam === 'blue' ? 'A' : 'B');

    // Helper function to convert god names from Firestore into full Character objects
    const mapNamesToCharacters = (names: string[], size: number): (Character | null)[] => {
      const characterArray = names.map(name => gods.find(g => g.name === name) || null);
      while (characterArray.length < size) {
        characterArray.push(null);
      }
      return characterArray;
    };

    // Reconstruct the state objects the UI expects
    setPicks({
      A: mapNamesToCharacters(initialState.bluePicks || [], 5),
      B: mapNamesToCharacters(initialState.redPicks || [], 5),
    });
    setBans({
      A: mapNamesToCharacters(initialState.blueBans || [], 3),
      B: mapNamesToCharacters(initialState.redBans || [], 3),
    });

  }, [initialState]);


  const handleCharacterSelect = async (character: Character) => {
    if (!draftId || mode === 'freedom') return;
    
    playAudio(character.name);

    const draftDocRef = doc(db, 'drafts', draftId);

    // Create copies of the current arrays from Firestore state
    let newBlueBans = [...initialState.blueBans];
    let newRedBans = [...initialState.redBans];
    let newBluePicks = [...initialState.bluePicks];
    let newRedPicks = [...initialState.redPicks];
    let newPhase = initialState.phase;
    let newActiveTeam = initialState.activeTeam;

    // Determine the action based on the current phase
    if (initialState.phase.startsWith('BAN')) {
      if (initialState.activeTeam === 'blue' && newBlueBans.length < 3) {
        newBlueBans.push(character.name);
      } else if (initialState.activeTeam === 'red' && newRedBans.length < 3) {
        newRedBans.push(character.name);
      }

      const totalBans = newBlueBans.length + newRedBans.length;
      if (totalBans >= 6) {
        newPhase = 'PICK';
        newActiveTeam = 'blue'; // First pick is always blue team
      } else {
        newActiveTeam = initialState.activeTeam === 'blue' ? 'red' : 'blue';
      }
    } else if (initialState.phase.startsWith('PICK')) {
      if (initialState.activeTeam === 'blue' && newBluePicks.length < 5) {
        newBluePicks.push(character.name);
      } else if (initialState.activeTeam === 'red' && newRedPicks.length < 5) {
        newRedPicks.push(character.name);
      }
      
      const totalPicks = newBluePicks.length + newRedPicks.length;
      if (totalPicks >= 10) {
        newPhase = 'COMPLETE';
        newActiveTeam = ''; // No active team
      } else {
        newActiveTeam = pickSequence[totalPicks];
      }
    }

    // Update the document in Firestore with the new simple array data
    await updateDoc(draftDocRef, {
      phase: newPhase,
      activeTeam: newActiveTeam,
      blueBans: newBlueBans,
      redBans: newRedBans,
      bluePicks: newBluePicks,
      redPicks: newRedPicks,
      availableGods: initialState.availableGods.filter((g: string) => g !== character.name)
    });
  };

  // Disable unsupported functions for now
  const handleDragStart = () => {};
  const handleDragOver = () => {};
  const handleDragLeave = () => {};
  const handleDrop = () => console.log("Drag-and-drop is disabled in real-time mode.");
  const handleStandardDrop = () => console.log("Drag-and-drop is disabled in real-time mode.");
  const handleUndo = () => console.log("Undo is disabled in real-time mode.");
  const handleClear = () => console.log("Clear is disabled in real-time mode.");

  return {
    mode,
    characters,
    phase,
    currentTeam,
    picks,
    bans,
    handleCharacterSelect,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleStandardDrop,
    handleUndo,
    handleClear,
  };
};
