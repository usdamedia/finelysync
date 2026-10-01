import React from 'react';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
}

interface SegmentedControlProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  fullWidth?: boolean;
  className?: string;
}

function SegmentedControl<T extends string = string>({
  value,
  onChange,
  options,
  fullWidth = true,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div role="tablist" className={['ios-segmented flex', fullWidth ? 'w-full' : '', className].join(' ')}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={[
              'ios-segmented-item flex-1 flex items-center justify-center gap-1.5',
              active ? 'active' : '',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
