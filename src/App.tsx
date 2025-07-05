import React, { useState } from 'react';
// import './layout-fix.css';
import './esports-layout.css';
import CharacterGrid from './components/CharacterGrid';
import EsportsTeamDisplay from './components/EsportsTeamDisplay';
import ModeToggle from './components/ModeToggle';
import BanArea from './components/BanArea';
import { Character, TeamState } from './types';
import { gods } from './constants/gods';
import MuteButton from './components/MuteButton';

function App() {
  // Mode state
  const [mode, setMode] = useState<'standard' | 'freedom'>('standard');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Audio cache for reliable playback
  const [audioCache, setAudioCache] = useState<Map<string, HTMLAudioElement>>(new Map());

  // Smite 2 Open Beta Roster (as of July 2025, OB13)
  const [characters] = useState<Character[]>(gods);

  const [phase, setPhase] = useState<'BAN' | 'PICK'>('BAN');
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [picks, setPicks] = useState<TeamState>({ A: [], B: [] });
  const [bans, setBans] = useState<TeamState>({ A: [], B: [] });

  // Draft pick order for the PICK phase (10 total picks)
  const pickSequence: ('A' | 'B')[] = ['A', 'B', 'B', 'A', 'A', 'B', 'B', 'A', 'A', 'B'];

  const playAudio = (name: string) => {
    if (isMuted) return; // Don't play if muted
    
    // Check if audio is already cached
    let audio = audioCache.get(name);
    
    if (!audio) {
      // Create and cache the audio if not already cached
      audio = new Audio(`/smite2pbsimulator/${name}.ogg`);
      audio.preload = 'auto';
      
      setAudioCache(prev => new Map(prev).set(name, audio!));
      
      // Wait for it to be fully loaded before playing
      const playWhenReady = () => {
        // Ensure we're at the beginning and audio is ready
        audio!.currentTime = 0;
        audio!.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      };

      // Use 'loadeddata' event which fires when audio is fully loaded
      if (audio.readyState >= 2) {
        // Audio is already loaded enough to play
        playWhenReady();
      } else {
        // Wait for audio to be ready
        audio.addEventListener('loadeddata', playWhenReady, { once: true });
        
        // Fallback in case loadeddata doesn't fire
        audio.addEventListener('canplaythrough', playWhenReady, { once: true });
      }
    } else {
      // Audio is cached and ready, play immediately
      audio.currentTime = 0; // Reset to beginning
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const handleCharacterSelect = (character: Character) => {
    console.log(character)
    playAudio(character.name)
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
    if (e.currentTarget.classList.contains('ban-item') ||
      e.currentTarget.classList.contains('pick-item') ||
      e.currentTarget.classList.contains('ban-slot') ||
      e.currentTarget.classList.contains('pick-slot')) {
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

    // Play audio for drag and drop as well
    playAudio(character.name);

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
    <div className={`app esports ${mode}`}>
      {/* Esports Header */}
      <div className="esports-header">
        {/* Team A name container */}
        <div className="esports-team-header team-a-header">
          {/* Team name will be positioned below in CSS */}
        </div>

        <div className="center-header">
          <div className="tournament-logo">SMITE 2 PICK/BAN SIMULATOR</div>
          <div className="beta-text">BETA - NOT FINAL</div>
        </div>

        <div className="header-controls">
          <MuteButton isMuted={isMuted} onToggle={toggleMute} />
        </div>

        {/* Team B name container */}
        <div className="esports-team-header team-b-header">
          {/* Team name will be positioned below in CSS */}
        </div>
      </div>

      {/* Team names positioned below header */}
      <div className="team-names-container">
        <div className="team-name-group team-a-group">
          <div className="team-name team-a">ORDER</div>
          <div className="pick-order team-a">1ST PICK</div>
        </div>
        <div className="team-name-group team-b-group">
          <div className="team-name team-b">CHAOS</div>
          <div className="pick-order team-b">2ND PICK</div>
        </div>
      </div>

      {/* Mode Toggle - Centered above phase indicator */}
      <div className="centered-mode-toggle">
        <ModeToggle mode={mode} onModeChange={setMode} />
      </div>

      {/* Phase Indicator */}
      <div className="phase-indicator esports">
        {mode === 'standard' ? (
          <>
            Current Phase: <span className={`phase-text phase-${phase.toLowerCase()}`}>{phase}</span> -&nbsp;
            <span className={`turn-text ${currentTeam === 'A' ? 'order' : 'chaos'}`}>
              {currentTeam === 'A' ? 'ORDER\'S TURN' : 'CHAOS\'S TURN'}
            </span>
          </>
        ) : (
          <span>Freedom Mode - Drag and drop any god to any position</span>
        )}
      </div>

      {/* Main Content - Picks Section */}
      <div className="esports-content">
        {/* Order (Team A) on the left */}
        <EsportsTeamDisplay
          team="A"
          picks={picks.A}
          bans={bans.A}
          mode={mode}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        {/* Center column with god selection grid */}
        <div className="esports-center-column">
          <div className="center-grid-container">
            <CharacterGrid
              characters={characters}
              onCharacterSelect={handleCharacterSelect}
              picks={picks}
              bans={bans}
              mode={mode}
              onDragStart={handleDragStart}
            />
          </div>
        </div>

        {/* Chaos (Team B) on the right */}
        <EsportsTeamDisplay
          team="B"
          picks={picks.B}
          bans={bans.B}
          mode={mode}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      </div>

      {/* Ban Area - Now directly under the picks */}
      <BanArea
        bansA={bans.A}
        bansB={bans.B}
        mode={mode}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  );
}

export default App;