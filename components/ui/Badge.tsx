import React from 'react';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'husband' | 'wife';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-surfaceVariant text-onSurfaceVariant',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-error/12 text-error',
  info: 'bg-info/12 text-info',
  husband: 'bg-teal-500/12 text-teal-600 dark:text-teal-300',
  wife: 'bg-rose-500/12 text-rose-600 dark:text-rose-300',
};

const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', className = '', children, ...props }) => (
  <span
    {...props}
    className={['inline-flex items-center gap-1 rounded-full px-2.5 py-1 type-caption font-semibold whitespace-nowrap', TONE_CLASS[tone], className].join(' ')}
  >
    {children}
  </span>
);

export default Badge;
