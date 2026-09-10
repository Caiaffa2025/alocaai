import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, CreditCard, Tag, DollarSign, FileText, Building, MessageSquare } from 'lucide-react';
import {
  PaymentTransaction,
  PaymentCategory,
  PaymentMethod,
  PAYMENT_CATEGORIES,
  PAYMENT_METHODS,
} from '../types';

interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<PaymentTransaction, 'id' | 'createdAt'> | PaymentTransaction) => void;
  editingTransaction?: PaymentTransaction | null;
}

export const ManualTransactionModal: React.FC<ManualTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [category, setCategory] = useState<PaymentCategory>('alimentacao');
  const [recipient, setRecipient] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description || '');
      setDate(editingTransaction.date || new Date().toISOString().split('T')[0]);
      setMethod(editingTransaction.method || 'pix');
      setCategory(editingTransaction.category || 'alimentacao');
      setRecipient(editingTransaction.recipient || '');
      setNotes(editingTransaction.notes || '');
    } else {
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setMethod('pix');
      setCategory('alimentacao');
      setRecipient('');
      setNotes('');
    }
    setError(null);
  }, [editingTransaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Informe um valor numérico válido maior que zero.');
      return;
    }

    if (!description.trim()) {
      setError('A descrição do pagamento é obrigatória.');
      return;
    }

    if (editingTransaction) {
      onSave({
        ...editingTransaction,
        amount: numAmount,
        description: description.trim(),
        date,
        method,
        category,
        recipient: recipient.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      onSave({
        amount: numAmount,
        description: description.trim(),
        date,
        method,
        category,
        recipient: recipient.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-base font-bold">
            {editingTransaction ? 'Editar / Re-alocar Pagamento' : 'Novo Pagamento Manual'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium">
              {error}
            </div>
          )}

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Valor (R$) *
              </label>
              <input
                id="manual-amount-input"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
                className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Data *
              </label>
              <input
                id="manual-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Descrição do Pagamento *
            </label>
            <input
              id="manual-description-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel de Setembro, Almoço executivo"
              required
              className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Payment Method & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                Tipo de Pagamento *
              </label>
              <select
                id="manual-method-select"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              >
                {Object.values(PAYMENT_METHODS).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Alocação / Categoria *
              </label>
              <select
                id="manual-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as PaymentCategory)}
                className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              >
                {Object.values(PAYMENT_CATEGORIES).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recipient / Store */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              Estabelecimento / Favorecido (Opcional)
            </label>
            <input
              id="manual-recipient-input"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Ex: Mercado Extra, Posto Shell"
              className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              Observações (Opcional)
            </label>
            <textarea
              id="manual-notes-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Aotações adicionais sobre esta despesa..."
              className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancelar
            </button>
            <button
              id="save-manual-tx-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Registro</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
