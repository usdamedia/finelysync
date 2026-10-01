import React, { useMemo } from 'react';
import { Subscription } from '../../../types';
import { monthlyCost, yearlyCost } from '../../../services/subscriptionService';
import { Sparkles } from 'lucide-react';

interface SubscriptionOrbitProps {
  subscriptions: Subscription[];
  currencySymbol: string;
  showAmounts: boolean;
}

const ORBIT_RADII = [0.24, 0.38]; // fraction of container
const PALETTE = ['#5E5CE6', '#0A84FF', '#30D158', '#FF9F0A', '#FF375F', '#BF5AF2', '#64D2FF', '#FFD60A'];

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const SubscriptionOrbit: React.FC<SubscriptionOrbitProps> = ({ subscriptions, currencySymbol, showAmounts }) => {
  const { planets, totalMonthly, totalYearly, maxMonthly } = useMemo(() => {
    const sorted = [...subscriptions].sort((a, b) => monthlyCost(b) - monthlyCost(a));
    const maxMonthly = Math.max(1, ...sorted.map(monthlyCost));
    const totalMonthly = sorted.reduce((acc, s) => acc + monthlyCost(s), 0);
    const totalYearly = sorted.reduce((acc, s) => acc + yearlyCost(s), 0);

    const orbitBuckets: Subscription[][] = ORBIT_RADII.map(() => []);
    sorted.forEach((s, i) => orbitBuckets[i % ORBIT_RADII.length].push(s));

    const planets = orbitBuckets.flatMap((bucket, orbitIndex) =>
      bucket.map((subscription, i) => {
        const angle = (i / Math.max(1, bucket.length)) * Math.PI * 2 - Math.PI / 2;
        const radius = ORBIT_RADII[orbitIndex];
        const ratio = Math.sqrt(monthlyCost(subscription) / maxMonthly);
        const size = 0.10 + ratio * 0.10; // 10%–20% of container
        return {
          subscription,
          left: 50 + Math.cos(angle) * radius * 100,
          top: 50 + Math.sin(angle) * radius * 100,
          size,
          orbitIndex,
        };
      })
    );

    return { planets, totalMonthly, totalYearly, maxMonthly };
  }, [subscriptions]);

  if (subscriptions.length === 0) {
    return (
      <div className="relative w-full max-w-[440px] mx-auto aspect-square flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-surfaceVariant/60 border border-dashed border-outline flex flex-col items-center justify-center text-center px-4">
          <Sparkles className="w-6 h-6 text-onSurfaceVariant mb-2" />
          <p className="type-caption">Belum ada langganan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[440px] mx-auto aspect-square select-none" aria-label="Visual orbit langganan">
      {/* Orbit rings */}
      {ORBIT_RADII.map((r, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-dashed border-outline/70"
          style={{
            width: `${r * 200}%`,
            height: `${r * 200}%`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Core */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[24%] h-[24%] rounded-full bg-primary text-onPrimary shadow-[var(--shadow-2)] flex flex-col items-center justify-center text-center z-10"
      >
        <span className="type-caption opacity-80 leading-none mb-0.5">Sebulan</span>
        <span className="type-subheadline md:type-headline font-semibold tabular-nums leading-none">
          {showAmounts ? `${currencySymbol}${Math.round(totalMonthly).toLocaleString()}` : '••'}
        </span>
        <span className="type-caption opacity-70 leading-none mt-0.5 hidden md:block">
          {showAmounts ? `${currencySymbol}${Math.round(totalYearly).toLocaleString()}/thn` : '••'}
        </span>
      </div>

      {/* Planets — outer wrapper positions, inner wrapper animates */}
      {planets.map(({ subscription, left, top, size }, idx) => (
        <div
          key={subscription.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${left}%`, top: `${top}%`, width: `${size * 100}%`, height: `${size * 100}%` }}
          title={`${subscription.name} · ${currencySymbol}${monthlyCost(subscription).toLocaleString(undefined, { maximumFractionDigits: 2 })}/bln`}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center font-semibold text-white shadow-[var(--shadow-1)] ring-2 ring-surface"
            style={{
              backgroundColor: subscription.color || PALETTE[idx % PALETTE.length],
              fontSize: `clamp(10px, ${size * 26}vw, 18px)`,
              animation: 'bmc-float 6s ease-in-out infinite',
              animationDelay: `${(idx % 5) * 0.6}s`,
            }}
          >
            <span className="leading-none">{initials(subscription.name)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionOrbit;
