import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserSettings, Account } from '../../types';
import { LogOut, Palette, Coffee, Camera, Loader2, History, Heart, ChevronRight, Lock, FileText, Globe, LifeBuoy, MessageSquare, Users, Repeat } from 'lucide-react';
import { accountService } from '../../services/accountService';
import { getTranslations } from '../../constants/translations';
import { Badge, Button, useToast } from '../../components/ui';

import WalletManager from './components/WalletManager';
import FamilySync from './components/FamilySync';

interface UserProfileProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onLogout: () => void;
  email?: string | null;
  onNavigateToDonation: () => void;
  onNavigateToHistory: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToTerms: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToPreferences?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToLanguage?: () => void;
  onNavigateToSubscription?: () => void;
  isGuest: boolean;
  language?: string;
  uid?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  settings,
  onUpdateSettings,
  onLogout,
  email,
  onNavigateToDonation,
  onNavigateToHistory,
  onNavigateToPrivacy,
  onNavigateToTerms,
  onNavigateToHelp,
  onNavigateToPreferences,
  onNavigateToContact,
  onNavigateToLanguage,
  onNavigateToSubscription,
  isGuest,
  language = 'ms',
  uid,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [myAccounts, setMyAccounts] = useState<Account[]>([]);

  const t = useMemo(() => getTranslations(language), [language]);
  const isSingle = settings.role === 'Bujang';

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = accountService.subscribeToAccounts(uid, (data) => setMyAccounts(data));
    return () => unsubscribe();
  }, [uid]);

  const resizeImage = (base64Str: string, maxWidth = 300): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleSize = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Gambar terlalu besar. Sila pilih gambar bawah 5MB.');
      return;
    }
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const compressedBase64 = await resizeImage(reader.result as string);
        onUpdateSettings({ ...settings, photoURL: compressedBase64 });
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Gagal memuat naik gambar.');
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h1 className="type-title1 text-onSurface mb-5">{t.profileTitle}</h1>

      <div className="bg-surface border border-outline rounded-2xl p-5 flex items-center gap-4 mb-5 shadow-[var(--shadow-1)]">
        <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
          <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center type-title2 font-semibold border border-outline ${settings.photoURL ? 'bg-surface' : 'bg-primary/10 text-primary'}`}>
            {settings.photoURL ? <img src={settings.photoURL} alt="" className="w-full h-full object-cover" /> : settings.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
          {uploadingPhoto && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="type-title3 text-onSurface truncate">{settings.displayName}</h2>
          <p className="type-footnote truncate">{email}</p>
          <div className="flex gap-2 mt-2">
            <Badge tone="primary">{settings.role === 'Bujang' ? t.single : settings.role}</Badge>
            {isGuest && <Badge tone="warning">Guest</Badge>}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {!isGuest && !isSingle && <FamilySync settings={settings} onUpdateSettings={onUpdateSettings} email={email} t={t} />}

        <div className="ios-list">
          <div className="px-4 pt-3 pb-1">
            <h3 className="type-caption uppercase tracking-wide">{t.general || 'General'}</h3>
          </div>
          {onNavigateToPreferences && (
            <ProfileRow icon={<Palette className="w-5 h-5 text-primary" />} label="Preferences" onClick={onNavigateToPreferences} />
          )}
          {onNavigateToLanguage && (
            <ProfileRow icon={<Globe className="w-5 h-5 text-primary" />} label="Language" onClick={onNavigateToLanguage} trailing={<Badge tone="primary">{language}</Badge>} />
          )}
          {onNavigateToSubscription && (
            <ProfileRow icon={<Repeat className="w-5 h-5 text-primary" />} label="Langganan" onClick={onNavigateToSubscription} />
          )}
          {onNavigateToHelp && <ProfileRow icon={<LifeBuoy className="w-5 h-5 text-primary" />} label="Help Centre" onClick={onNavigateToHelp} />}
          <ProfileRow icon={<Lock className="w-5 h-5 text-primary" />} label={language === 'ms' ? 'Polisi Privasi' : 'Privacy Policy'} onClick={onNavigateToPrivacy} />
          <ProfileRow icon={<FileText className="w-5 h-5 text-primary" />} label={language === 'ms' ? 'Terma & Syarat' : 'Terms & Conditions'} onClick={onNavigateToTerms} />
          {onNavigateToContact && <ProfileRow icon={<MessageSquare className="w-5 h-5 text-primary" />} label="Contact Us" onClick={onNavigateToContact} />}
        </div>

        <WalletManager myAccounts={myAccounts} settings={settings} onUpdateSettings={onUpdateSettings} uid={uid} isGuest={isGuest} />

        <div className="space-y-3">
          {!isGuest && (
            <button
              onClick={onNavigateToDonation}
              className="w-full bg-surface border border-outline rounded-2xl p-5 text-left shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] transition-shadow flex items-center gap-4"
            >
              <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6" />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="type-headline text-onSurface">Sokong app ini</h3>
                <p className="type-footnote mt-0.5">100% percuma & tanpa iklan. Sumbangan membantu kami terus membina.</p>
              </div>
              <ChevronRight className="w-5 h-5 text-onSurfaceVariant shrink-0" />
            </button>
          )}

          {!isGuest && (
            <Button variant="secondary" fullWidth leftIcon={<History className="w-5 h-5" />} onClick={onNavigateToHistory}>
              {t.appHistory}
            </Button>
          )}

          <Button variant="secondary" fullWidth leftIcon={<LogOut className="w-5 h-5" />} onClick={onLogout} className="text-error">
            {t.logout}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProfileRow: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; trailing?: React.ReactNode }> = ({ icon, label, onClick, trailing }) => (
  <button onClick={onClick} className="ios-list-item hover:bg-surfaceVariant/60">
    <div className="flex items-center gap-3">
      {icon}
      <span className="type-body text-onSurface">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {trailing}
      <ChevronRight className="w-4 h-4 text-onSurfaceVariant" />
    </div>
  </button>
);

export default UserProfile;
