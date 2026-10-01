import React, { useMemo } from 'react';
import { Expense } from '../../../types';

interface CommitmentCalendarProps {
  expenses: Expense[];
  year: number;
  month: number; // 1-12
  currencySymbol: string;
  showAmounts: boolean;
  onSelectDay?: (day: number) => void;
  /** Days in the month with a subscription renewal. */
  renewalDays?: number[];
}

const WEEKDAYS = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];

const CommitmentCalendar: React.FC<CommitmentCalendarProps> = ({ expenses, year, month, currencySymbol, showAmounts, onSelectDay, renewalDays = [] }) => {
  const renewalSet = useMemo(() => new Set(renewalDays), [renewalDays]);
  const { cells, byDay, undated, maxDayTotal } = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstWeekday = new Date(year, month - 1, 1).getDay();

    const map: Record<number, { total: number; count: number; items: Expense[] }> = {};
    const undated: Expense[] = [];

    expenses.forEach((exp) => {
      const day = exp.dueDay;
      if (!day || day < 1) {
        undated.push(exp);
        return;
      }
      const safeDay = Math.min(day, daysInMonth);
      if (!map[safeDay]) map[safeDay] = { total: 0, count: 0, items: [] };
      map[safeDay].total += exp.totalAmount;
      map[safeDay].count += 1;
      map[safeDay].items.push(exp);
    });

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const maxDayTotal = Math.max(1, ...Object.values(map).map((m) => m.total));

    return { cells, byDay: map, undated, maxDayTotal };
  }, [expenses, year, month]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  return (
    <div className="bg-surface border border-outline rounded-2xl p-4 md:p-5 shadow-[var(--shadow-1)]">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="type-caption text-center font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;
          const info = byDay[day];
          const intensity = info ? Math.max(0.15, info.total / maxDayTotal) : 0;
          const isToday = isCurrentMonth && today.getDate() === day;
          return (
            <button
              key={day}
              onClick={() => info && onSelectDay && onSelectDay(day)}
              className={[
                'aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 relative transition-colors',
                info ? 'cursor-pointer' : 'cursor-default',
                isToday ? 'ring-2 ring-primary/50' : '',
                info ? '' : 'hover:bg-surfaceVariant/50',
              ].join(' ')}
              style={info ? { backgroundColor: `color-mix(in srgb, var(--color-primary) ${Math.round(intensity * 100)}%, transparent)` } : undefined}
              aria-label={info ? `${day}: ${info.count} komitmen` : `${day}`}
            >
              {renewalSet.has(day) && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-info" title="Pembaharuan langganan" />
              )}
              <span className={`type-caption font-semibold ${info ? 'text-primary' : 'text-onSurfaceVariant'}`}>{day}</span>
              {info ? (
                <span className="type-caption text-primary font-medium leading-none">{showAmounts ? `${currencySymbol}${Math.round(info.total)}` : '•'}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {renewalDays.length > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline">
          <span className="w-1.5 h-1.5 rounded-full bg-info" />
          <span className="type-caption">Pembaharuan langganan</span>
        </div>
      )}

      {undated.length > 0 && (
        <div className="mt-4 pt-4 border-t border-outline">
          <p className="type-caption font-medium mb-2">Tanpa tarikh ({undated.length})</p>
          <div className="flex flex-wrap gap-2">
            {undated.slice(0, 12).map((exp) => (
              <span key={exp.id} className="type-caption bg-surfaceVariant/60 px-2.5 py-1 rounded-full text-onSurface">
                {exp.description || exp.category}
              </span>
            ))}
            {undated.length > 12 && <span className="type-caption text-onSurfaceVariant">+{undated.length - 12} lagi</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitmentCalendar;
