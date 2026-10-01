import React from 'react';

type Variant = 'plain' | 'tint' | 'surface' | 'destructive';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}

const VARIANT_CLASS: Record<Variant, string> = {
  plain: 'bg-transparent text-onSurfaceVariant hover:bg-surfaceVariant',
  tint: 'bg-primary/10 text-primary hover:bg-primary/15',
  surface: 'bg-surface border border-outline text-onSurface hover:bg-surfaceVariant',
  destructive: 'bg-error/10 text-error hover:bg-error/15',
};

const SIZE_CLASS = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-11 h-11 rounded-xl',
};

const IconButton: React.FC<IconButtonProps> = ({
  label,
  variant = 'plain',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      className={[
        'inline-flex items-center justify-center shrink-0 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
};

export default IconButton;
