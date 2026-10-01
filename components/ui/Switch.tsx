import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false, id }) => {
  const switchId = id || (label ? `switch-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative w-[51px] h-[31px] rounded-full shrink-0 transition-colors',
        checked ? 'bg-success' : 'bg-outline',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-[var(--shadow-1)] transition-all',
          checked ? 'left-[22px]' : 'left-[2px]',
        ].join(' ')}
      />
    </button>
  );
};

export default Switch;
