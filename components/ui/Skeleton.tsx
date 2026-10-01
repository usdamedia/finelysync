import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={['animate-pulse rounded-xl bg-surfaceVariant', className].join(' ')} aria-hidden="true" />
);

export default Skeleton;
