import React, { useMemo, useState } from 'react';
import { ChevronDown, Sparkles, Wallet, Globe, Target, TrendingUp } from 'lucide-react';
import { getTranslations } from '../../../constants/translations';

interface TutorialCardProps {
  language?: string;
}

const TutorialCard: React.FC<TutorialCardProps> = ({ language = 'ms' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useMemo(() => getTranslations(language), [language]);

  const features = [
    { icon: Wallet, title: t.home_whatsNewFeature1Title, desc: t.home_whatsNewFeature1Desc, tint: 'bg-primary/10 text-primary' },
    { icon: Globe, title: t.home_whatsNewFeature2Title, desc: t.home_whatsNewFeature2Desc, tint: 'bg-info/12 text-info' },
    { icon: Target, title: t.home_whatsNewFeature3Title, desc: t.home_whatsNewFeature3Desc, tint: 'bg-secondary/12 text-secondary' },
    { icon: TrendingUp, title: t.home_whatsNewFeature4Title, desc: t.home_whatsNewFeature4Desc, tint: 'bg-success/12 text-success' },
  ];

  return (
    <div className="bg-surface border border-outline rounded-2xl shadow-[var(--shadow-1)] overflow-hidden mb-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-surfaceVariant/50"
      >
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </span>
          <h3 className="type-headline text-onSurface">{t.home_whatsNewTitle}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-onSurfaceVariant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 md:px-5 pb-5 pt-1 border-t border-outline animate-fade-in">
          <div className="space-y-5 pt-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex gap-3.5 items-start">
                  <span className={`mt-0.5 p-2.5 rounded-xl shrink-0 ${f.tint}`}>
                    <Icon size={18} />
                  </span>
                  <div>
                    <h4 className="type-subheadline font-semibold text-onSurface mb-0.5">{f.title}</h4>
                    <p className="type-footnote">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="type-caption text-center mt-6 pt-4 border-t border-outline">{t.home_whatsNewFooter}</p>
        </div>
      )}
    </div>
  );
};

export default TutorialCard;
