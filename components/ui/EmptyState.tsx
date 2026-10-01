import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '' }) => (
  <div
    className={[
      'flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl border border-dashed border-outline bg-surfaceVariant/30',
      className,
    ].join(' ')}
  >
    {icon ? (
      <div className="w-14 h-14 rounded-2xl bg-surface border border-outline flex items-center justify-center text-onSurfaceVariant mb-4 shadow-[var(--shadow-1)]">
        {icon}
      </div>
    ) : null}
    <h3 className="type-headline text-onSurface">{title}</h3>
    {description ? <p className="type-footnote mt-1 max-w-sm">{description}</p> : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export default EmptyState;
