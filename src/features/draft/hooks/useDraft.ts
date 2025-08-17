import { useState } from 'react';
import { Character, TeamState } from '../../../types';
import { gods } from '../../../constants/gods';
import { useAudioContext } from '../../layout/context/AudioContext';

const pickSequence: ('A' | 'B')[] = ['A', 'B', 'B', 'A', 'A', 'B', 'B', 'A', 'A', 'B'];

interface UseDraftOptions {
  mode: 'standard' | 'freedom';
  initialState?: any; // Draft state to restore from
}

export const useDraft = ({ mode, initialState }: UseDraftOptions) => {
  const [characters] = useState<Character[]>(gods);
  
  // Initialize state from preserved draft or defaults
  const [phase, setPhase] = useState<'BAN' | 'PICK'>(initialState?.phase || 'BAN');
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>(initialState?.currentTeam || 'A');
  const [history, setHistory] = useState<{ picks: TeamState; bans: TeamState; phase: 'BAN' | 'PICK'; currentTeam: 'A' | 'B' }[]>([]);
  
  // Debug logging
  if (initialState) {
    console.log('useDraft: Restoring from initialState:', initialState);
  }
  
  // Convert preserved picks/bans back to Character objects
  const getInitialPicks = () => {
    if (!initialState?.picks) {
      console.log('getInitialPicks: No picks in initialState, returning empty arrays');
      return { A: Array(5).fill(null), B: Array(5).fill(null) };
    }
    
    console.log('getInitialPicks: Converting picks:', initialState.picks);
    console.log('getInitialPicks: picks.A:', initialState.picks.A);
    console.log('getInitialPicks: picks.B:', initialState.picks.B);
    
    const convertTeamPicks = (teamPicks: any[]) => {
      if (!teamPicks || !Array.isArray(teamPicks)) {
        console.log('convertTeamPicks: Invalid teamPicks:', teamPicks);
        return Array(5).fill(null);
      }
      
      return teamPicks.map((pick, index) => {
        if (!pick) return null;
        // Find character by name if pick is a string, or return as-is if already a Character object
        const converted = typeof pick === 'string' ? gods.find(god => god.name === pick) || null : pick;
        console.log(`Converting pick[${index}]:`, pick, '→', converted);
        return converted;
      });
    };
    
    const result = {
      A: convertTeamPicks(initialState.picks.A),
      B: convertTeamPicks(initialState.picks.B)
    };
    console.log('getInitialPicks result:', result);
    return result;
  };
  
  const getInitialBans = () => {
    if (!initialState?.bans) return { A: Array(3).fill(null), B: Array(3).fill(null) };
    
    console.log('getInitialBans: Converting bans:', initialState.bans);
    
    const convertTeamBans = (teamBans: any[]) => {
      return teamBans.map(ban => {
        if (!ban) return null;
        // Find character by name if ban is a string, or return as-is if already a Character object
        const converted = typeof ban === 'string' ? gods.find(god => god.name === ban) || null : ban;
        console.log('Converting ban:', ban, '→', converted);
        return converted;
      });
    };
    
    const result = {
      A: convertTeamBans(initialState.bans.A),
      B: convertTeamBans(initialState.bans.B)
    };
    console.log('getInitialBans result:', result);
    return result;
  };
  
  const [picks, setPicks] = useState<TeamState>(() => {
    const initialPicks = getInitialPicks();
    console.log('useDraft: Initialized picks:', initialPicks);
    return initialPicks;
  });
  const [bans, setBans] = useState<TeamState>(() => {
    const initialBans = getInitialBans();
    console.log('useDraft: Initialized bans:', initialBans);
    return initialBans;
  });
  const [aspects, setAspects] = useState<TeamState>(initialState?.aspects || { A: Array(5).fill(false), B: Array(5).fill(false) });
  const { playAudio } = useAudioContext();

  const handleCharacterSelect = (character: Character) => {
    playAudio(character.name);
    if (mode === 'freedom') {
      return;
    }

    setHistory(prev => [...prev, { picks, bans, phase, currentTeam }]);

    if (phase === 'BAN') {
      setBans(prevBans => {
        const updatedBans: TeamState = { ...prevBans };
        const targetTeamBans = [...prevBans[currentTeam]];
        const firstEmptyIndex = targetTeamBans.findIndex(slot => slot === null);

        if (firstEmptyIndex !== -1) {
          targetTeamBans[firstEmptyIndex] = character;
        } else {
          return prevBans;
        }
        updatedBans[currentTeam] = targetTeamBans;

        const totalBans = updatedBans.A.filter(Boolean).length + updatedBans.B.filter(Boolean).length;
        if (totalBans >= 6) {
          setPhase('PICK');
          setCurrentTeam(pickSequence[0]);
        } else {
          setCurrentTeam(prevTeam => (prevTeam === 'A' ? 'B' : 'A'));
        }

        return updatedBans;
      });
    } else {
      const totalPicksBefore = picks.A.filter(Boolean).length + picks.B.filter(Boolean).length;

      setPicks(prevPicks => {
        const newPicks = { ...prevPicks };
        const teamPicks = [...newPicks[currentTeam]];
        const firstEmptyIndex = teamPicks.findIndex(slot => slot === null);
        if (firstEmptyIndex !== -1) {
          teamPicks[firstEmptyIndex] = character;
        }
        newPicks[currentTeam] = teamPicks;
        return newPicks;
      });

      const totalPicksAfter = totalPicksBefore + 1;
      if (totalPicksAfter < pickSequence.length) {
        setCurrentTeam(pickSequence[totalPicksAfter]);
      }
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const lastState = history.pop();
      if (lastState) {
        setPicks(lastState.picks);
        setBans(lastState.bans);
        setPhase(lastState.phase);
        setCurrentTeam(lastState.currentTeam);
      }
    }
  };

  const handleClear = () => {
    setPicks({ A: Array(5).fill(null), B: Array(5).fill(null) });
    setBans({ A: Array(3).fill(null), B: Array(3).fill(null) });
    setPhase('BAN');
    setCurrentTeam('A');
    setHistory([]);
  };

  // Drag and drop functions are fully supported in local mode
  const handleDragStart = (e: React.DragEvent, character: Character) => {
    e.dataTransfer.setData('characterId', character.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, team: 'A' | 'B', type: 'pick' | 'ban', index: number) => {
    const characterId = parseInt(e.dataTransfer.getData('characterId'));
    const character = characters.find(c => c.id === characterId);
    if (!character) return;
    playAudio(character.name);
    // Simplified drop for freedom mode, more complex for standard
    if (type === 'ban') {
      setBans(prev => ({...prev, [team]: [...prev[team].slice(0, index), character, ...prev[team].slice(index + 1)]}));
    } else {
      setPicks(prev => ({...prev, [team]: [...prev[team].slice(0, index), character, ...prev[team].slice(index + 1)]}));
    }
  };

  const toggleAspect = (team: 'A' | 'B', index: number) => {
    setAspects(prev => {
      const newAspects = { ...prev };
      newAspects[team] = [...prev[team]];
      newAspects[team][index] = !prev[team][index];
      return newAspects;
    });
  };

  return {
    mode,
    characters,
    phase,
    currentTeam,
    picks,
    bans,
    aspects,
    handleCharacterSelect,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleUndo,
    handleClear,
    toggleAspect,
  };
};