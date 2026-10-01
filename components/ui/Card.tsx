import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  padded?: boolean;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({
  elevated = false,
  padded = true,
  interactive = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      className={[
        'bg-surface border border-outline rounded-2xl',
        elevated ? 'shadow-[var(--shadow-2)]' : 'shadow-[var(--shadow-1)]',
        padded ? 'p-5 md:p-6' : '',
        interactive ? 'hover:shadow-[var(--shadow-2)] active:scale-[0.995] cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; className?: string }> = ({
  title,
  subtitle,
  action,
  className = '',
}) => (
  <div className={['flex items-start justify-between gap-3 mb-4', className].join(' ')}>
    <div className="min-w-0">
      <h3 className="type-headline text-onSurface truncate">{title}</h3>
      {subtitle ? <p className="type-footnote mt-0.5">{subtitle}</p> : null}
    </div>
    {action}
  </div>
);

export default Card;
