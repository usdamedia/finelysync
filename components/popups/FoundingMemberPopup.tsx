import React from 'react';
import { HeartHandshake, ExternalLink } from 'lucide-react';
import type { PopupProps } from './types';
import { getTranslations } from '../../constants/translations';
import { Modal, Button } from '../ui';

const FoundingMemberPopup: React.FC<PopupProps> = ({ isOpen, onClose, onViewFoundingMembers, language = 'ms' }) => {
  const t = getTranslations(language);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center">
        <span className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
          <HeartHandshake className="w-8 h-8" />
        </span>

        <h2 className="type-title3 text-onSurface leading-tight">{t.popup_foundingTitle}</h2>
        <p className="type-subheadline text-onSurface mt-3">{t.popup_foundingTagline}</p>
        <p className="type-footnote mt-2">{t.popup_foundingDesc}</p>

        <Button
          fullWidth
          size="lg"
          className="mt-6"
          rightIcon={<ExternalLink className="w-4 h-4" />}
          onClick={() => window.open('https://buymeacoffee.com/faridzhuanfirdaus', '_blank')}
        >
          {t.popup_foundingCta}
        </Button>

        <Button variant="secondary" fullWidth size="lg" className="mt-3" onClick={onViewFoundingMembers}>
          {t.popup_foundingList}
        </Button>

        <p className="type-footnote mt-5">{t.popup_foundingThanks}</p>
      </div>
    </Modal>
  );
};

export default FoundingMemberPopup;
