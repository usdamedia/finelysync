import React, { useState, useMemo } from 'react';
import { ChevronLeft, Plus, CheckCircle2, Target, Calendar } from 'lucide-react';
import SinkingFundModal from '../../components/SinkingFundModal';
import { ExpenseCategory, FinancialRecords, MonthlyData, Account } from '../../types';
import ActiveWalletSelectorCard from '../../components/ActiveWalletSelectorCard';
import { Button, EmptyState } from '../../components/ui';

interface SinkingFundPageProps {
  onBack: () => void;
  uid?: string;
  currencySymbol: string;
  financialRecords?: FinancialRecords;
  accounts: Account[];
  activeAccountId: string | null;
  onSelectAccount: (id: string | null) => void;
}

const HoneyPotIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 8h-1.6c.4-1.1.6-2.3.6-3.5 0-2.5-2-4.5-4.5-4.5S9 2 9 4.5c0 1.2.2 2.4.6 3.5H4.2C3 8 2 9 2 10.2v3.6c0 4.2 3.2 7.7 7.2 8.1 1.6.2 3.2.2 4.8 0 4-.4 7.2-3.9 7.2-8.1v-3.6C21.2 9 20.2 8 19 8z" />
    <path d="M9 4.5C9 3.1 10.1 2 11.5 2S14 3.1 14 4.5" />
    <path d="M6 8h12" />
  </svg>
);

const SinkingFundPage: React.FC<SinkingFundPageProps> = ({ onBack, uid, currencySymbol, financialRecords, accounts, activeAccountId, onSelectAccount }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const activeFunds = useMemo(() => {
    if (!financialRecords) return [];
    const funds: Record<string, { name: string; totalTarget: number; collected: number; monthsTotal: number; monthsPassed: number }> = {};

    Object.values(financialRecords).forEach((monthData: MonthlyData) => {
      (monthData.expenses || []).forEach((exp) => {
        if (exp.category === ExpenseCategory.SIMPANAN) {
          const match = exp.description.match(/(.*) \((\d+)\/(\d+)\)/);
          if (match) {
            const fundName = match[1].trim();
            const totalIdx = parseInt(match[3]);
            if (!funds[fundName]) {
              funds[fundName] = { name: fundName, totalTarget: 0, collected: 0, monthsTotal: totalIdx, monthsPassed: 0 };
            }
            funds[fundName].totalTarget += exp.totalAmount;
            if (exp.status === 'paid' || exp.status === 'aside') {
              funds[fundName].collected += exp.totalAmount;
              funds[fundName].monthsPassed += 1;
            }
          }
        }
      });
    });

    return Object.values(funds);
  }, [financialRecords]);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2.5 rounded-xl bg-surface border border-outline hover:bg-surfaceVariant transition-colors" aria-label="Kembali">
          <ChevronLeft className="w-5 h-5 text-onSurface" />
        </button>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-warning/12 rounded-xl flex items-center justify-center text-warning">
            <HoneyPotIcon className="w-5 h-5" />
          </span>
          <div>
            <h1 className="type-title3 text-onSurface">Sinking Fund</h1>
            <p className="type-caption uppercase tracking-wider">Savings Goals</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <ActiveWalletSelectorCard accounts={accounts} activeAccountId={activeAccountId} onSelectAccount={onSelectAccount} label="Wallet simpanan" />
      </div>

      <div className="bg-primary text-onPrimary rounded-2xl p-6 shadow-[var(--shadow-2)] flex justify-between items-start gap-4">
        <div>
          <h2 className="type-title3 leading-tight mb-2">Simpan Sedikit, Lama-lama Jadi Bukit</h2>
          <p className="type-footnote text-white/80 max-w-[240px] leading-relaxed">Pecahkan bayaran tahunan kepada komitmen bulanan yang kecil.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-14 h-14 bg-white text-primary rounded-full shadow-[var(--shadow-2)] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shrink-0"
          aria-label="Tambah tabung"
        >
          <Plus className="w-6 h-6" strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="type-headline text-onSurface">Tabung Aktif</h2>
          <span className="type-caption bg-surfaceVariant px-2.5 py-1 rounded-full">{activeFunds.length} Tabung</span>
        </div>

        {activeFunds.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {activeFunds.map((fund, index) => {
              const percent = fund.totalTarget > 0 ? (fund.collected / fund.totalTarget) * 100 : 0;
              const isCompleted = percent >= 100;
              const monthsLeft = fund.monthsTotal - fund.monthsPassed;
              return (
                <div key={index} className="bg-surface border border-outline rounded-2xl p-5 shadow-[var(--shadow-1)]">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-success/12 text-success' : 'bg-surfaceVariant text-onSurfaceVariant'}`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                      </span>
                      <div className="min-w-0">
                        <h3 className="type-subheadline font-semibold text-onSurface truncate">{fund.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3 h-3 text-onSurfaceVariant" />
                          <p className="type-caption uppercase tracking-wider">{isCompleted ? 'Selesai' : `${monthsLeft} bulan lagi`}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`type-title3 shrink-0 ${isCompleted ? 'text-success' : 'text-primary'}`}>{percent.toFixed(0)}%</span>
                  </div>

                  <div className="h-2.5 w-full bg-surfaceVariant rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-success' : 'bg-primary'}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                  </div>

                  <div className="flex justify-between items-center type-caption bg-surfaceVariant/40 p-3 rounded-xl">
                    <div className="flex flex-col">
                      <span className="uppercase tracking-widest mb-0.5">Terkumpul</span>
                      <span className="type-subheadline font-semibold text-onSurface tabular-nums">{currencySymbol}{fund.collected.toLocaleString()}</span>
                    </div>
                    <div className="w-px h-6 bg-outline" />
                    <div className="flex flex-col text-right">
                      <span className="uppercase tracking-widest mb-0.5">Sasaran</span>
                      <span className="type-subheadline font-semibold text-onSurface tabular-nums">{currencySymbol}{fund.totalTarget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Target className="w-6 h-6" />}
            title="Tiada tabung aktif"
            description="Tekan butang tambah untuk mula merancang simpanan anda."
            action={<Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>Tambah Tabung</Button>}
          />
        )}
      </div>

      <SinkingFundModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        uid={uid}
        currencySymbol={currencySymbol}
        accounts={accounts}
        activeAccountId={activeAccountId}
        financialRecords={financialRecords}
      />
    </div>
  );
};

export default SinkingFundPage;
