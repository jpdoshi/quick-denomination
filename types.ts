export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  name: string;
}

export interface DenominationItem {
  value: number;
  active: boolean;
  label?: string;
}

export interface DenominationBreakdown {
  denomination: number;
  count: number;
  subtotal: number;
}

export interface CalculationResult {
  breakdown: DenominationBreakdown[];
  totalAmount: number;
  totalNotes: number;
  unpayableAmount: number;
}

export type SplitPercentages = Record<number, number>;

export const DEFAULT_SPLIT_PERCENTAGES: SplitPercentages = {
  500: 50,
  200: 30,
  100: 20,
};

export interface SettingsState {
  currency: CurrencyCode;
  denominations: DenominationItem[];
  showQuickAdd: boolean;
  splitEnabled: boolean;
  splitPercentages: SplitPercentages;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
};

export const DEFAULT_DENOMINATIONS: DenominationItem[] = [
  { value: 2000, active: false, label: '₹2000 (Withdrawn)' },
  { value: 500, active: true, label: '₹500' },
  { value: 200, active: true, label: '₹200' },
  { value: 100, active: true, label: '₹100' },
  { value: 50, active: true, label: '₹50' },
  { value: 20, active: true, label: '₹20' },
  { value: 10, active: true, label: '₹10' },
  { value: 5, active: true, label: '₹5' },
  { value: 2, active: true, label: '₹2' },
  { value: 1, active: true, label: '₹1' },
];

export const formatCurrencyAmount = (
  amount: number,
  currencyCode: CurrencyCode = 'INR'
): string => {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.INR;
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${config.symbol}${formattedNumber}`;
};

export const formatOnlyNumber = (
  amount: number,
  currencyCode: CurrencyCode = 'INR'
): string => {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.INR;
  return new Intl.NumberFormat(config.locale, {
    maximumFractionDigits: 0,
  }).format(amount);
};
