
import { db, firebase } from './firebase';
import { Expense, ExpenseCategory, ExpenseStatus } from '../types';

export const planningService = {
  /**
   * Creates a Sinking Fund by generating expense entries across multiple months.
   * Uses Firestore Batch to ensure data integrity.
   */
  createSinkingFund: async (
    uid: string,
    params: {
      name: string;
      targetAmount: number;
      startMonthStr: string; // Format "YYYY-MM"
      durationMonths: number;
      category: string;
      accountId: string; // Link to a wallet
    }
  ) => {
    const { name, targetAmount, startMonthStr, durationMonths, category, accountId } = params;
    
    if (durationMonths < 1) throw new Error("Tempoh mesti sekurang-kurangnya 1 bulan.");
    
    // Calculate monthly amount (rounded to 2 decimal places logic handled by input, here we verify)
    const monthlyAmount = targetAmount / durationMonths;
    const batch = db.batch();
    
    // Parse Start Date
    const [startYear, startMonth] = startMonthStr.split('-').map(Number);
    
    // Create a base date object set to the 1st of the start month
    // Note: Month in JS Date is 0-indexed (0 = Jan, 1 = Feb)
    let currentDate = new Date(startYear, startMonth - 1, 1);

    // Loop through duration to create entries for each month
    for (let i = 0; i < durationMonths; i++) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const docId = `${year}-${month}`; // e.g., "2025-04"

        const docRef = db.collection('users').doc(uid).collection('monthly_data').doc(docId);

        // Create the Expense Object
        // IMPORTANT: The description format "Name (Current/Total)" is used by the UI 
        // to group and calculate the progress bar. Do not change this format.
        const newExpense: Expense = {
            id: crypto.randomUUID(),
            category: category || ExpenseCategory.SIMPANAN,
            description: `${name} (${i + 1}/${durationMonths})`,
            totalAmount: monthlyAmount,
            splitType: 'Tiada Split',
            paidBy: 'both', 
            husbandContribution: monthlyAmount / 2, 
            wifeContribution: monthlyAmount / 2,
            status: 'pending' as ExpenseStatus,
            accountId: accountId || '' 
        };

        // Use arrayUnion to append to existing array or create doc if missing
        batch.set(docRef, {
            expenses: firebase.firestore.FieldValue.arrayUnion(newExpense)
        }, { merge: true });

        // Increment Month for next iteration
        // setMonth handles year rollover automatically (e.g. month 12 becomes month 0 of next year)
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    await batch.commit();
    return true;
  }
};
