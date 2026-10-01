import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { Activity, TrendingUp, ChevronRight, BarChart3, Repeat, Bell } from 'lucide-react';

import Summary from '../../components/Summary';
import CategoryList from '../../components/CategoryList';
import { Subscription } from '../../types';
import { monthlyCost, upcomingRenewals } from '../../services/subscriptionService';

const RetirementCalculatorModal = lazy(() => import('../../components/RetirementCalculatorModal'));
const VehicleTCOModal = lazy(() => import('../../components/VehicleTCOModal'));
const RayaCalculatorModal = lazy(() => import('../../components/RayaCalculatorModal'));
import { SummaryMetrics, Income, Expense, FinancialRecords, MonthlyData, UserSettings, Account } from '../../types';
import { getTranslations } from '../../constants/translations';

import HeroSection from './components/HeroSection';
import QuickTools from './components/QuickTools';
import TutorialCard from './components/TutorialCard';
import StickySupport from './components/StickySupport';

interface HomeProps {
  metrics: SummaryMetrics;
  income: Income;
  expenses: Expense[];
  displayBalance: number;
  monthLabel: string;
  currentMonth: string;
  currencySymbol?: string;
  isGuest?: boolean;
  language?: string;
  userRole?: 'Suami' | 'Isteri' | 'Bujang';
  showAmounts: boolean;
  onToggleAmounts: () => void;
  financialRecords?: FinancialRecords;
  displayName?: string;
  photoURL?: string;
  onNavigateToDashboard?: () => void;
  onNavigateToSinkingFund?: () => void;
  onNavigateToDonation?: () => void;
  onNavigateToSubscription?: () => void;
  subscriptions?: Subscription[];
  onOpenRayaCalculator?: () => void;
  userSettings?: UserSettings;
  onUpdateSettings?: (settings: UserSettings) => void;
  targetUid?: string;
  activeAccountId: string | null;
  onSelectAccount: (id: string | null) => void;
  accounts?: Account[];
}

const COLORS = ['#5E5CE6', '#0A84FF', '#30D158', '#FF9F0A', '#FF375F', '#BF5AF2', '#64D2FF'];

