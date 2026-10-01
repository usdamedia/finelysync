import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Wallet, CheckCircle2, CheckSquare, Copy, Square,
  PiggyBank, Clock, Check, Archive, RefreshCw, Search, X, CalendarDays, List, Settings2, Repeat, CalendarClock,
} from 'lucide-react';
import { IncomeItem, Expense, Income, Account, ExpenseCategory, ExpenseStatus, UserSettings, Subscription } from '../../types';
import { nextRenewalDate } from '../../services/subscriptionService';
import { getTranslations } from '../../constants/translations';
import PlannerForm from './components/PlannerForm';
import BudgetModal from './components/BudgetModal';
import CommitmentCalendar from './components/CommitmentCalendar';
import CustomSelect from '../../components/CustomSelect';
import ActiveWalletSelectorCard from '../../components/ActiveWalletSelectorCard';
import { Button, IconButton, Modal, SegmentedControl, EmptyState, useToast } from '../../components/ui';

interface PlannerProps {
  incomes: IncomeItem[];
  onUpdateIncomes: (incomes: IncomeItem[]) => void;
  expenses: Expense[];
  onUpdateExpenses: (expenses: Expense[]) => void;
  onDuplicateExpenses?: (expenses: Expense[], targetMonth: string) => void;
  calculatedIncome: Income;
  currencySymbol: string;
  language: string;
  userRole: 'Suami' | 'Isteri' | 'Bujang';
  showAmounts: boolean;
  onToggleAmounts: () => void;
  isGuest: boolean;
  activeAccountId: string | null;
  onSelectAccount: (id: string | null) => void;
  accounts: Account[];
  currentMonthVal: string;
  currentYearVal: string;
  onMonthChange: (val: string) => void;
  onYearChange: (val: string) => void;
  months: { value: string; label: string }[];
  years: number[];
  quickAddType?: 'income' | 'expense' | null;
  onClearQuickAdd?: () => void;
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  subscriptions?: Subscription[];
}

