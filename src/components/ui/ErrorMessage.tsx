import React from 'react';

interface ErrorMessageProps {
  error: string;
  size?: 'sm' | 'md' | 'lg';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <p className={`text-red-500 ${sizeClasses[size]}`}>
      {error}
    </p>
  );
};

export default ErrorMessage;