const CustomTooltip = ({ active, payload, label, currencySymbol, showAmounts }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-outline p-3 rounded-xl shadow-[var(--shadow-3)] min-w-[120px]">
        <p className="type-caption font-medium text-onSurfaceVariant mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="type-caption font-semibold text-onSurface tabular-nums">
              {showAmounts ? `${currencySymbol} ${entry.value.toLocaleString()}` : '••••'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Home: React.FC<HomeProps> = ({
  metrics,
  income,
  expenses,
  displayBalance,
  monthLabel,
  currentMonth,
  currencySymbol = 'RM',
  isGuest = false,
  language = 'ms',
  userRole = 'Suami',
  showAmounts,
  onToggleAmounts,
  financialRecords,
  displayName = 'User',
  photoURL,
  targetUid,
  activeAccountId,
  onSelectAccount,
  onNavigateToDashboard,
  onNavigateToSinkingFund,
  onNavigateToDonation,
  onNavigateToSubscription,
  subscriptions = [],
  onOpenRayaCalculator,
  accounts = [],
}) => {
  const [showRetirementModal, setShowRetirementModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showRayaModal, setShowRayaModal] = useState(false);
  const [showSupportCard, setShowSupportCard] = useState(true);
  const [greeting, setGreeting] = useState('');

  const t = useMemo(() => getTranslations(language), [language]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t.home_greetingMorning);
    else if (hour < 18) setGreeting(t.home_greetingAfternoon);
    else setGreeting(t.home_greetingEvening);
  }, [t.home_greetingAfternoon, t.home_greetingEvening, t.home_greetingMorning]);

  const activeAccount = useMemo(() => accounts.find((a) => a.id === activeAccountId), [accounts, activeAccountId]);

  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach((exp) => {
      grouped[exp.category] = (grouped[exp.category] || 0) + exp.totalAmount;
    });
    return Object.keys(grouped)
      .map((key, index) => ({
        name: t[`cat_${key.replace(/\s+/g, '')}`] || key,
        value: grouped[key],
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, t]);

  const trendData = useMemo(() => {
    if (!financialRecords) return [];
    return Object.keys(financialRecords)
      .sort()
      .map((monthKey) => {
        const data: MonthlyData = financialRecords[monthKey];
        const relevantIncomes = activeAccountId ? (data.incomes || []).filter((i) => i.accountId === activeAccountId) : data.incomes || [];
        const relevantExpenses = activeAccountId ? (data.expenses || []).filter((e) => e.accountId === activeAccountId) : data.expenses || [];

        const totalInc = relevantIncomes.reduce((a, b) => a + b.amount, 0);
        const totalExp = relevantExpenses.reduce((a, b) => a + b.totalAmount, 0);

        const date = new Date(monthKey + '-01');
        if (isNaN(date.getTime())) return null;
        const locale =
          language?.startsWith('zh') ? 'zh-CN' : language?.startsWith('ta') ? 'ta-IN' : language === 'ms' ? 'ms-MY' : 'en-US';
        const shortMonth = date.toLocaleDateString(locale, { month: 'short' });
        return { name: shortMonth, [t.income]: totalInc, [t.expenses]: totalExp };
      })
      .filter(Boolean);
  }, [financialRecords, language, t, activeAccountId]);

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const subscriptionReminders = useMemo(() => upcomingRenewals(subscriptions, 3), [subscriptions]);
  const subscriptionMonthly = useMemo(() => subscriptions.reduce((acc, s) => acc + monthlyCost(s), 0), [subscriptions]);

  return (
    <div className="animate-fade-in space-y-5">
      <header className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-surfaceVariant border border-outline flex items-center justify-center shrink-0">
            {photoURL ? (
              <img src={photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="type-headline font-semibold text-primary">{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="type-caption">{greeting}</p>
            <h1 className="type-headline text-onSurface truncate">{displayName}</h1>
          </div>
        </div>
      </header>

      <HeroSection
        language={language}
        accounts={accounts}
        activeAccountId={activeAccountId}
        onSelectAccount={onSelectAccount}
        currencySymbol={currencySymbol}
        showAmounts={showAmounts}
        onToggleAmounts={onToggleAmounts}
        displayBalance={displayBalance}
        monthLabel={monthLabel}
        activeAccount={activeAccount}
        targetUid={targetUid}
        userRole={userRole}
        currentMonth={currentMonth}
        metrics={metrics}
      />

      {subscriptionReminders.length > 0 && onNavigateToSubscription && (
        <button
          onClick={onNavigateToSubscription}
          className="w-full bg-warning/10 border border-warning/25 rounded-2xl p-4 flex items-center gap-3 text-left hover:bg-warning/15 transition-colors"
        >
          <span className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="type-subheadline font-semibold text-onSurface">
              {subscriptionReminders.length} langganan akan diperbaharui
            </p>
            <p className="type-footnote">Dalam 3 hari akan datang · Ketik untuk lihat</p>
          </div>
          <ChevronRight className="w-5 h-5 text-onSurfaceVariant shrink-0" />
        </button>
      )}

      <QuickTools
        language={language}
        onOpenRetirement={() => setShowRetirementModal(true)}
        onOpenVehicle={() => setShowVehicleModal(true)}
        onOpenSinkingFund={() => onNavigateToSinkingFund && onNavigateToSinkingFund()}
        onOpenRaya={() => (onOpenRayaCalculator ? onOpenRayaCalculator() : setShowRayaModal(true))}
      />

      {onNavigateToSubscription && (
        <button
          onClick={onNavigateToSubscription}
          className="w-full bg-surface border border-outline rounded-2xl p-5 shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] transition-shadow flex items-center gap-4"
        >
          <span className="w-12 h-12 rounded-2xl bg-info/12 text-info flex items-center justify-center shrink-0">
            <Repeat className="w-6 h-6" />
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="type-headline text-onSurface">Langganan</h3>
            <p className="type-footnote mt-0.5">
              {subscriptions.length > 0
                ? `${subscriptions.length} langganan · ${currencySymbol}${subscriptionMonthly.toLocaleString(undefined, { maximumFractionDigits: 2 })} sebulan`
                : 'Tambah dan pantau langganan berulang anda'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-onSurfaceVariant shrink-0" />
        </button>
      )}

      {showSupportCard && !isGuest && (
        <StickySupport onDonate={() => onNavigateToDonation && onNavigateToDonation()} onClose={() => setShowSupportCard(false)} />
      )}

      <TutorialCard language={language} />

      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="type-headline text-onSurface flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> {t.cashflowTitle}
          </h2>
          <button onClick={onNavigateToDashboard} className="flex items-center gap-0.5 type-subheadline font-medium text-primary">
            Lihat Semua <ChevronRight size={16} />
          </button>
        </div>
        <Summary metrics={metrics} income={income} expenses={expenses} showAmounts={showAmounts} currencySymbol={currencySymbol} language={language} userRole={userRole} />

        {trendData.length > 0 && (
          <div className="bg-surface border border-outline rounded-2xl p-5 shadow-[var(--shadow-1)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="type-headline text-onSurface flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> {t.trend}
              </h3>
              <span className="type-caption bg-surfaceVariant px-2.5 py-1 rounded-full">{new Date().getFullYear()}</span>
            </div>
            <div className="h-44 md:h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} showAmounts={showAmounts} />} />
                  <Area type="monotone" dataKey={t.income} stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey={t.expenses} stroke="var(--color-error)" strokeWidth={2} fillOpacity={0.06} fill="var(--color-error)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {expenses.length > 0 && (
        <section className="bg-surface border border-outline rounded-2xl p-5 shadow-[var(--shadow-1)]">
          <h3 className="type-headline text-onSurface flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" /> {t.topExpenses}
          </h3>
          <div className="w-full h-48 md:h-56 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData.slice(0, 5)} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barSize={16}>
                <Tooltip cursor={{ opacity: 0.08 }} content={<CustomTooltip currencySymbol={currencySymbol} showAmounts={showAmounts} />} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                  {categoryData.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <CategoryList data={categoryData} limit={5} totalValue={totalExpense} currencySymbol={currencySymbol} showAmounts={showAmounts} />
        </section>
      )}

      <Suspense fallback={null}>
        {showRetirementModal && <RetirementCalculatorModal isOpen onClose={() => setShowRetirementModal(false)} currencySymbol={currencySymbol} />}
        {showVehicleModal && <VehicleTCOModal isOpen onClose={() => setShowVehicleModal(false)} currencySymbol={currencySymbol} language={language} />}
        {showRayaModal && <RayaCalculatorModal isOpen onClose={() => setShowRayaModal(false)} currencySymbol={currencySymbol} />}
      </Suspense>
    </div>
  );
};

export default Home;
