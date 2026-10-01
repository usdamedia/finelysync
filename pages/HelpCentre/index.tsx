import React from 'react';
import { ArrowLeft, LifeBuoy } from 'lucide-react';

interface HelpCentreProps {
  onBack: () => void;
  language: string;
}

const HelpCentre: React.FC<HelpCentreProps> = ({ onBack, language }) => {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-primary type-subheadline font-medium mb-5 hover:underline">
        <ArrowLeft className="w-5 h-5" /> Kembali ke profil
      </button>
      <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-1)] border border-outline text-center py-16">
        <span className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <LifeBuoy className="w-8 h-8" />
        </span>
        <h1 className="type-title2 text-onSurface mb-2">Help Centre</h1>
        <p className="type-footnote max-w-sm mx-auto">Pusat bantuan sedang dibina. Sila hubungi kami melalui halaman Contact Us untuk sebarang pertanyaan.</p>
      </div>
    </div>
  );
};

export default HelpCentre;
