import React, { useState } from 'react';
import { PiggyBank } from 'lucide-react';
import { ExpenseCategory } from '../../../types';
import { Modal, Input, Button } from '../../../components/ui';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: Record<string, number>;
  onSave: (budgets: Record<string, number>) => void;
  currencySymbol: string;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, budgets, onSave, currencySymbol }) => {
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    Object.values(ExpenseCategory).forEach((cat) => {
      init[cat] = budgets[cat] ? budgets[cat].toString() : '';
    });
    return init;
  });

  const handleSave = () => {
    const next: Record<string, number> = {};
    Object.entries(draft).forEach(([cat, val]) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) next[cat] = num;
    });
    onSave(next);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Belanjawan bulanan" subtitle="Tetapkan had perbelanjaan setiap kategori" size="lg">
      <div className="space-y-3 mb-5">
        {Object.values(ExpenseCategory).map((cat) => (
          <div key={cat} className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PiggyBank size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <Input
                label={cat}
                type="number"
                inputMode="decimal"
                value={draft[cat]}
                onChange={(e) => setDraft((prev) => ({ ...prev, [cat]: e.target.value }))}
                placeholder="Tiada had"
                prefix={currencySymbol}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="type-footnote mb-5">Biarkan kosong untuk kategori tanpa had belanjawan.</p>

      <Button fullWidth size="lg" onClick={handleSave}>
        Simpan Belanjawan
      </Button>
    </Modal>
  );
};

export default BudgetModal;
