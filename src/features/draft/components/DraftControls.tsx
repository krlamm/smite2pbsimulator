import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDraftContext } from '../context/DraftContext';
import ModeToggle from './ModeToggle';
import EditableTeamName from '../../teams/components/EditableTeamName';

interface DraftControlsProps {
  teamAName: string;
  teamBName: string;
  onTeamANameChange: (name: string) => void;
  onTeamBNameChange: (name: string) => void;
  teamAColor: string;
  teamBColor: string;
  mode: 'standard' | 'freedom';
  setMode: (mode: 'standard' | 'freedom') => void;
}

const DraftControls: React.FC<DraftControlsProps> = ({
  teamAName,
  teamBName,
  onTeamANameChange,
  onTeamBNameChange,
  teamAColor,
  teamBColor,
  mode,
  setMode,
}) => {
  const { handleUndo, handleClear, currentTeam, phase, draftId, handleReset, handleLeave, initialState } = useDraftContext();
  const navigate = useNavigate();
  const isOnlineMode = !!draftId;

  const onLeaveClick = async () => {
    if (handleLeave) {
      await handleLeave();
    }
    navigate('/');
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
    <div className="flex justify-center items-center py-2.5 px-5 bg-black/50 border-b border-light-blue shadow-[0_2px_10px_rgba(0,204,255,0.3)] relative z-20 flex-wrap gap-[30px]">
      <div className="flex flex-col items-center w-1/6">
        <EditableTeamName initialName={teamAName} onNameChange={onTeamANameChange} team="A" />
        <div className="text-sm font-bold uppercase tracking-wider text-order">1ST PICK</div>
      </div>
      {!isOnlineMode && <ModeToggle mode={mode} onModeChange={setMode} />}
      <div className="flex justify-center items-center w-auto mx-auto relative z-10 gap-4">
        {!isOnlineMode ? (
          <>
            <button
              className="bg-gray-700 text-white border border-gray-500 rounded-full py-2 px-5 text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-gray-500 hover:border-gray-400"
              onClick={handleUndo}
            >
              UNDO
            </button>
            <button
              className="bg-red-700 text-white border border-red-500 rounded-full py-2 px-5 text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-red-500 hover:border-red-400"
              onClick={handleClear}
            >
              CLEAR
            </button>
          </>
        ) : (
          <>
            <button
              className="bg-gray-700 text-white border border-gray-500 rounded-full py-2 px-5 text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-gray-500 hover:border-gray-400"
              onClick={onLeaveClick}
            >
              LEAVE
            </button>
            <button
              className="bg-red-700 text-white border border-red-500 rounded-full py-2 px-5 text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-red-500 hover:border-red-400"
              onClick={handleReset}
            >
              RESET
            </button>
          </>
        )}
        <button
          className="bg-blue-700 text-white border border-blue-500 rounded-full py-2 px-5 text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-blue-500 hover:border-blue-400"
          onClick={() => navigate('/final-teams')}
        >
          FINAL TEAMS
        </button>
      </div>
      <div className="bg-black/70 p-4 rounded-full text-center border border-light-blue shadow-border-glow text-2xl flex justify-center items-center min-w-[300px]">
        {renderTurnDisplay()}
      </div>
      <div className="flex flex-col items-center w-1/6">
        <EditableTeamName initialName={teamBName} onNameChange={onTeamBNameChange} team="B" />
        <div className="text-sm font-bold uppercase tracking-wider text-chaos">2ND PICK</div>
      </div>
    </div>
  );
};

export default DraftControls;
