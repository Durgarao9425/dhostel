import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = ({ children, className, padding = 'md' }) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className }) => (
  <div className={clsx('border-b border-gray-200 pb-3 mb-3', className)}>
    {children}
  </div>
);

Card.Body = ({ children, className }) => (
  <div className={className}>{children}</div>
);

Card.Footer = ({ children, className }) => (
  <div className={clsx('border-t border-gray-200 pt-3 mt-3', className)}>
    {children}
  </div>
);
