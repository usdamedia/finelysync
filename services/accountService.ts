
import { db, firebase } from './firebase';
import { Account, AccountType, IncomeItem, Expense } from '../types';

const COLLECTION_NAME = 'accounts';
const TRANSFER_COLLECTION = 'transfers';

export const accountService = {
  // Subscribe to accounts (Real-time)
  subscribeToAccounts: (uid: string, callback: (accounts: Account[]) => void) => {
    return db.collection('users').doc(uid).collection(COLLECTION_NAME)
      .orderBy('lastUpdated', 'desc')
      .onSnapshot((snapshot) => {
        const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
        callback(accounts);
      }, (error) => {
        console.error("Error subscribing to accounts:", error);
      });
  },

  // Add a new account (Updated to handle initial balance as Income)
  addAccount: async (
    uid: string, 
    account: Omit<Account, 'id'>, 
    initialIncome?: { month: string, item: IncomeItem }
  ) => {
    const batch = db.batch();
    
    // 1. Create Account Ref
    const accountRef = db.collection('users').doc(uid).collection(COLLECTION_NAME).doc();
    
    batch.set(accountRef, {
      ...account,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });

    // 2. Register Initial Balance as Income if applicable
    if (initialIncome && account.balance > 0) {
        const incomeRef = db.collection('users').doc(uid).collection('monthly_data').doc(initialIncome.month);
        
        // Link the income to this specific account ID
        const incomeItemWithId = { 
            ...initialIncome.item, 
            accountId: accountRef.id 
        };

        // Use set with merge to ensure document exists, and arrayUnion to append atomically
        batch.set(incomeRef, {
            incomes: firebase.firestore.FieldValue.arrayUnion(incomeItemWithId)
        }, { merge: true });
    }

    await batch.commit();
  },

  // Update existing account
  updateAccount: async (uid: string, accountId: string, data: Partial<Account>) => {
    await db.collection('users').doc(uid).collection(COLLECTION_NAME).doc(accountId).update({
      ...data,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // Delete account
  deleteAccount: async (uid: string, accountId: string) => {
    await db.collection('users').doc(uid).collection(COLLECTION_NAME).doc(accountId).delete();
  },

  // Perform Atomic Transfer between Wallets/Accounts
  performTransfer: async (
    uid: string, 
    fromAccountId: string, 
    toAccountId: string, 
    amount: number,
    date: Date
  ) => {
    const userRef = db.collection('users').doc(uid);
    const fromRef = userRef.collection(COLLECTION_NAME).doc(fromAccountId);
    const toRef = userRef.collection(COLLECTION_NAME).doc(toAccountId);
    const transferRef = userRef.collection(TRANSFER_COLLECTION).doc();

    try {
      await db.runTransaction(async (transaction) => {
        const fromDoc = await transaction.get(fromRef);
        const toDoc = await transaction.get(toRef);

        if (!fromDoc.exists || !toDoc.exists) {
          throw new Error("Salah satu akaun tidak wujud.");
        }

        const fromData = fromDoc.data() as Account;
        const toData = toDoc.data() as Account;

        // Logik: Tolak dari akaun asal, tambah ke akaun destinasi
        transaction.update(fromRef, { 
          balance: fromData.balance - amount,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });

        transaction.update(toRef, { 
          balance: toData.balance + amount,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Simpan rekod sejarah perpindahan
        transaction.set(transferRef, {
          fromAccountId,
          fromAccountName: fromData.name,
          toAccountId,
          toAccountName: toData.name,
          amount,
          date: firebase.firestore.Timestamp.fromDate(date),
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          type: 'transfer'
        });
      });
      return true;
    } catch (e) {
      console.error("Transfer failed: ", e);
      throw e;
    }
  },

  // Find all income/expense items without an 'accountId' and assigns them to the targetAccountId
  migrateLegacyData: async (uid: string, targetAccountId: string) => {
    const monthlyRef = db.collection('users').doc(uid).collection('monthly_data');
    const snapshot = await monthlyRef.get();
    
    const batch = db.batch();
    let batchCount = 0;

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        let modified = false;
        
        const newIncomes = (data.incomes || []).map((item: IncomeItem) => {
            if (!item.accountId) {
                modified = true;
                return { ...item, accountId: targetAccountId };
            }
            return item;
        });

        const newExpenses = (data.expenses || []).map((item: Expense) => {
            if (!item.accountId) {
                modified = true;
                return { ...item, accountId: targetAccountId };
            }
            return item;
        });

        if (modified) {
            batch.update(doc.ref, {
                incomes: newIncomes,
                expenses: newExpenses
            });
            batchCount++;
        }
    });

    if (batchCount > 0) {
        await batch.commit();
    }
    return batchCount;
  },

  // --- RESET USER DATA (FRESH START) ---
  resetUserData: async (uid: string) => {
    const userRef = db.collection('users').doc(uid);
    const settingsRef = userRef.collection('settings').doc('preferences');
    
    // Helper to delete all docs in a collection
    const deleteCollection = async (collectionPath: string) => {
      const ref = userRef.collection(collectionPath);
      const snapshot = await ref.get();
      
      if (snapshot.empty) return;

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    };

    try {
      // 1. Delete Collections
      await deleteCollection('monthly_data');
      await deleteCollection('accounts');
      await deleteCollection('transfers');

      // 2. Unlink Partner (Family Sync) & Reset Sharing
      // This is crucial. If user is linked, "Reset" should probably unlink them 
      // so they see their own empty state, not the partner's old data.
      await settingsRef.set({
          linkedAccountId: firebase.firestore.FieldValue.delete(),
          linkedAccountEmail: firebase.firestore.FieldValue.delete(),
          sharedAccountIds: firebase.firestore.FieldValue.delete()
      }, { merge: true });

      return true;
    } catch (error) {
      console.error("Error resetting data:", error);
      throw error;
    }
  },

  // --- DELETE USER ACCOUNT (APPLE COMPLIANCE) ---
  deleteUserAccount: async (uid: string) => {
    const userRef = db.collection('users').doc(uid);
    
    const deleteCollection = async (collectionPath: string) => {
      const ref = userRef.collection(collectionPath);
      const snapshot = await ref.get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    };

    try {
      // 1. Delete all sub-collections
      await deleteCollection('monthly_data');
      await deleteCollection('accounts');
      await deleteCollection('transfers');
      await deleteCollection('settings');
      
      // 2. Delete the main user document
      await userRef.delete();
      
      return true;
    } catch (error) {
      console.error("Error deleting account data:", error);
      throw error;
    }
  }
};
