import React, { useMemo, useState } from 'react';
import { ChevronLeft, Plus, Repeat, Edit2, Trash2, CalendarClock, Bell, RefreshCw, Wallet } from 'lucide-react';
import { Subscription, Account } from '../../types';
import {
  subscriptionService,
  monthlyCost,
  yearlyCost,
  nextRenewalDate,
  daysUntil,
  upcomingRenewals,
  formatDate,
} from '../../services/subscriptionService';
import SubscriptionOrbit from './components/SubscriptionOrbit';
import SubscriptionForm from './components/SubscriptionForm';
import { Button, IconButton, Modal, Badge, EmptyState, useToast } from '../../components/ui';

interface SubscriptionPageProps {
  onBack: () => void;
  uid?: string;
  currencySymbol: string;
  showAmounts: boolean;
  subscriptions: Subscription[];
  accounts: Account[];
  defaultAccountId?: string | null;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  onBack, uid, currencySymbol, showAmounts, subscriptions, accounts, defaultAccountId,
}) => {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Subscription | null>(null);

  const fmt = (v: number) => `${currencySymbol}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const short = (v: number) => `${currencySymbol}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const sorted = useMemo(() => [...subscriptions].sort((a, b) => monthlyCost(b) - monthlyCost(a)), [subscriptions]);
  const totals = useMemo(
    () => ({
      monthly: subscriptions.reduce((acc, s) => acc + monthlyCost(s), 0),
      yearly: subscriptions.reduce((acc, s) => acc + yearlyCost(s), 0),
    }),
    [subscriptions]
  );
  const reminders = useMemo(() => upcomingRenewals(subscriptions, 7), [subscriptions]);

  const openAdd = () => { setEditing(null); setShowForm(true); };
  const openEdit = (s: Subscription) => { setEditing(s); setShowForm(true); };

  const handleSave = async (data: Omit<Subscription, 'id'>) => {
    if (!uid) return;
    try {
      if (editing) {
        await subscriptionService.updateSubscription(uid, editing.id, data);
        toast.success('Langganan dikemaskini.');
      } else {
        await subscriptionService.addSubscription(uid, data);
        toast.success('Langganan ditambah.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan langganan.');
    }
  };

  const confirmDelete = async () => {
    if (!uid || !pendingDelete) return;
    const removed = pendingDelete;
    setPendingDelete(null);
    try {
      await subscriptionService.deleteSubscription(uid, removed.id);
      toast.action(`${removed.name} dipadam`, {
        label: 'Batal',
        onClick: async () => {
          const { id, createdAt, ...rest } = removed;
          await subscriptionService.addSubscription(uid, rest);
        },
      }, 'info');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memadam langganan.');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2.5 rounded-xl bg-surface border border-outline hover:bg-surfaceVariant transition-colors" aria-label="Kembali">
          <ChevronLeft className="w-5 h-5 text-onSurface" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="type-title2 text-onSurface">Langganan</h1>
          <p className="type-footnote">Pantau semua langganan berulang anda.</p>
        </div>
        <Button leftIcon={<Plus size={16} strokeWidth={2.4} />} onClick={openAdd}>Tambah</Button>
      </div>

      {/* Reminder */}
      {reminders.length > 0 && (
        <div className="bg-warning/10 border border-warning/25 rounded-2xl p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-9 h-9 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h3 className="type-subheadline font-semibold text-onSurface">Peringatan pembaharuan</h3>
              <p className="type-caption">{reminders.length} langganan akan diperbaharui dalam 7 hari.</p>
            </div>
          </div>
          <div className="space-y-2">
            {reminders.map(({ subscription, date, days }) => (
              <div key={subscription.id} className="flex items-center justify-between gap-3 bg-surface rounded-xl px-3.5 py-2.5 border border-outline">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: subscription.color || 'var(--color-primary)' }} />
                  <span className="type-subheadline font-medium text-onSurface truncate">{subscription.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="type-caption font-semibold text-warning">{days === 0 ? 'Hari ini' : days === 1 ? 'Esok' : `${days} hari`}</p>
                  <p className="type-caption">{formatDate(date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-outline rounded-2xl p-4 shadow-[var(--shadow-1)]">
          <p className="type-caption">Jumlah sebulan</p>
          <p className="type-title2 text-primary tabular-nums mt-0.5">{showAmounts ? fmt(totals.monthly) : '••••'}</p>
        </div>
        <div className="bg-surface border border-outline rounded-2xl p-4 shadow-[var(--shadow-1)]">
          <p className="type-caption">Jumlah setahun</p>
          <p className="type-title2 text-onSurface tabular-nums mt-0.5">{showAmounts ? fmt(totals.yearly) : '••••'}</p>
        </div>
      </div>

      {/* Orbit */}
      <div className="bg-surface border border-outline rounded-2xl p-4 md:p-6 shadow-[var(--shadow-1)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Repeat size={16} />
          </span>
          <h2 className="type-headline text-onSurface">Orbit langganan</h2>
        </div>
        <p className="type-caption mb-4">Bulatan lebih besar = kos bulanan lebih tinggi.</p>
        <SubscriptionOrbit subscriptions={subscriptions} currencySymbol={currencySymbol} showAmounts={showAmounts} />
      </div>

      {/* Detailed list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="type-headline text-onSurface">Senarai terperinci</h2>
          <span className="type-caption bg-surfaceVariant px-2.5 py-1 rounded-full">{subscriptions.length} langganan</span>
        </div>

        {sorted.length > 0 ? (
          <div className="space-y-3">
            {sorted.map((s) => {
              const renewal = nextRenewalDate(s);
              const dLeft = daysUntil(renewal);
              const isSoon = dLeft >= 0 && dLeft <= 7;
              return (
                <div key={s.id} className="bg-surface border border-outline rounded-2xl p-4 shadow-[var(--shadow-1)] group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-semibold shrink-0" style={{ backgroundColor: s.color || 'var(--color-primary)' }}>
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h3 className="type-subheadline font-semibold text-onSurface truncate">{s.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge tone={s.billingCycle === 'monthly' ? 'primary' : 'info'}>
                            {s.billingCycle === 'monthly' ? 'Bulanan' : 'Tahunan'}
                          </Badge>
                          {isSoon && <Badge tone="warning">Renewal {dLeft === 0 ? 'hari ini' : `${dLeft} hari`}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <IconButton label="Edit" size="sm" variant="surface" onClick={() => openEdit(s)}>
                        <Edit2 size={14} />
                      </IconButton>
                      <IconButton label="Padam" size="sm" variant="destructive" onClick={() => setPendingDelete(s)}>
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3.5 border-t border-outline">
                    <div>
                      <p className="type-caption">{s.billingCycle === 'monthly' ? 'Sebulan' : 'Sebulan (≈)'}</p>
                      <p className="type-subheadline font-semibold text-onSurface tabular-nums">{showAmounts ? short(monthlyCost(s)) : '••'}</p>
                    </div>
                    <div>
                      <p className="type-caption">{s.billingCycle === 'monthly' ? 'Setahun (≈)' : 'Setahun'}</p>
                      <p className="type-subheadline font-semibold text-primary tabular-nums">{showAmounts ? short(yearlyCost(s)) : '••'}</p>
                    </div>
                    <div>
                      <p className="type-caption flex items-center gap-1"><CalendarClock size={11} /> Pembaharuan</p>
                      <p className="type-subheadline font-medium text-onSurface">{formatDate(renewal)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Repeat className="w-6 h-6" />}
            title="Belum ada langganan"
            description="Tambah langganan untuk melihat kos bulanan dan tahunan anda."
            action={<Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>Tambah Langganan</Button>}
          />
        )}
      </div>

      <SubscriptionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        editing={editing}
        currencySymbol={currencySymbol}
        accounts={accounts}
        defaultAccountId={defaultAccountId || ''}
      />

      <Modal isOpen={!!pendingDelete} onClose={() => setPendingDelete(null)} title="Padam langganan?" size="sm">
        <p className="type-subheadline text-onSurfaceVariant mb-5">
          Adakah anda pasti mahu memadam <b className="text-onSurface">{pendingDelete?.name}</b>? Tindakan ini tidak boleh dikembalikan.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setPendingDelete(null)}>Batal</Button>
          <Button variant="destructive" fullWidth onClick={confirmDelete}>Ya, Padam</Button>
        </div>
      </Modal>

      {/* Wallet link hint */}
      {accounts.length > 0 && (
        <p className="type-caption text-center flex items-center justify-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" /> Langganan yang dipautkan wallet akan muncul dalam Planner.
        </p>
      )}
    </div>
  );
};

export default SubscriptionPage;
