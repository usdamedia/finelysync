import React, { useMemo } from 'react';
import { SummaryMetrics, Income, Expense } from '../types';
import { User, ArrowUpRight } from 'lucide-react';
import { getTranslations } from '../constants/translations';

interface SummaryProps {
  metrics: SummaryMetrics;
  income: Income;
  expenses: Expense[];
  viewMode?: 'list' | 'grid';
  showAmounts?: boolean;
  currencySymbol?: string;
  language?: string;
  userRole?: 'Suami' | 'Isteri' | 'Bujang';
}

const Summary: React.FC<SummaryProps> = ({
  metrics,
  income,
  expenses,
  showAmounts = true,
  currencySymbol = 'RM',
  language = 'ms',
  userRole = 'Suami',
}) => {
  const t = useMemo(() => getTranslations(language), [language]);
  const isSingle = userRole === 'Bujang';

  const formatCurrency = (val: number) =>
    showAmounts ? `${currencySymbol}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '••••';

  const MetricCard = ({ title, balanceVal, incomeVal, type }: { title: string; balanceVal: number; incomeVal: number; type: 'husband' | 'wife' }) => {
    const isHusband = type === 'husband';
    const accent = isHusband ? 'text-teal-600 dark:text-teal-300' : 'text-rose-600 dark:text-rose-300';
    const accentBg = isHusband ? 'bg-teal-500/12' : 'bg-rose-500/12';
    const itemCount = expenses.filter(
      (e) => (isHusband && e.husbandContribution > 0) || (!isHusband && e.wifeContribution > 0)
    ).length;

    return (
      <div className="bg-surface border border-outline rounded-2xl p-5 shadow-[var(--shadow-1)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accentBg} ${accent}`}>
              <User className="w-4.5 h-4.5" strokeWidth={2.4} />
            </span>
            <div className="min-w-0">
              <p className="type-subheadline font-semibold text-onSurface truncate">{title}</p>
              <p className="type-caption">{itemCount} {t.itemCount}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="type-caption">Baki</p>
          <p className={`type-title1 tracking-tight ${balanceVal < 0 ? 'text-error' : 'text-onSurface'}`}>{formatCurrency(balanceVal)}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-outline/60">
          <span className="type-caption">{t.income}</span>
          <span className="type-subheadline font-semibold text-onSurface">{formatCurrency(incomeVal)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="type-subheadline font-medium text-onSurfaceVariant flex items-center gap-2 px-0.5">
        <ArrowUpRight className="w-4 h-4" /> {t.cashflow}
      </h3>
      <div className={`grid gap-3 md:gap-4 ${isSingle ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <MetricCard title={isSingle ? t.self : t.husband} type="husband" balanceVal={metrics.balanceHusband} incomeVal={income.husband} />
        {!isSingle && <MetricCard title={t.wife} type="wife" balanceVal={metrics.balanceWife} incomeVal={income.wife} />}
      </div>
    </div>
  );
};

export default Summary;
