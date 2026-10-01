import React from 'react';
import { Heart, X } from 'lucide-react';

interface StickySupportProps {
  onDonate: () => void;
  onClose: () => void;
}

const StickySupport: React.FC<StickySupportProps> = ({ onDonate, onClose }) => {
  return (
    <div className="relative bg-primary/8 border border-primary/15 rounded-2xl p-4 md:p-5 mb-5 animate-fade-in">
      <button
        onClick={onClose}
        aria-label="Tutup"
        className="absolute top-3 right-3 p-1.5 rounded-lg text-onSurfaceVariant hover:bg-surfaceVariant"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-4 pr-8">
        <span className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 fill-current" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="type-subheadline font-semibold text-onSurface">Suka guna app ini?</h3>
          <p className="type-footnote mt-0.5">Sumbangan ikhlas anda membantu kami kekalkan servis ini percuma.</p>
        </div>
        <button
          onClick={onDonate}
          className="shrink-0 h-10 px-4 rounded-xl bg-primary text-onPrimary type-subheadline font-semibold active:scale-[0.98]"
        >
          Sumbang
        </button>
      </div>
    </div>
  );
};

export default StickySupport;
