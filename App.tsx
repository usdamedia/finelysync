import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { Income, Expense, SummaryMetrics, FinancialRecords, MonthlyData, IncomeItem, UserSettings, Account, Subscription } from './types';
import Home from './pages/Home';
import Auth from './pages/Auth';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Planner = lazy(() => import('./pages/Planner'));
const UserProfile = lazy(() => import('./pages/Profile'));
const DonationPage = lazy(() => import('./components/DonationPage'));
const SinkingFundPage = lazy(() => import('./pages/SinkingFund'));
const SubscriptionPage = lazy(() => import('./pages/Subscription'));
const AppHistory = lazy(() => import('./pages/AppHistory'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const HelpCentre = lazy(() => import('./pages/HelpCentre'));
const PreferencesPage = lazy(() => import('./pages/Preferences'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const LanguageSettings = lazy(() => import('./pages/LanguageSettings'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
import { FoundingMemberPopup, InstallPrompt } from './components/popups';
import AppShell, { NavItem } from './components/layout/AppShell';
import { useToast } from './components/ui';
import { auth, db, firebase } from './services/firebase';
import { accountService } from './services/accountService';
import { subscriptionService } from './services/subscriptionService';
import { Wallet, PieChart, Loader2, Home as HomeIcon, Settings } from 'lucide-react';
import { getTranslations } from './constants/translations';

const App: React.FC = () => {
  const toast = useToast();
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'planner' | 'dashboard' | 'profile' | 'donation' | 'appHistory' | 'sinkingFund' | 'subscription' | 'privacy' | 'terms' | 'helpCentre' | 'preferences' | 'contactUs' | 'language'>('home');
  const [isSaving, setIsSaving] = useState(false);
  const [showAmounts, setShowAmounts] = useState(true);

  // Quick Add State
  const [quickAddType, setQuickAddType] = useState<'income' | 'expense' | null>(null);

  // New Feature Modal State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // PERSISTENT ACCOUNT SELECTION
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const defaultLanguage =
    (typeof window !== 'undefined' && window.localStorage?.getItem('finelysync_lang')) || 'ms';

  const defaultSettings: UserSettings = {
    displayName: 'Pengguna',
    role: 'Suami',
    currency: 'MYR',
    language: defaultLanguage as any,
    themeColor: '#5E5CE6',
    isDarkMode: false,
    sharedAccountIds: []
  };
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [partnerSharedIds, setPartnerSharedIds] = useState<string[] | null>(null);

  const t = useMemo(() => getTranslations(userSettings.language || 'ms'), [userSettings.language]);
  const targetUid = useMemo(() => userSettings.linkedAccountId || user?.uid, [userSettings.linkedAccountId, user?.uid]);
  const currencySymbol = useMemo(() => {
    switch (userSettings.currency) {
        case 'USD': return '$';
        case 'SGD': return 'S$';
        case 'IDR': return 'Rp';
        default: return 'RM';
    }
  }, [userSettings.currency]);

  const getRecurringKey = (expense: Expense) => {
    if (expense.recurringSourceId) return expense.recurringSourceId;

    return [
      expense.category,
      expense.description || '',
      expense.totalAmount,
      expense.splitType,
      expense.paidBy,
      expense.accountId || '',
      expense.husbandContribution,
      expense.wifeContribution,
      expense.payToPartner ? 'partner' : 'self'
    ].join('::');
  };

  const sanitizeExpenseForSave = (expense: Expense): Expense => {
    const { recurringSourceId, ...safeExpense } = expense;
    return safeExpense;
  };

  const sanitizeIncomeForSave = (income: IncomeItem): IncomeItem => {
    const { recurringSourceId, ...safeIncome } = income;
    return safeIncome;
  };

  const sanitizeMonthlyDataForSave = (data: MonthlyData): MonthlyData => ({
    incomes: (data.incomes || []).map(sanitizeIncomeForSave),
    expenses: (data.expenses || []).map(sanitizeExpenseForSave)
  });

  const getRecurringIncomeKey = (income: IncomeItem) => {
    if (income.recurringSourceId) return income.recurringSourceId;
    return [income.owner, income.category, income.description || '', income.amount, income.accountId || ''].join('::');
  };

  const handleSelectAccount = (id: string | null) => {
    setActiveAccountId(id);
  };

  const handleCloseUpdateModal = () => {
      setShowUpdateModal(false);
  };

  const handleViewFoundingMembers = () => {
      setShowUpdateModal(false);
      window.location.hash = 'founding-members';
      setActiveTab('donation');
  };

  // Handle URL Parameters for Apple Compliance (Direct links to Privacy/Terms)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page === 'privacy') setActiveTab('privacy');
    if (page === 'terms') setActiveTab('terms');
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', userSettings.themeColor);
  }, [userSettings.themeColor]);

  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const effectiveDark = useMemo(() => {
    if (userSettings.themeMode === 'dark' || userSettings.themeMode === 'dark-grey') return true;
    if (userSettings.themeMode === 'light') return false;
    if (userSettings.themeMode === 'system') return systemDark;
    return !!userSettings.isDarkMode;
  }, [userSettings.themeMode, userSettings.isDarkMode, systemDark]);

  const isGreyDark = userSettings.themeMode === 'dark-grey';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', effectiveDark);
    root.classList.toggle('dark-grey', effectiveDark && isGreyDark);
  }, [effectiveDark, isGreyDark]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      const wasLoggedOut = !user;
      if (currentUser && !currentUser.isAnonymous && !currentUser.emailVerified) {
        auth.signOut();
        setUser(null);
      } else {
        setUser(currentUser);

        if (currentUser && wasLoggedOut) {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
            const hasSeenPrompt = localStorage.getItem('finelysync_install_prompt_seen');

            if (!isStandalone && !hasSeenPrompt) {
                setTimeout(() => setShowInstallPrompt(true), 1500);
            }
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch Partner's Sharing Preferences
  useEffect(() => {
    if (!user || !targetUid) return;

    if (targetUid === user.uid) {
        setPartnerSharedIds(null);
        return;
    }

    db.collection('users').doc(targetUid).collection('settings').doc('preferences').get()
      .then(doc => {
          if (doc.exists) {
              const data = doc.data() as UserSettings;
              setPartnerSharedIds(data.sharedAccountIds || null);
          }
      }).catch(err => console.error("Error fetching partner settings", err));

  }, [targetUid, user]);

  useEffect(() => {
    if (!user || !targetUid) return;

    const unsubscribe = accountService.subscribeToAccounts(targetUid, (data) => {
      let visibleAccounts = data;

      if (targetUid !== user.uid && partnerSharedIds !== null) {
          visibleAccounts = data.filter(acc => partnerSharedIds.includes(acc.id));
      }

      setAccounts(visibleAccounts);

      if (visibleAccounts.length === 1) {
         if (activeAccountId !== visibleAccounts[0].id) {
             handleSelectAccount(visibleAccounts[0].id);
         }
      } else {
         if (activeAccountId && !visibleAccounts.find(a => a.id === activeAccountId)) {
             handleSelectAccount(null);
         }
      }
    });
    return () => unsubscribe();
  }, [user, targetUid, activeAccountId, partnerSharedIds]);

  useEffect(() => {
    if (!user || !targetUid || user.isAnonymous) { setSubscriptions([]); return; }
    return subscriptionService.subscribeToSubscriptions(targetUid, setSubscriptions);
  }, [user, targetUid]);

  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear() < 2025 ? 2025 : now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const currentYearVal = currentMonth.split('-')[0];
  const currentMonthVal = currentMonth.split('-')[1];

  const handleMonthChange = (val: string) => setCurrentMonth(`${currentYearVal}-${val}`);
  const handleYearChange = (val: string) => setCurrentMonth(`${val}-${currentMonthVal}`);

  const years = Array.from({length: 6}, (_, i) => 2025 + i);
  const months = [
    { value: 'all', label: t.selectAll || 'Semua' },
    { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mac' },
    { value: '04', label: 'Apr' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' }, { value: '08', label: 'Ogos' }, { value: '09', label: 'Sep' },
    { value: '10', label: 'Okt' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dis' },
  ];

  const [records, setRecords] = useState<FinancialRecords>({});

  type MainNavTab = 'home' | 'planner' | 'dashboard' | 'profile';
  const activeNavTab: MainNavTab = useMemo(() => {
    if (activeTab === 'donation' || activeTab === 'appHistory' || activeTab === 'privacy' || activeTab === 'terms' || activeTab === 'helpCentre' || activeTab === 'preferences' || activeTab === 'contactUs' || activeTab === 'language') return 'profile';
    if (activeTab === 'sinkingFund' || activeTab === 'subscription') return 'home';
    return activeTab as MainNavTab;
  }, [activeTab]);

  const mainNavItems: NavItem[] = useMemo(
    () => [
      { key: 'home', label: t.home || 'Utama', icon: HomeIcon },
      { key: 'planner', label: t.planner || 'Planner', icon: Wallet },
      { key: 'dashboard', label: t.dashboard || 'Dashboard', icon: PieChart },
      { key: 'profile', label: t.profileTitle || 'Profil', icon: Settings },
    ],
    [t]
  );

  useEffect(() => {
    if (!user) { setSettingsLoaded(false); return; }
    if (user.isAnonymous) { setUserSettings({...defaultSettings, displayName: 'Tetamu'}); setSettingsLoaded(true); return; }
    const settingsRef = db.collection('users').doc(user.uid).collection('settings').doc('preferences');
    settingsRef.get().then(snap => {
        if (snap.exists) {
          const data = (snap.data() as Partial<UserSettings>) || {};
          setUserSettings(prev => ({
            ...prev,
            ...data,
            language: (data.language || prev.language || defaultSettings.language) as any,
          }));
        }
        else if (user.displayName) setUserSettings(prev => ({...prev, displayName: user.displayName!}));
        setSettingsLoaded(true);
    });
  }, [user]);

  const handleUpdateSettings = async (newSettings: UserSettings) => {
      setUserSettings(newSettings);
      try {
        if (newSettings.language) window.localStorage?.setItem('finelysync_lang', newSettings.language);
      } catch (e) {
        console.warn('Unable to persist language preference');
      }
      if (!user || user.isAnonymous) return;
      try {
          const settingsRef = db.collection('users').doc(user.uid).collection('settings').doc('preferences');
          const payload: any = { ...newSettings };
          if (!newSettings.linkedAccountId) payload.linkedAccountId = firebase.firestore.FieldValue.delete();
          if (!newSettings.linkedAccountEmail) payload.linkedAccountEmail = firebase.firestore.FieldValue.delete();
          await settingsRef.set(payload, { merge: true });
      } catch (e) { console.error("Error saving settings", e); }
  };

  useEffect(() => {
    try {
      if (userSettings.language) window.localStorage?.setItem('finelysync_lang', userSettings.language);
    } catch (e) {
      // ignore
    }
  }, [userSettings.language]);

  useEffect(() => {
    if (!user || !settingsLoaded || !targetUid) return;
    if (user.isAnonymous) { setRecords({}); return; }
    setDataLoading(true);
    if (currentMonth.includes('all')) {
        db.collection('users').doc(targetUid).collection('monthly_data').get().then((snap) => {
            const newRecords: FinancialRecords = {};
            snap.forEach(doc => { newRecords[doc.id] = doc.data() as MonthlyData; });
            setRecords(newRecords);
            setDataLoading(false);
        }).catch(err => { console.error(err); setDataLoading(false); });
    } else {
        const docRef = db.collection('users').doc(targetUid).collection('monthly_data').doc(currentMonth);
        const unsubscribe = docRef.onSnapshot((docSnap) => {
            if (docSnap.exists) setRecords(prev => ({ ...prev, [currentMonth]: docSnap.data() as MonthlyData }));
            else setRecords(prev => ({ ...prev, [currentMonth]: { incomes: [], expenses: [] } }));
            setDataLoading(false);
        });
        return () => unsubscribe();
    }
  }, [user, currentMonth, targetUid, settingsLoaded]);

  // AUTO-POPULATE RECURRING EXPENSES
  useEffect(() => {
    if (!user || !targetUid || currentMonth.includes('all') || user.isAnonymous || !settingsLoaded) return;

    const checkAndPopulateRecurring = async () => {
      try {
        const docRef = db.collection('users').doc(targetUid).collection('monthly_data').doc(currentMonth);
        const snap = await docRef.get();

        const currentData = snap.exists ? (snap.data() as MonthlyData) : { incomes: [], expenses: [] };
        const currentExpenses = currentData.expenses || [];
        const existingRecurringKeys = new Set(
          currentExpenses.map(getRecurringKey)
        );

        const [year, month] = currentMonth.split('-').map(Number);
        let prevYear = year;
        let prevMonth = month - 1;
        if (prevMonth === 0) {
          prevMonth = 12;
          prevYear -= 1;
        }

        const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
        const prevSnap = await db.collection('users').doc(targetUid).collection('monthly_data').doc(prevMonthKey).get();
        if (!prevSnap.exists) return;

        const prevData = prevSnap.data() as MonthlyData;
        const recurringExpenses = (prevData.expenses || [])
          .filter(expense => expense.isRecurring)
          .filter(expense => !existingRecurringKeys.has(getRecurringKey(expense)))
          .map(expense => ({
            ...sanitizeExpenseForSave(expense),
            id: crypto.randomUUID(),
            status: 'pending' as const
          }));

        const currentIncomes = currentData.incomes || [];
        const existingIncomeKeys = new Set(currentIncomes.map(getRecurringIncomeKey));
        const recurringIncomes = (prevData.incomes || [])
          .filter(income => income.isRecurring)
          .filter(income => !existingIncomeKeys.has(getRecurringIncomeKey(income)))
          .map(income => ({
            ...sanitizeIncomeForSave(income),
            id: crypto.randomUUID(),
            recurringSourceId: getRecurringIncomeKey(income)
          }));

        if (recurringExpenses.length > 0 || recurringIncomes.length > 0) {
          await docRef.set(sanitizeMonthlyDataForSave({
            incomes: [...currentIncomes, ...recurringIncomes],
            expenses: [...currentExpenses, ...recurringExpenses]
          }), { merge: true });
        }
      } catch (e) {
        console.error("Error auto-populating recurring expenses:", e);
      }
    };

    checkAndPopulateRecurring();
  }, [currentMonth, user, targetUid, settingsLoaded]);

  const saveToFirestore = async (month: string, newData: MonthlyData) => {
      if (!user || !targetUid || month.includes('all') || user.isAnonymous) return false;
      setIsSaving(true);
      try {
          await db.collection('users').doc(targetUid).collection('monthly_data').doc(month).set(
            sanitizeMonthlyDataForSave(newData),
            { merge: true }
          );
          return true;
      } catch (error) {
          console.error('Error saving monthly data:', { month, targetUid, error });
          toast.error(
            userSettings.linkedAccountId
              ? 'Gagal simpan data. Anda mungkin melihat akaun yang dihubungkan tetapi tidak mempunyai kebenaran menulis.'
              : 'Gagal simpan data ke server. Sila cuba semula.'
          );
          return false;
      } finally {
          setIsSaving(false);
      }
  };

  const fullCurrentData: MonthlyData = useMemo(() => {
    if (currentMonth.includes('all')) {
        const allIncomes: IncomeItem[] = [];
        const allExpenses: Expense[] = [];
        Object.values(records).forEach((data: MonthlyData) => {
            if (data.incomes) allIncomes.push(...data.incomes);
            if (data.expenses) allExpenses.push(...data.expenses);
        });
        return { incomes: allIncomes, expenses: allExpenses };
    }
    return records[currentMonth] || { incomes: [], expenses: [] };
  }, [records, currentMonth]);

  const filteredData: MonthlyData = useMemo(() => {
    if (!activeAccountId) return fullCurrentData;
    return {
      incomes: (fullCurrentData.incomes || []).filter(i => i.accountId === activeAccountId),
      expenses: (fullCurrentData.expenses || []).filter(e => e.accountId === activeAccountId)
    };
  }, [fullCurrentData, activeAccountId]);

  const calculatedIncome: Income = useMemo(() => {
    const incomes = filteredData.incomes || [];
    return {
      husband: incomes.filter(i => i.owner === 'husband').reduce((acc, curr) => acc + curr.amount, 0),
      wife: incomes.filter(i => i.owner === 'wife').reduce((acc, curr) => acc + curr.amount, 0),
    };
  }, [filteredData.incomes]);

  const currentMetrics: SummaryMetrics = useMemo(() => {
    const { expenses } = filteredData;
    const totalHusbandCommitment = expenses.reduce((acc, curr) => acc + curr.husbandContribution, 0);
    const totalWifeCommitment = expenses.reduce((acc, curr) => acc + curr.wifeContribution, 0);
    return {
      totalHusbandCommitment, totalWifeCommitment,
      balanceHusband: calculatedIncome.husband - totalHusbandCommitment,
      balanceWife: calculatedIncome.wife - totalWifeCommitment
    };
  }, [filteredData, calculatedIncome]);

  const displayBalanceValue = useMemo(() => {
    const totalIncomeValue = calculatedIncome.husband + calculatedIncome.wife;
    const totalExpenseValue = (filteredData.expenses || []).reduce((acc, curr) => acc + curr.totalAmount, 0);
    const netCashflow = totalIncomeValue - totalExpenseValue;

    if (activeAccountId) {
      const activeAccount = accounts.find(a => a.id === activeAccountId);
      return (activeAccount?.balance || 0) + netCashflow;
    }

    const totalInitialBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
    return totalInitialBalance + netCashflow;
  }, [calculatedIncome, filteredData.expenses, activeAccountId, accounts]);

  const updateIncomes = async (newIncomes: IncomeItem[]) => {
    if (currentMonth.includes('all')) return;
    const previousData = records[currentMonth] || { incomes: [], expenses: [] };

    let mergedIncomes: IncomeItem[];

    if (activeAccountId) {
        const incomesWithAcc = newIncomes.map(i => i.accountId ? i : { ...i, accountId: activeAccountId });
        const otherIncomes = (fullCurrentData.incomes || []).filter(i => i.accountId !== activeAccountId);
        mergedIncomes = [...otherIncomes, ...incomesWithAcc];
    } else {
        mergedIncomes = newIncomes;
    }

    const newData = { incomes: mergedIncomes, expenses: fullCurrentData.expenses };
    setRecords(prev => ({ ...prev, [currentMonth]: newData }));
    const saved = await saveToFirestore(currentMonth, newData);
    if (!saved) {
        setRecords(prev => ({ ...prev, [currentMonth]: previousData }));
    }
  };

  const updateExpenses = async (newExpenses: Expense[]) => {
    if (currentMonth.includes('all')) return;
    const previousData = records[currentMonth] || { incomes: [], expenses: [] };

    let mergedExpenses: Expense[];

    if (activeAccountId) {
        const expensesWithAcc = newExpenses.map(e => e.accountId ? e : { ...e, accountId: activeAccountId });
        const otherExpenses = (fullCurrentData.expenses || []).filter(e => e.accountId !== activeAccountId);
        mergedExpenses = [...otherExpenses, ...expensesWithAcc];
    } else {
        mergedExpenses = newExpenses;
    }

    const newData = { incomes: fullCurrentData.incomes, expenses: mergedExpenses };
    setRecords(prev => ({ ...prev, [currentMonth]: newData }));
    const saved = await saveToFirestore(currentMonth, newData);
    if (!saved) {
        setRecords(prev => ({ ...prev, [currentMonth]: previousData }));
    }
  };

  const handleDuplicateExpenses = async (selectedExpenses: Expense[], targetMonth: string) => {
    if (!user || user.isAnonymous || !targetUid) return;
    if (targetMonth === currentMonth) {
        toast.warning('Pilih bulan lain untuk menduplikasi komitmen.');
        return;
    }

    setIsSaving(true);
    try {
        const targetDocRef = db.collection('users').doc(targetUid).collection('monthly_data').doc(targetMonth);
        const targetSnap = await targetDocRef.get();
        let targetData: MonthlyData = { incomes: [], expenses: [] };

        if (targetSnap.exists) {
            targetData = targetSnap.data() as MonthlyData;
        }

        const newExpenses = selectedExpenses.map(exp => ({
            ...exp,
            id: crypto.randomUUID(),
            status: 'pending' as const,
            accountId: exp.accountId
        }));

        const updatedTargetExpenses = [...(targetData.expenses || []), ...newExpenses];
        const updatedTargetData = { ...targetData, expenses: updatedTargetExpenses };

        await targetDocRef.set(updatedTargetData, { merge: true });

        setRecords(prev => ({
            ...prev,
            [targetMonth]: updatedTargetData
        }));

        toast.success(`${selectedExpenses.length} komitmen disalin ke ${targetMonth}.`);

    } catch (e) {
        console.error("Error duplicating expenses:", e);
        toast.error('Ralat semasa menyalin komitmen.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleQuickAction = (type: 'income' | 'expense') => {
      setActiveTab('planner');
      setQuickAddType(type);
  };

  const IS_MAINTENANCE_MODE = false;
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (IS_MAINTENANCE_MODE && !isLocalDev) {
      return <Suspense fallback={<PageLoader />}><Maintenance /></Suspense>;
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!user) return <Auth />;

  return (
    <>
      <AppShell
        navItems={mainNavItems}
        activeKey={activeNavTab}
        onNavigate={(key) => setActiveTab(key as any)}
        displayName={userSettings.displayName}
        email={user.email}
        photoURL={userSettings.photoURL}
        isGuest={user.isAnonymous}
        onLogout={() => auth.signOut()}
        onQuickAdd={handleQuickAction}
      >
        <Suspense fallback={<PageLoader />}>
        {activeTab === 'home' && <Home metrics={currentMetrics} income={calculatedIncome} expenses={filteredData.expenses} displayBalance={displayBalanceValue} monthLabel={`${months.find(m => m.value === currentMonthVal)?.label} ${currentYearVal}`} currentMonth={currentMonth} currencySymbol={currencySymbol} isGuest={user.isAnonymous} language={userSettings.language || 'ms'} userRole={userSettings.role} showAmounts={showAmounts} onToggleAmounts={() => setShowAmounts(!showAmounts)} financialRecords={records} displayName={userSettings.displayName} photoURL={userSettings.photoURL} onNavigateToDashboard={() => setActiveTab('dashboard')} onNavigateToSinkingFund={() => setActiveTab('sinkingFund')} onNavigateToDonation={() => setActiveTab('donation')} onNavigateToSubscription={() => setActiveTab('subscription')} subscriptions={subscriptions} userSettings={userSettings} onUpdateSettings={handleUpdateSettings} targetUid={targetUid} activeAccountId={activeAccountId} onSelectAccount={handleSelectAccount} accounts={accounts} />}
        {activeTab === 'planner' && (currentMonthVal !== 'all' ? <Planner incomes={filteredData.incomes || []} onUpdateIncomes={updateIncomes} expenses={filteredData.expenses} onUpdateExpenses={updateExpenses} onDuplicateExpenses={handleDuplicateExpenses} calculatedIncome={calculatedIncome} currencySymbol={currencySymbol} language={userSettings.language || 'ms'} userRole={userSettings.role} showAmounts={showAmounts} onToggleAmounts={() => setShowAmounts(!showAmounts)} isGuest={user.isAnonymous} activeAccountId={activeAccountId} onSelectAccount={handleSelectAccount} accounts={accounts} currentMonthVal={currentMonthVal} currentYearVal={currentYearVal} onMonthChange={handleMonthChange} onYearChange={handleYearChange} months={months} years={years} quickAddType={quickAddType} onClearQuickAdd={() => setQuickAddType(null)} settings={userSettings} onUpdateSettings={handleUpdateSettings} subscriptions={subscriptions} /> : <div className="text-center py-20 bg-surfaceVariant/30 rounded-2xl border border-dashed border-outline">Sila pilih bulan spesifik untuk mengedit data.</div>)}
        {activeTab === 'dashboard' && <Dashboard allData={records} currentMonth={currentMonth} currencySymbol={currencySymbol} themeColor={userSettings.themeColor} language={userSettings.language || 'ms'} showAmounts={showAmounts} activeAccountId={activeAccountId} currentMonthVal={currentMonthVal} currentYearVal={currentYearVal} onMonthChange={handleMonthChange} onYearChange={handleYearChange} months={months} years={years} accounts={accounts} onSelectAccount={handleSelectAccount} />}
        {activeTab === 'profile' && <UserProfile settings={userSettings} onUpdateSettings={handleUpdateSettings} onLogout={() => auth.signOut()} email={user.email} onNavigateToDonation={() => setActiveTab('donation')} onNavigateToHistory={() => setActiveTab('appHistory')} onNavigateToPrivacy={() => setActiveTab('privacy')} onNavigateToTerms={() => setActiveTab('terms')} onNavigateToHelp={() => setActiveTab('helpCentre')} onNavigateToPreferences={() => setActiveTab('preferences')} onNavigateToContact={() => setActiveTab('contactUs')} onNavigateToLanguage={() => setActiveTab('language')} onNavigateToSubscription={() => setActiveTab('subscription')} isGuest={user.isAnonymous} language={userSettings.language} uid={user.uid} />}
        {activeTab === 'donation' && <DonationPage currencySymbol={currencySymbol} onBack={() => setActiveTab('profile')} />}
        {activeTab === 'appHistory' && <AppHistory onBack={() => setActiveTab('profile')} />}
        {activeTab === 'privacy' && <PrivacyPolicy onBack={() => setActiveTab('profile')} language={userSettings.language || 'ms'} />}
        {activeTab === 'terms' && <TermsOfService onBack={() => setActiveTab('profile')} language={userSettings.language || 'ms'} />}
        {activeTab === 'helpCentre' && <HelpCentre onBack={() => setActiveTab('profile')} language={userSettings.language || 'ms'} />}
        {activeTab === 'preferences' && <PreferencesPage settings={userSettings} onUpdateSettings={handleUpdateSettings} onBack={() => setActiveTab('profile')} uid={user.uid} isGuest={user.isAnonymous} />}
        {activeTab === 'contactUs' && <ContactUs onBack={() => setActiveTab('profile')} language={userSettings.language || 'ms'} />}
        {activeTab === 'language' && <LanguageSettings settings={userSettings} onUpdateSettings={handleUpdateSettings} onBack={() => setActiveTab('profile')} language={userSettings.language || 'ms'} />}
        {activeTab === 'sinkingFund' && (
          <SinkingFundPage
            onBack={() => setActiveTab('home')}
            uid={targetUid}
            currencySymbol={currencySymbol}
            financialRecords={records}
            accounts={accounts}
            activeAccountId={activeAccountId}
            onSelectAccount={handleSelectAccount}
          />
        )}
        {activeTab === 'subscription' && (
          <SubscriptionPage
            onBack={() => setActiveTab('home')}
            uid={targetUid}
            currencySymbol={currencySymbol}
            showAmounts={showAmounts}
            subscriptions={subscriptions}
            accounts={accounts}
            defaultAccountId={activeAccountId}
          />
        )}
        </Suspense>
      </AppShell>

      <FoundingMemberPopup
        isOpen={showUpdateModal}
        onClose={handleCloseUpdateModal}
        onViewFoundingMembers={handleViewFoundingMembers}
        language={userSettings.language || 'ms'}
      />

      <InstallPrompt
        isOpen={showInstallPrompt}
        onClose={() => {
            setShowInstallPrompt(false);
            localStorage.setItem('finelysync_install_prompt_seen', 'true');
        }}
        language={userSettings.language || 'ms'}
      />
    </>
  );
};

const PageLoader: React.FC = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

export default App;
