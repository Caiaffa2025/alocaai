export type PaymentMethod = 
  | 'pix'
  | 'credit_card'
  | 'debit_card'
  | 'cash'
  | 'bank_transfer'
  | 'boleto'
  | 'other';

export type PaymentCategory = 
  | 'alimentacao'
  | 'moradia'
  | 'transporte'
  | 'saude'
  | 'educacao'
  | 'lazer'
  | 'compras'
  | 'servicos'
  | 'impostos'
  | 'outros';

export interface PaymentTransaction {
  id: string;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  category: PaymentCategory;
  recipient?: string;
  notes?: string;
  rawSpeechText?: string;
  createdAt: string;
}

export interface ParsedPaymentAIResult {
  amount: number;
  description: string;
  date: string;
  method: PaymentMethod;
  category: PaymentCategory;
  recipient?: string;
  notes?: string;
  confidence: number;
  explanation: string;
}

export interface CategoryInfo {
  id: PaymentCategory;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  iconName: string;
}

export interface PaymentMethodInfo {
  id: PaymentMethod;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  iconName: string;
}

export const PAYMENT_CATEGORIES: Record<PaymentCategory, CategoryInfo> = {
  alimentacao: {
    id: 'alimentacao',
    label: 'Alimentação & Mercado',
    color: '#f59e0b', // amber
    bgClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    textClass: 'text-amber-600 dark:text-amber-400',
    iconName: 'Utensils',
  },
  moradia: {
    id: 'moradia',
    label: 'Moradia & Contas',
    color: '#3b82f6', // blue
    bgClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
    textClass: 'text-blue-600 dark:text-blue-400',
    iconName: 'Home',
  },
  transporte: {
    id: 'transporte',
    label: 'Transporte & Veículo',
    color: '#10b981', // emerald
    bgClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    iconName: 'Car',
  },
  saude: {
    id: 'saude',
    label: 'Saúde & Farmácia',
    color: '#ec4899', // pink
    bgClass: 'bg-pink-100 text-pink-800 dark:bg-pink-950/50 dark:text-pink-300',
    textClass: 'text-pink-600 dark:text-pink-400',
    iconName: 'HeartPulse',
  },
  educacao: {
    id: 'educacao',
    label: 'Educação & Cursos',
    color: '#8b5cf6', // purple
    bgClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300',
    textClass: 'text-purple-600 dark:text-purple-400',
    iconName: 'GraduationCap',
  },
  lazer: {
    id: 'lazer',
    label: 'Lazer & Viagens',
    color: '#06b6d4', // cyan
    bgClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    iconName: 'Sparkles',
  },
  compras: {
    id: 'compras',
    label: 'Compras & Vestuário',
    color: '#f43f5e', // rose
    bgClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300',
    textClass: 'text-rose-600 dark:text-rose-400',
    iconName: 'ShoppingBag',
  },
  servicos: {
    id: 'servicos',
    label: 'Serviços & Assinaturas',
    color: '#6366f1', // indigo
    bgClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    iconName: 'Tv',
  },
  impostos: {
    id: 'impostos',
    label: 'Impostos & Taxas',
    color: '#64748b', // slate
    bgClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    textClass: 'text-slate-600 dark:text-slate-400',
    iconName: 'Receipt',
  },
  outros: {
    id: 'outros',
    label: 'Outros Pagamentos',
    color: '#a855f7', // violet
    bgClass: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    textClass: 'text-gray-600 dark:text-gray-400',
    iconName: 'CircleEllipsis',
  },
};

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodInfo> = {
  pix: {
    id: 'pix',
    label: 'Pix',
    color: '#00bdae', // Teal/Pix style
    bgClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
    textClass: 'text-teal-600 dark:text-teal-400',
    iconName: 'Zap',
  },
  credit_card: {
    id: 'credit_card',
    label: 'Cartão de Crédito',
    color: '#6366f1', // Indigo
    bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    iconName: 'CreditCard',
  },
  debit_card: {
    id: 'debit_card',
    label: 'Cartão de Débito',
    color: '#0284c7', // Sky
    bgClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
    textClass: 'text-sky-600 dark:text-sky-400',
    iconName: 'CreditCard',
  },
  cash: {
    id: 'cash',
    label: 'Dinheiro',
    color: '#16a34a', // Green
    bgClass: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
    textClass: 'text-green-600 dark:text-green-400',
    iconName: 'Banknote',
  },
  bank_transfer: {
    id: 'bank_transfer',
    label: 'Transferência / TED',
    color: '#2563eb', // Blue
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    textClass: 'text-blue-600 dark:text-blue-400',
    iconName: 'ArrowRightLeft',
  },
  boleto: {
    id: 'boleto',
    label: 'Boleto',
    color: '#d97706', // Amber/Orange
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    textClass: 'text-amber-600 dark:text-amber-400',
    iconName: 'Barcode',
  },
  other: {
    id: 'other',
    label: 'Outro Método',
    color: '#6b7280', // Gray
    bgClass: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800',
    textClass: 'text-gray-600 dark:text-gray-400',
    iconName: 'Wallet',
  },
};
