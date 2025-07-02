import React, { useState } from 'react';
import './App.css';
import CharacterGrid from './components/CharacterGrid';
import TeamDisplay from './components/TeamDisplay';
import { Character, TeamState } from './types';
import { gods } from './constants/gods';


function App() {
  // Smite 2 Open Beta Roster (as of July 2025, OB13)
  const [characters] = useState<Character[]>(gods); 
  
  const [phase, setPhase] = useState<'BAN' | 'PICK'>('BAN');
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [picks, setPicks] = useState<TeamState>({ A: [], B: [] });
  const [bans, setBans] = useState<TeamState>({ A: [], B: [] });

  // Draft pick order for the PICK phase (10 total picks)
  const pickSequence: ('A' | 'B')[] = ['A', 'B', 'B', 'A', 'A', 'B', 'B', 'A', 'A', 'B'];

  const handleCharacterSelect = (character: Character) => {
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
      const totalPicksBefore = picks.A.length + picks.B.length; // 0-based index in sequence

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

  return (
    <div className="app">
      <h1>Pick/Ban Simulator</h1>
      <div className="phase-indicator">
        Current Phase: {phase} - <span className={`team-name ${currentTeam === 'A' ? 'order' : 'chaos'}`}>{currentTeam === 'A' ? 'Order' : 'Chaos'}</span>'s turn
      </div>
      <div className="main-content">
        {/* Order (Team A) on the left */}
        <TeamDisplay 
          team="A"
          picks={picks.A}
          bans={bans.A}
        />

        {/* Character pool in the middle */}
        <CharacterGrid 
          characters={characters}
          onCharacterSelect={handleCharacterSelect}
          picks={picks}
          bans={bans}
        />

        {/* Chaos (Team B) on the right */}
        <TeamDisplay 
          team="B"
          picks={picks.B}
          bans={bans.B}
        />
      </div>
    </div>
  );
}

export default App; 