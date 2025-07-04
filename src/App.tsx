import React, { useState } from 'react';
import './App.css';
import CharacterGrid from './components/CharacterGrid';
import TeamDisplay from './components/TeamDisplay';
import ModeToggle from './components/ModeToggle';
import { Character, TeamState } from './types';
import { gods } from './constants/gods';

function App() {
  // Mode state
  const [mode, setMode] = useState<'standard' | 'freedom'>('standard');
  
  // Smite 2 Open Beta Roster (as of July 2025, OB13)
  const [characters] = useState<Character[]>(gods); 
  
  const [phase, setPhase] = useState<'BAN' | 'PICK'>('BAN');
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [picks, setPicks] = useState<TeamState>({ A: [], B: [] });
  const [bans, setBans] = useState<TeamState>({ A: [], B: [] });

  // Draft pick order for the PICK phase (10 total picks)
  const pickSequence: ('A' | 'B')[] = ['A', 'B', 'B', 'A', 'A', 'B', 'B', 'A', 'A', 'B'];

  const handleCharacterSelect = (character: Character) => {
    if (mode === 'freedom') {
      // In freedom mode, we'll handle this differently with drag and drop
      return;
    }

    if (phase === 'BAN') {
      setBans(prevBans => {
        const updatedBans: TeamState = {
          ...prevBans,
          [currentTeam]: [...prevBans[currentTeam], character],
        };

        // If we've reached 6 total bans (3 per team), move to the PICK phase
        const totalBans = updatedBans.A.length + updatedBans.B.length;
        if (totalBans >= 6) {
          // Switch to pick phase and reset to first pick (Order)
          setPhase('PICK');
          setCurrentTeam(pickSequence[0]);
        } else {
          // Alternate bans
          setCurrentTeam(prevTeam => (prevTeam === 'A' ? 'B' : 'A'));
        }

        return updatedBans;
      });
    } else {
      // PICK PHASE
      const totalPicksBefore = picks.A.length + picks.B.length;

      setPicks(prevPicks => {
        const updatedPicks: TeamState = {
          ...prevPicks,
          [currentTeam]: [...prevPicks[currentTeam], character],
        };

        return updatedPicks;
      });

      const totalPicksAfter = totalPicksBefore + 1;
      if (totalPicksAfter < pickSequence.length) {
        setCurrentTeam(pickSequence[totalPicksAfter]);
      }
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, character: Character) => {
    e.dataTransfer.setData('characterId', character.id.toString());
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.classList.contains('ban-item') || e.currentTarget.classList.contains('pick-item')) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.classList.contains('drag-over')) {
      e.currentTarget.classList.remove('drag-over');
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, team: 'A' | 'B', type: 'pick' | 'ban', index: number) => {
    e.preventDefault();
    
    // Remove drag-over class
    if (e.currentTarget.classList.contains('drag-over')) {
      e.currentTarget.classList.remove('drag-over');
    }
    
    const characterId = parseInt(e.dataTransfer.getData('characterId'));
    const character = characters.find(c => c.id === characterId);
    
    if (!character) return;
    
    if (type === 'ban') {
      setBans(prevBans => {
        const newBans = { ...prevBans };
        // Create a new array if it doesn't exist
        if (!Array.isArray(newBans[team])) {
          newBans[team] = [];
        }
        // Create a copy of the array
        const teamBans = [...newBans[team]];
        // Set the character at the specific index
        teamBans[index] = character;
        newBans[team] = teamBans;
        return newBans;
      });
    } else {
      setPicks(prevPicks => {
        const newPicks = { ...prevPicks };
        // Create a new array if it doesn't exist
        if (!Array.isArray(newPicks[team])) {
          newPicks[team] = [];
        }
        // Create a copy of the array
        const teamPicks = [...newPicks[team]];
        // Set the character at the specific index
        teamPicks[index] = character;
        newPicks[team] = teamPicks;
        return newPicks;
      });
    }
  };

  return (
    <div className={`app ${mode}`}>
      <h1>Pick/Ban Simulator</h1>
      <ModeToggle mode={mode} onModeChange={setMode} />
      <div className="phase-indicator">
        {mode === 'standard' ? (
          <>
            Current Phase: <span className={`phase-text phase-${phase.toLowerCase()}`}>{phase}</span> - 
            <span className={`turn-text ${currentTeam === 'A' ? 'order' : 'chaos'}`}>
              {currentTeam === 'A' ? 'Order' : 'Chaos'}'s turn
            </span>
          </>
        ) : (
          <span>Freedom Mode - Drag and drop any god to any position</span>
        )}
      </div>
      <div className="main-content">
        {/* Order (Team A) on the left */}
        <TeamDisplay 
          team="A"
          picks={picks.A}
          bans={bans.A}
          mode={mode}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        {/* Character pool in the middle */}
        <CharacterGrid 
          characters={characters}
          onCharacterSelect={handleCharacterSelect}
          picks={picks}
          bans={bans}
          mode={mode}
          onDragStart={handleDragStart}
        />

        {/* Chaos (Team B) on the right */}
        <TeamDisplay 
          team="B"
          picks={picks.B}
          bans={bans.B}
          mode={mode}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      </div>
    </div>
  );
}

export default App; 