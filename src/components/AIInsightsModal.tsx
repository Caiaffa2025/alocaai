import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2, Lightbulb, RefreshCw, CheckCircle } from 'lucide-react';
import { PaymentTransaction } from '../types';

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: PaymentTransaction[];
}

export const AIInsightsModal: React.FC<AIInsightsModalProps> = ({
  isOpen,
  onClose,
  transactions,
}) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (transactions.length === 0) {
      setInsights([
        'Adicione seus primeiros pagamentos para a inteligência artificial analisar a alocação dos seus gastos e oferecer dicas!',
      ]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/financial-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao consultar IA');
      }

      setInsights(data.insights || []);
    } catch (err: any) {
      console.error('Erro ao buscar insights:', err);
      setError('Não foi possível gerar os insights no momento.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInsights();
    }
  }, [isOpen, transactions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-200 animate-pulse" />
            <h2 className="text-base font-bold">Insights Financeiros da IA</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Análise inteligente baseada no seu padrão de pagamentos, formas de pagamento utilizadas e categorias de despesa.
          </p>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-purple-600 dark:text-purple-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Analisando a alocação dos seus pagamentos com Gemini...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200">
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3"
                >
                  <div className="p-1.5 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-xl shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={fetchInsights}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recarregar Análise</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
            >
              Entendido
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
