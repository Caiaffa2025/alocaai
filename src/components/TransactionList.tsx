import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Download,
  Calendar,
  CreditCard,
  Tag,
  ArrowUpDown,
  Building,
  Volume2,
  Plus,
} from 'lucide-react';
import {
  PaymentTransaction,
  PaymentCategory,
  PaymentMethod,
  PAYMENT_CATEGORIES,
  PAYMENT_METHODS,
} from '../types';

interface TransactionListProps {
  transactions: PaymentTransaction[];
  onEditTransaction: (transaction: PaymentTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenVoiceModal: () => void;
  onOpenManualModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onOpenVoiceModal,
  onOpenManualModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filtered & Sorted list
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search query check
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          t.description.toLowerCase().includes(q) ||
          (t.recipient && t.recipient.toLowerCase().includes(q)) ||
          (t.rawSpeechText && t.rawSpeechText.toLowerCase().includes(q));

        // Category filter
        const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;

        // Method filter
        const matchesMethod = selectedMethod === 'all' || t.method === selectedMethod;

        return matchesSearch && matchesCat && matchesMethod;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, selectedCategory, selectedMethod, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Data', 'Descrição', 'Valor (R$)', 'Método', 'Categoria', 'Beneficiário/Local', 'Relato Falado'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      PAYMENT_METHODS[t.method]?.label || t.method,
      PAYMENT_CATEGORIES[t.category]?.label || t.category,
      `"${(t.recipient || '').replace(/"/g, '""')}"`,
      `"${(t.rawSpeechText || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alocapag_extrato_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Extrato de Pagamentos Alocados</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gerencie, filtre e edite todos os seus registros de pagamento
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
            title="Exportar em formato planilha CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            id="list-add-manual-btn"
            onClick={onOpenManualModal}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>+ Manual</span>
          </button>

          <button
            id="list-speak-payment-btn"
            onClick={onOpenVoiceModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Volume2 className="w-4 h-4" />
            <span>Falar Pagamento</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="search-transactions-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por descrição, lugar..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="all">Todas as Categorias</option>
              {Object.values(PAYMENT_CATEGORIES).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Method Filter */}
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              id="filter-method-select"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full py-2 px-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="all">Todos os Tipos (Pix, Cartão...)</option>
              {Object.values(PAYMENT_METHODS).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="date_desc">Mais Recentes Primeiro</option>
              <option value="date_asc">Mais Antigos Primeiro</option>
              <option value="amount_desc">Maior Valor Primeiro</option>
              <option value="amount_asc">Menor Valor Primeiro</option>
            </select>
          </div>

        </div>

        {/* Total stats bar */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <span>Exibindo <strong>{filteredTransactions.length}</strong> de {transactions.length} registros</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            Total Selecionado: <span className="text-emerald-600 dark:text-emerald-400">{formatBRL(totalFilteredAmount)}</span>
          </span>
        </div>
      </div>

      {/* Transaction Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrição & Detalhes</th>
                <th className="py-3 px-4">Categoria Alocada</th>
                <th className="py-3 px-4">Tipo de Pagamento</th>
                <th className="py-3 px-4 text-right">Valor (R$)</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredTransactions.map((t) => {
                const catInfo = PAYMENT_CATEGORIES[t.category] || PAYMENT_CATEGORIES.outros;
                const methodInfo = PAYMENT_METHODS[t.method] || PAYMENT_METHODS.other;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Date */}
                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {t.date}
                    </td>

                    {/* Description & Recipient */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {t.description}
                      </div>
                      {t.recipient && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{t.recipient}</span>
                        </div>
                      )}
                      {t.rawSpeechText && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 italic mt-0.5 max-w-xs truncate" title={t.rawSpeechText}>
                          "{t.rawSpeechText}"
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${catInfo.bgClass}`}>
                        {catInfo.label}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${methodInfo.bgClass}`}>
                        {methodInfo.label}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white text-sm">
                      {formatBRL(t.amount)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          id={`edit-tx-${t.id}`}
                          onClick={() => onEditTransaction(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Editar ou re-alocar pagamento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-tx-${t.id}`}
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir o pagamento "${t.description}"?`)) {
                              onDeleteTransaction(t.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Excluir pagamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTransactions.map((t) => {
            const catInfo = PAYMENT_CATEGORIES[t.category] || PAYMENT_CATEGORIES.outros;
            const methodInfo = PAYMENT_METHODS[t.method] || PAYMENT_METHODS.other;

            return (
              <div key={t.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.date}</div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{t.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900 dark:text-white">{formatBRL(t.amount)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${catInfo.bgClass}`}>
                    {catInfo.label}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${methodInfo.bgClass}`}>
                    {methodInfo.label}
                  </span>
                  {t.recipient && (
                    <span className="text-[11px] text-slate-400">
                      • {t.recipient}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => onEditTransaction(t)}
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDeleteTransaction(t.id)}
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-rose-200 text-rose-600 dark:border-rose-900/60"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm space-y-2">
            <p>Nenhum pagamento encontrado com os filtros atuais.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedMethod('all');
              }}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Limpar Filtros de Busca
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
