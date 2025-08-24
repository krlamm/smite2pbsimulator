import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface ListContainerProps {
  title?: string;
  loading?: boolean;
  error?: string;
  children: React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

const ListContainer: React.FC<ListContainerProps> = ({
  title,
  loading,
  error,
  children,
  emptyMessage = 'No items found',
  emptyIcon
}) => {
  if (loading) {
    return <LoadingSpinner message={title ? `Loading ${title}` : 'Loading'} />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  const childrenArray = React.Children.toArray(children);
  
  if (childrenArray.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        {emptyIcon && <div className="mb-2">{emptyIcon}</div>}
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {title && <h3 className="text-lg font-bold mb-3 text-white">{title}</h3>}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

export default ListContainer;