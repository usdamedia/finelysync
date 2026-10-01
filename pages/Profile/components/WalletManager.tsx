import React, { useState } from 'react';
import { Wallet, Edit2, Check, Save, Trash2, Plus } from 'lucide-react';
import { Account, AccountType, UserSettings } from '../../../types';
import { accountService } from '../../../services/accountService';
import CustomSelect from '../../../components/CustomSelect';
import { Modal, Input, Button, IconButton, Switch, EmptyState, useToast } from '../../../components/ui';

const WALLET_THEMES = ['#3b3967', '#556B2F', '#8B4513', '#2F4F4F', '#4B0082', '#B22222', '#DAA520'];

interface WalletManagerProps {
  myAccounts: Account[];
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  uid?: string;
  isGuest: boolean;
}

const WalletManager: React.FC<WalletManagerProps> = ({ myAccounts, settings, onUpdateSettings, uid, isGuest }) => {
  const toast = useToast();

  const [editingWallet, setEditingWallet] = useState<Account | null>(null);
  const [editWalletName, setEditWalletName] = useState('');
  const [editWalletBalance, setEditWalletBalance] = useState('');
  const [editWalletColor, setEditWalletColor] = useState('');
  const [editWalletType, setEditWalletType] = useState<AccountType>('wallet');
  const [editWalletShared, setEditWalletShared] = useState(false);
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newType, setNewType] = useState<AccountType>('wallet');
  const [newColor, setNewColor] = useState(WALLET_THEMES[0]);

  if (isGuest) return null;

  const getCurrencySymbol = () => {
    switch (settings.currency) {
      case 'USD': return '$';
      case 'SGD': return 'S$';
      case 'IDR': return 'Rp';
      default: return 'RM';
    }
  };
  const currencySymbol = getCurrencySymbol();

  const openEditWallet = (account: Account) => {
    setEditingWallet(account);
    setEditWalletName(account.name);
    setEditWalletBalance(account.balance.toString());
    setEditWalletColor(account.color || '#3b3967');
    setEditWalletType(account.type);
    setEditWalletShared((settings.sharedAccountIds || []).includes(account.id));
    setIsEditingBalance(false);
  };

  const closeEditWallet = () => {
    setEditingWallet(null);
    setIsSavingWallet(false);
    setIsEditingBalance(false);
  };

  const saveWalletChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !editingWallet) return;
    setIsSavingWallet(true);
    try {
      await accountService.updateAccount(uid, editingWallet.id, {
        name: editWalletName,
        balance: parseFloat(editWalletBalance) || 0,
        color: editWalletColor,
        type: editWalletType,
      });

      if (settings.linkedAccountId) {
        const currentShared = settings.sharedAccountIds || [];
        let newShared = [...currentShared];
        if (editWalletShared) {
          if (!newShared.includes(editingWallet.id)) newShared.push(editingWallet.id);
        } else {
          newShared = newShared.filter((id) => id !== editingWallet.id);
        }
        if (JSON.stringify(currentShared) !== JSON.stringify(newShared)) onUpdateSettings({ ...settings, sharedAccountIds: newShared });
      }
      closeEditWallet();
      toast.success('Wallet dikemaskini.');
    } catch (error) {
      console.error('Failed to update wallet', error);
      toast.error('Gagal mengemaskini wallet.');
    } finally {
      setIsSavingWallet(false);
    }
  };

  const deleteWallet = async () => {
    if (!uid || !editingWallet) return;
    setShowDeleteConfirm(false);
    setIsSavingWallet(true);
    try {
      await accountService.deleteAccount(uid, editingWallet.id);
      if (settings.sharedAccountIds?.includes(editingWallet.id)) {
        onUpdateSettings({ ...settings, sharedAccountIds: settings.sharedAccountIds.filter((id) => id !== editingWallet.id) });
      }
      closeEditWallet();
      toast.success('Wallet dipadam.');
    } catch (error) {
      console.error('Failed to delete wallet', error);
      toast.error('Gagal memadam wallet.');
    } finally {
      setIsSavingWallet(false);
    }
  };

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    setIsSavingWallet(true);
    try {
      await accountService.addAccount(uid, { name: newName, balance: parseFloat(newBalance) || 0, type: newType, color: newColor });
      setNewName('');
      setNewBalance('');
      setNewType('wallet');
      setNewColor(WALLET_THEMES[0]);
      setIsAdding(false);
      toast.success('Wallet ditambah.');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menambah wallet.');
    } finally {
      setIsSavingWallet(false);
    }
  };

  const ColorPicker: React.FC<{ value: string; onChange: (c: string) => void }> = ({ value, onChange }) => (
    <div className="flex flex-wrap gap-3">
      {WALLET_THEMES.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Pilih warna ${color}`}
          onClick={() => onChange(color)}
          className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${value === color ? 'border-primary scale-110' : 'border-transparent opacity-70'}`}
          style={{ backgroundColor: color }}
        >
          {value === color && <Check size={16} className="text-white" />}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="bg-surface border border-outline rounded-2xl p-5 shadow-[var(--shadow-1)]">
        <h3 className="type-headline text-onSurface mb-1 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" /> Pengurusan Wallet
        </h3>
        <p className="type-footnote mb-4">Edit nama, baki, warna, dan tetapan perkongsian wallet anda.</p>

        <button
          onClick={() => setIsAdding(true)}
          className="w-full h-11 rounded-xl border-2 border-dashed border-primary/30 text-primary type-subheadline font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 mb-3"
        >
          <Plus size={16} /> Tambah Wallet Baharu
        </button>

        {myAccounts.length > 0 ? (
          <div className="space-y-2">
            {myAccounts.map((account) => {
              const isShared = (settings.sharedAccountIds || []).includes(account.id);
              return (
                <button
                  key={account.id}
                  onClick={() => openEditWallet(account)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-outline bg-surfaceVariant/30 hover:bg-surfaceVariant/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0" style={{ backgroundColor: account.color }}>
                      {account.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="type-subheadline font-semibold text-onSurface truncate">{account.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="type-caption uppercase">{account.type}</span>
                        {settings.linkedAccountId && (
                          <span className={`type-caption font-semibold px-1.5 py-0.5 rounded-md ${isShared ? 'bg-success/12 text-success' : 'bg-surfaceVariant text-onSurfaceVariant'}`}>
                            {isShared ? 'Shared' : 'Private'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Edit2 className="w-4 h-4 text-onSurfaceVariant shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Tiada wallet" description="Tambah wallet untuk mula menjejak kewangan." />
        )}
      </div>

      <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Tambah Wallet" subtitle="Cipta akaun baharu" size="md">
        <form onSubmit={handleCreateWallet} className="space-y-4">
          <Input label="Nama Wallet" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Contoh: Tabung Haji" required />
          <Input label="Baki Permulaan" type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} placeholder="0.00" prefix={currencySymbol} />
          <div>
            <label className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">Jenis Akaun</label>
            <CustomSelect
              value={newType}
              onChange={(val) => setNewType(val as AccountType)}
              options={[
                { value: 'savings', label: 'Simpanan' },
                { value: 'wallet', label: 'E-Wallet' },
                { value: 'business', label: 'Bisnes' },
                { value: 'investment', label: 'Pelaburan' },
              ]}
            />
          </div>
          <div>
            <label className="block type-subheadline font-medium text-onSurfaceVariant mb-2 px-0.5">Tema Warna</label>
            <ColorPicker value={newColor} onChange={setNewColor} />
          </div>
          <Button type="submit" fullWidth size="lg" loading={isSavingWallet} disabled={!newName} leftIcon={<Save className="w-5 h-5" />}>
            Cipta Wallet
          </Button>
        </form>
      </Modal>

      <Modal isOpen={!!editingWallet} onClose={closeEditWallet} title="Tetapan Wallet" subtitle="Urus butiran akaun anda" size="md">
        {editingWallet && (
          <form onSubmit={saveWalletChanges} className="space-y-4">
            <Input label="Nama Wallet" value={editWalletName} onChange={(e) => setEditWalletName(e.target.value)} placeholder="Contoh: Maybank" />

            <div className="flex items-center justify-between gap-3 bg-surface border border-outline rounded-xl px-3.5 min-h-[56px]">
              <div className="min-w-0">
                <p className="type-caption">Baki Semasa / Mula</p>
                {isEditingBalance ? (
                  <div className="flex items-center gap-1">
                    <span className="type-subheadline text-onSurfaceVariant">{currencySymbol}</span>
                    <input
                      type="number"
                      value={editWalletBalance}
                      onChange={(e) => setEditWalletBalance(e.target.value)}
                      className="bg-transparent border-none outline-none type-subheadline font-semibold text-onSurface w-32 tabular-nums"
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                ) : (
                  <p className="type-subheadline font-semibold text-onSurface tabular-nums">
                    {currencySymbol} {parseFloat(editWalletBalance || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              <IconButton label={isEditingBalance ? 'Selesai' : 'Edit baki'} variant={isEditingBalance ? 'tint' : 'surface'} onClick={() => setIsEditingBalance(!isEditingBalance)}>
                {isEditingBalance ? <Check size={16} /> : <Edit2 size={16} />}
              </IconButton>
            </div>

            <div>
              <label className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">Jenis Akaun</label>
              <CustomSelect
                value={editWalletType}
                onChange={(val) => setEditWalletType(val as AccountType)}
                options={[
                  { value: 'savings', label: 'Simpanan' },
                  { value: 'wallet', label: 'E-Wallet' },
                  { value: 'business', label: 'Bisnes' },
                  { value: 'investment', label: 'Pelaburan' },
                ]}
              />
            </div>

            <div>
              <label className="block type-subheadline font-medium text-onSurfaceVariant mb-2 px-0.5">Tema Warna</label>
              <ColorPicker value={editWalletColor} onChange={setEditWalletColor} />
            </div>

            {settings.linkedAccountId && (
              <div className="bg-surfaceVariant/40 rounded-xl p-4 border border-outline flex items-center justify-between gap-3">
                <div>
                  <span className="type-subheadline font-semibold text-onSurface block">Kongsikan Wallet</span>
                  <span className="type-caption">Paparkan di dashboard pasangan</span>
                </div>
                <Switch checked={editWalletShared} onChange={setEditWalletShared} label="Kongsikan wallet" />
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={isSavingWallet} leftIcon={<Save className="w-5 h-5" />}>
              Simpan Perubahan
            </Button>
            <Button type="button" variant="ghost" fullWidth leftIcon={<Trash2 size={16} />} onClick={() => setShowDeleteConfirm(true)} className="text-error">
              Padam Wallet Ini
            </Button>
          </form>
        )}
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Padam wallet ini?" size="sm">
        <p className="type-subheadline text-onSurfaceVariant mb-5">
          Adakah anda pasti mahu memadam <b className="text-onSurface">{editingWallet?.name}</b>? Tindakan ini tidak boleh dikembalikan.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(false)}>Batal</Button>
          <Button variant="destructive" fullWidth loading={isSavingWallet} onClick={deleteWallet}>Ya, Padam</Button>
        </div>
      </Modal>
    </>
  );
};

export default WalletManager;
