import React, { useState, useEffect } from 'react';
import { Check, ArrowRightLeft, RefreshCw, Briefcase, User } from 'lucide-react';
import { IncomeItem, Expense, Account, IncomeCategory, ExpenseCategory, ExpenseStatus, SplitType, IncomeOwner, PartnerSettlementDirection } from '../../../types';
import CustomSelect from '../../../components/CustomSelect';
import { Modal, Input, Button, Switch, SegmentedControl, useToast } from '../../../components/ui';

interface PlannerFormProps {
  activeTab: 'income' | 'expense';
  onClose: () => void;
  accounts: Account[];
  isSingle: boolean;
  t: any;
  incomes: IncomeItem[];
  onUpdateIncomes: (items: IncomeItem[]) => void;
  editingIncomeId: string | null;
  expenses: Expense[];
  onUpdateExpenses: (items: Expense[]) => void;
  editingExpenseId: string | null;
  defaultAccountId: string;
  currencySymbol: string;
}

const PlannerForm: React.FC<PlannerFormProps> = ({
  activeTab, onClose, accounts, isSingle, t,
  incomes, onUpdateIncomes, editingIncomeId,
  expenses, onUpdateExpenses, editingExpenseId,
  defaultAccountId, currencySymbol,
}) => {
  const toast = useToast();

  const [incOwner, setIncOwner] = useState<IncomeOwner>('husband');
  const [incCategory, setIncCategory] = useState<string>(IncomeCategory.GAJI);
  const [incDesc, setIncDesc] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incAccountId, setIncAccountId] = useState<string>(defaultAccountId);
  const [incRecurring, setIncRecurring] = useState(false);

  const [expCategory, setExpCategory] = useState<string>(ExpenseCategory.RUMAH);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expSplit, setExpSplit] = useState<SplitType>('50/50');
  const [expStatus, setExpStatus] = useState<ExpenseStatus>('pending');
  const [expPaidBy, setExpPaidBy] = useState<'husband' | 'wife' | 'both'>('husband');
  const [expAccountId, setExpAccountId] = useState<string>(defaultAccountId);

  const [customHusbandAmt, setCustomHusbandAmt] = useState('');
  const [payToPartner, setPayToPartner] = useState(false);
  const [partnerSettlementDirection, setPartnerSettlementDirection] = useState<PartnerSettlementDirection>('husband_to_wife');
  const [isRecurring, setIsRecurring] = useState(false);
  const [expDueDay, setExpDueDay] = useState('');

  useEffect(() => {
    if (activeTab === 'income' && editingIncomeId) {
      const item = incomes.find((i) => i.id === editingIncomeId);
      if (item) {
        setIncOwner(item.owner);
        setIncCategory(item.category);
        setIncDesc(item.description);
        setIncAmount(item.amount.toString());
        setIncAccountId(item.accountId || defaultAccountId);
        setIncRecurring(item.isRecurring || false);
      }
    } else if (activeTab === 'expense' && editingExpenseId) {
      const item = expenses.find((e) => e.id === editingExpenseId);
      if (item) {
        setExpCategory(item.category);
        setExpDesc(item.description);
        setExpAmount(item.totalAmount.toString());
        setExpSplit(item.splitType);
        setExpStatus(item.status);
        setExpPaidBy(item.paidBy);
        setExpAccountId(item.accountId || defaultAccountId);
        setPayToPartner(item.payToPartner || false);
        setPartnerSettlementDirection(item.partnerSettlementDirection || (item.paidBy === 'wife' ? 'wife_to_husband' : 'husband_to_wife'));
        setIsRecurring(item.isRecurring || false);
        setExpDueDay(item.dueDay ? item.dueDay.toString() : '');
        if (item.splitType === 'Custom') setCustomHusbandAmt(item.husbandContribution.toString());
      }
    }
  }, [editingIncomeId, editingExpenseId, activeTab]);

  const saveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(incAmount);
    if (isNaN(amountVal) || amountVal <= 0) { toast.warning('Sila masukkan jumlah yang sah.'); return; }
    if (!incAccountId) { toast.warning('Sila pilih akaun/wallet.'); return; }

    if (editingIncomeId) {
      onUpdateIncomes(incomes.map((i) => (i.id === editingIncomeId ? { ...i, owner: incOwner, category: incCategory, description: incDesc, amount: amountVal, accountId: incAccountId, isRecurring: incRecurring } : i)));
    } else {
      onUpdateIncomes([...incomes, { id: crypto.randomUUID(), owner: incOwner, category: incCategory, description: incDesc, amount: amountVal, accountId: incAccountId, isRecurring: incRecurring }]);
    }
    onClose();
  };

  const saveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(expAmount);
    if (isNaN(amountVal) || amountVal <= 0) { toast.warning('Sila masukkan jumlah yang sah.'); return; }
    if (!expAccountId) { toast.warning('Sila pilih akaun/wallet untuk menolak baki.'); return; }

    let hContrib = 0;
    let wContrib = 0;

    if (isSingle) {
      hContrib = amountVal;
      wContrib = 0;
    } else {
      if (expSplit === '50/50') {
        hContrib = amountVal / 2;
        wContrib = amountVal / 2;
      } else if (expSplit === 'Tiada Split') {
        if (expPaidBy === 'husband') hContrib = amountVal;
        else if (expPaidBy === 'wife') wContrib = amountVal;
        else { hContrib = amountVal / 2; wContrib = amountVal / 2; }
      } else if (expSplit === 'Custom') {
        hContrib = parseFloat(customHusbandAmt) || 0;
        wContrib = Math.max(0, amountVal - hContrib);
      } else {
        hContrib = amountVal / 2;
        wContrib = amountVal / 2;
      }
    }

    const payload: Expense = {
      id: editingExpenseId || crypto.randomUUID(),
      category: expCategory,
      description: expDesc,
      totalAmount: amountVal,
      splitType: expSplit,
      status: expStatus,
      paidBy: expPaidBy,
      husbandContribution: hContrib,
      wifeContribution: wContrib,
      accountId: expAccountId,
      payToPartner,
      partnerSettlementDirection: payToPartner ? partnerSettlementDirection : undefined,
      isRecurring,
      dueDay: expDueDay ? Math.min(31, Math.max(1, parseInt(expDueDay))) : undefined,
    };

    if (editingExpenseId) onUpdateExpenses(expenses.map((ex) => (ex.id === editingExpenseId ? { ...ex, ...payload } : ex)));
    else onUpdateExpenses([...expenses, payload]);
    onClose();
  };

  const accountOptions = [
    ...(accounts.length === 0 ? [{ value: '', label: 'Tiada wallet' }] : []),
    ...accounts.map((a) => ({ value: a.id, label: a.name })),
  ];

  const noAccounts = accounts.length === 0;

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="md"
      title={activeTab === 'income' ? (editingIncomeId ? 'Edit pendapatan' : 'Pendapatan baharu') : editingExpenseId ? 'Edit komitmen' : 'Komitmen baharu'}
    >
      {activeTab === 'income' ? (
        <form onSubmit={saveIncome} className="space-y-4">
          {/* Primary value — the amount is the focus of this form */}
          <div className="text-center pt-1 pb-1">
            <label htmlFor="income-amount" className="type-caption font-medium">
              {t.amount}
            </label>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span className="type-title2 text-onSurfaceVariant">{currencySymbol}</span>
              <input
                id="income-amount"
                type="number"
                inputMode="decimal"
                value={incAmount}
                onChange={(e) => setIncAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="type-large-title text-center bg-transparent outline-none text-onSurface tabular-nums w-full max-w-[240px] min-h-[48px] placeholder:text-onSurfaceVariant/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <Input label={t.description} value={incDesc} onChange={(e) => setIncDesc(e.target.value)} placeholder="Contoh: Gaji bulan Mac" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect
              label={t.category}
              value={incCategory}
              onChange={(val) => setIncCategory(val)}
              options={Object.values(IncomeCategory).map((c) => ({ value: c, label: c }))}
            />
            {!isSingle && (
              <CustomSelect
                label={t.owner}
                value={incOwner}
                onChange={(val) => setIncOwner(val)}
                options={[
                  { value: 'husband', label: t.husband, icon: User },
                  { value: 'wife', label: t.wife, icon: User },
                ]}
              />
            )}
          </div>

          <CustomSelect
            label="Masuk ke wallet"
            value={incAccountId}
            onChange={(val) => setIncAccountId(val)}
            options={accountOptions}
            prefixIcon={Briefcase}
          />

          <div className="pt-4 border-t border-outline">
            <ToggleRow
              active={incRecurring}
              onToggle={() => setIncRecurring(!incRecurring)}
              activeTone="success"
              icon={incRecurring ? <Check size={14} /> : <RefreshCw size={14} />}
              title="Pendapatan berulang"
              desc={incRecurring ? 'Pendapatan ini akan muncul automatik pada bulan hadapan.' : 'Tanda jika pendapatan ini sama setiap bulan.'}
            />
          </div>

          {noAccounts && <AccountWarning />}

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={noAccounts}>
              {editingIncomeId ? 'Simpan Perubahan' : 'Tambah Pendapatan'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={saveExpense} className="space-y-4">
          <Input label={t.description} value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="Contoh: Sewa rumah" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t.amount} type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="0.00" autoFocus />
            <div>
              <label className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">{t.category}</label>
              <CustomSelect value={expCategory} onChange={(val) => setExpCategory(val)} options={Object.values(ExpenseCategory).map((c) => ({ value: c, label: c }))} />
            </div>
          </div>

          <CustomSelect
            label="Tolak dari wallet"
            value={expAccountId}
            onChange={(val) => setExpAccountId(val)}
            options={accountOptions}
            prefixIcon={Briefcase}
          />

          {!isSingle && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">{t.split}</label>
                  <CustomSelect value={expSplit} onChange={(val) => setExpSplit(val)} options={[{ value: '50/50', label: '50/50' }, { value: 'Tiada Split', label: 'Tiada Split' }, { value: 'Custom', label: 'Custom' }]} />
                </div>
                <div>
                  <label className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">{t.paidBy}</label>
                  <CustomSelect value={expPaidBy} onChange={(val) => setExpPaidBy(val)} options={[{ value: 'husband', label: t.husband }, { value: 'wife', label: t.wife }, { value: 'both', label: t.both }]} />
                </div>
              </div>

              {expPaidBy !== 'both' && expSplit !== 'Tiada Split' && (
                <p className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 type-footnote text-onSurface animate-fade-in">
                  {expPaidBy === 'husband'
                    ? 'Bila suami bayar dahulu, bahagian isteri dikira automatik sebagai bayaran kepada suami.'
                    : 'Bila isteri bayar dahulu, bahagian suami dikira automatik sebagai bayaran kepada isteri.'}
                </p>
              )}

              {expSplit === 'Custom' && (
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-3 animate-fade-in">
                  <label className="block type-subheadline font-medium text-onSurfaceVariant">Tetapan pembahagian</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Bahagian suami" type="number" value={customHusbandAmt} onChange={(e) => setCustomHusbandAmt(e.target.value)} placeholder="0.00" />
                    <div>
                      <label className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">Bahagian isteri</label>
                      <div className="h-12 px-3.5 flex items-center bg-surfaceVariant/60 rounded-xl type-subheadline text-onSurface tabular-nums">
                        {(parseFloat(expAmount || '0') - (parseFloat(customHusbandAmt) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {expPaidBy !== 'both' && (
                <div className="space-y-3">
                  <ToggleRow
                    active={payToPartner}
                    onToggle={() => setPayToPartner(!payToPartner)}
                    activeTone="info"
                    icon={payToPartner ? <Check size={14} /> : <ArrowRightLeft size={14} />}
                    title="Bayaran kepada pasangan"
                    desc={payToPartner ? 'Duit ditolak dari wallet dan direkodkan sebagai bayaran kepada pasangan.' : 'Tanda jika ada bayaran semula atau settlement dengan pasangan.'}
                  />
                  {payToPartner && (
                    <div className="animate-fade-in">
                      <label className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">Arah bayaran pasangan</label>
                      <CustomSelect
                        value={partnerSettlementDirection}
                        onChange={(val) => setPartnerSettlementDirection(val as PartnerSettlementDirection)}
                        options={[{ value: 'husband_to_wife', label: 'Suami bayar kepada isteri' }, { value: 'wife_to_husband', label: 'Isteri bayar kepada suami' }]}
                      />
                    </div>
                  )}
                </div>
              )}

              <ToggleRow
                active={isRecurring}
                onToggle={() => setIsRecurring(!isRecurring)}
                activeTone="success"
                icon={isRecurring ? <Check size={14} /> : <RefreshCw size={14} />}
                title="Komitmen berulang"
                desc={isRecurring ? 'Komitmen ini akan muncul secara automatik pada bulan hadapan.' : 'Tanda jika komitmen ini sama setiap bulan.'}
              />
            </>
          )}

          <div className="pt-4 border-t border-outline">
            <label className="block type-subheadline font-medium text-onSurfaceVariant mb-2 px-0.5">Status</label>
            <SegmentedControl
              value={expStatus}
              onChange={(v) => setExpStatus(v)}
              options={[
                { value: 'pending', label: t.pending },
                { value: 'paid', label: t.paid },
                { value: 'aside', label: t.aside },
              ]}
            />
          </div>

          {noAccounts && <AccountWarning />}

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={noAccounts}>
              {editingExpenseId ? 'Simpan Perubahan' : 'Tambah Komitmen'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

const AccountWarning = () => (
  <div className="p-3 bg-error/10 type-footnote text-error rounded-xl text-center border border-error/20">
    Sila tambah wallet di halaman utama sebelum merekodkan transaksi.
  </div>
);

const ToggleRow: React.FC<{ active: boolean; onToggle: () => void; activeTone: 'info' | 'success'; icon: React.ReactNode; title: string; desc: string }> = ({ active, onToggle, activeTone, icon, title, desc }) => {
  const toneClass = activeTone === 'info' ? 'bg-info/10 border-info/25' : 'bg-success/10 border-success/25';
  const iconClass = activeTone === 'info' ? 'bg-info text-white' : 'bg-success text-white';
  return (
    <div className={`w-full flex items-start justify-between gap-3 p-4 rounded-2xl border transition-all ${active ? toneClass : 'bg-surfaceVariant/40 border-transparent'}`}>
      <div className="flex items-start gap-3">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${active ? iconClass : 'bg-outline text-onSurfaceVariant'}`}>
          {icon}
        </span>
        <div>
          <span className="type-subheadline font-semibold text-onSurface block">{title}</span>
          <span className="type-footnote">{desc}</span>
        </div>
      </div>
      <Switch checked={active} onChange={onToggle} label={title} />
    </div>
  );
};

export default PlannerForm;
