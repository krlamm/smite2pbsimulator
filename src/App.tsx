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
    e.dataTransfer.setData('character', JSON.stringify(character));
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, team: 'A' | 'B', type: 'pick' | 'ban', index: number) => {
    e.preventDefault();
    const character = JSON.parse(e.dataTransfer.getData('character'));
    
    if (type === 'ban') {
      setBans(prevBans => {
        const newBans = { ...prevBans };
        newBans[team][index] = character;
        return newBans;
      });
    } else {
      setPicks(prevPicks => {
        const newPicks = { ...prevPicks };
        newPicks[team][index] = character;
        return newPicks;
      });
    }
  };

  return (
    <div className="app">
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
          onDrop={handleDrop}
        />
      </div>
    </div>
  );
}

export default App; 