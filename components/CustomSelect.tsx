import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface Option {
  value: string | number;
  label: string;
  icon?: React.ElementType;
  disabled?: boolean;
}

type SelectAppearance = 'default' | 'white';

interface CustomSelectProps {
  label?: string;
  value: string | number;
  onChange: (value: any) => void;
  options: Option[];
  placeholder?: string;
  prefixIcon?: React.ElementType;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  disabled?: boolean;
  /** Kept for API compatibility; both appearances now use design tokens. */
  appearance?: SelectAppearance;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  prefixIcon: PrefixIcon,
  className = '',
  labelClassName = '',
  valueClassName = '',
  disabled = false,
  appearance = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  void appearance;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((o) => o.value === value);
      setActiveIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, options, value]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  const commit = useCallback(
    (opt: Option) => {
      if (opt.disabled) return;
      onChange(opt.value);
      setIsOpen(false);
    },
    [onChange]
  );

  const move = (delta: number) => {
    if (!options.length) return;
    let next = activeIndex;
    for (let i = 0; i < options.length; i++) {
      next = (next + delta + options.length) % options.length;
      if (!options[next].disabled) break;
    }
    setActiveIndex(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); setIsOpen(false); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); setActiveIndex(0); }
    else if (e.key === 'End') { e.preventDefault(); setActiveIndex(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commit(options[activeIndex]); }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={[
          'bg-surface border rounded-xl px-3.5 md:px-4 h-[48px] flex flex-col justify-center transition-all',
          isOpen ? 'ring-2 ring-primary/20 border-primary/40' : 'border-outline hover:border-primary/40',
          disabled ? 'opacity-50' : '',
        ].join(' ')}
      >
        {label && (
          <label className={['block text-[10px] md:text-[11px] font-medium text-onSurfaceVariant leading-none mb-1 truncate select-none', labelClassName].join(' ')}>
            {label}
          </label>
        )}

        <button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={label || placeholder}
          onClick={() => !disabled && setIsOpen((v) => !v)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          className={`flex items-center justify-between w-full bg-transparent outline-none text-left ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {PrefixIcon && (
              <span className="flex h-6 w-6 items-center justify-center shrink-0 rounded-lg bg-surfaceVariant text-onSurfaceVariant">
                <PrefixIcon className="w-3.5 h-3.5" />
              </span>
            )}
            {selectedOption?.icon && (
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <selectedOption.icon className="w-3.5 h-3.5" />
              </span>
            )}
            <span className={['type-subheadline font-medium truncate', selectedOption ? 'text-onSurface' : 'text-onSurfaceVariant/60', valueClassName].join(' ')}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown className={['w-4 h-4 shrink-0 text-onSurfaceVariant transition-transform', isOpen ? 'rotate-180 text-primary' : ''].join(' ')} />
        </button>
      </div>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-[60] max-h-60 overflow-y-auto custom-scrollbar p-1.5 material-regular material-edge rounded-xl shadow-[var(--shadow-3)] animate-scale-in origin-top"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  disabled={opt.disabled}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => commit(opt)}
                  className={[
                    'w-full flex items-center justify-between gap-3 px-3.5 py-2.5 md:px-4 md:py-3 type-subheadline font-medium rounded-lg transition-colors',
                    opt.disabled ? 'opacity-40 cursor-not-allowed' : '',
                    isSelected
                      ? 'bg-primary text-onPrimary'
                      : i === activeIndex
                        ? 'bg-surfaceVariant text-onSurface'
                        : 'text-onSurface hover:bg-surfaceVariant',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {opt.icon && (
                      <span className={['flex h-6 w-6 items-center justify-center rounded-lg shrink-0', isSelected ? 'bg-white/20 text-onPrimary' : 'bg-primary/10 text-primary'].join(' ')}>
                        <opt.icon className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
