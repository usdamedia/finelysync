import React, { useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  BarChart, Bar, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { FinancialRecords, MonthlyData, Account } from '../../types';
import { getTranslations } from '../../constants/translations';
import CategoryList from '../../components/CategoryList';
import { TrendingDown, TrendingUp, Wallet, BarChart3, ArrowRightLeft, User } from 'lucide-react';
import CustomSelect from '../../components/CustomSelect';
import ActiveWalletSelectorCard from '../../components/ActiveWalletSelectorCard';
import { Card, EmptyState } from '../../components/ui';

interface DashboardProps {
  allData: FinancialRecords;
  currentMonth: string;
  currencySymbol?: string;
  themeColor?: string;
  language?: string;
  showAmounts: boolean;
  activeAccountId: string | null;
  currentMonthVal: string;
  currentYearVal: string;
  onMonthChange: (e: any) => void;
  onYearChange: (e: any) => void;
  months: { value: string; label: string }[];
  years: number[];
  accounts: Account[];
  onSelectAccount: (id: string | null) => void;
}

const CHART_COLORS = ['#5E5CE6', '#0A84FF', '#30D158', '#FF9F0A', '#FF375F', '#BF5AF2', '#64D2FF'];

const Dashboard: React.FC<DashboardProps> = ({
  allData,
  currencySymbol = 'RM',
  language = 'ms',
  showAmounts,
  activeAccountId,
  currentMonthVal,
  currentYearVal,
  onMonthChange,
  onYearChange,
  months,
  years,
  accounts,
  onSelectAccount,
}) => {
  const t = useMemo(() => getTranslations(language), [language]);
  const isGlobalView = currentMonthVal === 'all';
  const sortedMonths = useMemo(() => Object.keys(allData).sort(), [allData]);

  const trendData = useMemo(() => {
    if (isGlobalView) {
      const yearlyGroups: Record<string, { income: number; expense: number }> = {};
      sortedMonths.forEach((monthKey) => {
        const year = monthKey.split('-')[0];
        if (!yearlyGroups[year]) yearlyGroups[year] = { income: 0, expense: 0 };
        const data = allData[monthKey];
        const relevantIncomes = activeAccountId ? (data.incomes || []).filter((i) => i.accountId === activeAccountId) : data.incomes || [];
        const relevantExpenses = activeAccountId ? (data.expenses || []).filter((e) => e.accountId === activeAccountId) : data.expenses || [];
        yearlyGroups[year].income += relevantIncomes.reduce((acc, curr) => acc + curr.amount, 0);
        yearlyGroups[year].expense += relevantExpenses.reduce((acc, curr) => acc + curr.totalAmount, 0);
      });
      return Object.keys(yearlyGroups).sort().map((year) => ({ name: year, fullDate: year, [t.income]: yearlyGroups[year].income, [t.expenses]: yearlyGroups[year].expense }));
    } else {
      const keysToProcess = sortedMonths.filter((k) => k.startsWith(currentYearVal));
      return keysToProcess.map((monthKey) => {
        const data: MonthlyData = allData[monthKey];
        const relevantIncomes = activeAccountId ? (data.incomes || []).filter((i) => i.accountId === activeAccountId) : data.incomes || [];
        const relevantExpenses = activeAccountId ? (data.expenses || []).filter((e) => e.accountId === activeAccountId) : data.expenses || [];
        const totalIncome = relevantIncomes.reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpense = relevantExpenses.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const dateObj = new Date(monthKey);
        return { name: dateObj.toLocaleDateString('ms-MY', { month: 'short' }), fullDate: monthKey, [t.income]: totalIncome, [t.expenses]: totalExpense };
      });
    }
  }, [allData, sortedMonths, t, activeAccountId, isGlobalView, currentYearVal]);

  const getBarChartData = (type: 'income' | 'expense') => {
    if (isGlobalView) {
      const yearlyTotals: Record<string, number> = {};
      sortedMonths.forEach((monthKey) => {
        const year = monthKey.split('-')[0];
        const data = allData[monthKey];
        const items = type === 'income'
          ? (activeAccountId ? (data.incomes || []).filter((i) => i.accountId === activeAccountId) : data.incomes || [])
          : (activeAccountId ? (data.expenses || []).filter((e) => e.accountId === activeAccountId) : data.expenses || []);
        const val = items.reduce((acc, curr) => acc + (type === 'income' ? (curr as any).amount : (curr as any).totalAmount), 0);
        yearlyTotals[year] = (yearlyTotals[year] || 0) + val;
      });
      const yearsArr = Object.keys(yearlyTotals).sort();
      const slicedYears = yearsArr.slice(Math.max(0, yearsArr.length - 5));
      return slicedYears.map((y) => ({ name: y, value: yearlyTotals[y], isCurrent: true }));
    } else {
      const dataPoints = sortedMonths.map((monthKey) => {
        const data = allData[monthKey];
        const items = type === 'income'
          ? (activeAccountId ? (data.incomes || []).filter((i) => i.accountId === activeAccountId) : data.incomes || [])
          : (activeAccountId ? (data.expenses || []).filter((e) => e.accountId === activeAccountId) : data.expenses || []);
        return {
          fullDate: monthKey,
          name: new Date(monthKey).toLocaleDateString('ms-MY', { month: 'short' }),
          value: items.reduce((acc, curr) => acc + (type === 'income' ? (curr as any).amount : (curr as any).totalAmount), 0),
        };
      });
      let focusIndex = dataPoints.length - 1;
      const targetDate = `${currentYearVal}-${currentMonthVal}`;
      const idx = dataPoints.findIndex((d) => d.fullDate.startsWith(targetDate));
      if (idx !== -1) focusIndex = idx;
      const start = Math.max(0, focusIndex - 5);
      const end = focusIndex + 1;
      return dataPoints.slice(start, end).map((d) => ({ ...d, isCurrent: d.fullDate.startsWith(`${currentYearVal}-${currentMonthVal}`) }));
    }
  };

  const incomeBarData = useMemo(() => getBarChartData('income'), [allData, sortedMonths, activeAccountId, isGlobalView, currentMonthVal, currentYearVal]);
  const expenseBarData = useMemo(() => getBarChartData('expense'), [allData, sortedMonths, activeAccountId, isGlobalView, currentMonthVal, currentYearVal]);

  const ytdMetrics = useMemo(() => {
    let totalInc = 0;
    let totalExp = 0;
    const relevantKeys = isGlobalView ? sortedMonths : sortedMonths.filter((k) => k.startsWith(`${currentYearVal}-${currentMonthVal}`));
    relevantKeys.forEach((monthKey) => {
      const data = allData[monthKey];
      if (!data) return;
      const relevantIncomes = activeAccountId ? (data.incomes || []).filter((i) => i.accountId === activeAccountId) : data.incomes || [];
      const relevantExpenses = activeAccountId ? (data.expenses || []).filter((e) => e.accountId === activeAccountId) : data.expenses || [];
      totalInc += relevantIncomes.reduce((acc, curr) => acc + curr.amount, 0);
      totalExp += relevantExpenses.reduce((a, b) => a + b.totalAmount, 0);
    });

    let liveBalance = 0;
    if (activeAccountId) {
      const acc = accounts.find((a) => a.id === activeAccountId);
      liveBalance = acc ? acc.balance : 0;
    } else {
      liveBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
    }

    return { income: totalInc, expense: totalExp, balance: liveBalance, displayIncome: totalInc, displayExpense: totalExp, dataPointCount: relevantKeys.length };
  }, [allData, activeAccountId, isGlobalView, sortedMonths, currentMonthVal, currentYearVal, accounts]);

  const settlementMetrics = useMemo(() => {
    let husbandToWife = 0;
    let wifeToHusband = 0;
    const relevantKeys = isGlobalView ? sortedMonths : sortedMonths.filter((k) => k.startsWith(`${currentYearVal}-${currentMonthVal}`));
    relevantKeys.forEach((monthKey) => {
      const data = allData[monthKey];
      if (!data) return;
      const relevantExpenses = activeAccountId ? (data.expenses || []).filter((e) => e.accountId === activeAccountId) : data.expenses || [];
      relevantExpenses.forEach((exp) => {
        if (exp.payToPartner) {
          const direction = exp.partnerSettlementDirection || (exp.paidBy === 'wife' ? 'wife_to_husband' : 'husband_to_wife');
          if (direction === 'husband_to_wife') husbandToWife += exp.totalAmount;
          else if (direction === 'wife_to_husband') wifeToHusband += exp.totalAmount;
          return;
        }
        if (exp.paidBy === 'husband') wifeToHusband += exp.wifeContribution || 0;
        else if (exp.paidBy === 'wife') husbandToWife += exp.husbandContribution || 0;
      });
    });
    return { husbandToWife, wifeToHusband };
  }, [allData, activeAccountId, isGlobalView, sortedMonths, currentMonthVal, currentYearVal]);

  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    let total = 0;
    const relevantKeys = isGlobalView ? sortedMonths : sortedMonths.filter((k) => k.startsWith(`${currentYearVal}-${currentMonthVal}`));
    relevantKeys.forEach((monthKey) => {
      const data = allData[monthKey];
      if (!data) return;
      const relevantExpenses = activeAccountId ? (data.expenses || []).filter((e) => e.accountId === activeAccountId) : data.expenses || [];
      relevantExpenses.forEach((exp) => {
        grouped[exp.category] = (grouped[exp.category] || 0) + exp.totalAmount;
        total += exp.totalAmount;
      });
    });
    return {
      data: Object.keys(grouped)
        .map((key, index) => ({ name: t[`cat_${key.replace(/\s+/g, '')}`] || key, value: grouped[key], color: CHART_COLORS[index % CHART_COLORS.length] }))
        .sort((a, b) => b.value - a.value),
      total,
    };
  }, [allData, t, activeAccountId, isGlobalView, sortedMonths, currentMonthVal, currentYearVal]);

  const gaugeData = useMemo(() => {
    const expenseValue = ytdMetrics.expense;
    const savingsValue = Math.max(0, ytdMetrics.balance);
    if (ytdMetrics.balance < 0) return [{ name: t.expenses, value: 100, color: 'var(--color-error)' }, { name: t.savings, value: 0, color: 'var(--color-surface-variant)' }];
    if (ytdMetrics.income === 0 && ytdMetrics.expense === 0 && ytdMetrics.balance === 0) return [{ name: 'Empty', value: 100, color: 'var(--color-surface-variant)' }];
    return [{ name: t.expenses, value: expenseValue, color: 'var(--color-outline)' }, { name: t.savings, value: savingsValue, color: 'var(--color-primary)' }];
  }, [ytdMetrics, t]);

  const formatCurrency = (val: number) =>
    showAmounts ? `${currencySymbol} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${currencySymbol} ••••`;

  if (sortedMonths.length === 0 && accounts.length === 0) {
    return <EmptyState icon={<BarChart3 className="w-6 h-6" />} title="Tiada data" description="Cipta wallet dan rekod transaksi untuk mula menjejak kewangan." />;
  }

  const yearOptions = years.map((y) => ({ value: y.toString(), label: y.toString() }));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="type-title1 text-onSurface">{t.dashboard}</h1>
          <p className="type-footnote mt-1">{isGlobalView ? 'Analisis keseluruhan tahunan' : `Analisis bulan ${currentMonthVal}/${currentYearVal}`}</p>
        </div>

        <div className={`grid grid-cols-1 gap-2.5 md:gap-3 w-full lg:w-auto lg:min-w-[420px] ${isGlobalView ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
          <ActiveWalletSelectorCard accounts={accounts} activeAccountId={activeAccountId} onSelectAccount={onSelectAccount} label="Wallet" />
          <CustomSelect label="Tempoh" value={currentMonthVal} onChange={onMonthChange} options={months} />
          {!isGlobalView && <CustomSelect label="Tahun" value={currentYearVal} onChange={onYearChange} options={yearOptions} />}
        </div>
      </div>

      {/* Balance gauge */}
      <Card elevated className="relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-[-36px] md:mb-[-48px] z-20 mt-2">
            <span className="w-11 h-11 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-3">
              <Wallet className="w-5 h-5 md:w-6 md:h-6" />
            </span>
            <p className="type-title1 text-onSurface tabular-nums">{formatCurrency(ytdMetrics.balance)}</p>
            <p className="type-footnote mt-1.5">{isGlobalView ? 'Jumlah baki terkumpul' : t.totalBalance}</p>
          </div>

          <div className="w-full h-[200px] md:h-[240px] max-w-[440px] pointer-events-none mt-8 md:mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gaugeData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={100} outerRadius={130} paddingAngle={0} dataKey="value" stroke="none" cornerRadius={10}>
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 w-full max-w-2xl gap-4 mt-6 pt-6 border-t border-outline">
            <Metric label="Perbelanjaan" value={formatCurrency(ytdMetrics.expense)} icon={<TrendingDown className="w-4 h-4" />} tone="text-error" />
            <Metric label="Pendapatan" value={formatCurrency(ytdMetrics.income)} icon={<TrendingUp className="w-4 h-4" />} tone="text-primary" className="sm:border-l sm:border-r border-outline" />
            <Metric label="Baki" value={formatCurrency(ytdMetrics.balance)} icon={<Wallet className="w-4 h-4" />} tone="text-success" />
          </div>
        </div>
      </Card>

      {(settlementMetrics.husbandToWife > 0 || settlementMetrics.wifeToHusband > 0) && (
        <Card>
          <div className="flex items-start gap-4 mb-5">
            <span className="p-3 bg-info/12 rounded-2xl text-info shrink-0">
              <ArrowRightLeft className="w-6 h-6" />
            </span>
            <div className="min-w-0">
              <h2 className="type-headline text-onSurface">{t.partnerSettlement || 'Bayaran kepada pasangan'}</h2>
              <p className="type-footnote">Duit yang perlu dipindahkan kepada pasangan.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettlementCard label={t.husbandToWife || 'Suami bayar isteri'} value={formatCurrency(settlementMetrics.husbandToWife)} tone="info" />
            <SettlementCard label={t.wifeToHusband || 'Isteri bayar suami'} value={formatCurrency(settlementMetrics.wifeToHusband)} tone="secondary" />
          </div>
        </Card>
      )}

      {incomeBarData.length > 0 && (
        <Card>
          <div className="mb-5">
            <h2 className="type-headline text-onSurface">Pendapatan mengikut tempoh</h2>
            <p className="type-footnote">{isGlobalView ? 'Pecahan tahunan' : 'Paparan 6 tempoh terkini'}</p>
          </div>
          <p className="type-title1 text-primary tabular-nums mb-6">{formatCurrency(ytdMetrics.displayIncome)}</p>
          <div className="h-32 md:h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeBarData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Tooltip cursor={{ fill: 'transparent' }} content={<BarTooltip formatCurrency={formatCurrency} color="var(--color-primary)" />} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={36}>
                  {incomeBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="var(--color-primary)" opacity={entry.isCurrent || isGlobalView ? 1 : 0.25} />
                  ))}
                </Bar>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} dy={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {expenseBarData.length > 0 && (
        <Card>
          <div className="mb-5">
            <h2 className="type-headline text-onSurface">Perbelanjaan mengikut tempoh</h2>
            <p className="type-footnote">{isGlobalView ? 'Pecahan tahunan' : 'Paparan 6 tempoh terkini'}</p>
          </div>
          <p className="type-title1 text-error tabular-nums mb-6">{formatCurrency(ytdMetrics.displayExpense)}</p>
          <div className="h-32 md:h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseBarData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Tooltip cursor={{ fill: 'transparent' }} content={<BarTooltip formatCurrency={formatCurrency} color="var(--color-error)" />} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={36}>
                  {expenseBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="var(--color-error)" opacity={entry.isCurrent || isGlobalView ? 1 : 0.25} />
                  ))}
                </Bar>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} dy={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h2 className="type-headline text-onSurface mb-5 flex items-center gap-3">
            <span className="p-2 bg-surfaceVariant rounded-xl">
              <BarChart3 className="w-5 h-5 text-primary" />
            </span>
            {t.trend} {isGlobalView && <span className="type-caption font-medium">(Tahunan)</span>}
          </h2>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} dy={12} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => (showAmounts ? `${currencySymbol}${val / 1000}k` : '•••')} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '16px', border: '1px solid var(--color-outline)', background: 'var(--color-surface)', fontWeight: 500, fontSize: '13px' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} />
                <Line type="monotone" dataKey={t.income} stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-primary)' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey={t.expenses} stroke="var(--color-error)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-error)' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col">
          <h2 className="type-headline text-onSurface mb-5">{t.category}</h2>
          <div className="w-full h-56 md:h-64 mb-5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData.data} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={6}>
                  {categoryData.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ borderRadius: '16px', border: '1px solid var(--color-outline)', background: 'var(--color-surface)', fontWeight: 500, fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[420px] custom-scrollbar pr-1">
            <CategoryList data={categoryData.data} totalValue={categoryData.total} currencySymbol={currencySymbol} showAmounts={showAmounts} />
          </div>
        </Card>
      </div>
    </div>
  );
};

const Metric = ({ label, value, icon, tone, className = '' }: { label: string; value: string; icon: React.ReactNode; tone: string; className?: string }) => (
  <div className={`flex flex-col items-center text-center ${className}`}>
    <span className={`mb-1.5 ${tone}`}>{icon}</span>
    <span className="type-caption">{label}</span>
    <span className="type-headline text-onSurface mt-1 tabular-nums">{value}</span>
  </div>
);

const SettlementCard = ({ label, value, tone }: { label: string; value: string; tone: 'info' | 'secondary' }) => {
  const bar = tone === 'info' ? 'bg-info' : 'bg-secondary';
  const text = tone === 'info' ? 'text-info' : 'text-secondary';
  return (
    <div className="flex items-start justify-between gap-4 p-5 bg-surfaceVariant/40 rounded-2xl relative overflow-hidden">
      <span className={`absolute top-0 left-0 w-1.5 h-full ${bar}`} />
      <div className="min-w-0">
        <span className="type-caption">{label}</span>
        <p className={`type-title2 tabular-nums mt-1 ${text}`}>{value}</p>
      </div>
      <span className="w-10 h-10 rounded-2xl bg-surfaceVariant flex items-center justify-center opacity-60 shrink-0">
        <User className="w-5 h-5 text-onSurface" />
      </span>
    </div>
  );
};

const BarTooltip = ({ active, payload, formatCurrency, color }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-outline p-2.5 rounded-xl shadow-[var(--shadow-2)]">
        <p className="type-caption font-medium text-onSurface">{payload[0].payload.name}</p>
        <p className="type-subheadline font-semibold" style={{ color }}>{formatCurrency(payload[0].value as number)}</p>
      </div>
    );
  }
  return null;
};

export default Dashboard;
