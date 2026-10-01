import { db, firebase } from './firebase';
import { Subscription } from '../types';

const collectionRef = (uid: string) => db.collection('users').doc(uid).collection('subscriptions');

export const subscriptionService = {
  subscribeToSubscriptions(uid: string, onData: (items: Subscription[]) => void) {
    return collectionRef(uid).onSnapshot(
      (snap) => {
        const items = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Subscription, 'id'>) })) as Subscription[];
        onData(items);
      },
      (err) => console.error('Error subscribing to subscriptions:', err)
    );
  },

  addSubscription(uid: string, data: Omit<Subscription, 'id'>) {
    return collectionRef(uid).add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  updateSubscription(uid: string, id: string, data: Partial<Subscription>) {
    return collectionRef(uid).doc(id).set(data, { merge: true });
  },

  deleteSubscription(uid: string, id: string) {
    return collectionRef(uid).doc(id).delete();
  },
};

/* ── Helpers ──────────────────────────────────────────────────────── */

/** Cost normalised to one month. */
export const monthlyCost = (s: Subscription): number => (s.billingCycle === 'monthly' ? s.price : s.price / 12);

/** Cost normalised to one year (monthly → ×12, yearly → actual). */
export const yearlyCost = (s: Subscription): number => (s.billingCycle === 'monthly' ? s.price * 12 : s.price);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Next renewal date on/after `from`. */
export const nextRenewalDate = (s: Subscription, from: Date = new Date()): Date => {
  const start = new Date(`${s.startDate}T00:00:00`);
  if (isNaN(start.getTime())) return from;
  const cursor = new Date(start);
  const fromDay = startOfDay(from);
  let guard = 0;
  while (cursor < fromDay && guard < 2400) {
    if (s.billingCycle === 'monthly') cursor.setMonth(cursor.getMonth() + 1);
    else cursor.setFullYear(cursor.getFullYear() + 1);
    guard += 1;
  }
  return cursor;
};

export const daysUntil = (date: Date, from: Date = new Date()): number =>
  Math.round((startOfDay(date).getTime() - startOfDay(from).getTime()) / 86400000);

export interface UpcomingRenewal {
  subscription: Subscription;
  date: Date;
  days: number;
}

/** Renewals happening within `withinDays` from today (inclusive). */
export const upcomingRenewals = (subscriptions: Subscription[], withinDays = 7): UpcomingRenewal[] =>
  subscriptions
    .map((subscription) => {
      const date = nextRenewalDate(subscription);
      return { subscription, date, days: daysUntil(date) };
    })
    .filter((r) => r.days >= 0 && r.days <= withinDays)
    .sort((a, b) => a.days - b.days);

export const formatDate = (date: Date, locale = 'ms-MY'): string =>
  date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
