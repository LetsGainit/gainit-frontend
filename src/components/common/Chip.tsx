import React from 'react';

interface ChipProps {
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ 
  variant = 'default', 
  size = 'md', 
  children, 
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Chip;
