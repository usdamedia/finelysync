import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight, Target, Clock, Wallet, List } from 'lucide-react';
import { planningService } from '../services/planningService';
import { ExpenseCategory, FinancialRecords, Account } from '../types';
import CustomSelect from './CustomSelect';
import { Modal, Input, Button, useToast } from './ui';

interface SinkingFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid?: string;
  currencySymbol: string;
  financialRecords?: FinancialRecords;
  accounts: Account[];
  activeAccountId: string | null;
}

const HoneyPotIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 8h-1.6c.4-1.1.6-2.3.6-3.5 0-2.5-2-4.5-4.5-4.5S9 2 9 4.5c0 1.2.2 2.4.6 3.5H4.2C3 8 2 9 2 10.2v3.6c0 4.2 3.2 7.7 7.2 8.1 1.6.2 3.2.2 4.8 0 4-.4 7.2-3.9 7.2-8.1v-3.6C21.2 9 20.2 8 19 8z" />
    <path d="M9 4.5C9 3.1 10.1 2 11.5 2S14 3.1 14 4.5" />
    <path d="M6 8h12" />
  </svg>
);

const SinkingFundModal: React.FC<SinkingFundModalProps> = ({ isOpen, onClose, uid, currencySymbol, accounts, activeAccountId }) => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const m = new Date().getMonth() + 1;
    return m < 10 ? `0${m}` : `${m}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
  const [duration, setDuration] = useState('6');
  const [selectedAccount, setSelectedAccount] = useState<string>(activeAccountId || '');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const MONTHS = [
    { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Mac' },
    { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Jun' },
    { value: '07', label: 'Julai' }, { value: '08', label: 'Ogos' }, { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Disember' },
  ];

  const YEARS = Array.from({ length: 6 }, (_, i) => {
    const y = new Date().getFullYear() + i;
    return { value: y.toString(), label: y.toString() };
  });

  const calculatedMonthly = useMemo(() => {
    const amount = parseFloat(targetAmount) || 0;
    const months = parseInt(duration) || 1;
    return amount / months;
  }, [targetAmount, duration]);

  const schedulePreview = useMemo(() => {
    const y = parseInt(selectedYear);
    const m = parseInt(selectedMonth);
    const dur = parseInt(duration) || 0;
    const amount = calculatedMonthly;
    const schedule = [];
    const currentDate = new Date(y, m - 1, 1);
    for (let i = 0; i < dur; i++) {
      schedule.push({ month: currentDate.toLocaleDateString('ms-MY', { month: 'short', year: '2-digit' }), amount });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return schedule;
  }, [selectedMonth, selectedYear, duration, calculatedMonthly]);

  const endDate = schedulePreview.length > 0 ? schedulePreview[schedulePreview.length - 1].month : '-';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    if (calculatedMonthly <= 0) return;
    if (!selectedAccount && accounts.length > 0) {
      toast.warning('Sila pilih wallet untuk simpanan ini.');
      return;
    }

    setLoading(true);
    try {
      await planningService.createSinkingFund(uid, {
        name,
        targetAmount: parseFloat(targetAmount),
        startMonthStr: `${selectedYear}-${selectedMonth}`,
        durationMonths: parseInt(duration),
        category: ExpenseCategory.SIMPANAN,
        accountId: selectedAccount,
      });

      toast.success('Tabung berjaya dicipta! Semak halaman Planner untuk bulan mendatang.');
      setName('');
      setTargetAmount('');
      setDuration('6');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Ralat mencipta tabung. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const walletOptions = accounts.map((acc) => ({ value: acc.id, label: acc.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sinking Fund" subtitle="Tambah matlamat simpanan baharu" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-warning/12 text-warning flex items-center justify-center">
            <HoneyPotIcon className="w-6 h-6" />
          </span>
          <p className="type-footnote">Pecahkan bayaran tahunan kepada komitmen bulanan yang kecil.</p>
        </div>

        <Input label="Nama Tabung" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Roadtax 2026" required />

        <div className="grid grid-cols-2 gap-4">
          <Input label={`Sasaran (${currencySymbol})`} type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="1000" required />
          <Input label="Tempoh (Bulan)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="10" min="1" required />
        </div>

        <CustomSelect label="Simpan Dalam Wallet" value={selectedAccount} onChange={(val) => setSelectedAccount(val)} options={walletOptions} prefixIcon={Wallet} placeholder="Pilih Wallet" />

        <div>
          <label className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">Mula Kumpul Pada</label>
          <div className="grid grid-cols-2 gap-3">
            <CustomSelect value={selectedMonth} onChange={(val) => setSelectedMonth(val)} options={MONTHS} />
            <CustomSelect value={selectedYear} onChange={(val) => setSelectedYear(val)} options={YEARS} />
          </div>
        </div>

        <div className="bg-surfaceVariant/40 rounded-2xl p-5 border border-outline">
          <div className="flex justify-between items-center mb-4">
            <h4 className="type-caption font-semibold text-onSurfaceVariant uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Rumusan Pelan
            </h4>
            <button type="button" onClick={() => setShowPreview(!showPreview)} className="type-caption font-semibold text-primary flex items-center gap-1 hover:underline">
              <List className="w-3 h-3" /> {showPreview ? 'Tutup Jadual' : 'Lihat Jadual'}
            </button>
          </div>

          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="type-caption block mb-1">Simpanan Bulanan</span>
              <span className="type-title1 text-primary tabular-nums">
                {currencySymbol}{calculatedMonthly.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="type-caption">selama {duration} bulan</span>
          </div>

          <div className="h-px bg-outline my-3" />

          <div className="flex items-center justify-between type-caption">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Mula: {MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear}
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            <div className="flex items-center gap-1.5 text-primary">
              <Clock className="w-3.5 h-3.5" /> Tamat: {endDate}
            </div>
          </div>

          {showPreview && (
            <div className="mt-4 bg-surface rounded-xl p-3 border border-outline max-h-32 overflow-y-auto custom-scrollbar animate-fade-in">
              <table className="w-full type-caption">
                <thead>
                  <tr className="text-left text-onSurfaceVariant">
                    <th className="pb-2 pl-2 font-medium">Bulan</th>
                    <th className="pb-2 text-right pr-2 font-medium">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {schedulePreview.map((item, idx) => (
                    <tr key={idx} className="border-t border-outline">
                      <td className="py-1.5 pl-2 font-medium text-onSurface">{item.month}</td>
                      <td className="py-1.5 text-right pr-2 font-semibold text-primary tabular-nums">
                        {currencySymbol}{item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading} disabled={!name || !targetAmount}>
          Sahkan & Auto-Generate
        </Button>
        <p className="type-caption text-center">
          Item komitmen akan ditambah secara automatik ke dalam Planner untuk {duration} bulan.
        </p>
      </form>
    </Modal>
  );
};

export default SinkingFundModal;
