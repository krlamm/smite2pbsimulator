import React, { useState } from 'react';
import './App.css';
import CharacterGrid from './components/CharacterGrid';
import TeamDisplay from './components/TeamDisplay';
import { Character, TeamState } from './types';

function App() {
  // Smite 2 Open Beta Roster (as of July 2025, OB13)
  const [characters] = useState<Character[]>([
    // Guardians
    { id: 1, name: 'Ares', image: 'https://via.placeholder.com/100', role: 'Guardian' },
    { id: 2, name: 'Athena', image: 'https://via.placeholder.com/100', role: 'Guardian' },
    { id: 3, name: 'Bacchus', image: 'https://via.placeholder.com/100', role: 'Guardian' },
    { id: 4, name: 'Cabrakan', image: 'https://via.placeholder.com/100', role: 'Guardian' },
    { id: 5, name: 'Cerberus', image: 'https://via.placeholder.com/100', role: 'Guardian' },
    { id: 6, name: 'Ganesha', image: 'https://via.placeholder.com/100', role: 'Guardian' },
    { id: 7, name: 'Geb', image: 'https://via.placeholder.com/100', role: 'Guardian' },
    { id: 8, name: 'Khepri', image: 'https://via.placeholder.com/100', role: 'Guardian' },
    { id: 9, name: 'Sobek', image: 'https://via.placeholder.com/100', role: 'Guardian' },
    { id: 10, name: 'Ymir', image: 'https://via.placeholder.com/100', role: 'Guardian' },

    // Mages
    { id: 11, name: 'Agni', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 12, name: 'Ah Puch', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 13, name: 'Anubis', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 14, name: 'Aphrodite', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 15, name: 'Baron Samedi', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 16, name: 'Hades', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 17, name: 'Hecate', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 18, name: 'Kukulkan', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 19, name: 'Merlin', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 20, name: 'Nu Wa', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 21, name: 'Poseidon', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 22, name: 'Princess Bari', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 23, name: 'Scylla', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 24, name: 'Sol', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 25, name: 'The Morrigan', image: 'https://via.placeholder.com/100', role: 'Mage' },
    { id: 26, name: 'Zeus', image: 'https://via.placeholder.com/100', role: 'Mage' },

    // Warriors
    { id: 27, name: 'Achilles', image: 'https://via.placeholder.com/100', role: 'Warrior' },
    { id: 28, name: 'Amaterasu', image: 'https://via.placeholder.com/100', role: 'Warrior' },
    { id: 29, name: 'Bellona', image: 'https://via.placeholder.com/100', role: 'Warrior' },
    { id: 30, name: 'Chaac', image: 'https://via.placeholder.com/100', role: 'Warrior' },
    { id: 31, name: 'Guan Yu', image: 'https://via.placeholder.com/100', role: 'Warrior' },
    { id: 32, name: 'Mulan', image: 'https://via.placeholder.com/100', role: 'Warrior' },

    // Assassins
    { id: 33, name: 'Aladdin', image: 'https://via.placeholder.com/100', role: 'Assassin' },
    { id: 34, name: 'Awilix', image: 'https://via.placeholder.com/100', role: 'Assassin' },
    { id: 35, name: 'Fenrir', image: 'https://via.placeholder.com/100', role: 'Assassin' },
    { id: 36, name: 'Kali', image: 'https://via.placeholder.com/100', role: 'Assassin' },
    { id: 37, name: 'Loki', image: 'https://via.placeholder.com/100', role: 'Assassin' },
    { id: 38, name: 'Mercury', image: 'https://via.placeholder.com/100', role: 'Assassin' },
    { id: 39, name: 'Nemesis', image: 'https://via.placeholder.com/100', role: 'Assassin' },
    { id: 40, name: 'Susano', image: 'https://via.placeholder.com/100', role: 'Assassin' },
    { id: 41, name: 'Thanatos', image: 'https://via.placeholder.com/100', role: 'Assassin' },

    // Hunters
    { id: 42, name: 'Anhur', image: 'https://via.placeholder.com/100', role: 'Hunter' },
    { id: 43, name: 'Apollo', image: 'https://via.placeholder.com/100', role: 'Hunter' },
    { id: 44, name: 'Artemis', image: 'https://via.placeholder.com/100', role: 'Hunter' },
    { id: 45, name: 'Cernunnos', image: 'https://via.placeholder.com/100', role: 'Hunter' },
    { id: 46, name: 'Cupid', image: 'https://via.placeholder.com/100', role: 'Hunter' },
    { id: 47, name: 'Danzaburou', image: 'https://via.placeholder.com/100', role: 'Hunter' },
    { id: 48, name: 'Izanami', image: 'https://via.placeholder.com/100', role: 'Hunter' },
    { id: 49, name: 'Jing Wei', image: 'https://via.placeholder.com/100', role: 'Hunter' },
    { id: 50, name: 'Medusa', image: 'https://via.placeholder.com/100', role: 'Hunter' },
    { id: 51, name: 'Neith', image: 'https://via.placeholder.com/100', role: 'Hunter' },
    { id: 52, name: 'Rama', image: 'https://via.placeholder.com/100', role: 'Hunter' },
    { id: 53, name: 'Ullr', image: 'https://via.placeholder.com/100', role: 'Hunter' }
  ]);

  const [phase, setPhase] = useState<'BAN' | 'PICK'>('BAN');
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [picks, setPicks] = useState<TeamState>({ A: [], B: [] });
  const [bans, setBans] = useState<TeamState>({ A: [], B: [] });

  const handleCharacterSelect = (character: Character) => {
    if (phase === 'BAN') {
      setBans(prev => ({
        ...prev,
        [currentTeam]: [...prev[currentTeam], character]
      }));
    } else {
      setPicks(prev => ({
        ...prev,
        [currentTeam]: [...prev[currentTeam], character]
      }));
    }

    // Switch teams and possibly phase
    if (bans.A.length + bans.B.length < 6) { // 3 bans per team
      setCurrentTeam(currentTeam === 'A' ? 'B' : 'A');
    } else if (picks.A.length + picks.B.length < 10) { // 5 picks per team
      setPhase('PICK');
      setCurrentTeam(currentTeam === 'A' ? 'B' : 'A');
    }
  };

  return (
    <div className="app">
      <h1>Pick/Ban Simulator</h1>
      <div className="phase-indicator">
        Current Phase: {phase} - Team {currentTeam}'s turn
      </div>
      <div className="teams-container">
        <TeamDisplay 
          team="A"
          picks={picks.A}
          bans={bans.A}
        />
        <TeamDisplay 
          team="B"
          picks={picks.B}
          bans={bans.B}
        />
      </div>
      <CharacterGrid 
        characters={characters}
        onCharacterSelect={handleCharacterSelect}
        picks={picks}
        bans={bans}
      />
    </div>
  );
}

export default App; 