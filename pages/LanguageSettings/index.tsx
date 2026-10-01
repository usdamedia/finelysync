import React from 'react';
import { ArrowLeft, Globe, Check } from 'lucide-react';
import { UserSettings } from '../../types';

interface LanguageSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  onBack: () => void;
  language: string;
}

const LanguageSettings: React.FC<LanguageSettingsProps> = ({ settings, onUpdateSettings, onBack, language }) => {
  const languages = [
    { code: 'ms', label: 'Bahasa Melayu' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '简体中文' },
    { code: 'ta', label: 'தமிழ்' },
  ];

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-primary type-subheadline font-medium mb-5 hover:underline">
        <ArrowLeft className="w-5 h-5" /> Kembali
      </button>
      <div className="bg-surface rounded-2xl p-5 shadow-[var(--shadow-1)] border border-outline">
        <h1 className="type-title3 flex items-center gap-2 mb-5">
          <Globe className="w-6 h-6 text-primary" /> Bahasa
        </h1>
        <div className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                window.localStorage.setItem('finelysync_lang', lang.code);
                onUpdateSettings({ ...settings, language: lang.code as any });
              }}
              className={`w-full p-4 rounded-xl flex items-center justify-between border transition-all ${language === lang.code ? 'border-primary bg-primary/8' : 'border-outline hover:bg-surfaceVariant/60'}`}
            >
              <span className="type-body font-medium text-onSurface">{lang.label}</span>
              {language === lang.code && <Check className="w-5 h-5 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;
