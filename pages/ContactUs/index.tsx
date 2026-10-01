import React from 'react';
import { ArrowLeft, MessageSquare, Mail } from 'lucide-react';

interface ContactUsProps {
  onBack: () => void;
  language: string;
}

const ContactUs: React.FC<ContactUsProps> = ({ onBack, language }) => {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-primary type-subheadline font-medium mb-5 hover:underline">
        <ArrowLeft className="w-5 h-5" /> Kembali ke profil
      </button>
      <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-1)] border border-outline text-center py-16">
        <span className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8" />
        </span>
        <h1 className="type-title2 text-onSurface mb-2">Contact Us</h1>
        <p className="type-footnote max-w-sm mx-auto mb-6">Hubungi pembangun untuk sebarang pertanyaan, cadangan, atau laporan masalah.</p>
        <a
          href="mailto:faridzhuanfirdaus@icloud.com"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-onPrimary type-subheadline font-semibold"
        >
          <Mail className="w-4 h-4" /> faridzhuanfirdaus@icloud.com
        </a>
      </div>
    </div>
  );
};

export default ContactUs;
