import React, { useState, useMemo } from 'react';
import { Banknote, Calculator, Hash, Coins, Plus, Trash2, Users } from 'lucide-react';
import { Modal, Input, Button, IconButton } from './ui';

interface RayaCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
}

interface RecipientGroup {
  id: string;
  name: string;
  count: number;
  amountPerPerson: number;
}

const RayaCalculatorModal: React.FC<RayaCalculatorModalProps> = ({ isOpen, onClose, currencySymbol }) => {
  const [groups, setGroups] = useState<RecipientGroup[]>([
    { id: '1', name: 'Anak Buah', count: 0, amountPerPerson: 5 },
    { id: '2', name: 'Ibu Bapa', count: 0, amountPerPerson: 100 },
  ]);

  const [bufferNotes, setBufferNotes] = useState({ rm1: '', rm5: '', rm10: '', rm20: '', rm50: '', rm100: '' });

  const handleAddGroup = () => setGroups([...groups, { id: crypto.randomUUID(), name: '', count: 0, amountPerPerson: 0 }]);
  const handleRemoveGroup = (id: string) => setGroups(groups.filter((g) => g.id !== id));
  const handleGroupChange = (id: string, field: keyof RecipientGroup, value: any) =>
    setGroups(groups.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  const handleBufferChange = (key: keyof typeof bufferNotes, value: string) => setBufferNotes((prev) => ({ ...prev, [key]: value }));

  const recipientBreakdown = useMemo(() => {
    const breakdown = { rm1: 0, rm5: 0, rm10: 0, rm20: 0, rm50: 0, rm100: 0 };
    groups.forEach((group) => {
      if (group.count > 0 && group.amountPerPerson > 0) {
        let amount = group.amountPerPerson;
        const n100 = Math.floor(amount / 100); amount %= 100;
        const n50 = Math.floor(amount / 50); amount %= 50;
        const n20 = Math.floor(amount / 20); amount %= 20;
        const n10 = Math.floor(amount / 10); amount %= 10;
        const n5 = Math.floor(amount / 5); amount %= 5;
        const n1 = amount;
        breakdown.rm100 += n100 * group.count;
        breakdown.rm50 += n50 * group.count;
        breakdown.rm20 += n20 * group.count;
        breakdown.rm10 += n10 * group.count;
        breakdown.rm5 += n5 * group.count;
        breakdown.rm1 += n1 * group.count;
      }
    });
    return breakdown;
  }, [groups]);

  const totals = useMemo(() => {
    const b = {
      rm1: parseInt(bufferNotes.rm1) || 0,
      rm5: parseInt(bufferNotes.rm5) || 0,
      rm10: parseInt(bufferNotes.rm10) || 0,
      rm20: parseInt(bufferNotes.rm20) || 0,
      rm50: parseInt(bufferNotes.rm50) || 0,
      rm100: parseInt(bufferNotes.rm100) || 0,
    };
    const totalPieces = {
      rm1: recipientBreakdown.rm1 + b.rm1,
      rm5: recipientBreakdown.rm5 + b.rm5,
      rm10: recipientBreakdown.rm10 + b.rm10,
      rm20: recipientBreakdown.rm20 + b.rm20,
      rm50: recipientBreakdown.rm50 + b.rm50,
      rm100: recipientBreakdown.rm100 + b.rm100,
    };
    const totalCount = Object.values(totalPieces).reduce((a, c) => a + c, 0);
    const totalValue = totalPieces.rm1 + totalPieces.rm5 * 5 + totalPieces.rm10 * 10 + totalPieces.rm20 * 20 + totalPieces.rm50 * 50 + totalPieces.rm100 * 100;
    const totalPackets = groups.reduce((acc, g) => acc + (parseInt(g.count.toString()) || 0), 0);
    return { totalPieces, totalCount, totalValue, totalPackets };
  }, [recipientBreakdown, bufferNotes, groups]);

  const resetForm = () => {
    setGroups([
      { id: '1', name: 'Anak Buah', count: 0, amountPerPerson: 5 },
      { id: '2', name: 'Ibu Bapa', count: 0, amountPerPerson: 100 },
    ]);
    setBufferNotes({ rm1: '', rm5: '', rm10: '', rm20: '', rm50: '', rm100: '' });
  };

  const NoteInput = ({ label, value, onChange, color, calculatedAmount }: any) => {
    const extra = parseInt(value) || 0;
    const total = calculatedAmount + extra;
    return (
      <div className="flex items-center gap-3 bg-surface border border-outline p-3 rounded-xl">
        <div className={`w-12 h-10 rounded-lg flex items-center justify-center font-semibold text-xs text-white ${color}`}>{label}</div>
        <div className="flex flex-col items-center justify-center px-2 border-r border-outline min-w-[3rem]">
          <span className="type-caption uppercase">Auto</span>
          <span className="type-subheadline font-semibold text-onSurface">{calculatedAmount}</span>
        </div>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Tambah ${label}`}
          className="flex-1 min-w-0 bg-transparent type-subheadline font-semibold text-onSurface outline-none placeholder:text-onSurfaceVariant/40 text-center py-1"
          placeholder="0"
        />
        <div className="flex flex-col items-center justify-center px-3 bg-surfaceVariant rounded-lg py-1 min-w-[3.5rem]">
          <span className="type-caption uppercase">Total</span>
          <span className={`type-subheadline font-semibold ${total > 0 ? 'text-primary' : 'text-onSurfaceVariant/40'}`}>{total}</span>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kalkulator Raya"
      subtitle="Rancang pecahan duit raya"
      size="lg"
      footer={
        <Button variant="secondary" fullWidth leftIcon={<Coins className="w-4 h-4" />} onClick={resetForm}>
          Reset
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="bg-surface border border-outline rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="type-subheadline font-semibold text-onSurface flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Senarai Penerima
            </h4>
            <span className="type-caption bg-surfaceVariant px-2 py-1 rounded-lg">{totals.totalPackets} Sampul</span>
          </div>

          <div className="space-y-3">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => handleGroupChange(group.id, 'name', e.target.value)}
                    placeholder="Nama"
                    aria-label="Nama kumpulan"
                    className="col-span-5 bg-surfaceVariant/60 rounded-xl px-3 h-11 type-subheadline text-onSurface outline-none focus:ring-2 focus:ring-primary/20 min-w-0"
                  />
                  <input
                    type="number"
                    value={group.count || ''}
                    onChange={(e) => handleGroupChange(group.id, 'count', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    aria-label="Bilangan orang"
                    className="col-span-3 bg-surfaceVariant/60 rounded-xl px-3 h-11 type-subheadline font-semibold text-onSurface outline-none focus:ring-2 focus:ring-primary/20 text-center"
                  />
                  <input
                    type="number"
                    value={group.amountPerPerson || ''}
                    onChange={(e) => handleGroupChange(group.id, 'amountPerPerson', parseFloat(e.target.value) || 0)}
                    placeholder="RM"
                    aria-label="Amaun setiap orang"
                    className="col-span-4 bg-surfaceVariant/60 rounded-xl px-3 h-11 type-subheadline font-semibold text-onSurface outline-none focus:ring-2 focus:ring-primary/20 text-right"
                  />
                </div>
                <IconButton label="Buang kumpulan" variant="destructive" onClick={() => handleRemoveGroup(group.id)}>
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddGroup}
            className="mt-4 w-full h-11 border border-dashed border-outline rounded-xl type-subheadline font-medium text-onSurfaceVariant hover:bg-surfaceVariant/60 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Kumpulan
          </button>
        </div>

        <div className="bg-surface border border-outline rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="type-subheadline font-semibold text-onSurface flex items-center gap-2">
              <Calculator className="w-4 h-4 text-secondary" /> Pecahan Wang
            </h4>
            <span className="type-caption">Auto + Extra</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NoteInput label="RM 1" value={bufferNotes.rm1} onChange={(v: string) => handleBufferChange('rm1', v)} color="bg-info" calculatedAmount={recipientBreakdown.rm1} />
            <NoteInput label="RM 5" value={bufferNotes.rm5} onChange={(v: string) => handleBufferChange('rm5', v)} color="bg-success" calculatedAmount={recipientBreakdown.rm5} />
            <NoteInput label="RM 10" value={bufferNotes.rm10} onChange={(v: string) => handleBufferChange('rm10', v)} color="bg-error" calculatedAmount={recipientBreakdown.rm10} />
            <NoteInput label="RM 20" value={bufferNotes.rm20} onChange={(v: string) => handleBufferChange('rm20', v)} color="bg-warning" calculatedAmount={recipientBreakdown.rm20} />
            <NoteInput label="RM 50" value={bufferNotes.rm50} onChange={(v: string) => handleBufferChange('rm50', v)} color="bg-primary" calculatedAmount={recipientBreakdown.rm50} />
            <NoteInput label="RM 100" value={bufferNotes.rm100} onChange={(v: string) => handleBufferChange('rm100', v)} color="bg-secondary" calculatedAmount={recipientBreakdown.rm100} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-success text-white rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <Coins className="w-4 h-4" />
              <span className="type-caption font-semibold uppercase tracking-widest">Jumlah Besar</span>
            </div>
            <p className="type-title2 tabular-nums">{currencySymbol} {totals.totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-surface border border-outline rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1 text-onSurfaceVariant">
              <Hash className="w-4 h-4" />
              <span className="type-caption font-semibold uppercase tracking-widest">Total Keping</span>
            </div>
            <p className="type-title2 text-onSurface tabular-nums">{totals.totalCount} <span className="type-subheadline font-normal text-onSurfaceVariant">Pcs</span></p>
          </div>
        </div>

        <div className="p-4 bg-warning/10 rounded-2xl border border-warning/20 flex gap-3">
          <Banknote className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <p className="type-footnote text-onSurface">Tukar duit lebih awal di bank. Jumlah "Extra" berguna untuk kecemasan atau tetamu yang tidak dijangka.</p>
        </div>
      </div>
    </Modal>
  );
};

export default RayaCalculatorModal;
