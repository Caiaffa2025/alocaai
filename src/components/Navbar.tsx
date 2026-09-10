import React from 'react';
import { Mic, Plus, Wallet, Sparkles, RefreshCw, BarChart3, ListFilter } from 'lucide-react';

interface NavbarProps {
  onOpenVoiceModal: () => void;
  onOpenManualModal: () => void;
  onOpenInsightsModal: () => void;
  onResetData: () => void;
  activeTab: 'dashboard' | 'transactions';
  setActiveTab: (tab: 'dashboard' | 'transactions') => void;
  totalTransactionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVoiceModal,
  onOpenManualModal,
  onOpenInsightsModal,
  onResetData,
  activeTab,
  setActiveTab,
  totalTransactionsCount,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div id="brand-logo" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  Aloca<span className="text-emerald-600 dark:text-emerald-400">Pag</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                  IA por Voz
                </span>
              </div>
              <p className="text-xs text-slate-5-00 dark:text-slate-400 hidden sm:block">
                Gestão e Alocação Inteligente de Pagamentos
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              id="tab-dashboard-btn"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Visão Geral</span>
            </button>
            <button
              id="tab-transactions-btn"
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Extrato</span>
              <span className="ml-0.5 px-1.5 py-0.2 text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                {totalTransactionsCount}
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Insights AI button */}
            <button
              id="open-insights-btn"
              onClick={onOpenInsightsModal}
              title="Análise e Insights Financeiros por IA"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span>Insights IA</span>
            </button>

            {/* Manual add button */}
            <button
              id="add-manual-payment-btn"
              onClick={onOpenManualModal}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Adicionar pagamento manualmente"
            >
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Manual</span>
            </button>

            {/* Hero Voice Record button */}
            <button
              id="open-voice-modal-btn"
              onClick={onOpenVoiceModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 text-xs sm:text-sm font-semibold transition-all transform active:scale-95"
            >
              <Mic className="w-4 h-4 animate-bounce" />
              <span>Falar Pagamento</span>
            </button>

            {/* Reset sample data button */}
            <button
              id="reset-data-btn"
              onClick={onResetData}
              title="Recarregar dados de exemplo"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
