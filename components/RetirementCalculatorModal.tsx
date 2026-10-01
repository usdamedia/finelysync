import React, { useState } from 'react';
import { Calculator, RefreshCw, TrendingUp, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Modal, Input, Button, useToast } from './ui';

interface RetirementCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
}

const RetirementCalculatorModal: React.FC<RetirementCalculatorModalProps> = ({ isOpen, onClose, currencySymbol }) => {
  const toast = useToast();
  const [currentSalary, setCurrentSalary] = useState<string>('');
  const [currentBalance, setCurrentBalance] = useState<string>('');
  const [kgt, setKgt] = useState<string>('');
  const [currentAge, setCurrentAge] = useState<string>('');
  const [retirementAge, setRetirementAge] = useState<string>('');

  const [result, setResult] = useState<{ finalSalary: number; totalFund: number; monthlyPayout: number } | null>(null);

  const calculateRetirement = (e: React.FormEvent) => {
    e.preventDefault();

    let salary = parseFloat(currentSalary) || 0;
    let balance = parseFloat(currentBalance) || 0;
    const increment = parseFloat(kgt) || 0;
    const ageNow = parseFloat(currentAge) || 0;
    const ageRetire = parseFloat(retirementAge) || 60;

    if (ageNow >= ageRetire) {
      toast.warning('Umur sekarang mesti kurang daripada umur bersara.');
      return;
    }

    const EMPLOYEE_CONTRIB = 0.11;
    const EMPLOYER_CONTRIB = 0.13;
    const TOTAL_CONTRIB_RATE = EMPLOYEE_CONTRIB + EMPLOYER_CONTRIB;
    const DIVIDEND_RATE = 0.055;

    for (let age = ageNow; age < ageRetire; age++) {
      const annualSalary = salary * 12;
      const annualContribution = annualSalary * TOTAL_CONTRIB_RATE;
      const annualDividend = balance * DIVIDEND_RATE;
      balance = balance + annualContribution + annualDividend;
      salary = salary + increment;
    }

    setResult({ finalSalary: salary, totalFund: balance, monthlyPayout: balance / 240 });
  };

  const resetForm = () => {
    setCurrentSalary('');
    setCurrentBalance('');
    setKgt('');
    setCurrentAge('');
    setRetirementAge('');
    setResult(null);
  };

  const formatCurrency = (val: number) =>
    `${currencySymbol} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simulasi Persaraan" subtitle="Anggaran simpanan KWSP" size="lg">
      {!result ? (
        <form onSubmit={calculateRetirement} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Gaji Pokok Semasa" type="number" value={currentSalary} onChange={(e) => setCurrentSalary(e.target.value)} placeholder="3500" prefix={currencySymbol} required />
            <Input label="Baki KWSP Terkini" type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} placeholder="50000" prefix={currencySymbol} />
          </div>
          <Input label="Kenaikan Gaji Tahunan (KGT)" type="number" value={kgt} onChange={(e) => setKgt(e.target.value)} placeholder="225" prefix={currencySymbol} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Umur Sekarang" type="number" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} placeholder="30" required />
            <Input label="Umur Bersara" type="number" value={retirementAge} onChange={(e) => setRetirementAge(e.target.value)} placeholder="60" required />
          </div>
          <Button type="submit" fullWidth size="lg" leftIcon={<Calculator className="w-5 h-5" />} className="mt-2">
            Kira Unjuran
          </Button>
        </form>
      ) : (
        <div className="space-y-5 animate-scale-in">
          <div className="bg-primary text-onPrimary rounded-2xl p-6 shadow-[var(--shadow-2)]">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <DollarSign className="w-4 h-4" />
              <span className="type-caption font-semibold uppercase tracking-wider">Jumlah Simpanan KWSP</span>
            </div>
            <p className="type-title1 tabular-nums">{formatCurrency(result.totalFund)}</p>
            <p className="type-caption opacity-70 mt-1">Pada umur {retirementAge} tahun</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface border border-outline rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-onSurfaceVariant">
                <Calendar className="w-4 h-4" />
                <span className="type-caption font-semibold uppercase tracking-wider">Belanja Sebulan</span>
              </div>
              <p className="type-headline text-onSurface tabular-nums">{formatCurrency(result.monthlyPayout)}</p>
              <p className="type-caption mt-1">Untuk 20 tahun</p>
            </div>
            <div className="bg-surface border border-outline rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2 text-onSurfaceVariant">
                <TrendingUp className="w-4 h-4" />
                <span className="type-caption font-semibold uppercase tracking-wider">Gaji Akhir</span>
              </div>
              <p className="type-headline text-onSurface tabular-nums">{formatCurrency(result.finalSalary)}</p>
              <p className="type-caption mt-1">Gaji Pokok</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-info/10 p-4 rounded-2xl border border-info/20">
            <AlertCircle className="w-5 h-5 text-info shrink-0 mt-0.5" />
            <p className="type-footnote text-onSurface">
              Pengiraan ini anggaran berdasarkan dividen tahunan 5.5% dan jumlah caruman 24% (Pekerja 11% + Majikan 13%). Ia tidak menjamin pulangan sebenar.
            </p>
          </div>

          <Button variant="secondary" fullWidth size="lg" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={resetForm}>
            Kira Semula
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default RetirementCalculatorModal;
