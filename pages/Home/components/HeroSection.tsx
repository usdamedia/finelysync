import React, { useMemo, useState } from 'react';
import { Wallet, Eye, EyeOff, Loader2, ArrowRight, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { Account } from '../../../types';
import { accountService } from '../../../services/accountService';
import CustomSelect from '../../../components/CustomSelect';
import TransferModal from '../../../components/TransferModal';
import { getTranslations } from '../../../constants/translations';

interface HeroSectionProps {
  language?: string;
  accounts: Account[];
  activeAccountId: string | null;
  onSelectAccount: (id: string | null) => void;
  currencySymbol: string;
  showAmounts: boolean;
  onToggleAmounts: () => void;
  displayBalance: number;
  monthLabel: string;
  targetUid?: string;
  userRole?: string;
  currentMonth: string;
  activeAccount?: Account;
  metrics?: {
    balanceHusband: number;
    balanceWife: number;
  };
}

const HeroSection: React.FC<HeroSectionProps> = ({
  language = 'ms',
  accounts,
  activeAccountId,
  onSelectAccount,
  currencySymbol,
  showAmounts,
  onToggleAmounts,
  displayBalance,
  monthLabel,
  targetUid,
  activeAccount,
  userRole,
  metrics,
}) => {
  const t = useMemo(() => getTranslations(language), [language]);
  const [newAccName, setNewAccName] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [creatingMain, setCreatingMain] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const walletOptions = useMemo(
    () => [{ value: '', label: 'Semua wallet' }, ...accounts.map((acc) => ({ value: acc.id, label: acc.name }))],
    [accounts]
  );

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUid) return;
    setCreatingMain(true);
    const initialBalance = newAccBalance === '' ? 0 : parseFloat(newAccBalance);
    try {
      await accountService.addAccount(targetUid, {
        name: newAccName || 'Main wallet',
        balance: initialBalance || 0,
        type: 'wallet',
        color: '#5E5CE6',
      });
      setCreatingMain(false);
    } catch (e) {
      console.error(e);
      setCreatingMain(false);
    }
  };

  if (accounts.length === 0) {
    return (
      <section className="bg-surface border border-outline rounded-2xl p-6 shadow-[var(--shadow-1)] mb-5">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </span>
          <div>
            <h2 className="type-title3 text-onSurface">{t.home_createWalletTitle}</h2>
            <p className="type-footnote mt-0.5">Mulakan dengan mencipta wallet pertama anda.</p>
          </div>
        </div>

        <form onSubmit={handleAddAccount} className="space-y-4">
          <div>
            <label htmlFor="new-wallet-name" className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5">{t.home_accountNameLabel}</label>
            <input
              id="new-wallet-name"
              type="text"
              value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
              className="w-full h-12 bg-surface border border-outline rounded-xl px-4 type-body text-onSurface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={t.home_accountNamePlaceholder}
              required
            />
          </div>
          <div>
            <label htmlFor="new-wallet-balance" className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5">{t.home_startBalanceLabel} ({currencySymbol})</label>
            <input
              id="new-wallet-balance"
              type="number"
              value={newAccBalance}
              onChange={(e) => setNewAccBalance(e.target.value)}
              className="w-full h-12 bg-surface border border-outline rounded-xl px-4 type-title3 font-semibold text-onSurface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 tabular-nums"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <button
            type="submit"
            disabled={creatingMain}
            className="w-full h-12 bg-primary text-onPrimary rounded-xl type-subheadline font-semibold shadow-[var(--shadow-1)] hover:brightness-105 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {creatingMain ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t.home_startNow} <ArrowRight size={18} /></>}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="bg-surface border border-outline rounded-2xl p-5 md:p-6 shadow-[var(--shadow-1)] mb-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="min-w-0 flex-1 max-w-[240px]">
          <CustomSelect
            value={activeAccountId || ''}
            onChange={(val) => onSelectAccount(val === '' ? null : val)}
            options={walletOptions}
            prefixIcon={Wallet}
            placeholder="Semua wallet"
            className="text-sm"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {accounts.length >= 2 && targetUid && (
            <button
              type="button"
              onClick={() => setShowTransfer(true)}
              aria-label="Pindah dana antara wallet"
              className="h-11 w-11 rounded-xl bg-surfaceVariant text-onSurfaceVariant flex items-center justify-center hover:bg-outline/50"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleAmounts}
            aria-label={showAmounts ? 'Sembunyikan jumlah' : 'Tunjukkan jumlah'}
            className="h-11 w-11 rounded-xl bg-surfaceVariant text-onSurfaceVariant flex items-center justify-center hover:bg-outline/50"
          >
            {showAmounts ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: activeAccount?.color || 'var(--color-primary)' }}
        />
        <span className="type-caption">{t.home_totalBalanceLabel}</span>
      </div>
      <p className="type-large-title text-onSurface tabular-nums break-words">
        {showAmounts ? `${currencySymbol}${displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
      </p>

      {userRole !== 'Bujang' && metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <div className="flex items-center gap-3 bg-surfaceVariant/50 rounded-xl px-4 py-3">
            <span className="w-8 h-8 rounded-lg bg-teal-500/12 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="type-caption">{t.home_husbandBalance}</p>
              <p className="type-subheadline font-semibold text-onSurface tabular-nums truncate">
                {showAmounts ? `${currencySymbol}${metrics.balanceHusband.toLocaleString()}` : '••••'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-surfaceVariant/50 rounded-xl px-4 py-3">
            <span className="w-8 h-8 rounded-lg bg-rose-500/12 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="type-caption">{t.home_wifeBalance}</p>
              <p className="type-subheadline font-semibold text-onSurface tabular-nums truncate">
                {showAmounts ? `${currencySymbol}${metrics.balanceWife.toLocaleString()}` : '••••'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-outline">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        <span className="type-caption">{monthLabel} · {t.home_statusCurrent}</span>
      </div>

      {targetUid && (
        <TransferModal
          isOpen={showTransfer}
          onClose={() => setShowTransfer(false)}
          accounts={accounts}
          uid={targetUid}
          currencySymbol={currencySymbol}
        />
      )}
    </section>
  );
};

export default HeroSection;
