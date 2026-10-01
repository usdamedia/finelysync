import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import IconButton from './IconButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Mobile presentation. 'sheet' slides from bottom; 'center' stays centered. */
  mobilePresentation?: 'sheet' | 'center';
  closeOnBackdrop?: boolean;
}

const SIZE_CLASS = {
  sm: 'md:max-w-sm',
  md: 'md:max-w-md',
  lg: 'md:max-w-lg',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  mobilePresentation = 'sheet',
  closeOnBackdrop = true,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => panelRef.current?.focus(), 40);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSheet = mobilePresentation === 'sheet';

  return (
    <div
      className={[
        'fixed inset-0 z-[1000] flex justify-center material-scrim animate-fade-in',
        isSheet ? 'items-end md:items-center' : 'items-center',
      ].join(' ')}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        className={[
          'material-thick material-edge w-full flex flex-col outline-none',
          'max-h-[92vh] md:max-h-[88vh]',
          isSheet ? 'rounded-t-3xl md:rounded-3xl animate-slide-up md:animate-scale-in' : 'rounded-3xl m-4 animate-scale-in',
          'md:my-auto md:mx-4',
          'shadow-[var(--shadow-3)]',
          SIZE_CLASS[size],
        ].join(' ')}
        style={isSheet ? { paddingBottom: 'env(safe-area-inset-bottom)' } : undefined}
      >
        <div className="flex items-start justify-between gap-3 p-5 md:p-6 pb-3 md:pb-4 shrink-0">
          <div className="min-w-0">
            {title ? <h2 className="type-title3 text-onSurface truncate">{title}</h2> : null}
            {subtitle ? <p className="type-footnote mt-0.5">{subtitle}</p> : null}
          </div>
          <IconButton label="Tutup" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="overflow-y-auto custom-scrollbar px-5 md:px-6 pb-5 md:pb-6 flex-1">{children}</div>

        {footer ? <div className="p-5 md:p-6 pt-0 shrink-0">{footer}</div> : null}
      </div>
    </div>
  );
};

export default Modal;
