import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Heart, ShieldCheck, ChevronLeft, CheckCircle2, Copy, Sparkles, Rocket, Loader2, RefreshCw, AppWindow, Gift, Coffee } from 'lucide-react';
import { Button, Card, IconButton, EmptyState, Badge } from './ui';

interface DonationPageProps {
  currencySymbol?: string;
  onBack: () => void;
}

interface Contributor {
  name: string;
  amount: number;
}

const SECURE_CONFIG = { SHEET_ID: '1S5hn44A2feT4zXxHDi58YWBOhAFA-Pgitl33p-d8J8I' };
const MISSION_GOAL_AMOUNT = 550;
// Mission + contributor history (from the Google Sheet) are shown in MYR.
const DONATION_CURRENCY = 'RM';

const BMC_SCRIPT_SRC = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js';

// The official BMC script ends with `document.writeln(...)`, which browsers
// ignore for dynamically-inserted scripts (so the button never appears).
// Instead we load the script WITHOUT `data-name="bmc-button"` (so it skips the
// writeln) and call the exported `window.bmcBtnWidget(...)` ourselves.
let bmcScriptPromise: Promise<void> | null = null;
const loadBmcScript = (): Promise<void> => {
  if (typeof window !== 'undefined' && (window as any).bmcBtnWidget) return Promise.resolve();
  if (!bmcScriptPromise) {
    bmcScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = BMC_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Gagal memuatkan script Buy Me a Coffee'));
      document.body.appendChild(script);
    });
  }
  return bmcScriptPromise;
};

