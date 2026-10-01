import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Palette, Layout, Trash2, RotateCcw, ArrowRightLeft, Check } from 'lucide-react';
import { UserSettings } from '../../types';
import { accountService } from '../../services/accountService';
import { firebase } from '../../services/firebase';
import CustomSelect from '../../components/CustomSelect';
import { getTranslations } from '../../constants/translations';
import { Button, Input, Modal, useToast } from '../../components/ui';

interface PreferencesPageProps {
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  onBack: () => void;
  uid?: string;
  isGuest: boolean;
}

const PreferencesPage: React.FC<PreferencesPageProps> = ({ settings, onUpdateSettings, onBack, uid, isGuest }) => {
  const toast = useToast();
  const t = useMemo(() => getTranslations(settings.language || 'ms'), [settings.language]);

  const activeAppearance = settings.themeMode || (settings.isDarkMode ? 'dark' : 'light');
  const appearanceOptions: { value: 'light' | 'dark' | 'dark-grey' | 'system'; label: string; swatch: string; bar: string }[] = [
    { value: 'light', label: 'Cahaya', swatch: 'bg-white', bar: 'bg-gray-300' },
    { value: 'dark', label: 'Gelap', swatch: 'bg-[#1C1C1E]', bar: 'bg-white/30' },
    { value: 'dark-grey', label: 'Kelabu', swatch: 'bg-[#2C2C2C]', bar: 'bg-white/25' },
    { value: 'system', label: 'Auto', swatch: 'bg-gradient-to-r from-white from-50% to-[#1C1C1E] to-50%', bar: 'bg-gray-400' },
  ];

  const THEME_PRESETS = [
    { label: 'Indigo', value: '#5E5CE6' },
    { label: 'Navy Blue', value: '#1E3A8A' },
    { label: 'Blue', value: '#0A84FF' },
    { label: 'Green', value: '#30D158' },
    { label: 'Orange', value: '#FF9F0A' },
    { label: 'Pink', value: '#FF375F' },
    { label: 'Purple', value: '#BF5AF2' },
    { label: 'Graphite', value: '#8E8E93' },
  ];
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showBujangConfirm, setShowBujangConfirm] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const [displayNameDraft, setDisplayNameDraft] = useState(settings.displayName || '');
  const [displayNameTouched, setDisplayNameTouched] = useState(false);

  const isDisplayNameDirty = (displayNameDraft || '').trim() !== (settings.displayName || '').trim();
  const canSaveDisplayName = displayNameTouched && isDisplayNameDirty && displayNameDraft.trim().length > 0;

  useEffect(() => {
    if (!displayNameTouched) setDisplayNameDraft(settings.displayName || '');
  }, [settings.displayName, displayNameTouched]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => onUpdateSettings({ ...settings, themeColor: e.target.value });

  const handleRoleChange = (val: any) => {
    const newRole = val;
    const currentRole = settings.role;
    if (newRole === 'Bujang' && (currentRole === 'Suami' || currentRole === 'Isteri')) {
      setPendingRole(newRole);
      setShowBujangConfirm(true);
    } else {
      onUpdateSettings({ ...settings, role: newRole });
    }
  };

  const confirmBujangSwitch = () => {
    if (pendingRole) onUpdateSettings({ ...settings, role: pendingRole as any });
    setShowBujangConfirm(false);
    setPendingRole(null);
  };

  const handleResetData = async () => {
    if (!uid) return;
    setIsResetting(true);
    try {
      await accountService.resetUserData(uid);
      setShowResetConfirm(false);
      toast.success('Reset berjaya. Aplikasi akan dimuat semula.');
      window.location.reload();
    } catch (error) {
      console.error('Reset failed', error);
      toast.error('Gagal menetapkan semula data.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!uid) return;
    setIsDeleting(true);
    try {
      await accountService.deleteUserAccount(uid);
      const currentUser = firebase.auth().currentUser;
      if (currentUser) await currentUser.delete();
      toast.success(settings.language === 'ms' ? 'Akaun anda telah dipadamkan.' : 'Your account has been deleted.');
      window.location.reload();
    } catch (error: any) {
      console.error('Delete failed', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error(settings.language === 'ms' ? 'Sila log keluar dan masuk semula untuk memadam akaun.' : 'Please logout and login again to delete.');
      } else {
        toast.error(settings.language === 'ms' ? 'Gagal memadam akaun.' : 'Failed to delete account.');
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-primary type-subheadline font-medium mb-5 hover:underline">
        <ArrowLeft className="w-5 h-5" /> Kembali ke profil
      </button>

      <h1 className="type-title1 text-onSurface mb-5">Preferences</h1>

      <div className="space-y-5">
        <section className="bg-surface border border-outline rounded-2xl p-5 shadow-[var(--shadow-1)]">
          <h2 className="type-headline text-onSurface mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-secondary" /> {t.general}
          </h2>
          <div className="space-y-4">
            <Input
              label="Nama paparan"
              value={displayNameDraft}
              onChange={(e: any) => { setDisplayNameDraft(e.target.value); setDisplayNameTouched(true); }}
            />
            <div className="flex justify-end">
              <Button
                variant={canSaveDisplayName ? 'primary' : 'secondary'}
                disabled={!canSaveDisplayName}
                onClick={() => { if (!canSaveDisplayName) return; onUpdateSettings({ ...settings, displayName: displayNameDraft.trim() }); setDisplayNameTouched(false); toast.success('Nama dikemaskini.'); }}
              >
                {t.save}
              </Button>
            </div>
            <div>
              <label className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">Peranan</label>
              <CustomSelect
                value={settings.role}
                onChange={handleRoleChange}
                options={[
                  { value: 'Suami', label: t.husband },
                  { value: 'Isteri', label: t.wife },
                  { value: 'Bujang', label: t.single },
                ]}
              />
            </div>
            <div>
              <label className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">Mata wang</label>
              <CustomSelect
                value={settings.currency}
                onChange={(val: any) => onUpdateSettings({ ...settings, currency: val })}
                options={[
                  { value: 'MYR', label: 'MYR (Ringgit Malaysia)' },
                  { value: 'USD', label: 'USD (US Dollar)' },
                  { value: 'SGD', label: 'SGD (Singapore Dollar)' },
                  { value: 'IDR', label: 'IDR (Indonesian Rupiah)' },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="bg-surface border border-outline rounded-2xl p-5 shadow-[var(--shadow-1)]">
          <h2 className="type-headline text-onSurface mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5 text-tertiary" /> {t.appearance}
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block type-subheadline font-medium text-onSurfaceVariant mb-3 px-0.5">Penampilan</label>
              <div className="grid grid-cols-2 gap-3">
                {appearanceOptions.map((opt) => {
                  const active = activeAppearance === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, themeMode: opt.value, isDarkMode: opt.value === 'dark' || opt.value === 'dark-grey' })}
                      aria-pressed={active}
                      className={`rounded-2xl border p-3 text-left transition-all ${active ? 'border-primary ring-2 ring-primary/20' : 'border-outline hover:bg-surfaceVariant/50'}`}
                    >
                      <span className={`block w-full h-12 rounded-xl border border-outline/60 mb-2.5 overflow-hidden ${opt.swatch}`}>
                        <span className="flex flex-col justify-center gap-1 h-full px-2">
                          <span className={`h-1.5 w-3/4 rounded-full ${opt.bar}`} />
                          <span className={`h-1.5 w-1/2 rounded-full ${opt.bar}`} />
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="type-subheadline font-medium text-onSurface flex-1">{opt.label}</span>
                        {active && <Check className="w-4 h-4 text-primary" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="type-caption mt-2 px-0.5">Auto mengikut tetapan sistem peranti anda.</p>
            </div>

            <div>
              <label className="block type-subheadline font-medium text-onSurfaceVariant mb-3">Warna tema</label>
              <div className="flex flex-wrap items-center gap-3">
                {THEME_PRESETS.map((preset) => {
                  const active = (settings.themeColor || '').toLowerCase() === preset.value.toLowerCase();
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, themeColor: preset.value })}
                      aria-label={`Warna ${preset.label}`}
                      aria-pressed={active}
                      title={preset.label}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                        active ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface scale-105' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.value }}
                    >
                      {active && <Check className="w-5 h-5 text-white" />}
                    </button>
                  );
                })}

                {/* Custom colour */}
                <label
                  className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-outline cursor-pointer hover:scale-105 transition-transform"
                  title="Warna tersuai"
                >
                  <span
                    className="absolute inset-0"
                    style={{ background: 'conic-gradient(from 0deg, #ff0000, #ffea00, #00ff2a, #00e0ff, #3a00ff, #ff00c8, #ff0000)' }}
                  />
                  <input type="color" value={settings.themeColor} onChange={handleColorChange} aria-label="Pilih warna tersuai" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </label>
              </div>
              <p className="type-caption mt-3 px-0.5">
                Pilih pratetap atau warna tersuai. Nilai semasa: <span className="uppercase font-medium text-onSurface">{settings.themeColor}</span>
              </p>
            </div>
          </div>
        </section>

        {!isGuest && (
          <section className="bg-surface border border-error/20 rounded-2xl p-5 shadow-[var(--shadow-1)]">
            <h2 className="type-headline text-error mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Zon bahaya
            </h2>
            <div className="space-y-3">
              <Button variant="secondary" fullWidth leftIcon={<RotateCcw className="w-5 h-5" />} onClick={() => setShowResetConfirm(true)} className="justify-start">
                {t.resetData}
              </Button>
              <Button variant="ghost" fullWidth leftIcon={<Trash2 className="w-5 h-5" />} onClick={() => setShowDeleteConfirm(true)} className="justify-start text-error">
                {settings.language === 'ms' ? 'Padam Akaun' : 'Delete account'}
              </Button>
            </div>
          </section>
        )}
      </div>

      <Modal isOpen={showBujangConfirm} onClose={() => setShowBujangConfirm(false)} title={`Tukar ke ${t.single}?`} size="sm">
        <div className="flex items-start gap-3 mb-5">
          <span className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-6 h-6" />
          </span>
          <p className="type-subheadline text-onSurfaceVariant">Mod solo tidak akan memaparkan kiraan pasangan.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowBujangConfirm(false)}>Batal</Button>
          <Button fullWidth onClick={confirmBujangSwitch}>Ya, Tukar</Button>
        </div>
      </Modal>

      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} title={t.resetConfirmTitle} size="sm">
        <p className="type-subheadline text-onSurfaceVariant mb-5">{t.resetConfirmDesc}</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowResetConfirm(false)}>Batal</Button>
          <Button variant="destructive" fullWidth loading={isResetting} onClick={handleResetData}>Ya, Reset</Button>
        </div>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Padam akaun?" size="sm">
        <p className="type-subheadline text-onSurfaceVariant mb-5">Semua data kewangan anda akan dipadamkan secara kekal. Tindakan ini tidak boleh dikembalikan.</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(false)}>Batal</Button>
          <Button variant="destructive" fullWidth loading={isDeleting} onClick={handleDeleteAccount}>Ya, Padam</Button>
        </div>
      </Modal>
    </div>
  );
};

export default PreferencesPage;
