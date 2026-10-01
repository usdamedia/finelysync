import React, { useState } from 'react';
import { Car, Calculator, AlertTriangle, Coins, ShieldCheck, History } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { Modal, Input, Button } from './ui';

interface VehicleTCOModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  language: string;
}

const VehicleTCOModal: React.FC<VehicleTCOModalProps> = ({ isOpen, onClose, currencySymbol }) => {
  const [carPrice, setCarPrice] = useState<string>('');
  const [downpayment, setDownpayment] = useState<string>('');
  const [loanTerm, setLoanTerm] = useState<string>('7');
  const [interestRate, setInterestRate] = useState<string>('3.0');
  const [annualRoadtaxIns, setAnnualRoadtaxIns] = useState<string>('');
  const [annualService, setAnnualService] = useState<string>('');
  const [expiryMonth, setExpiryMonth] = useState<string>(new Date().getMonth().toString());

  const [results, setResults] = useState<{
    monthlyInstallment: number;
    monthlyRunningCost: number;
    monthlyFuel: number;
    totalTCO: number;
    remainingMonths: number;
    sinkingFundNeeded: number;
    currentMonthName: string;
    expiryMonthName: string;
  } | null>(null);

  const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

  const calculateTCO = (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(carPrice) || 0;
    const dp = parseFloat(downpayment) || 0;
    const years = parseFloat(loanTerm) || 1;
    const interest = parseFloat(interestRate) || 0;
    const roadtaxIns = parseFloat(annualRoadtaxIns) || 0;
    const service = parseFloat(annualService) || 0;
    const targetMonth = parseInt(expiryMonth);

    const principal = price - dp;
    const totalInterest = principal * (interest / 100) * years;
    const monthlyInstallment = (principal + totalInterest) / (years * 12);

    const monthlyRunningCost = (roadtaxIns + service) / 12;
    const monthlyFuel = (1000 / 12) * 2.05;

    const now = new Date();
    const currentMonth = now.getMonth();

    let diff;
    if (targetMonth > currentMonth) diff = targetMonth - currentMonth;
    else if (targetMonth < currentMonth) diff = 12 - currentMonth + targetMonth;
    else diff = 12;

    const sinkingFundNeeded = (roadtaxIns + service) / diff;

    setResults({
      monthlyInstallment,
      monthlyRunningCost,
      monthlyFuel,
      totalTCO: monthlyInstallment + monthlyRunningCost + monthlyFuel,
      remainingMonths: diff,
      sinkingFundNeeded,
      currentMonthName: months[currentMonth],
      expiryMonthName: months[targetMonth],
    });
  };

  const formatCurrency = (val: number) =>
    `${currencySymbol} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kalkulator Kos Kereta" subtitle="TCO & Roadtax Saver" size="lg">
      {!results ? (
        <form onSubmit={calculateTCO} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Harga Kereta" type="number" value={carPrice} onChange={(e) => setCarPrice(e.target.value)} placeholder="80000" required />
            <Input label="Bayaran Muka" type="number" value={downpayment} onChange={(e) => setDownpayment(e.target.value)} placeholder="8000" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustomSelect
              label="Pinjaman (Tahun)"
              value={loanTerm}
              onChange={(val) => setLoanTerm(val)}
              options={[3, 5, 7, 9].map((y) => ({ value: y.toString(), label: `${y} Tahun` }))}
            />
            <Input label="Kadar Faedah (%)" type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="3.0" />
          </div>

          <div className="p-4 bg-surfaceVariant/40 rounded-2xl border border-outline space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="type-subheadline font-semibold text-onSurface">Kos Tahunan (Maintenance)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Roadtax & Insurans" type="number" value={annualRoadtaxIns} onChange={(e) => setAnnualRoadtaxIns(e.target.value)} placeholder="1500" required />
              <Input label="Servis & Tayar" type="number" value={annualService} onChange={(e) => setAnnualService(e.target.value)} placeholder="1000" required />
            </div>
            <CustomSelect
              label="Bulan Roadtax Tamat"
              value={expiryMonth}
              onChange={(val) => setExpiryMonth(val)}
              options={months.map((m, i) => ({ value: i.toString(), label: m }))}
            />
          </div>

          <Button type="submit" fullWidth size="lg" leftIcon={<Calculator className="w-5 h-5" />}>
            Analisis Kos Sebenar
          </Button>
        </form>
      ) : (
        <div className="space-y-5 animate-scale-in">
          <div className="bg-surfaceVariant/40 border border-outline rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="type-caption font-semibold uppercase tracking-wider text-onSurfaceVariant">Monthly TCO Analysis</h4>
              <span className="type-caption font-semibold bg-error/12 text-error px-2.5 py-1 rounded-full uppercase">True Cost</span>
            </div>
            <div className="space-y-3">
              <Row label="Ansuran Bank (Bulanan)" value={formatCurrency(results.monthlyInstallment)} />
              <Row label="Penyelenggaraan (Pro-rata)" value={formatCurrency(results.monthlyRunningCost)} />
              <Row label="Bahan Api (1000km)" value={formatCurrency(results.monthlyFuel)} />
              <div className="pt-3 border-t border-outline flex justify-between items-end">
                <span className="type-subheadline font-semibold text-onSurface">Kos Sebenar (TCO)</span>
                <span className="type-title2 text-error tabular-nums">{formatCurrency(results.totalTCO)}</span>
              </div>
            </div>
          </div>

          <div className="bg-info/10 border border-info/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2 bg-info text-white rounded-xl">
                <Coins className="w-5 h-5" />
              </span>
              <h4 className="type-subheadline font-semibold text-onSurface">Pelan Tabung Roadtax</h4>
            </div>
            <p className="type-footnote mb-4">
              Hari ini bulan <b className="text-onSurface">{results.currentMonthName}</b>. Roadtax anda mati pada bulan{' '}
              <b className="text-onSurface">{results.expiryMonthName}</b>.
            </p>
            <div className="bg-surface border border-outline rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="type-caption font-semibold uppercase tracking-wider text-onSurfaceVariant">Simpanan Bulanan Diperlukan</p>
                <span className="type-caption font-semibold bg-info text-white px-2 py-0.5 rounded-lg">Baki {results.remainingMonths} Bulan</span>
              </div>
              <p className="type-title1 text-info tabular-nums">{formatCurrency(results.sinkingFundNeeded)}<span className="type-subheadline font-normal text-onSurfaceVariant"> / bulan</span></p>
            </div>
          </div>

          <Button variant="secondary" fullWidth size="lg" leftIcon={<History className="w-4 h-4" />} onClick={() => setResults(null)}>
            Kira Semula
          </Button>
        </div>
      )}

      <div className="mt-5 p-4 bg-warning/10 rounded-2xl border border-warning/20 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <p className="type-footnote text-onSurface">
          <b>Peringatan:</b> Kos penyelenggaraan tidak termasuk kerosakan luar jangka. Dicadangkan simpan 10% tambahan untuk dana kecemasan kenderaan.
        </p>
      </div>
    </Modal>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center">
    <span className="type-subheadline text-onSurfaceVariant">{label}</span>
    <span className="type-subheadline font-semibold text-onSurface tabular-nums">{value}</span>
  </div>
);

export default VehicleTCOModal;
