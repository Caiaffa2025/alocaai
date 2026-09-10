import React, { useState, useMemo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  PieChart,
  Mic,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  PaymentTransaction,
  PAYMENT_CATEGORIES,
  PAYMENT_METHODS,
  PaymentCategory,
  PaymentMethod,
} from '../types';

interface AllocationDashboardProps {
  transactions: PaymentTransaction[];
  onOpenVoiceModal: () => void;
  onOpenManualModal: () => void;
}

export const AllocationDashboard: React.FC<AllocationDashboardProps> = ({
  transactions,
  onOpenVoiceModal,
  onOpenManualModal,
}) => {
  const [timeRange, setTimeRange] = useState<'current_month' | 'last_30_days' | 'all'>('current_month');

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    
    if (timeRange === 'current_month') {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      return transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    }

    if (timeRange === 'last_30_days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return transactions.filter((t) => new Date(t.date) >= thirtyDaysAgo);
    }

    return transactions;
  }, [transactions, timeRange]);

  // Aggregate Total Spent
  const totalSpent = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTransactions]);

  // Aggregate by Category
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

    return Object.entries(totals)
      .map(([catKey, value]) => {
        const info = PAYMENT_CATEGORIES[catKey as PaymentCategory] || PAYMENT_CATEGORIES.outros;
        return {
          key: catKey,
          name: info.label,
          value,
          percentage: totalSpent > 0 ? (value / totalSpent) * 100 : 0,
          color: info.color,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, totalSpent]);

  // Aggregate by Payment Method
  const methodData = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      totals[t.method] = (totals[t.method] || 0) + t.amount;
    });

    return Object.entries(totals)
      .map(([methodKey, value]) => {
        const info = PAYMENT_METHODS[methodKey as PaymentMethod] || PAYMENT_METHODS.other;
        return {
          key: methodKey,
          name: info.label,
          value,
          percentage: totalSpent > 0 ? (value / totalSpent) * 100 : 0,
          color: info.color,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, totalSpent]);

  // Top Category and Method
  const topCategory = categoryData[0];
  const topMethod = methodData[0];
  const averagePayment = filteredTransactions.length > 0 ? totalSpent / filteredTransactions.length : 0;

  // Format BRL
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner with Voice Action */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-900/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Alocação por Fala em Tempo Real</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Apenas fale e seu pagamento é alocado instantaneamente.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Diga o valor, para quem ou o que foi pago, se usou Pix, Cartão ou Dinheiro e a data. A Inteligência Artificial cuida do resto!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              id="hero-voice-record-btn"
              onClick={onOpenVoiceModal}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Mic className="w-5 h-5" />
              <span>Registrar Pagamento por Voz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Date Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Período de Análise:</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTimeRange('current_month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timeRange === 'current_month'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mês Atual
          </button>
          <button
            onClick={() => setTimeRange('last_30_days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timeRange === 'last_30_days'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Últimos 30 dias
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timeRange === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todo o Histórico
          </button>
        </div>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Spent */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Alocado</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatBRL(totalSpent)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {filteredTransactions.length} pagamentos efetuados
          </p>
        </div>

        {/* Top Category Allocation */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Maior Alocação</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {topCategory ? topCategory.name : 'Nenhuma'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {topCategory ? `${formatBRL(topCategory.value)} (${topCategory.percentage.toFixed(1)}%)` : 'R$ 0,00'}
          </p>
        </div>

        {/* Top Payment Method */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Método Mais Utilizado</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {topMethod ? topMethod.name : 'Nenhum'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {topMethod ? `${formatBRL(topMethod.value)} (${topMethod.percentage.toFixed(1)}%)` : 'R$ 0,00'}
          </p>
        </div>

        {/* Average Payment */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Média por Pagamento</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatBRL(averagePayment)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Valor médio de cada transação
          </p>
        </div>

      </div>

      {/* Charts Section: Pie Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Allocation Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                Alocação por Categoria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Distribuição percentual dos seus gastos</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg">
              {categoryData.length} categorias
            </span>
          </div>

          {categoryData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatBRL(Number(value)), 'Valor']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
              <p>Nenhum pagamento registrado no período selecionado.</p>
            </div>
          )}

          {/* Category List Progress Bars */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto pr-1">
            {categoryData.map((cat) => (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {formatBRL(cat.value)}{' '}
                    <span className="text-slate-400 font-normal">({cat.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Alocação por Tipo de Pagamento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Volume alocado em Pix, Cartão, Dinheiro e Boleto</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg">
              {methodData.length} métodos
            </span>
          </div>

          {methodData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={methodData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    formatter={(value: any) => [formatBRL(Number(value)), 'Total Alocado']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {methodData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
              <p>Sem dados de tipo de pagamento no período.</p>
            </div>
          )}

          {/* Method Badges Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {methodData.map((m) => (
              <div
                key={m.key}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.name}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatBRL(m.value)}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Recent Activity Quick List Preview */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Últimos Pagamentos Efetuados</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Atividades recentes registradas</p>
          </div>
          <button
            onClick={onOpenVoiceModal}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>+ Adicionar por voz</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTransactions.slice(0, 5).map((t) => {
            const catInfo = PAYMENT_CATEGORIES[t.category] || PAYMENT_CATEGORIES.outros;
            const methodInfo = PAYMENT_METHODS[t.method] || PAYMENT_METHODS.other;

            return (
              <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-2xl shrink-0 ${catInfo.bgClass}`}>
                    <span className="font-semibold text-xs">{catInfo.label.split(' ')[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {t.description}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{t.date}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${methodInfo.bgClass}`}>
                        {methodInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatBRL(t.amount)}
                  </div>
                  {t.recipient && (
                    <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                      {t.recipient}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredTransactions.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Nenhum pagamento registrado ainda neste período.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
