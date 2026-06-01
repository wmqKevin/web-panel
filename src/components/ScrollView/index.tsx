import React from 'react';

export interface ScrollViewProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollView: React.FC<ScrollViewProps> = ({
  children,
  className = '',
}) => {
  return <div className={`scroll-view ${className}`}>{children}</div>;
};

export default ScrollView;
