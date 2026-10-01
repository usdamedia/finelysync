import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  prefix,
  suffix,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `field-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">
          {label}
        </label>
      ) : null}
      <div
        className={[
          'flex items-center gap-2 bg-surface border rounded-xl px-3.5 min-h-[48px]',
          error ? 'border-error focus-within:ring-2 focus-within:ring-error/25' : 'border-outline focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
        ].join(' ')}
      >
        {prefix ? <span className="text-onSurfaceVariant shrink-0">{prefix}</span> : null}
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...props}
          className={['flex-1 min-w-0 bg-transparent border-none outline-none type-body text-onSurface placeholder:text-onSurfaceVariant/50', className].join(' ')}
        />
        {suffix ? <span className="text-onSurfaceVariant shrink-0">{suffix}</span> : null}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="type-caption mt-1.5 px-0.5" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="type-caption mt-1.5 px-0.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
