import React, { useMemo, useState, useEffect, useRef } from 'react';
import { auth, db, firebase } from '../../services/firebase';
import { Loader2, Lock, Mail, ArrowRight, UserCircle2, AlertTriangle, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, User, Globe, Wallet, Calendar, PieChart, Users } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { getTranslations } from '../../constants/translations';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Button, Input, Modal } from '../../components/ui';
import CustomSelect from '../../components/CustomSelect';

const GOOGLE_WEB_CLIENT_ID = '978808382506-a5v8nirrbf6it5ll6ea9hmlpp60a2ruf.apps.googleusercontent.com';

const Auth: React.FC = () => {
  const [uiLanguage, setUiLanguage] = useState<'ms' | 'en' | 'zh' | 'ta'>(() => {
    const saved = (typeof window !== 'undefined' && window.localStorage?.getItem('finelysync_lang')) || 'ms';
    const normalized = saved.toLowerCase();
    if (normalized.startsWith('zh')) return 'zh';
    if (normalized.startsWith('ta')) return 'ta';
    if (normalized.startsWith('en')) return 'en';
    return 'ms';
  });
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Suami' | 'Isteri' | 'Bujang'>('Suami');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const pointerStartXRef = useRef<number | null>(null);

  const [hasSocialProof, setHasSocialProof] = useState<boolean>(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const t = useMemo(() => getTranslations(uiLanguage), [uiLanguage]);

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await auth.signInAnonymously();
    } catch (err: any) {
      console.error('Guest login error:', err);
      if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/operation-not-allowed') {
        setError("Sila aktifkan 'Anonymous' di Firebase Console > Authentication > Sign-in method.");
      } else {
        setError('Gagal masuk sebagai tetamu: ' + err.message);
      }
      setShowGuestWarning(false);
    } finally {
      setLoading(false);
    }
  };

  const ensureUserPreferences = async (
    user: firebase.User,
    options?: { displayName?: string; roleOverride?: 'Suami' | 'Isteri' | 'Bujang' }
  ) => {
    const settingsRef = db.collection('users').doc(user.uid).collection('settings').doc('preferences');
    const settingsDoc = await settingsRef.get();

    if (!settingsDoc.exists) {
      await settingsRef.set(
        {
          role: options?.roleOverride || 'Suami',
          displayName: options?.displayName || user.displayName || user.email?.split('@')[0] || 'User',
          currency: 'MYR',
          language: uiLanguage,
          themeColor: '#5E5CE6',
          isDarkMode: false,
        },
        { merge: true }
      );
    }
  };

  useEffect(() => {
    const fetchSocialProof = async () => {
      try {
        const snapshot = await db.collection('feedback').where('sentiment', '==', 'love').limit(1).get();
        if (!snapshot.empty) setHasSocialProof(true);
      } catch (e: any) {
        console.warn('Social proof check skipped');
      }
    };
    fetchSocialProof();

    try {
      GoogleAuth.initialize({
        clientId: GOOGLE_WEB_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    } catch (e) {
      console.warn('GoogleAuth init:', e);
    }
  }, []);

  useEffect(() => {
    const checkRedirectSignIn = async () => {
      try {
        setLoading(true);
        const userCredential = await auth.getRedirectResult();
        if (userCredential?.user) {
          await ensureUserPreferences(userCredential.user, { roleOverride: role });
        }
      } catch (err: any) {
        console.error('Redirect Auth Error:', err);
        setError(err.message || t.auth_googleSignInFailed);
      } finally {
        setLoading(false);
      }
    };
    checkRedirectSignIn();
  }, [role, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        if (user && !user.emailVerified) {
          await auth.signOut();
          setError(t.auth_verificationRequired);
          setLoading(false);
          return;
        }
      } else {
        if (password !== confirmPassword) {
          setError(t.auth_passwordMismatch);
          setLoading(false);
          return;
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        if (user) {
          await ensureUserPreferences(user, { displayName: name || email.split('@')[0], roleOverride: role });
          await user.sendEmailVerification();
          await auth.signOut();
        }
        setSuccessMessage(t.auth_signupSuccessVerifyEmail);
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError(t.auth_invalidCredential);
      } else if (err.code === 'auth/email-already-in-use') {
        setError(t.auth_emailInUse);
      } else if (err.code === 'auth/weak-password') {
        setError(t.auth_weakPassword);
      } else if (err.code === 'auth/too-many-requests') {
        setError(t.auth_tooManyRequests);
      } else if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/operation-not-allowed') {
        setError(t.auth_enableEmailPassword);
      } else {
        setError('Berlaku ralat: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let userCredential: firebase.auth.UserCredential;

      if (Capacitor.isNativePlatform()) {
        const googleUser = await GoogleAuth.signIn();
        const credential = firebase.auth.GoogleAuthProvider.credential(
          googleUser.authentication.idToken,
          googleUser.authentication.accessToken
        );
        userCredential = await auth.signInWithCredential(credential);
      } else {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
          userCredential = await auth.signInWithPopup(provider);
        } catch (popupErr: any) {
          if (popupErr?.code === 'auth/popup-blocked' || popupErr?.code === 'auth/cancelled-popup-request') {
            await auth.signInWithRedirect(provider);
            return;
          }
          if (popupErr?.code === 'auth/popup-closed-by-user') {
            setLoading(false);
            return;
          }
          throw popupErr;
        }
      }

      if (userCredential.user) {
        await ensureUserPreferences(userCredential.user, { displayName: !isLogin ? name : undefined, roleOverride: role });
      }
    } catch (err: any) {
      console.error('Google Auth Error details:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err.message || t.auth_googleSignInFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError(t.auth_enterEmailForReset);
      setSuccessMessage(null);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await auth.sendPasswordResetEmail(email);
      setSuccessMessage(`${t.auth_resetLinkSent} ${email}.`);
    } catch (err: any) {
      console.error('Forgot Password Error:', err);
      if (err.code === 'auth/user-not-found') setError(t.auth_userNotFound);
      else if (err.code === 'auth/invalid-email') setError(t.auth_invalidEmail);
      else setError('Gagal menghantar emel: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const boilerplateItems = [
    { icon: Wallet, title: 'Multi-Wallet Dengan Tapisan', detail: 'Asingkan duit ikut tujuan (Gaji, Bisnes, Simpanan) dan lihat rekod/baki mengikut wallet atau semua sekali.' },
    { icon: Calendar, title: 'Planner Rekod Komitmen', detail: 'Tambah pendapatan/komitmen, status bayaran, dan auto-populate komitmen berulang untuk bulan seterusnya.' },
    { icon: PieChart, title: 'Analisis Trend Jelas', detail: 'Dashboard tunjuk trend, pecahan kategori, dan ringkasan cashflow supaya senang nampak pola perbelanjaan.' },
    { icon: Users, title: 'Untuk Berdua, Solo atau Bisnes', detail: 'Peranan Suami/Isteri/Bujang, kiraan sumbangan/settlement, dan sync akaun + wallet dikongsi.' },
  ];

  const uiText = {
    ms: { languageLabel: 'Bahasa Melayu', signUp: 'Daftar', logIn: 'Log masuk', alreadyHaveAccount: 'Sudah ada akaun?' },
    en: { languageLabel: 'English', signUp: 'Sign up', logIn: 'Log in', alreadyHaveAccount: 'Already have an account?' },
    zh: { languageLabel: '简体中文', signUp: '注册', logIn: '登录', alreadyHaveAccount: '已有账号？' },
    ta: { languageLabel: 'தமிழ்', signUp: 'பதிவு செய்', logIn: 'உள்நுழை', alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?' },
  } as const;

  const currentUi = uiText[uiLanguage];

  const localizedBoilerplateItems = (() => {
    if (uiLanguage === 'en') {
      return [
        { icon: Wallet, title: 'Multi-Wallet With Filters', detail: 'Separate money by purpose and view records and balances per wallet or all at once.' },
        { icon: Calendar, title: 'Simple Commitment Planner', detail: 'Record income and expenses with clear status, and carry recurring commitments into the next month.' },
        { icon: PieChart, title: 'Clear Spending Insights', detail: 'Trends, category breakdowns, and cashflow summaries that reveal spending patterns.' },
        { icon: Users, title: 'For Couples, Solo, Business', detail: 'Husband-wife-solo roles, settlements, and linked account sync with wallet sharing.' },
      ];
    }
    if (uiLanguage === 'zh') {
      return [
        { icon: Wallet, title: '多钱包与筛选', detail: '按用途分开资金，按钱包或全局查看记录与余额。' },
        { icon: Calendar, title: '轻松规划支出', detail: '记录收入与支出，状态清晰，并可将重复性承诺自动带入下个月。' },
        { icon: PieChart, title: '清晰趋势分析', detail: '通过趋势、类别占比与现金流汇总，更容易看出消费模式。' },
        { icon: Users, title: '情侣/个人/生意', detail: '支持夫妻/单身角色、结算与关联账号同步，并可按需共享钱包。' },
      ];
    }
    if (uiLanguage === 'ta') {
      return [
        { icon: Wallet, title: 'பல வாலெட் மற்றும் வடிகட்டி', detail: 'தேவைக்கேற்ப பணத்தை பிரித்து வாலெட் வாரியாக அல்லது அனைத்தாக பார்க்கலாம்.' },
        { icon: Calendar, title: 'எளிய செலவு திட்டம்', detail: 'வருமானம் மற்றும் செலவுகளை பதிவு செய்து நிலையை கண்காணிக்கவும்.' },
        { icon: PieChart, title: 'தெளிவான பகுப்பாய்வு', detail: 'போக்கு, வகை பிரிப்பு, cashflow சுருக்கம் மூலம் செலவு பழக்கங்களை புரிந்துகொள்ளலாம்.' },
        { icon: Users, title: 'ஜோடி/தனி/வணிகம்', detail: 'கணவன்-மனைவி-தனி பாத்திரங்கள், settlement, linked account sync ஆதரவு.' },
      ];
    }
    return boilerplateItems;
  })();

  const activeBoilerplate = localizedBoilerplateItems[onboardingIndex];

  const goToOnboardingIndex = (nextIdx: number) => {
    const safeIdx = Math.max(0, Math.min(localizedBoilerplateItems.length - 1, nextIdx));
    setOnboardingIndex(safeIdx);
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setIsLogin(mode === 'login');
    setShowAuthForm(true);
    setError(null);
    setSuccessMessage(null);
  };

  const closeAuth = () => {
    setShowAuthForm(false);
    setError(null);
    setSuccessMessage(null);
    setLoading(false);
  };

  if (!showAuthForm) {
    const Icon = activeBoilerplate.icon;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="pt-8 px-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowLanguageMenu((v) => !v)}
            className="flex items-center gap-2 px-4 h-10 rounded-full bg-surface border border-outline shadow-[var(--shadow-1)] type-subheadline font-medium text-onSurface"
          >
            <Globe className="w-4 h-4 text-primary" />
            <span>{currentUi.languageLabel}</span>
            <ChevronDown className="w-4 h-4 opacity-60" />
          </button>
        </div>

        {showLanguageMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowLanguageMenu(false)} />
            <div className="fixed top-[5.25rem] left-1/2 -translate-x-1/2 z-50 w-[280px] bg-surface border border-outline rounded-2xl shadow-[var(--shadow-3)] p-2 animate-scale-in">
              {([
                { code: 'en', label: uiText.en.languageLabel },
                { code: 'ms', label: uiText.ms.languageLabel },
                { code: 'zh', label: uiText.zh.languageLabel },
                { code: 'ta', label: uiText.ta.languageLabel },
              ] as const).map((opt) => {
                const active = opt.code === uiLanguage;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      setUiLanguage(opt.code);
                      window.localStorage.setItem('finelysync_lang', opt.code);
                      setShowLanguageMenu(false);
                      setOnboardingIndex(0);
                    }}
                    className={['w-full px-3 py-2.5 rounded-xl text-left type-subheadline font-medium flex items-center justify-between', active ? 'bg-primary/10 text-primary' : 'text-onSurface hover:bg-surfaceVariant'].join(' ')}
                  >
                    <span>{opt.label}</span>
                    {active ? <CheckCircle className="w-4 h-4" /> : null}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div
          className="flex-1 flex flex-col items-center justify-center px-6 text-center select-none"
          onPointerDown={(e) => { pointerStartXRef.current = e.clientX; }}
          onPointerUp={(e) => {
            if (pointerStartXRef.current === null) return;
            const delta = e.clientX - pointerStartXRef.current;
            pointerStartXRef.current = null;
            if (Math.abs(delta) < 40) return;
            if (delta < 0) goToOnboardingIndex(onboardingIndex + 1);
            else goToOnboardingIndex(onboardingIndex - 1);
          }}
          onPointerCancel={() => { pointerStartXRef.current = null; }}
        >
          <div className="w-20 h-20 rounded-3xl bg-surface border border-outline shadow-[var(--shadow-1)] flex items-center justify-center mb-7">
            <Icon className="w-10 h-10 text-primary" />
          </div>

          <h1 className="type-title2 text-onSurface tracking-tight max-w-[24ch]">{activeBoilerplate.title}</h1>
          <p className="type-body text-onSurfaceVariant mt-2.5 max-w-[40ch]">{activeBoilerplate.detail}</p>

          <div className="flex items-center justify-center gap-3 mt-7">
            <button
              type="button"
              onClick={() => goToOnboardingIndex(onboardingIndex - 1)}
              disabled={onboardingIndex === 0}
              aria-label="Sebelum"
              className="h-10 w-10 rounded-full border border-outline bg-surface shadow-[var(--shadow-1)] flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5 text-onSurface" />
            </button>

            <div className="flex items-center justify-center gap-2">
              {localizedBoilerplateItems.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToOnboardingIndex(idx)}
                  aria-label={`Pergi ke slaid ${idx + 1}`}
                  className={['h-2 rounded-full transition-all', idx === onboardingIndex ? 'w-7 bg-primary' : 'w-2 bg-primary/30'].join(' ')}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToOnboardingIndex(onboardingIndex + 1)}
              disabled={onboardingIndex === localizedBoilerplateItems.length - 1}
              aria-label="Seterusnya"
              className="h-10 w-10 rounded-full border border-outline bg-surface shadow-[var(--shadow-1)] flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5 text-onSurface" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-8 w-full max-w-md mx-auto space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 bg-surface text-onSurface border border-outline rounded-xl font-semibold hover:bg-surfaceVariant/60 disabled:opacity-70 flex items-center justify-center gap-3 transition shadow-[var(--shadow-1)]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t.auth_continueWithGoogle}
              </>
            )}
          </button>

          <Button fullWidth size="lg" variant="secondary" onClick={() => openAuth('signup')}>
            {currentUi.signUp}
          </Button>

          <p className="type-subheadline text-center text-onSurfaceVariant mt-4">
            {currentUi.alreadyHaveAccount}{' '}
            <button type="button" onClick={() => openAuth('login')} className="text-primary font-semibold underline underline-offset-4">
              {currentUi.logIn}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-[var(--shadow-2)] border border-outline relative">
          <button
            type="button"
            onClick={closeAuth}
            aria-label="Tutup"
            className="absolute top-5 right-5 p-2 rounded-xl hover:bg-surfaceVariant"
          >
            <ChevronLeft className="w-5 h-5 text-onSurfaceVariant" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-surface border border-outline text-primary rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-[var(--shadow-1)]">
              <Logo className="w-10 h-10" />
            </div>
            <h1 className="type-title3 text-onSurface tracking-tight">FinelySync</h1>
            {hasSocialProof && (
              <div className="mt-3 inline-flex items-center gap-2 bg-surfaceVariant/60 border border-primary/15 rounded-full px-3.5 py-1.5">
                <span className="type-caption text-onSurface">Ramai pasangan suka app ini</span>
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              </div>
            )}
          </div>

          <h2 className="type-headline text-onSurface mb-5">{isLogin ? t.auth_welcomeBack : t.auth_createAccount}</h2>

          {successMessage && (
            <div className="bg-success/12 border border-success/20 text-onSurface px-4 py-3 rounded-xl type-subheadline mb-4 flex items-start gap-2 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="bg-error/12 border border-error/20 text-onSurface px-4 py-3 rounded-xl type-subheadline mb-4 flex items-start gap-2 animate-fade-in">
              <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input label={t.auth_name} value={name} onChange={(e) => setName(e.target.value)} placeholder={t.auth_name} prefix={<UserCircle2 className="w-5 h-5" />} required />
            )}

            <Input label={t.auth_email} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" prefix={<Mail className="w-5 h-5" />} required />

            <Input label={t.auth_password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" prefix={<Lock className="w-5 h-5" />} required />

            {!isLogin && (
              <>
                <Input label={t.auth_confirmPassword} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" prefix={<Lock className="w-5 h-5" />} required />
                <div>
                  <label className="block type-subheadline font-medium text-onSurfaceVariant mb-1.5 px-0.5">{t.auth_role}</label>
                  <CustomSelect
                    value={role}
                    onChange={(val) => setRole(val as any)}
                    options={[
                      { value: 'Suami', label: t.husband, icon: User },
                      { value: 'Isteri', label: t.wife, icon: User },
                      { value: 'Bujang', label: t.single, icon: User },
                    ]}
                  />
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex justify-end -mt-1">
                <button type="button" onClick={handleForgotPassword} className="type-caption font-semibold text-primary hover:underline">
                  {t.auth_forgotPassword}
                </button>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight className="w-5 h-5" />}>
              {isLogin ? t.auth_login : t.auth_signup}
            </Button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-surface type-caption">{t.auth_or}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 bg-surface text-onSurface border border-outline rounded-xl font-semibold hover:bg-surfaceVariant/60 disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t.auth_continueWithGoogle}
                </>
              )}
            </button>

            <Button variant="secondary" fullWidth size="lg" leftIcon={<UserCircle2 className="w-5 h-5" />} onClick={() => setShowGuestWarning(true)} type="button">
              Teruskan sebagai Tetamu
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="type-subheadline text-onSurfaceVariant">
              {isLogin ? t.auth_noAccount : t.auth_haveAccount}
              <button onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMessage(null); }} className="ml-2 font-semibold text-primary hover:underline">
                {isLogin ? t.auth_signupNow : t.auth_loginNow}
              </button>
            </p>
          </div>
        </div>

        <p className="type-caption text-center mt-6">&copy; 2025 FinelySync Finance by Faridzhuan Firdaus</p>
      </div>

      <Modal isOpen={showGuestWarning} onClose={() => setShowGuestWarning(false)} title="Mod Tetamu" size="sm">
        <div className="flex items-start gap-3 mb-5">
          <span className="w-11 h-11 rounded-2xl bg-warning/12 text-warning flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </span>
          <p className="type-subheadline text-onSurfaceVariant leading-relaxed">
            Anda boleh menggunakan aplikasi tanpa mendaftar. Namun, <b className="text-onSurface">progres tidak akan disimpan</b> jika anda refresh atau menutup pelayar.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowGuestWarning(false)}>Batal</Button>
          <Button fullWidth onClick={handleGuestLogin}>Faham & Masuk</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Auth;
