import React from 'react';
import { ArrowLeft, Shield, Lock, Trash2, Mail } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
  language: string;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, language }) => {
  const isMs = language === 'ms';

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-primary type-subheadline font-medium mb-5 hover:underline">
        <ArrowLeft className="w-5 h-5" /> {isMs ? 'Kembali' : 'Back'}
      </button>

      <div className="bg-surface p-6 md:p-10 rounded-2xl shadow-[var(--shadow-1)] border border-outline">
        <div className="flex items-center gap-4 mb-8">
          <span className="p-4 bg-primary/10 rounded-2xl text-primary">
            <Shield size={28} />
          </span>
          <div>
            <h1 className="type-title1 text-onSurface">{isMs ? 'Polisi Privasi' : 'Privacy Policy'}</h1>
            <p className="type-footnote">{isMs ? 'Terakhir dikemaskini: 3 Mac 2026' : 'Last updated: March 3, 2026'}</p>
          </div>
        </div>

        <div className="space-y-8 type-body text-onSurfaceVariant leading-relaxed">
          <section>
            <h2 className="type-title3 text-onSurface mb-3 flex items-center gap-2">
              <Lock size={20} className="text-primary" /> {isMs ? '1. Data Yang Kami Kumpul' : '1. Data We Collect'}
            </h2>
            <p className="mb-4">
              {isMs
                ? 'FinelySync mengumpul maklumat minimum yang diperlukan untuk menyediakan perkhidmatan pengurusan kewangan yang berkesan:'
                : 'FinelySync collects the minimum information necessary to provide an effective financial management service:'}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-onSurface">{isMs ? 'Maklumat Akaun:' : 'Account Information:'}</strong> {isMs ? 'Nama paparan dan alamat e-mel anda apabila anda mendaftar.' : 'Your display name and email address when you register.'}</li>
              <li><strong className="text-onSurface">{isMs ? 'Data Kewangan:' : 'Financial Data:'}</strong> {isMs ? 'Rekod pendapatan, perbelanjaan, dan bajet yang anda masukkan secara sukarela.' : 'Income, expense, and budget records that you voluntarily enter.'}</li>
              <li><strong className="text-onSurface">{isMs ? 'Data Penggunaan:' : 'Usage Data:'}</strong> {isMs ? 'Maklumat teknikal asas seperti jenis peranti dan log ralat untuk tujuan penambahbaikan.' : 'Basic technical information such as device type and error logs for improvement purposes.'}</li>
            </ul>
          </section>

          <section>
            <h2 className="type-title3 text-onSurface mb-3">{isMs ? '2. Bagaimana Kami Menggunakan Data Anda' : '2. How We Use Your Data'}</h2>
            <p>
              {isMs
                ? 'Data anda digunakan semata-mata untuk memaparkan ringkasan kewangan anda, membolehkan perkongsian data antara pasangan (jika diaktifkan), dan memberikan analisis bajet. Kami TIDAK menjual data anda kepada pihak ketiga.'
                : 'Your data is used solely to display your financial summaries, enable data sharing between partners (if activated), and provide budget analysis. We do NOT sell your data to third parties.'}
            </p>
          </section>

          <section className="bg-error/8 p-6 rounded-2xl border border-error/20">
            <h2 className="type-title3 text-error mb-3 flex items-center gap-2">
              <Trash2 size={20} /> {isMs ? '3. Pemadaman Akaun & Data' : '3. Account & Data Deletion'}
            </h2>
            <p className="mb-4">
              {isMs
                ? 'Kami menghormati hak anda untuk dilupakan. Anda boleh memadamkan akaun dan semua data berkaitan pada bila-bila masa:'
                : 'We respect your right to be forgotten. You can delete your account and all associated data at any time:'}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{isMs ? 'Pergi ke bahagian "Profil" dalam aplikasi.' : 'Go to the "Profile" section in the app.'}</li>
              <li>{isMs ? 'Klik pada butang "Padam Akaun".' : 'Click on the "Delete Account" button.'}</li>
              <li>{isMs ? 'Semua data kewangan dan maklumat peribadi akan dipadamkan secara kekal dalam masa 24 jam.' : 'All your financial data and personal information will be permanently deleted within 24 hours.'}</li>
            </ul>
            <p className="mt-4 type-footnote italic">{isMs ? 'Nota: Tindakan ini tidak boleh dibatalkan.' : 'Note: This action cannot be undone.'}</p>
          </section>

          <section>
            <h2 className="type-title3 text-onSurface mb-3 flex items-center gap-2">
              <Mail size={20} className="text-primary" /> {isMs ? '4. Hubungi Kami' : '4. Contact Us'}
            </h2>
            <p>
              {isMs
                ? 'Jika anda mempunyai sebarang soalan mengenai polisi privasi ini, sila hubungi kami di:'
                : 'If you have any questions about this privacy policy, please contact us at:'}
            </p>
            <p className="mt-2 font-semibold text-primary">faridzhuanfirdaus@icloud.com</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
