import React from 'react';
import { ArrowLeft, FileText, Scale, AlertCircle, Copyright } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
  language: string;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack, language }) => {
  const isMs = language === 'ms';

  const sections = [
    { icon: Scale, title: isMs ? '1. Penerimaan Terma' : '1. Acceptance of Terms', body: isMs ? 'Dengan mengakses atau menggunakan aplikasi FinelySync, anda bersetuju untuk terikat dengan Terma dan Syarat ini. Jika anda tidak bersetuju, anda tidak dibenarkan menggunakan aplikasi ini.' : 'By accessing or using the FinelySync application, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not use the application.' },
    { icon: Copyright, title: isMs ? '2. Hak Milik Intelek' : '2. Intellectual Property', body: isMs ? 'Aplikasi ini, termasuk kod sumber, reka bentuk, logo, dan kandungan asal, adalah hak milik eksklusif FinelySync. Penggunaan tanpa kebenaran adalah dilarang.' : 'The application, including source code, design, logos, and original content, is the exclusive property of FinelySync. Unauthorized use is strictly prohibited.' },
    { icon: AlertCircle, title: isMs ? '3. Had Liabiliti' : '3. Limitation of Liability', body: isMs ? 'FinelySync disediakan "sebagaimana adanya". Kami tidak bertanggungjawab atas sebarang kerugian kewangan, ralat data, atau keputusan pelaburan berdasarkan maklumat dalam aplikasi ini.' : 'FinelySync is provided "as is". We are not responsible for any financial losses, data errors, or investment decisions made based on the information in this application.' },
    { title: isMs ? '4. Polisi Langganan & Pemulangan Wang' : '4. Subscription & Refund Policy', body: isMs ? 'Jika aplikasi ini menawarkan ciri premium, semua pembayaran adalah melalui Apple App Store. Polisi pemulangan wang tertakluk kepada polisi Apple.' : 'If this application offers premium features, all payments are through the Apple App Store. The refund policy is subject to Apple\'s policy.' },
    { title: isMs ? '5. Perubahan Terma' : '5. Changes to Terms', body: isMs ? 'Kami berhak mengubah terma ini pada bila-bila masa. Perubahan akan berkuat kuasa sebaik sahaja dikemas kini dalam aplikasi.' : 'We reserve the right to modify these terms at any time. Changes will take effect as soon as they are updated in the application.' },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-primary type-subheadline font-medium mb-5 hover:underline">
        <ArrowLeft className="w-5 h-5" /> {isMs ? 'Kembali' : 'Back'}
      </button>

      <div className="bg-surface p-6 md:p-10 rounded-2xl shadow-[var(--shadow-1)] border border-outline">
        <div className="flex items-center gap-4 mb-8">
          <span className="p-4 bg-primary/10 rounded-2xl text-primary">
            <FileText size={28} />
          </span>
          <div>
            <h1 className="type-title1 text-onSurface">{isMs ? 'Terma & Syarat' : 'Terms & Conditions'}</h1>
            <p className="type-footnote">{isMs ? 'Terakhir dikemaskini: 3 Mac 2026' : 'Last updated: March 3, 2026'}</p>
          </div>
        </div>

        <div className="space-y-8 type-body text-onSurfaceVariant leading-relaxed">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="type-title3 text-onSurface mb-3 flex items-center gap-2">
                {s.icon ? <s.icon size={20} className="text-primary" /> : null}
                {s.title}
              </h2>
              <p>{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