const Planner: React.FC<PlannerProps> = ({
  incomes, onUpdateIncomes, expenses, onUpdateExpenses, onDuplicateExpenses,
  calculatedIncome, currencySymbol, language, userRole, showAmounts,
  activeAccountId, onSelectAccount, accounts, currentMonthVal, currentYearVal,
  onMonthChange, onYearChange, months, years,
  quickAddType, onClearQuickAdd, settings, onUpdateSettings, subscriptions = [],
}) => {
  const t = useMemo(() => getTranslations(language), [language]);
  const toast = useToast();
  const isSingle = userRole === 'Bujang';

  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [showAddForm, setShowAddForm] = useState(false);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [targetDupMonth, setTargetDupMonth] = useState(months[new Date().getMonth()].value);
  const [targetDupYear, setTargetDupYear] = useState(new Date().getFullYear().toString());

  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // New: search / filter / view / budget
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ExpenseStatus>('all');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'husband' | 'wife'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  useEffect(() => {
    if (quickAddType) {
      setActiveTab(quickAddType);
      setShowAddForm(true);
      setEditingIncomeId(null);
      setEditingExpenseId(null);
      if (onClearQuickAdd) onClearQuickAdd();
    }
  }, [quickAddType, onClearQuickAdd]);

  const displayedIncomes = useMemo(() => (activeAccountId ? incomes.filter((i) => i.accountId === activeAccountId) : incomes), [incomes, activeAccountId]);
  const displayedExpenses = useMemo(() => (activeAccountId ? expenses.filter((e) => e.accountId === activeAccountId) : expenses), [expenses, activeAccountId]);

  const query = searchQuery.trim().toLowerCase();

  const visibleIncomes = useMemo(
    () =>
      displayedIncomes.filter((i) => {
        if (query && !`${i.description} ${i.category}`.toLowerCase().includes(query)) return false;
        if (ownerFilter !== 'all' && i.owner !== ownerFilter) return false;
        return true;
      }),
    [displayedIncomes, query, ownerFilter]
  );

  const visibleExpenses = useMemo(
    () =>
      displayedExpenses.filter((e) => {
        if (query && !`${e.description} ${e.category}`.toLowerCase().includes(query)) return false;
        if (statusFilter !== 'all' && e.status !== statusFilter) return false;
        if (ownerFilter === 'husband' && !(e.husbandContribution > 0 || e.paidBy === 'husband')) return false;
        if (ownerFilter === 'wife' && !(e.wifeContribution > 0 || e.paidBy === 'wife')) return false;
        return true;
      }),
    [displayedExpenses, query, statusFilter, ownerFilter]
  );

  const hasActiveFilters = query.length > 0 || statusFilter !== 'all' || ownerFilter !== 'all';
  const resetFilters = () => { setSearchQuery(''); setStatusFilter('all'); setOwnerFilter('all'); };

  const expenseStats = useMemo(() => {
    const pending = displayedExpenses.filter((e) => e.status === 'pending').reduce((a, b) => a + b.totalAmount, 0);
    const aside = displayedExpenses.filter((e) => e.status === 'aside').reduce((a, b) => a + b.totalAmount, 0);
    const paid = displayedExpenses.filter((e) => e.status === 'paid').reduce((a, b) => a + b.totalAmount, 0);
    const total = pending + aside + paid;
    const readiness = total > 0 ? ((paid + aside) / total) * 100 : 0;
    return { pending, aside, paid, total, readiness };
  }, [displayedExpenses]);

  const budgetRows = useMemo(() => {
    const budgets = settings.budgets || {};
    return Object.values(ExpenseCategory)
      .map((cat) => ({
        cat,
        limit: budgets[cat] || 0,
        spent: displayedExpenses.filter((e) => e.category === cat).reduce((a, b) => a + b.totalAmount, 0),
      }))
      .filter((r) => r.limit > 0);
  }, [settings.budgets, displayedExpenses]);

  const monthRenewals = useMemo(() => {
    const year = parseInt(currentYearVal);
    const month = parseInt(currentMonthVal);
    if (!year || !month) return [];
    return subscriptions
      .map((s) => ({ subscription: s, date: nextRenewalDate(s, new Date(year, month - 1, 1)) }))
      .filter(({ date }) => date.getFullYear() === year && date.getMonth() + 1 === month)
      .sort((a, b) => a.date.getDate() - b.date.getDate());
  }, [subscriptions, currentYearVal, currentMonthVal]);

  const renewalDays = useMemo(() => monthRenewals.map((r) => r.date.getDate()), [monthRenewals]);

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, typeof visibleExpenses> = {};
    visibleExpenses.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [visibleExpenses]);

  const toggleSelectionMode = () => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); };

  const toggleItemSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAllExpenses = () => {
    if (selectedIds.size === visibleExpenses.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(visibleExpenses.map((e) => e.id)));
  };

  const confirmDuplicate = () => {
    const itemsToCopy = expenses.filter((e) => selectedIds.has(e.id));
    const targetMonthKey = `${targetDupYear}-${targetDupMonth}`;
    if (onDuplicateExpenses) onDuplicateExpenses(itemsToCopy, targetMonthKey);
    setShowDuplicateModal(false);
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleEditIncome = (item: IncomeItem) => { setEditingIncomeId(item.id); setShowAddForm(true); };
  const handleEditExpense = (item: Expense) => { setEditingExpenseId(item.id); setShowAddForm(true); };

  const handleStatusChange = (e: React.MouseEvent, id: string, newStatus: ExpenseStatus) => {
    e.stopPropagation();
    onUpdateExpenses(expenses.map((exp) => (exp.id === id ? { ...exp, status: newStatus } : exp)));
  };

  // Undo-capable delete
  const handleDeleteExpense = (id: string) => {
    const target = expenses.find((exp) => exp.id === id);
    if (!target) return;
    onUpdateExpenses(expenses.filter((exp) => exp.id !== id));
    toast.action(`${target.description || target.category} dipadam`, { label: 'Batal', onClick: () => onUpdateExpenses(expenses) }, 'info');
  };

  const handleDeleteIncome = (id: string) => {
    const target = incomes.find((inc) => inc.id === id);
    if (!target) return;
    onUpdateIncomes(incomes.filter((inc) => inc.id !== id));
    toast.action(`${target.description || target.category} dipadam`, { label: 'Batal', onClick: () => onUpdateIncomes(incomes) }, 'info');
  };

  const formatAmount = (val: number) => (showAmounts ? `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••');

  const yearOptions = years.map((y) => ({ value: y.toString(), label: y.toString() }));

  const husbandIncomes = visibleIncomes.filter((i) => i.owner === 'husband');
  const wifeIncomes = visibleIncomes.filter((i) => i.owner === 'wife');
  const husbandTotal = husbandIncomes.reduce((a, b) => a + b.amount, 0);
  const wifeTotal = wifeIncomes.reduce((a, b) => a + b.amount, 0);

  const renderIncomeCard = (item: IncomeItem) => (
    <div key={item.id} className="bg-surface p-4 rounded-2xl border border-outline shadow-[var(--shadow-1)] flex flex-col gap-2 group hover:shadow-[var(--shadow-2)] transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0 ${item.owner === 'husband' ? 'bg-teal-500/12 text-teal-600 dark:text-teal-300' : 'bg-rose-500/12 text-rose-600 dark:text-rose-300'}`}>
            {item.category.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="type-subheadline font-medium text-onSurface truncate">{item.category}</h4>
              {item.isRecurring && <RefreshCw size={11} className="text-success shrink-0" />}
            </div>
            <p className="type-caption truncate">{item.description || 'Tiada perincian'}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`type-subheadline font-semibold tabular-nums ${item.owner === 'husband' ? 'text-teal-600 dark:text-teal-300' : 'text-rose-600 dark:text-rose-300'}`}>
            {showAmounts ? `${currencySymbol}${item.amount.toLocaleString()}` : '••••'}
          </p>
          <div className="flex justify-end gap-1 mt-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <IconButton label="Edit" size="sm" variant="surface" onClick={(e) => { e.stopPropagation(); handleEditIncome(item); }}>
              <Edit2 size={12} />
            </IconButton>
            <IconButton label="Padam" size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleDeleteIncome(item.id); }}>
              <Trash2 size={12} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExpenseCard = (item: Expense) => {
    const isSelected = selectedIds.has(item.id);
    const isSaving = item.category === ExpenseCategory.SIMPANAN;
    const hPercent = item.totalAmount > 0 ? (item.husbandContribution / item.totalAmount) * 100 : 0;
    const wPercent = item.totalAmount > 0 ? (item.wifeContribution / item.totalAmount) * 100 : 0;
    const isHusbandOnly = item.paidBy === 'husband';
    const isWifeOnly = item.paidBy === 'wife';
    const isBoth = item.paidBy === 'both';
    const hasTransfer = item.payToPartner;
    const transferDir = item.partnerSettlementDirection;

    return (
      <div
        key={item.id}
        onClick={() => isSelectionMode && toggleItemSelection(item.id)}
        className={`bg-surface p-4 rounded-2xl border shadow-[var(--shadow-1)] flex flex-col gap-2.5 group transition-all relative ${
          isSelectionMode ? 'cursor-pointer' : ''
        } ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-outline hover:shadow-[var(--shadow-2)]'}`}
      >
        {isSelectionMode && <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${isSelected ? 'bg-primary' : 'bg-transparent'}`} />}

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isSelectionMode ? (
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-onPrimary' : 'bg-surfaceVariant text-onSurfaceVariant'}`}>
                {isSelected ? <CheckCircle2 size={16} /> : <Square size={16} />}
              </div>
            ) : (
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-sm ${isSaving ? 'bg-success/12 text-success' : 'bg-error/10 text-error'}`}>
                {isSaving ? <PiggyBank size={16} /> : item.category.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h4 className="type-subheadline font-medium text-onSurface truncate">{item.description || item.category}</h4>
                {item.isRecurring && <RefreshCw size={11} className="text-success shrink-0 animate-spin-slow" />}
              </div>
              <p className="type-caption truncate">
                {item.category}
                {item.dueDay ? ` · ${item.dueDay}hb` : ''}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`type-subheadline font-semibold tabular-nums ${isSaving ? 'text-success' : 'text-error'}`}>
              {showAmounts ? `${currencySymbol}${item.totalAmount.toLocaleString()}` : '••••'}
            </p>
            {!isSelectionMode && (
              <div className="flex justify-end gap-1 mt-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <IconButton label="Edit" size="sm" variant="surface" onClick={(e) => { e.stopPropagation(); handleEditExpense(item); }}>
                  <Edit2 size={12} />
                </IconButton>
                <IconButton label="Padam" size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleDeleteExpense(item.id); }}>
                  <Trash2 size={12} />
                </IconButton>
              </div>
            )}
          </div>
        </div>

        {!isSelectionMode && (
          <div className={`rounded-xl px-3 py-2 flex items-center gap-2 text-[12px] ${
            isBoth ? 'bg-surfaceVariant/60' : isHusbandOnly ? 'bg-teal-500/10' : 'bg-rose-500/10'
          }`}>
            {(isHusbandOnly || isBoth) && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-5 h-5 rounded-md bg-teal-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0">S</span>
                <span className="type-caption font-semibold text-teal-700 dark:text-teal-300 truncate">
                  {showAmounts ? `${currencySymbol}${item.husbandContribution.toLocaleString()}` : '••••'}
                </span>
              </div>
            )}
            {isBoth && hasTransfer && <span className="type-caption text-onSurfaceVariant">{transferDir === 'husband_to_wife' ? '→' : '←'}</span>}
            {isBoth && !hasTransfer && <span className="w-1 h-1 rounded-full bg-onSurfaceVariant/30 mx-0.5" />}
            {(isWifeOnly || isBoth) && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-5 h-5 rounded-md bg-rose-400 text-white flex items-center justify-center text-[9px] font-bold shrink-0">I</span>
                <span className="type-caption font-semibold text-rose-600 dark:text-rose-300 truncate">
                  {showAmounts ? `${currencySymbol}${item.wifeContribution.toLocaleString()}` : '••••'}
                </span>
              </div>
            )}
            {!isBoth && hasTransfer && (
              <span className={`ml-auto type-caption font-medium px-1.5 py-0.5 rounded-md shrink-0 ${isHusbandOnly ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300' : 'bg-teal-500/15 text-teal-600 dark:text-teal-300'}`}>
                ⇒ {isHusbandOnly ? 'ke Isteri' : 'ke Suami'}
              </span>
            )}
            {isBoth && <span className="ml-auto type-caption shrink-0">Bersama</span>}
          </div>
        )}

        <div className="w-full h-1.5 bg-surfaceVariant rounded-full flex overflow-hidden">
          {item.status === 'paid' ? (
            <div className="h-full bg-success w-full transition-all duration-500" />
          ) : (
            <>
              {hPercent > 0 && <div style={{ width: `${hPercent}%` }} className="h-full bg-teal-400 transition-all duration-500" />}
              {wPercent > 0 && <div style={{ width: `${wPercent}%` }} className="h-full bg-rose-300 transition-all duration-500" />}
            </>
          )}
        </div>

        {!isSelectionMode && (
          <div className="grid grid-cols-3 gap-1.5">
            <StatusButton active={item.status === 'pending'} tone="warning" onClick={(e) => handleStatusChange(e, item.id, 'pending')} icon={<Clock size={12} />} label={t.pending} />
            <StatusButton active={item.status === 'paid'} tone="success" onClick={(e) => handleStatusChange(e, item.id, 'paid')} icon={<Check size={12} />} label={t.paid} />
            <StatusButton active={item.status === 'aside'} tone="info" onClick={(e) => handleStatusChange(e, item.id, 'aside')} icon={<Archive size={12} />} label={t.aside} />
          </div>
        )}
      </div>
    );
  };

  const incomeContent = visibleIncomes.length > 0 ? (
    <div className="grid gap-3 md:gap-4 items-start grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1 pb-2 border-b border-outline">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold">S</span>
            <span className="type-subheadline font-semibold text-teal-700 dark:text-teal-300">{isSingle ? 'Saya' : t.husband}</span>
            <span className="type-caption bg-teal-500/12 text-teal-600 dark:text-teal-300 px-1.5 py-0.5 rounded-full">{husbandIncomes.length}</span>
          </div>
          <span className="type-subheadline font-semibold text-teal-600 dark:text-teal-300 tabular-nums">
            {showAmounts ? `${currencySymbol}${husbandTotal.toLocaleString()}` : '••••'}
          </span>
        </div>
        {husbandIncomes.length > 0 ? husbandIncomes.map(renderIncomeCard) : <EmptyState title="Tiada rekod" />}
      </div>

      {!isSingle && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1 pb-2 border-b border-outline">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-400 text-white flex items-center justify-center text-[10px] font-bold">I</span>
              <span className="type-subheadline font-semibold text-rose-600 dark:text-rose-300">{t.wife}</span>
              <span className="type-caption bg-rose-500/12 text-rose-600 dark:text-rose-300 px-1.5 py-0.5 rounded-full">{wifeIncomes.length}</span>
            </div>
            <span className="type-subheadline font-semibold text-rose-600 dark:text-rose-300 tabular-nums">
              {showAmounts ? `${currencySymbol}${wifeTotal.toLocaleString()}` : '••••'}
            </span>
          </div>
          {wifeIncomes.length > 0 ? wifeIncomes.map(renderIncomeCard) : <EmptyState title="Tiada rekod" />}
        </div>
      )}
    </div>
  ) : (
    <EmptyState icon={<Wallet className="w-6 h-6" />} title={hasActiveFilters ? 'Tiada padanan' : 'Tiada rekod pendapatan'} description={hasActiveFilters ? 'Cuba ubah carian atau penapis.' : 'Tekan butang tambah untuk merekod pendapatan pertama.'} />
  );

  const expenseList = () =>
    visibleExpenses.length > 0 ? (
      <div className="space-y-6">
        {Object.entries(groupedExpenses).map(([category, items]) => {
          const isSavingCat = category === ExpenseCategory.SIMPANAN;
          const catTotal = items.reduce((a, b) => a + b.totalAmount, 0);
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0 ${isSavingCat ? 'bg-success/12 text-success' : 'bg-error/10 text-error'}`}>
                    {isSavingCat ? <PiggyBank size={16} /> : category.charAt(0)}
                  </div>
                  <span className="type-subheadline font-semibold px-2.5 py-1 rounded-xl bg-primary/10 text-primary truncate">{category}</span>
                  <span className="type-caption bg-surfaceVariant px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <span className={`type-subheadline font-semibold tabular-nums ${isSavingCat ? 'text-success' : 'text-error'}`}>
                  {showAmounts ? `${currencySymbol}${catTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••'}
                </span>
              </div>

              {isSingle ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {items.map((item) => renderExpenseCard(item))}
                </div>
              ) : (
                (() => {
                  const husbandItems = items.filter((item) => item.husbandContribution > 0 || item.paidBy === 'husband');
                  const wifeItems = items.filter((item) => item.wifeContribution > 0 || item.paidBy === 'wife');
                  const hTotal = husbandItems.reduce((sum, item) => sum + item.husbandContribution, 0);
                  const wTotal = wifeItems.reduce((sum, item) => sum + item.wifeContribution, 0);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between px-1 pb-2 border-b border-outline">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold">S</span>
                            <span className="type-subheadline font-semibold text-teal-700 dark:text-teal-300">{t.husband}</span>
                            <span className="type-caption bg-teal-500/12 text-teal-600 dark:text-teal-300 px-1.5 py-0.5 rounded-full">{husbandItems.length}</span>
                          </div>
                          <span className="type-subheadline font-semibold text-teal-600 dark:text-teal-300 tabular-nums">
                            {showAmounts ? `${currencySymbol}${hTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••'}
                          </span>
                        </div>
                        {husbandItems.length > 0 ? <div className="flex flex-col gap-3">{husbandItems.map((item) => renderExpenseCard(item))}</div> : <EmptyState title="Tiada komitmen" />}
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between px-1 pb-2 border-b border-outline">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-rose-400 text-white flex items-center justify-center text-[10px] font-bold">I</span>
                            <span className="type-subheadline font-semibold text-rose-600 dark:text-rose-300">{t.wife}</span>
                            <span className="type-caption bg-rose-500/12 text-rose-600 dark:text-rose-300 px-1.5 py-0.5 rounded-full">{wifeItems.length}</span>
                          </div>
                          <span className="type-subheadline font-semibold text-rose-600 dark:text-rose-300 tabular-nums">
                            {showAmounts ? `${currencySymbol}${wTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••'}
                          </span>
                        </div>
                        {wifeItems.length > 0 ? <div className="flex flex-col gap-3">{wifeItems.map((item) => renderExpenseCard(item))}</div> : <EmptyState title="Tiada komitmen" />}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          );
        })}
      </div>
    ) : (
      <EmptyState icon={<Wallet className="w-6 h-6" />} title={hasActiveFilters ? 'Tiada padanan' : 'Tiada rekod komitmen'} description={hasActiveFilters ? 'Cuba ubah carian atau penapis.' : 'Tekan butang tambah untuk merekod komitmen pertama.'} />
    );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="type-title1 text-onSurface">{t.planner}</h1>
          <p className="type-footnote mt-1">Urus pendapatan dan komitmen dengan paparan yang ringkas.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-3 w-full lg:w-auto lg:min-w-[420px]">
          <ActiveWalletSelectorCard accounts={accounts} activeAccountId={activeAccountId} onSelectAccount={onSelectAccount} label="Wallet" />
          <CustomSelect label="Bulan" value={currentMonthVal} onChange={onMonthChange} options={months.filter((m) => m.value !== 'all')} />
          <CustomSelect label="Tahun" value={currentYearVal} onChange={onYearChange} options={yearOptions} />
        </div>
      </div>

      <SegmentedControl
        value={activeTab}
        onChange={(v) => { setActiveTab(v); setShowAddForm(false); setIsSelectionMode(false); setViewMode('list'); resetFilters(); }}
        options={[
          { value: 'income', label: t.income },
          { value: 'expense', label: t.expenses },
        ]}
      />

      {activeTab === 'income' ? (
        <div className="bg-surface border border-outline rounded-2xl p-5 shadow-[var(--shadow-1)]">
          <div className="flex justify-between items-start gap-4 mb-2">
            <span className="type-caption">Jumlah pendapatan</span>
            <span className="p-2.5 rounded-xl bg-primary/10 text-primary"><Wallet size={16} /></span>
          </div>
          <h2 className="type-title1 text-primary tabular-nums">
            {currencySymbol} {showAmounts ? (calculatedIncome.husband + calculatedIncome.wife).toLocaleString() : '••••'}
          </h2>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard icon={<Clock size={14} />} label="Menunggu" value={formatAmount(expenseStats.pending)} tint="bg-warning/12 text-warning" />
            <StatCard icon={<PiggyBank size={14} />} label="Asing tepi" value={formatAmount(expenseStats.aside)} tint="bg-info/12 text-info" />
            <StatCard icon={<CheckCircle2 size={14} />} label="Selesai" value={formatAmount(expenseStats.paid)} tint="bg-success/12 text-success" />
          </div>
          <div className="px-1">
            <div className="flex justify-between items-center mb-2">
              <span className="type-caption">Tahap kesiapsiagaan</span>
              <span className="type-subheadline font-semibold text-onSurface">{expenseStats.readiness.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-surfaceVariant rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${expenseStats.readiness}%` }} />
            </div>
          </div>

          {/* Budget */}
          <div className="bg-surface border border-outline rounded-2xl p-4 md:p-5 shadow-[var(--shadow-1)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="type-headline text-onSurface flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-primary" /> Belanjawan bulanan
              </h3>
              <Button size="sm" variant="secondary" leftIcon={<Settings2 size={14} />} onClick={() => setShowBudgetModal(true)}>
                Set
              </Button>
            </div>

            {budgetRows.length > 0 ? (
              <div className="space-y-4">
                {budgetRows.map(({ cat, limit, spent }) => {
                  const percent = limit > 0 ? (spent / limit) * 100 : 0;
                  const over = spent > limit;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5 gap-3">
                        <span className="type-subheadline font-medium text-onSurface truncate">{cat}</span>
                        <span className={`type-caption font-semibold tabular-nums shrink-0 ${over ? 'text-error' : 'text-onSurfaceVariant'}`}>
                          {showAmounts ? `${currencySymbol}${spent.toLocaleString()} / ${currencySymbol}${limit.toLocaleString()}` : `•• / ${currencySymbol}${limit.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surfaceVariant rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-error' : percent > 80 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="type-footnote">Belum ada belanjawan. Tekan "Set" untuk tetapkan had bulanan setiap kategori.</p>
            )}
          </div>

          {monthRenewals.length > 0 && (
            <div className="bg-surface border border-outline rounded-2xl p-4 md:p-5 shadow-[var(--shadow-1)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="type-headline text-onSurface flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-info" /> Langganan bulan ini
                </h3>
                <span className="type-caption bg-surfaceVariant px-2.5 py-1 rounded-full">{monthRenewals.length}</span>
              </div>
              <div className="space-y-2">
                {monthRenewals.map(({ subscription, date }) => (
                  <div key={subscription.id} className="flex items-center justify-between gap-3 bg-surfaceVariant/40 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: subscription.color || 'var(--color-primary)' }} />
                      <span className="type-subheadline font-medium text-onSurface truncate">{subscription.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="type-caption flex items-center gap-1"><CalendarClock size={11} /> {date.getDate()}hb</span>
                      <span className="type-subheadline font-semibold text-onSurface tabular-nums">
                        {showAmounts ? `${currencySymbol}${subscription.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '••'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="type-headline text-onSurface flex items-center gap-2.5">
            {activeTab === 'income' ? 'Senarai Pendapatan' : 'Senarai Komitmen'}
            <span className="bg-primary/10 text-primary type-caption font-medium px-2.5 py-1 rounded-full">
              {activeTab === 'income' ? visibleIncomes.length : visibleExpenses.length}
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {activeTab === 'expense' && (
              <SegmentedControl
                value={viewMode}
                onChange={(v) => setViewMode(v)}
                fullWidth={false}
                options={[
                  { value: 'list', label: <span className="flex items-center gap-1.5"><List size={14} /> Senarai</span> },
                  { value: 'calendar', label: <span className="flex items-center gap-1.5"><CalendarDays size={14} /> Kalendar</span> },
                ]}
              />
            )}
            {activeTab === 'expense' && visibleExpenses.length > 0 && (
              <IconButton label={isSelectionMode ? 'Batal pilih' : 'Pilih banyak item'} variant={isSelectionMode ? 'tint' : 'surface'} onClick={toggleSelectionMode}>
                <CheckSquare size={18} />
              </IconButton>
            )}
            <Button
              leftIcon={<Plus size={16} strokeWidth={2.4} />}
              onClick={() => { setEditingIncomeId(null); setEditingExpenseId(null); setShowAddForm(true); setIsSelectionMode(false); }}
            >
              {activeTab === 'income' ? t.addIncome : t.addExpense}
            </Button>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col gap-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-onSurfaceVariant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'income' ? 'Cari pendapatan...' : 'Cari komitmen...'}
              aria-label="Cari transaksi"
              className="w-full h-11 bg-surface border border-outline rounded-xl pl-10 pr-10 type-subheadline text-onSurface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} aria-label="Kosongkan carian" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-onSurfaceVariant hover:bg-surfaceVariant">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'expense' && (
              <>
                <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>Semua</FilterChip>
                <FilterChip active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')}>{t.pending}</FilterChip>
                <FilterChip active={statusFilter === 'paid'} onClick={() => setStatusFilter('paid')}>{t.paid}</FilterChip>
                <FilterChip active={statusFilter === 'aside'} onClick={() => setStatusFilter('aside')}>{t.aside}</FilterChip>
                <span className="w-px h-5 bg-outline mx-1" />
              </>
            )}
            {!isSingle && (
              <>
                <FilterChip active={ownerFilter === 'all'} onClick={() => setOwnerFilter('all')}>Semua</FilterChip>
                <FilterChip active={ownerFilter === 'husband'} onClick={() => setOwnerFilter('husband')}>{t.husband}</FilterChip>
                <FilterChip active={ownerFilter === 'wife'} onClick={() => setOwnerFilter('wife')}>{t.wife}</FilterChip>
              </>
            )}
            {hasActiveFilters && (
              <button onClick={resetFilters} className="type-caption font-medium text-primary hover:underline ml-1 flex items-center gap-1">
                <X size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {isSelectionMode && activeTab === 'expense' && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-primary/8 p-3 md:p-4 rounded-2xl border border-primary/20 animate-fade-in">
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={selectAllExpenses} className="flex items-center gap-2 px-3 h-9 bg-surface rounded-lg type-subheadline font-medium text-primary border border-outline">
                {selectedIds.size === visibleExpenses.length && visibleExpenses.length > 0 ? <CheckCircle2 size={14} /> : <Square size={14} />}
                {t.selectAll}
              </button>
              <span className="type-subheadline font-medium text-primary">{selectedIds.size} {t.selected}</span>
            </div>
            <Button size="sm" disabled={selectedIds.size === 0} leftIcon={<Copy size={14} />} onClick={() => selectedIds.size > 0 && setShowDuplicateModal(true)}>
              Duplikasi
            </Button>
          </div>
        )}

        {activeTab === 'income' ? (
          incomeContent
        ) : viewMode === 'calendar' ? (
          <CommitmentCalendar
            expenses={visibleExpenses}
            year={parseInt(currentYearVal)}
            month={parseInt(currentMonthVal)}
            currencySymbol={currencySymbol}
            showAmounts={showAmounts}
            renewalDays={renewalDays}
          />
        ) : (
          expenseList()
        )}
      </div>

      {showAddForm && (
        <PlannerForm
          activeTab={activeTab}
          onClose={() => { setShowAddForm(false); setEditingIncomeId(null); setEditingExpenseId(null); }}
          accounts={accounts}
          isSingle={isSingle}
          t={t}
          incomes={incomes}
          onUpdateIncomes={onUpdateIncomes}
          editingIncomeId={editingIncomeId}
          expenses={expenses}
          onUpdateExpenses={onUpdateExpenses}
          editingExpenseId={editingExpenseId}
          defaultAccountId={activeAccountId || accounts[0]?.id || ''}
          currencySymbol={currencySymbol}
        />
      )}

      <BudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        budgets={settings.budgets || {}}
        currencySymbol={currencySymbol}
        onSave={(budgets) => { onUpdateSettings({ ...settings, budgets }); toast.success('Belanjawan disimpan.'); }}
      />

      <Modal isOpen={showDuplicateModal} onClose={() => setShowDuplicateModal(false)} title="Duplikasi komitmen" subtitle={`Salin ${selectedIds.size} item yang dipilih ke bulan lain.`} size="md">
        <div className="space-y-4 mb-5">
          <CustomSelect label="Bulan sasaran" value={targetDupMonth} onChange={(val) => setTargetDupMonth(val)} options={months.filter((m) => m.value !== 'all')} />
          <CustomSelect label="Tahun sasaran" value={targetDupYear} onChange={(val) => setTargetDupYear(val)} options={yearOptions} />
        </div>
        <Button fullWidth size="lg" leftIcon={<Copy size={18} />} onClick={confirmDuplicate}>
          Sahkan duplikasi
        </Button>
      </Modal>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; tint: string }> = ({ icon, label, value, tint }) => (
  <div className="bg-surface border border-outline rounded-2xl p-4 shadow-[var(--shadow-1)]">
    <div className="flex items-center gap-2 mb-2">
      <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${tint}`}>{icon}</span>
      <span className="type-caption font-medium text-onSurface">{label}</span>
    </div>
    <p className="type-headline text-onSurface truncate tabular-nums">{value}</p>
  </div>
);

const FilterChip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`h-8 px-3 rounded-full type-caption font-medium border transition-colors ${
      active ? 'bg-primary text-onPrimary border-primary' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'
    }`}
  >
    {children}
  </button>
);

const StatusButton: React.FC<{ active: boolean; tone: 'warning' | 'success' | 'info'; onClick: (e: React.MouseEvent) => void; icon: React.ReactNode; label: string }> = ({ active, tone, onClick, icon, label }) => {
  const activeClass = {
    warning: 'bg-warning/15 text-warning border-warning/25',
    success: 'bg-success/15 text-success border-success/25',
    info: 'bg-info/15 text-info border-info/25',
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`min-h-[36px] py-1.5 rounded-xl type-caption font-medium flex items-center justify-center gap-1 border transition-all ${
        active ? activeClass : 'bg-surfaceVariant/60 text-onSurfaceVariant border-transparent hover:bg-surfaceVariant'
      }`}
    >
      {icon} {label}
    </button>
  );
};

export default Planner;
