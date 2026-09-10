import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AllocationDashboard } from './components/AllocationDashboard';
import { TransactionList } from './components/TransactionList';
import { VoiceInputModal } from './components/VoiceInputModal';
import { ManualTransactionModal } from './components/ManualTransactionModal';
import { AIInsightsModal } from './components/AIInsightsModal';
import { PaymentTransaction } from './types';
import {
  loadStoredTransactions,
  saveStoredTransactions,
  resetStoredTransactionsToDefault,
} from './utils/storage';
import { Mic, Plus, CheckCircle, Shield, Heart } from 'lucide-react';

export default function App() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<PaymentTransaction | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const data = loadStoredTransactions();
    setTransactions(data);
  }, []);

  // Save changes
  const updateTransactions = (newList: PaymentTransaction[]) => {
    setTransactions(newList);
    saveStoredTransactions(newList);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Add from Voice
  const handleSaveVoiceTransaction = (
    txData: Omit<PaymentTransaction, 'id' | 'createdAt'>
  ) => {
    const newTx: PaymentTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTx, ...transactions];
    updateTransactions(updated);
    showToast('✨ Pagamento alocado com sucesso por voz!');
  };

  // Add / Edit from Manual
  const handleSaveManualTransaction = (
    txData: Omit<PaymentTransaction, 'id' | 'createdAt'> | PaymentTransaction
  ) => {
    if ('id' in txData && txData.id) {
      // Editing
      const updated = transactions.map((t) => (t.id === txData.id ? (txData as PaymentTransaction) : t));
      updateTransactions(updated);
      showToast('Pagamento atualizado e re-alocado.');
    } else {
      // New
      const newTx: PaymentTransaction = {
        ...(txData as Omit<PaymentTransaction, 'id' | 'createdAt'>),
        id: `tx-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const updated = [newTx, ...transactions];
      updateTransactions(updated);
      showToast('Novo pagamento registrado manualmente.');
    }
    setEditingTransaction(null);
  };

  // Delete
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    updateTransactions(updated);
    showToast('Pagamento removido do extrato.');
  };

  // Reset Sample Data
  const handleResetData = () => {
    if (window.confirm('Deseja recarregar os pagamentos de exemplo padrão?')) {
      const resetList = resetStoredTransactionsToDefault();
      setTransactions(resetList);
      showToast('Dados de exemplo recarregados!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white transition-colors">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        onOpenVoiceModal={() => {
          setEditingTransaction(null);
          setIsVoiceModalOpen(true);
        }}
        onOpenManualModal={() => {
          setEditingTransaction(null);
          setIsManualModalOpen(true);
        }}
        onOpenInsightsModal={() => setIsInsightsModalOpen(true)}
        onResetData={handleResetData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalTransactionsCount={transactions.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'dashboard' ? (
          <AllocationDashboard
            transactions={transactions}
            onOpenVoiceModal={() => {
              setEditingTransaction(null);
              setIsVoiceModalOpen(true);
            }}
            onOpenManualModal={() => {
              setEditingTransaction(null);
              setIsManualModalOpen(true);
            }}
          />
        ) : (
          <TransactionList
            transactions={transactions}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsManualModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenVoiceModal={() => {
              setEditingTransaction(null);
              setIsVoiceModalOpen(true);
            }}
            onOpenManualModal={() => {
              setEditingTransaction(null);
              setIsManualModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Floating Action Mobile Button */}
      <div className="fixed bottom-6 right-6 z-30 sm:hidden">
        <button
          id="mobile-floating-mic-btn"
          onClick={() => {
            setEditingTransaction(null);
            setIsVoiceModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl flex items-center justify-center transform active:scale-90 transition-all ring-4 ring-emerald-500/30"
          title="Falar Pagamento"
        >
          <Mic className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>AlocaPag — Processamento seguro de pagamentos com IA server-side</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Desenvolvido com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>para controle financeiro pessoal</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSaveTransaction={handleSaveVoiceTransaction}
      />

      <ManualTransactionModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveManualTransaction}
        editingTransaction={editingTransaction}
      />

      <AIInsightsModal
        isOpen={isInsightsModalOpen}
        onClose={() => setIsInsightsModalOpen(false)}
        transactions={transactions}
      />

    </div>
  );
}
