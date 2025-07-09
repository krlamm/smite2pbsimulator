import React from 'react';
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
  const { handleUndo, handleClear, currentTeam, phase } = useDraftContext();

  return (
    <div className="flex justify-center items-center py-2.5 px-5 bg-black/50 border-b border-light-blue shadow-[0_2px_10px_rgba(0,204,255,0.3)] relative z-20 flex-wrap gap-[30px]">
      <div className="flex flex-col items-center w-1/6">
        <EditableTeamName initialName={teamAName} onNameChange={onTeamANameChange} team="A" />
        <div className="text-sm font-bold uppercase tracking-wider text-order">1ST PICK</div>
      </div>
      <ModeToggle mode={mode} onModeChange={setMode} />
      <div className="flex justify-center items-center w-52 mx-auto relative z-10 gap-4">
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
      </div>
      <div className="bg-black/70 p-4 rounded-full text-center border border-light-blue shadow-border-glow text-2xl flex justify-center items-center">
        {mode === 'standard' ? (
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
        ) : (
          <span>Freedom Mode - Drag and drop any god to any position</span>
        )}
      </div>
      <div className="flex flex-col items-center w-1/6">
        <EditableTeamName initialName={teamBName} onNameChange={onTeamBNameChange} team="B" />
        <div className="text-sm font-bold uppercase tracking-wider text-chaos">2ND PICK</div>
      </div>
    </div>
  );
};

export default DraftControls;
