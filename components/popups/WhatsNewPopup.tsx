import React from 'react';
import { ArrowRight, Info, Sparkles, Target, TrendingUp, Wallet } from 'lucide-react';
import type { PopupProps } from './types';
import { Modal, Button } from '../ui';

const features = [
  { icon: Wallet, title: 'Sistem Multi-Wallet', desc: 'Asingkan akaun (Gaji, Bisnes, Simpanan). Tetapkan baki permulaan dan urus komitmen setiap wallet secara berasingan.' },
  { icon: Target, title: 'Sinking Fund Pintar', desc: 'Tetapkan matlamat (cth: Renovasi RM12k). Sistem automatik mengira dan memasukkan komitmen bulanan ke dalam Planner.' },
  { icon: TrendingUp, title: 'UI & Analisis Lebih Mantap', desc: 'Nikmati paparan mod gelap, carta analisis bentuk tolok, dan navigasi yang lebih lancar.' },
];

const WhatsNewPopup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center mb-6">
        <span className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </span>
        <h2 className="type-title2 text-onSurface tracking-tight">Apa Yang Baru?</h2>
        <p className="type-caption font-semibold text-primary uppercase tracking-widest mt-1">Mac 2026 Update</p>
      </div>

      <p className="type-subheadline text-onSurfaceVariant text-center mb-6">Kami telah menaik taraf sistem untuk pengurusan kewangan yang lebih teliti!</p>

      <div className="space-y-5">
        {features.map((feature, index) => (
          <div key={index} className="flex gap-4">
            <span className="shrink-0 w-10 h-10 rounded-xl bg-surfaceVariant/60 flex items-center justify-center text-primary border border-outline">
              <feature.icon className="w-5 h-5" />
            </span>
            <div>
              <h4 className="type-subheadline font-semibold text-onSurface mb-1">{feature.title}</h4>
              <p className="type-footnote">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-xl flex gap-3">
        <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <p className="type-footnote text-onSurface">
          <b>Nota:</b> Pengguna sedia ada akan menerima notifikasi untuk memindahkan data lama ke sistem wallet baharu secara automatik.
        </p>
      </div>

      <Button fullWidth size="lg" className="mt-6" rightIcon={<ArrowRight className="w-5 h-5" />} onClick={onClose}>
        Jom Terokai Ciri Baharu
      </Button>
    </Modal>
  );
};

export default WhatsNewPopup;
