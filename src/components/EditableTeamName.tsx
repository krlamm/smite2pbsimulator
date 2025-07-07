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
      className={`team-name team-${team.toLowerCase()}`}
      contentEditable="true"
      suppressContentEditableWarning={true}
      spellCheck="false"
      ref={divRef}
      onInput={handleInput}
    ></div>
  );
};

export default EditableTeamName; 