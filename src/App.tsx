import React, { useState, useEffect, useRef } from 'react';
import './index.css';
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
  const [teamAColor, setTeamAColor] = useState('#1abc9c'); // Default color for Team A (Order)
  const [teamBColor, setTeamBColor] = useState('#ff6666'); // Default color for Team B (Chaos)

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
    <div className={` bg-gradient-to-b from-dark-blue to-medium-blue text-white font-sans overflow-hidden flex flex-col h-screen ${mode}`}>
      {/* Esports Header */}
      <div className="bg-dark-blue flex justify-center items-center px-5 border-b-2 border-light-blue shadow-lg">
        <div className="flex flex-row gap-4 whitespace-nowrap items-center justify-center w-2/5">
          <div className="text-2xl font-bold tracking-[2px] text-gold text-center shadow-[0_0_10px_rgba(255,215,0,0.5)]">SMITE 2 PICK/BAN SIMULATOR</div>
          <div className="flex items-center gap-2.5">
            <div className="text-chaos text-2xl shadow-border-glow">BETA - NOT FINAL</div>
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
      <div className="flex justify-center items-center py-2.5 px-5 bg-black/50 border-b border-light-blue shadow-[0_2px_10px_rgba(0,204,255,0.3)] relative z-20 flex-wrap gap-[30px]">
        <div className="flex flex-col items-center w-1/6">
          <EditableTeamName
            initialName={teamAName}
            onNameChange={setTeamAName}
            team="A"
          />
          <div className="text-sm font-bold uppercase tracking-wider text-order">1ST PICK</div>
        </div>
        {/* Mode Toggle - Centered above phase indicator */}
        <ModeToggle mode={mode} onModeChange={setMode} />
        {/* Undo Button */}
        <div className="flex justify-center items-center w-52 mx-auto relative z-10">
          <button className="bg-gray-700 text-white border border-gray-500 rounded-full py-2 px-5 text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-gray-500 hover:border-gray-400" onClick={handleUndo}>UNDO</button>
        </div>
        {/* Phase Indicator */}
        <div className="bg-black/70 p-4 rounded-full text-center border border-light-blue shadow-border-glow text-2xl flex justify-center items-center">
          {mode === 'standard' ? (
            <>
              Current Phase - <span className={`turn-text ${currentTeam === 'A' ? 'text-teal-400' : 'text-red-500'}`} style={{ color: currentTeam === 'A' ? teamAColor : teamBColor }}>
                {currentTeam === 'A' ? `${teamAName.toUpperCase()}` : `${teamBName.toUpperCase()}`}
              </span> - <span className={`phase-text ${phase === 'BAN' ? 'text-red-500 shadow-[0_0_5px_rgba(255,51,51,0.5)] font-bold' : 'text-teal-400 font-bold'}`}>{phase}</span>
            </>
          ) : (
            <span>Freedom Mode - Drag and drop any god to any position</span>
          )}
        </div>
        <div className="flex flex-col items-center w-1/6">
          <EditableTeamName
            initialName={teamBName}
            onNameChange={setTeamBName}
            team="B"
          />
          <div className="text-sm font-bold uppercase tracking-wider text-chaos">2ND PICK</div>
        </div>
      </div>

      {/* Main Content - Picks Section */}
      <div className="flex overflow-y-auto px-4 gap-4 h-full w-full relative">
        
        
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
        <div className="flex-1 flex flex-col">
          {/* Ban Area - Now at the top level */}
        <BanArea
          bansA={bans.A}
          bansB={bans.B}
          mode={mode}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
          <div className="flex-1 bg-black/30 rounded-md overflow-y-auto flex flex-col border-2 border-light-blue shadow-[0_0_10px_rgba(0,204,255,0.3)] p-2.5 lg:p-4">
            
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