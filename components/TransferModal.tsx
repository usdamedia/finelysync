import React, { useState, useMemo } from 'react';
import { ArrowRightLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Account } from '../types';
import { accountService } from '../services/accountService';
import CustomSelect from './CustomSelect';
import { Modal, Input, Button, useToast } from './ui';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  uid: string;
  currencySymbol: string;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, accounts, uid, currencySymbol }) => {
  const toast = useToast();
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedFromAccount = useMemo(() => accounts.find((acc) => acc.id === fromId), [fromId, accounts]);

  const accountOptions = accounts.map((acc) => ({ value: acc.id, label: `${acc.name}` }));

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!fromId || !toId || !value || value <= 0) return;
    if (fromId === toId) { toast.warning('Tidak boleh pindah ke akaun yang sama.'); return; }

    setLoading(true);
    try {
      await accountService.performTransfer(uid, fromId, toId, value, new Date(date));
      setSuccess(true);
      window.setTimeout(() => {
        setSuccess(false);
        onClose();
        setAmount('');
        setFromId('');
        setToId('');
      }, 1400);
    } catch (err) {
      console.error(err);
      toast.error('Pindahan gagal. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const setMaxAmount = () => {
    if (selectedFromAccount) setAmount(selectedFromAccount.balance.toString());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pindah dana" subtitle="Alihkan wang antara wallet anda" size="md">
      {success ? (
        <div className="py-10 text-center animate-scale-in">
          <span className="w-16 h-16 bg-success/12 text-success rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </span>
          <h3 className="type-title3 text-onSurface mb-1">Berjaya!</h3>
          <p className="type-footnote">Dana anda telah dipindahkan.</p>
        </div>
      ) : (
        <form onSubmit={handleTransfer} className="space-y-5">
          <div className="space-y-2">
            <CustomSelect
              label="Dari wallet"
              value={fromId}
              onChange={setFromId}
              options={accountOptions.map((opt) => ({ ...opt, disabled: opt.value === toId }))}
              placeholder="Pilih wallet asal"
            />
            {selectedFromAccount && (
              <p className="type-caption px-1">Baki: <b className="text-onSurface">{currencySymbol}{selectedFromAccount.balance.toLocaleString()}</b></p>
            )}
          </div>

          <div className="flex justify-center -my-1">
            <span className="w-9 h-9 rounded-full bg-surfaceVariant border border-outline flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-primary rotate-90" />
            </span>
          </div>

          <CustomSelect
            label="Ke wallet"
            value={toId}
            onChange={setToId}
            options={accountOptions.map((opt) => ({ ...opt, disabled: opt.value === fromId }))}
            placeholder="Pilih wallet destinasi"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Amaun"
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                prefix={currencySymbol}
                suffix={selectedFromAccount ? <button type="button" onClick={setMaxAmount} className="type-caption font-semibold text-primary">MAX</button> : undefined}
                required
              />
            </div>
            <Input label="Tarikh" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} disabled={!fromId || !toId || !amount} leftIcon={<ArrowRightLeft className="w-5 h-5" />}>
            Sahkan Pindahan
          </Button>
          <p className="type-caption text-center">Transaksi ini akan direkodkan secara automatik.</p>
        </form>
      )}
    </Modal>
  );
};

export default TransferModal;
