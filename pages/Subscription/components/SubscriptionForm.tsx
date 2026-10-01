import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Repeat, Wallet } from 'lucide-react';
import { BillingCycle, Subscription, Account } from '../../../types';
import CustomSelect from '../../../components/CustomSelect';
import { Modal, Input, Button, SegmentedControl } from '../../../components/ui';

const COLORS = ['#5E5CE6', '#0A84FF', '#30D158', '#FF9F0A', '#FF375F', '#BF5AF2', '#64D2FF', '#FFD60A'];

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Subscription, 'id'>) => void;
  editing: Subscription | null;
  currencySymbol: string;
  accounts: Account[];
  defaultAccountId?: string;
}

const todayISO = () => new Date().toISOString().split('T')[0];

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  isOpen, onClose, onSave, editing, currencySymbol, accounts, defaultAccountId,
}) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [price, setPrice] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [color, setColor] = useState(COLORS[0]);
  const [accountId, setAccountId] = useState(defaultAccountId || '');

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setName(editing.name);
      setStartDate(editing.startDate || todayISO());
      setPrice(editing.price.toString());
      setCycle(editing.billingCycle);
      setColor(editing.color || COLORS[0]);
      setAccountId(editing.accountId || defaultAccountId || '');
    } else {
      setName('');
      setStartDate(todayISO());
      setPrice('');
      setCycle('monthly');
      setColor(COLORS[0]);
      setAccountId(defaultAccountId || '');
    }
  }, [isOpen, editing, defaultAccountId]);

  const priceValue = parseFloat(price) || 0;

  const { monthly, yearly } = useMemo(
    () => ({
      monthly: cycle === 'monthly' ? priceValue : priceValue / 12,
      yearly: cycle === 'monthly' ? priceValue * 12 : priceValue,
    }),
    [cycle, priceValue]
  );

  const fmt = (v: number) => `${currencySymbol}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || priceValue <= 0) return;
    onSave({
      name: name.trim(),
      startDate,
      price: priceValue,
      billingCycle: cycle,
      color,
      accountId: accountId || undefined,
    });
    onClose();
  };

  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit langganan' : 'Langganan baharu'} subtitle="Rekod dan pantau kos langganan anda" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nama langganan" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: iCloud" autoFocus required />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Tarikh mula" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <Input label="Harga" type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" prefix={currencySymbol} required />
        </div>

        <div>
          <label className="block type-subheadline font-medium text-onSurfaceVariant mb-2 px-0.5">Kekerapan pembayaran</label>
          <SegmentedControl
            value={cycle}
            onChange={(v) => setCycle(v)}
            options={[
              { value: 'monthly', label: 'Bulanan' },
              { value: 'yearly', label: 'Tahunan' },
            ]}
          />
        </div>

        {accounts.length > 0 && (
          <CustomSelect
            label="Dibayar dari wallet (pilihan)"
            value={accountId}
            onChange={(val) => setAccountId(val)}
            options={[{ value: '', label: 'Tiada' }, ...accountOptions]}
            prefixIcon={Wallet}
          />
        )}

        <div>
          <label className="block type-subheadline font-medium text-onSurfaceVariant mb-2 px-0.5">Warna</label>
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Warna ${c}`}
                className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface scale-105' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Live cost preview */}
        <div className="rounded-2xl border border-outline bg-surfaceVariant/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Repeat size={16} />
            </span>
            <span className="type-subheadline font-semibold text-onSurface">Anggaran kos</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl p-3 border border-outline">
              <p className="type-caption">Sebulan</p>
              <p className="type-subheadline font-semibold text-onSurface tabular-nums">{fmt(monthly)}</p>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-outline">
              <p className="type-caption">{cycle === 'yearly' ? 'Setahun (sebenar)' : 'Setahun (anggaran)'}</p>
              <p className="type-subheadline font-semibold text-primary tabular-nums">{fmt(yearly)}</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" disabled={!name.trim() || priceValue <= 0} leftIcon={<CalendarDays size={18} />}>
            {editing ? 'Simpan Perubahan' : 'Tambah Langganan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubscriptionForm;
