import React from 'react';
import { Share, PlusSquare } from 'lucide-react';
import { getTranslations } from '../../constants/translations';
import { Logo } from '../Logo';
import { Modal, Button } from '../ui';

interface InstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ isOpen, onClose, language = 'ms' }) => {
  const t = getTranslations(language);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <span className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Logo className="w-10 h-10" />
        </span>

        <h2 className="type-title3 text-onSurface mb-2">{t.install_title}</h2>
        <p className="type-subheadline text-onSurfaceVariant leading-relaxed mb-6">{t.install_desc_ios}</p>

        <div className="space-y-3 text-left">
          <div className="flex items-center gap-4 bg-surfaceVariant/40 p-4 rounded-2xl border border-outline">
            <span className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-[var(--shadow-1)] border border-outline shrink-0">
              <Share className="w-5 h-5 text-primary" />
            </span>
            <div>
              <span className="type-caption uppercase tracking-widest text-onSurfaceVariant">Langkah 1</span>
              <p className="type-subheadline font-semibold text-onSurface">{t.install_step1}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-surfaceVariant/40 p-4 rounded-2xl border border-outline">
            <span className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shadow-[var(--shadow-1)] border border-outline shrink-0">
              <PlusSquare className="w-5 h-5 text-primary" />
            </span>
            <div>
              <span className="type-caption uppercase tracking-widest text-onSurfaceVariant">Langkah 2</span>
              <p className="type-subheadline font-semibold text-onSurface">{t.install_step2}</p>
            </div>
          </div>
        </div>

        <Button fullWidth size="lg" className="mt-6" onClick={onClose}>
          Faham
        </Button>
      </div>
    </Modal>
  );
};

export default InstallPrompt;