const DonationPage: React.FC<DonationPageProps> = ({ currencySymbol = 'RM', onBack }) => {
  const bmcRef = useRef<HTMLDivElement>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCollected, setTotalCollected] = useState(0);
  const goalAmount = MISSION_GOAL_AMOUNT;

  const progressPercent = goalAmount > 0 ? Math.min((totalCollected / goalAmount) * 100, 100) : 0;

  const mediaPaths = useMemo(() => {
    const cacheBuster = new Date().getTime();
    return { data: `https://docs.google.com/spreadsheets/d/${SECURE_CONFIG.SHEET_ID}/export?format=csv&gid=0&t=${cacheBuster}` };
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const freshUrl = `${mediaPaths.data}&_=${new Date().getTime()}`;
      const response = await fetch(freshUrl);
      const text = await response.text();
      const rows = text.split('\n');
      const dataRows = rows.slice(1);

      let parsedTotal = 0;
      let foundMetadata = false;

      const parsed: Contributor[] = dataRows
        .map((row) => {
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (cols.length < 2) return null;
          const cleanName = cols[0] ? cols[0].replace(/^"|"$/g, '').trim() : 'Hamba Allah';
          const rawAmount = cols[1] ? cols[1].replace(/[^0-9.-]+/g, '') : '0';
          const amount = parseFloat(rawAmount) || 0;

          if (!foundMetadata) {
            const rawCurrent = cols[2] ? cols[2].replace(/[^0-9.-]+/g, '') : '';
            if (rawCurrent) {
              parsedTotal = parseFloat(rawCurrent);
              foundMetadata = true;
            }
          }
          if (!foundMetadata) parsedTotal += amount;
          if (!cleanName && amount === 0) return null;
          return { name: cleanName, amount };
        })
        .filter(Boolean) as Contributor[];

      setContributors(parsed.reverse());
      if (parsedTotal > 0) setTotalCollected(parsedTotal);
    } catch (e) {
      console.warn('Failed to load contributors', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (mediaPaths.data) fetchData();
  }, [mediaPaths.data]);

  // Render the official Buy Me a Coffee button into its container.
  useEffect(() => {
    const container = bmcRef.current;
    if (!container) return;
    let cancelled = false;

    loadBmcScript()
      .then(() => {
        if (cancelled || !container) return;
        const widget = (window as any).bmcBtnWidget;
        if (typeof widget === 'function') {
          container.innerHTML = widget(
            'Buy me a coffee',   // data-text
            'faridzhuanfirdaus', // data-slug
            '#FFDD00',           // data-color
            '☕',                 // data-emoji
            'Cookie',            // data-font
            '#000000',           // data-font-color
            '#000000',           // data-outline-color
            '#ffffff'            // data-coffee-color
          );
        }
      })
      .catch((err) => console.warn(err));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (window.location.hash !== '#founding-members') return;
    const scrollToContributors = () => {
      document.getElementById('founding-members-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const timeoutId = window.setTimeout(scrollToContributors, 250);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('16126200065480');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2.5 rounded-xl bg-surface border border-outline hover:bg-surfaceVariant transition-colors" aria-label="Kembali">
          <ChevronLeft className="w-5 h-5 text-onSurface" />
        </button>
        <div>
          <h1 className="type-title2 text-onSurface">Sokong app ini</h1>
          <p className="type-footnote">Bantu kami kekalkan servis ini percuma.</p>
        </div>
      </div>

      <div className="bg-surface border border-outline rounded-2xl p-5 shadow-[var(--shadow-1)]">
        <div className="flex items-center gap-4 mb-4">
          <span className="w-11 h-11 rounded-2xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
            <Coffee className="w-5 h-5" />
          </span>
          <div>
            <span className="type-headline text-onSurface block">Belanja kopi</span>
            <span className="type-footnote">Sokong pembangunan app ini</span>
          </div>
        </div>
        <div ref={bmcRef} className="flex justify-center min-h-[60px]" />
      </div>

      <div className="bg-primary text-onPrimary border border-primary rounded-2xl p-5 md:p-6 shadow-[var(--shadow-2)]">
        <div className="flex items-center gap-3 mb-5">
          <span className="p-2.5 bg-white/15 rounded-xl">
            <AppWindow className="w-5 h-5" />
          </span>
          <h2 className="type-headline">Misi mobile app (iOS dan Android)</h2>
        </div>

        <div className="bg-black/15 rounded-2xl p-4">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="type-caption text-white/70 font-semibold">Terkumpul</span>
              <div className="type-title2 tabular-nums mt-0.5">
                <span className="type-subheadline opacity-70 font-semibold">{DONATION_CURRENCY} </span>
                {totalCollected.toFixed(2)}
              </div>
            </div>
            <span className="type-caption font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-black/25 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between mt-2 type-caption text-white/60">
            <span>{DONATION_CURRENCY} 0</span>
            <span>{DONATION_CURRENCY} {goalAmount}</span>
          </div>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <span className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Gift className="w-5 h-5" />
          </span>
          <div>
            <h3 className="type-headline text-onSurface">Sumbangan terus</h3>
            <p className="type-footnote">Melalui nombor akaun bank sahaja</p>
          </div>
        </div>

        <div className="bg-surfaceVariant/40 rounded-xl p-4 border border-outline">
          <span className="type-caption font-semibold block mb-1">Rhb bank (Mohd Faridzhuan)</span>
          <div className="flex items-center justify-between gap-3">
            <span className="type-headline font-mono text-primary tracking-tight">16126200065480</span>
            <IconButton label="Salin nombor akaun" variant="surface" onClick={handleCopy}>
              {copied ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
            </IconButton>
          </div>
        </div>
        <p className="type-footnote mt-3 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Transaksi selamat. Tiada data peribadi disimpan.
        </p>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-error/10 rounded-lg">
              <Heart className="w-4 h-4 text-error fill-current" />
            </span>
            <h3 className="type-headline text-onSurface">Terima kasih!</h3>
          </div>
          <IconButton label="Muat semula senarai" variant="plain" onClick={fetchData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </IconButton>
        </div>

        {loading ? (
          <div className="py-10 text-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-3" />
            <p className="type-footnote">Mengambil senarai...</p>
          </div>
        ) : contributors.length > 0 ? (
          <div className="space-y-2.5">
            {contributors.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-surfaceVariant/40 rounded-2xl">
                <span className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center type-subheadline font-semibold ${i % 2 === 0 ? 'bg-secondary/15 text-secondary' : 'bg-info/15 text-info'}`}>
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                  <h4 className="type-subheadline font-semibold text-onSurface truncate">{c.name}</h4>
                  <Badge tone="success">{DONATION_CURRENCY}{c.amount}</Badge>
                </div>
              </div>
            ))}
            <p className="type-caption text-center mt-4">Dan semua penyumbang lain</p>
          </div>
        ) : (
          <EmptyState icon={<Sparkles className="w-6 h-6" />} title="Jadilah yang pertama!" description="Sokongan anda pemangkin semangat kami." />
        )}
      </Card>

      <div className="flex items-center gap-2 justify-center type-caption">
        <Rocket className="w-4 h-4 text-primary" /> Terima kasih atas sokongan anda
      </div>
    </div>
  );
};

export default DonationPage;
