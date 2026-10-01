import React, { useMemo } from 'react';
import { Account } from '../types';
import CustomSelect from './CustomSelect';

interface ActiveWalletSelectorCardProps {
  accounts: Account[];
  activeAccountId: string | null;
  onSelectAccount: (id: string | null) => void;
  label?: string;
  className?: string;
}

/**
 * Compact wallet filter. Rendered as a single select so it aligns cleanly with
 * other filter controls (month/year) on mobile, tablet and desktop.
 */
const ActiveWalletSelectorCard: React.FC<ActiveWalletSelectorCardProps> = ({
  accounts,
  activeAccountId,
  onSelectAccount,
  label = 'Wallet',
  className = '',
}) => {
  const walletOptions = useMemo(
    () => [{ value: '', label: 'Semua wallet' }, ...accounts.map((acc) => ({ value: acc.id, label: acc.name }))],
    [accounts]
  );

  return (
    <CustomSelect
      label={label}
      value={activeAccountId || ''}
      onChange={(val) => onSelectAccount(val === '' ? null : val)}
      options={walletOptions}
      placeholder="Semua wallet"
      className={className}
    />
  );
};

export default ActiveWalletSelectorCard;
