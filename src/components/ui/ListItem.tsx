import React from 'react';

interface ListItemProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const ListItem: React.FC<ListItemProps> = ({
  children,
  actions,
  onClick,
  className = ''
}) => {
  const baseClasses = 'flex justify-between items-center p-2 border-b border-gray-700 hover:bg-gray-800/50 transition-colors';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex-1 text-white">
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default ListItem;