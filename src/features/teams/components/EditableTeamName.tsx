import React, { useRef, useEffect } from 'react';

interface EditableTeamNameProps {
  initialName: string;
  onNameChange: (newName: string) => void;
  team: 'A' | 'B';
}

const EditableTeamName: React.FC<EditableTeamNameProps> = ({ initialName, onNameChange, team }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && divRef.current.textContent !== initialName) {
      divRef.current.textContent = initialName;
    }
  }, [initialName]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onNameChange(e.currentTarget.textContent || '');
  };

  return (
    <div
      className={`text-2xl font-bold uppercase tracking-wider mb-1 p-1 rounded-md outline-none transition-all duration-200 bg-black/20 border border-white/10 hover:bg-black/30 hover:border-white/20 focus:bg-black/40 focus:shadow-[0_0_0_1px_var(--light-blue)] focus:border-light-blue ${
        team === 'A'
          ? 'text-order shadow-[0_0_5px_rgba(0,204,255,0.5)]'
          : 'text-chaos shadow-[0_0_5px_rgba(255,51,102,0.5)]'
      }`}
      contentEditable="true"
      suppressContentEditableWarning={true}
      spellCheck="false"
      ref={divRef}
      onInput={handleInput}
    ></div>
  );
};

export default EditableTeamName; 