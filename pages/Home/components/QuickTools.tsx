import React, { useMemo } from 'react';
import { Calculator, Car, Banknote } from 'lucide-react';
import { getTranslations } from '../../../constants/translations';

const HoneyPotIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 8h-1.6c.4-1.1.6-2.3.6-3.5 0-2.5-2-4.5-4.5-4.5S9 2 9 4.5c0 1.2.2 2.4.6 3.5H4.2C3 8 2 9 2 10.2v3.6c0 4.2 3.2 7.7 7.2 8.1 1.6.2 3.2.2 4.8 0 4-.4 7.2-3.9 7.2-8.1v-3.6C21.2 9 20.2 8 19 8z" />
    <path d="M9 4.5C9 3.1 10.1 2 11.5 2S14 3.1 14 4.5" />
    <path d="M6 8h12" />
  </svg>
);

interface QuickToolsProps {
  language?: string;
  onOpenRetirement: () => void;
  onOpenVehicle: () => void;
  onOpenSinkingFund: () => void;
  onOpenRaya: () => void;
}

const QuickTools: React.FC<QuickToolsProps> = ({ language = 'ms', onOpenRetirement, onOpenVehicle, onOpenSinkingFund, onOpenRaya }) => {
  const t = useMemo(() => getTranslations(language), [language]);

  const tools = [
    { key: 'retirement', label: t.home_toolRetirement, icon: Calculator, onClick: onOpenRetirement, tint: 'bg-primary/10 text-primary' },
    { key: 'vehicle', label: t.home_toolVehicleTco, icon: Car, onClick: onOpenVehicle, tint: 'bg-info/12 text-info' },
    { key: 'sinking', label: t.home_toolSinkingFund, icon: HoneyPotIcon, onClick: onOpenSinkingFund, tint: 'bg-secondary/12 text-secondary' },
    { key: 'raya', label: t.home_toolDuitRaya, icon: Banknote, onClick: onOpenRaya, tint: 'bg-success/12 text-success' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.key}
            onClick={tool.onClick}
            className="flex flex-col items-center justify-center gap-2.5 bg-surface border border-outline rounded-2xl py-4 px-2 shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] active:scale-[0.98] transition-all"
          >
            <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tool.tint}`}>
              <Icon className="w-6 h-6" />
            </span>
            <span className="type-caption font-medium text-onSurface text-center leading-snug">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickTools;
