import { useState } from 'react';
import { Character, TeamState } from '../../../types';
import { gods } from '../../../constants/gods';
import { useAudioContext } from '../../layout/context/AudioContext';

const pickSequence: ('A' | 'B')[] = ['A', 'B', 'B', 'A', 'A', 'B', 'B', 'A', 'A', 'B'];

interface UseDraftOptions {
  mode: 'standard' | 'freedom';
}

export const useDraft = ({ mode }: UseDraftOptions) => {
  const [characters] = useState<Character[]>(gods);
  const [phase, setPhase] = useState<'BAN' | 'PICK'>('BAN');
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [history, setHistory] = useState<{ picks: TeamState; bans: TeamState; phase: 'BAN' | 'PICK'; currentTeam: 'A' | 'B' }[]>([]);
  const [picks, setPicks] = useState<TeamState>({ A: Array(5).fill(null), B: Array(5).fill(null) });
  const [bans, setBans] = useState<TeamState>({ A: Array(3).fill(null), B: Array(3).fill(null) });
  const [aspects, setAspects] = useState<TeamState>({ A: Array(5).fill(false), B: Array(5).fill(false) });
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