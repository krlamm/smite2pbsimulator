import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDraftContext } from '../context/DraftContext';
import EditableTeamName from '../../teams/components/EditableTeamName';

interface DraftControlsProps {
  teamAName: string;
  teamBName: string;
  onTeamANameChange: (name: string) => void;
  onTeamBNameChange: (name: string) => void;
  teamAColor: string;
  teamBColor: string;
}

const DraftControls: React.FC<DraftControlsProps> = ({
  teamAName,
  teamBName,
  onTeamANameChange,
  onTeamBNameChange,
  teamAColor,
  teamBColor,
}) => {
  const { handleUndo, handleClear, currentTeam, phase, draftId, handleReset, handleLeave, initialState, picks, bans, mode } = useDraftContext();
  const navigate = useNavigate();
  const isOnlineMode = !!draftId;

  const handleFinalTeamsClick = () => {
    let draftState;
    if (isOnlineMode && initialState) {
      const teamAPicks: any[] = [];
      const teamBPicks: any[] = [];

      // First, determine which team each pick belongs to
      Object.entries(initialState.picks).forEach(([index, pick]) => {
        const pickOrderEntry = initialState.pickOrder[parseInt(index, 10)];
        if (pickOrderEntry?.team === 'teamA') {
          teamAPicks.push(pick);
        } else if (pickOrderEntry?.team === 'teamB') {
          teamBPicks.push(pick);
        }
      });

      // A lookup for all players in the draft to find their display names
      const allPlayers = { ...initialState.teamA.players, ...initialState.teamB.players };

      // Create a new players object for display purposes
      const finalTeamAPlayers = teamAPicks.reduce((acc, pick, index) => {
        const uid = `final-A-${index}`;
        acc[uid] = {
          uid,
          displayName: allPlayers[pick.uid]?.displayName || 'Unknown Player',
          pick: pick.character,
        };
        return acc;
      }, {});

      const finalTeamBPlayers = teamBPicks.reduce((acc, pick, index) => {
        const uid = `final-B-${index}`;
        acc[uid] = {
          uid,
          displayName: allPlayers[pick.uid]?.displayName || 'Unknown Player',
          pick: pick.character,
        };
        return acc;
      }, {});

      draftState = {
        ...initialState,
        teamA: { ...initialState.teamA, players: finalTeamAPlayers },
        teamB: { ...initialState.teamB, players: finalTeamBPlayers },
      };
    } else {
      // Construct a draft state object for local mode
      const teamAPlayers = picks.A.map((pick, index) => ({
        uid: `local-A-${index}`,
        displayName: `Player ${index + 1}`,
        pick: pick ? pick.name : 'N/A',
      }));
      const teamBPlayers = picks.B.map((pick, index) => ({
        uid: `local-B-${index}`,
        displayName: `Player ${index + 6}`,
        pick: pick ? pick.name : 'N/A',
      }));

      draftState = {
        teamA: {
          name: teamAName,
          players: teamAPlayers.reduce((acc, player) => ({ ...acc, [player.uid]: player }), {}),
        },
        teamB: {
          name: teamBName,
          players: teamBPlayers.reduce((acc, player) => ({ ...acc, [player.uid]: player }), {}),
        },
        bans: {
          A: bans.A.map(ban => ban ? ban.name : null).filter(Boolean) as string[],
          B: bans.B.map(ban => ban ? ban.name : null).filter(Boolean) as string[],
        },
        // Add other required draft properties for consistency if needed
        status: 'complete',
        pickOrder: [],
        currentPickIndex: 0,
      };
    }
    navigate('/final-teams', { state: { draft: draftState } });
  };


  const renderTurnDisplay = () => {
    if (isOnlineMode && initialState) {
      const { status, pickOrder, currentPickIndex, teamA, teamB } = initialState;
      if (status === 'complete') {
        return <span>DRAFT COMPLETE</span>;
      }
      if (status === 'lobby') {
        return <span>DRAFT LOBBY</span>;
      }
      
      const currentTurn = pickOrder[currentPickIndex];
      if (!currentTurn) return <span>Waiting...</span>;

      // Check for consecutive picks
      let consecutivePicks = 0;
      if (status === 'picking') {
        const currentTeam = pickOrder[currentPickIndex].team;
        for (let i = currentPickIndex; i < pickOrder.length; i++) {
          if (pickOrder[i].team === currentTeam && pickOrder[i].type === 'pick') {
            consecutivePicks++;
          } else {
            break;
          }
        }
      }

      if (consecutivePicks > 1) {
        const teamName = currentTurn.team === 'teamA' ? teamAName : teamBName;
        const teamColor = currentTurn.team === 'teamA' ? teamAColor : teamBColor;
        return (
          <>
            <span style={{ color: teamColor }}>{teamName.toUpperCase()}</span>
            <span>&nbsp;TO PICK ({consecutivePicks})</span>
          </>
        );
      }

      const currentTeamData = currentTurn.team === 'teamA' ? teamA : teamB;
      const currentPlayer = currentTeamData.players[currentTurn.uid];
      const teamColor = currentTurn.team === 'teamA' ? teamAColor : teamBColor;
      const phaseText = status === 'banning' ? 'BAN' : 'PICK';

      return (
        <>
          <span style={{ color: teamColor }}>{currentPlayer.displayName.toUpperCase()}</span>
          <span>&nbsp;TO&nbsp;</span>
          <span className={phaseText === 'BAN' ? 'text-red-500' : 'text-teal-400'}>{phaseText}</span>
        </>
      );
    }

    // Fallback for local mode
    if (mode === 'freedom') {
      return <span>Free Mode - Drag any god to any position</span>;
    }

    return (
      <>
        Current Phase -{' '}
        <span
          className={`turn-text ${currentTeam === 'A' ? 'text-teal-400' : 'text-red-500'}`}
          style={{ color: currentTeam === 'A' ? teamAColor : teamBColor }}
        >
          {currentTeam === 'A' ? `${teamAName.toUpperCase()}` : `${teamBName.toUpperCase()}`}
        </span>{' '}
        -{' '}
        <span
          className={`phase-text ${
            phase === 'BAN'
              ? 'text-red-500 shadow-[0_0_5px_rgba(255,51,51,0.5)] font-bold'
              : 'text-teal-400 font-bold'
          }`}
        >
          {phase}
        </span>
      </>
    );
  };

  return (
    <div className="flex items-center justify-between py-4 px-6 bg-black/50 border-b border-light-blue shadow-[0_2px_10px_rgba(0,204,255,0.3)] relative z-20 min-h-[80px]">
      
      {/* Left Section - Team A */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: '20%' }}>
        <EditableTeamName initialName={teamAName} onNameChange={onTeamANameChange} team="A" />
        <div className="text-sm font-bold uppercase tracking-wider text-order mt-1">1ST PICK</div>
      </div>

      {/* Center Section - UNDO + Current Phase + CLEAR */}
      <div className="flex items-center justify-center gap-4 flex-shrink-0">
        {/* UNDO Button */}
        {!isOnlineMode && (
          <button
            className="bg-gray-700 text-white border border-gray-500 rounded-full py-2 px-4 text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-gray-500 hover:border-gray-400"
            onClick={handleUndo}
          >
            UNDO
          </button>
        )}
        {isOnlineMode && (
          <button
            className="bg-red-700 text-white border border-red-500 rounded-full py-2 px-4 text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-red-500 hover:border-red-400"
            onClick={handleReset}
          >
            RESET
          </button>
        )}

        {/* Current Phase Display - Center */}
        <div className="bg-black/70 px-6 py-3 rounded-full text-center border border-light-blue shadow-border-glow text-lg lg:text-xl flex justify-center items-center min-w-[280px]">
          <div className="truncate">
            {renderTurnDisplay()}
          </div>
        </div>

        {/* CLEAR Button */}
        {!isOnlineMode && (
          <button
            className="bg-red-700 text-white border border-red-500 rounded-full py-2 px-4 text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-red-500 hover:border-red-400"
            onClick={handleClear}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Right Section - Team B */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: '20%' }}>
        <EditableTeamName initialName={teamBName} onNameChange={onTeamBNameChange} team="B" />
        <div className="text-sm font-bold uppercase tracking-wider text-chaos mt-1">2ND PICK</div>
      </div>
    </div>
  );
};

export default DraftControls;
