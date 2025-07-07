import React, { useState, useEffect, useRef } from 'react';
// import './layout-fix.css';
import './esports-layout.css';
import CharacterGrid from './components/CharacterGrid';
import EsportsTeamDisplay from './components/EsportsTeamDisplay';
import ModeToggle from './components/ModeToggle';
import BanArea from './components/BanArea';
import { Character, TeamState } from './types';
import { gods } from './constants/gods';
import MuteButton from './components/MuteButton';
import EditableTeamName from './components/EditableTeamName';

function App() {
  // Mode state
  const [mode, setMode] = useState<'standard' | 'freedom'>('standard');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5); // New volume state, default to 50%

  // Audio cache for reliable playback
  const [audioCache, setAudioCache] = useState<Map<string, HTMLAudioElement>>(new Map());

  // Smite 2 Open Beta Roster (as of July 2025, OB13)
  const [characters] = useState<Character[]>(gods);

  const [phase, setPhase] = useState<'BAN' | 'PICK'>('BAN');
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');

  // History state to store snapshots of picks, bans, phase, and currentTeam
  const [history, setHistory] = useState<{ picks: TeamState; bans: TeamState; phase: 'BAN' | 'PICK'; currentTeam: 'A' | 'B' }[]>([]);

  const [picks, setPicks] = useState<TeamState>({ A: [], B: [] });
  // HIGHLIGHTED CHANGE: BANS INITIALIZATION - Now 3 ban slots per team
  const [bans, setBans] = useState<TeamState>({ A: Array(3).fill(null), B: Array(3).fill(null) }); // Changed to 3 ban slots per team

  // Draft pick order for the PICK phase (10 total picks)
  const pickSequence: ('A' | 'B')[] = ['A', 'B', 'B', 'A', 'A', 'B', 'B', 'A', 'A', 'B'];

  // State for editable team names
  const [teamAName, setTeamAName] = useState('ORDER');
  const [teamBName, setTeamBName] = useState('CHAOS');

  // Refs for contentEditable divs
  // const teamANameRef = useRef<HTMLDivElement>(null);
  // const teamBNameRef = useRef<HTMLDivElement>(null);

  // Use useEffect to set initial content and handle external changes (e.g., undo)
  // useEffect(() => {
  //   if (teamANameRef.current && teamANameRef.current.textContent !== teamAName) {
  //     teamANameRef.current.textContent = teamAName;
  //   }
  // }, [teamAName]);

  // useEffect(() => {
  //   if (teamBNameRef.current && teamBNameRef.current.textContent !== teamBName) {
  //     teamBNameRef.current.textContent = teamBName;
  //   }
  // }, [teamBName]);

  const playAudio = (name: string) => {
    if (isMuted) return; // Don't play if muted

    // Check if audio is already cached
    let audio = audioCache.get(name);

    if (!audio) {
      // Create and cache the audio if not already cached
      audio = new Audio(`${name}.ogg`);
      audio.preload = 'auto';
      audio.volume = volume; // Set initial volume

      setAudioCache(prev => new Map(prev).set(name, audio!));

      // Wait for it to be fully loaded before playing
      const playWhenReady = () => {
        // Ensure we're at the beginning and audio is ready
        audio!.currentTime = 0;
        audio!.volume = volume; // Ensure volume is set before playing cached audio
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
      audio.volume = volume; // Ensure volume is set before playing cached audio
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Update volume for all cached audio elements
    audioCache.forEach(audio => {
      audio.volume = newVolume;
    });
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  useEffect(() => {
    // When isMuted changes, adjust volume of all cached audio elements
    audioCache.forEach(audio => {
      audio.volume = isMuted ? 0 : volume;
    });
  }, [isMuted, volume, audioCache]);

  const handleCharacterSelect = (character: Character) => {
    console.log(character)
    playAudio(character.name)
    if (mode === 'freedom') {
      // In freedom mode, we'll handle this differently with drag and drop
      return;
    }

    // Save current state to history before making changes
    setHistory(prev => [...prev, { picks, bans, phase, currentTeam }]);

    if (phase === 'BAN') {
      setBans(prevBans => {
        const updatedBans: TeamState = { ...prevBans };
        // This logic is good for BAN phase: Find first empty slot and place character there
        const targetTeamBans = [...prevBans[currentTeam]]; // Create a mutable copy
        const firstEmptyIndex = targetTeamBans.findIndex(slot => slot === null);

        if (firstEmptyIndex !== -1) {
          targetTeamBans[firstEmptyIndex] = character; // Place character in first empty slot
        } else {
          console.warn(`All ban slots for team ${currentTeam} are full.`);
          return prevBans; // Return previous state if no slot is available
        }
        updatedBans[currentTeam] = targetTeamBans; // Update the team's bans

        // HIGHLIGHTED CHANGE: If we've reached 6 total bans (3 per team), move to the PICK phase
        const totalBans = updatedBans.A.filter(Boolean).length + updatedBans.B.filter(Boolean).length;
        if (totalBans >= 6) { // Corrected from 8 to 6, for 3 bans per team
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
      // HIGHLIGHTED CHANGE: REVERTED PICK LOGIC to original appending behavior
      const totalPicksBefore = picks.A.length + picks.B.length; // Uses .length as it appends

      setPicks(prevPicks => {
        const updatedPicks: TeamState = {
          ...prevPicks,
          [currentTeam]: [...prevPicks[currentTeam], character], // Appends character
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

    // Save current state to history before making changes
    setHistory(prev => [...prev, { picks, bans, phase, currentTeam }]);

    // Play audio for drag and drop as well
    playAudio(character.name);

    if (type === 'ban') {
      setBans(prevBans => {
        const newBans = { ...prevBans };
        // This logic is good for BAN phase: Use spread to copy and set at index
        const teamBans = [...newBans[team]];
        teamBans[index] = character;
        newBans[team] = teamBans;
        return newBans;
      });
    } else {
      // HIGHLIGHTED CHANGE: REVERTED PICK DRAG/DROP LOGIC to original appending behavior
      setPicks(prevPicks => {
        const newPicks = { ...prevPicks };
        // This assumes you want to add to the end when dropping on a pick slot
        // If you intended to replace a specific pick slot by index, this might need re-evaluation
        const teamPicks = [...newPicks[team]];
        if (index >= 0 && index < teamPicks.length) { // Check if index is valid for replacement
          teamPicks[index] = character;
        } else { // Otherwise, append if out of bounds or for new picks
          teamPicks.push(character);
        }
        newPicks[team] = teamPicks;
        return newPicks;
      });
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

  return (
    <div className={`app esports ${mode}`}>
      {/* Esports Header */}
      <div className="esports-header">
        <div className="center-header">
          <div className="tournament-logo">SMITE 2 PICK/BAN SIMULATOR</div>
          <div className="beta-info-and-controls">
            <div className="beta-text">BETA - NOT FINAL</div>
            <MuteButton 
              isMuted={isMuted} 
              onToggle={toggleMute} 
              volume={volume} // Pass volume state
              onVolumeChange={handleVolumeChange} // Pass volume change handler
            />
          </div>
        </div>
      </div>

      {/* Team names positioned below header */}
      <div className="team-names-container">
        <div className="team-name-group team-a-group">
          <EditableTeamName
            initialName={teamAName}
            onNameChange={setTeamAName}
            team="A"
          />
          <div className="pick-order team-a">1ST PICK</div>
        </div>
        {/* Mode Toggle - Centered above phase indicator */}
        <ModeToggle mode={mode} onModeChange={setMode} />
        {/* Undo Button */}
        <div className="undo-button-container">
          <button className="undo-button" onClick={handleUndo}>UNDO</button>
        </div>
        {/* Phase Indicator */}
        <div className="phase-indicator esports">
          {mode === 'standard' ? (
            <>
              Current Phase: <span className={`phase-text phase-${phase.toLowerCase()}`}>{phase}</span> -&nbsp;
              <span className={`turn-text ${currentTeam === 'A' ? 'order' : 'chaos'}`}>
                {currentTeam === 'A' ? `${teamAName.toUpperCase()}'S TURN` : `${teamBName.toUpperCase()}'S TURN`}
              </span>
            </>
          ) : (
            <span>Freedom Mode - Drag and drop any god to any position</span>
          )}
        </div>
        <div className="team-name-group team-b-group">
          <EditableTeamName
            initialName={teamBName}
            onNameChange={setTeamBName}
            team="B"
          />
          <div className="pick-order team-b">2ND PICK</div>
        </div>
      </div>

      {/* Main Content - Picks Section */}
      <div className="esports-content">
        {/* Ban Area - Now at the top level */}
        <BanArea
          bansA={bans.A}
          bansB={bans.B}
          mode={mode}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
        
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
    </div>
  );
}

export default App;