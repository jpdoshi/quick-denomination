import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CurrencyCode,
  DenominationItem,
  CalculationResult,
  DEFAULT_DENOMINATIONS,
  SplitPercentages,
  DEFAULT_SPLIT_PERCENTAGES,
} from './types';

const STORAGE_KEY = '@quick_cashier_settings_v2';

export function calculateBreakdown(
  amount: number,
  activeNotes: number[],
  splitEnabled: boolean = false,
  splitPercentages: SplitPercentages = {}
): CalculationResult {
  const safeAmount = Math.max(0, Math.floor(amount || 0));
  const sortedNotes = [...activeNotes].sort((a, b) => b - a);

  let remaining = safeAmount;
  let totalNotes = 0;
  let totalDistributed = 0;

  // If Split Mode is active and we have notes, perform 2-phase calculation
  if (splitEnabled && sortedNotes.length > 0) {
    const countMap = new Map<number, number>();
    sortedNotes.forEach((note) => countMap.set(note, 0));

    // Phase 1: Percentage allocation for notes with assigned percentages
    for (const note of sortedNotes) {
      const pct = Math.max(0, splitPercentages[note] || 0);
      if (pct > 0 && remaining > 0) {
        const targetAmount = Math.floor(safeAmount * (pct / 100));
        const count = Math.min(Math.floor(targetAmount / note), Math.floor(remaining / note));
        if (count > 0) {
          countMap.set(note, count);
          const subtotal = count * note;
          remaining -= subtotal;
          totalNotes += count;
          totalDistributed += subtotal;
        }
      }
    }

    // Phase 2: Remainder cascade using standard greedy algorithm
    if (remaining > 0) {
      for (const note of sortedNotes) {
        const additionalCount = Math.floor(remaining / note);
        if (additionalCount > 0) {
          const currentCount = countMap.get(note) || 0;
          countMap.set(note, currentCount + additionalCount);
          const subtotal = additionalCount * note;
          remaining %= note;
          totalNotes += additionalCount;
          totalDistributed += subtotal;
        }
      }
    }

    const breakdown = sortedNotes.map((note) => {
      const count = countMap.get(note) || 0;
      return {
        denomination: note,
        count,
        subtotal: count * note,
      };
    });

    return {
      breakdown,
      totalAmount: totalDistributed,
      totalNotes,
      unpayableAmount: remaining,
    };
  }

  // Default Standard Greedy Algorithm
  const breakdown = sortedNotes.map((note) => {
    const count = note > 0 ? Math.floor(remaining / note) : 0;
    const subtotal = count * note;
    remaining %= note;
    totalNotes += count;
    totalDistributed += subtotal;
    return {
      denomination: note,
      count,
      subtotal,
    };
  });

  return {
    breakdown,
    totalAmount: totalDistributed,
    totalNotes,
    unpayableAmount: remaining,
  };
}

interface SettingsContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  denominations: DenominationItem[];
  toggleDenomination: (value: number) => void;
  resetDenominations: () => void;
  showQuickAdd: boolean;
  setShowQuickAdd: (show: boolean) => void;
  toggleQuickAdd: () => void;
  splitEnabled: boolean;
  setSplitEnabled: (enabled: boolean) => void;
  toggleSplitEnabled: () => void;
  splitPercentages: SplitPercentages;
  setDenominationPercentage: (value: number, percentage: number) => void;
  setSplitPercentages: (percentages: SplitPercentages) => void;
  resetSplitPercentages: () => void;
  equalizeSplitPercentages: () => void;
  activeNotes: number[];
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('INR');
  const [denominations, setDenominations] = useState<DenominationItem[]>(DEFAULT_DENOMINATIONS);
  const [showQuickAdd, setShowQuickAddState] = useState<boolean>(true);
  const [splitEnabled, setSplitEnabledState] = useState<boolean>(false);
  const [splitPercentages, setSplitPercentagesState] = useState<SplitPercentages>(DEFAULT_SPLIT_PERCENTAGES);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.currency) setCurrencyState(parsed.currency);
          if (typeof parsed.showQuickAdd === 'boolean') {
            setShowQuickAddState(parsed.showQuickAdd);
          }
          if (typeof parsed.splitEnabled === 'boolean') {
            setSplitEnabledState(parsed.splitEnabled);
          }
          if (parsed.splitPercentages && typeof parsed.splitPercentages === 'object') {
            setSplitPercentagesState(parsed.splitPercentages);
          }
          if (Array.isArray(parsed.denominations)) {
            const storedValues = new Set(parsed.denominations.map((d: DenominationItem) => d.value));
            const merged = [
              ...parsed.denominations,
              ...DEFAULT_DENOMINATIONS.filter((d) => !storedValues.has(d.value)),
            ];
            setDenominations(merged);
          }
        }
      } catch (e) {
        console.error('Failed to load cashier settings', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const saveSettings = useCallback(
    async (
      newCurr: CurrencyCode,
      newDenoms: DenominationItem[],
      newQuickAdd: boolean,
      newSplitEnabled: boolean,
      newSplitPercentages: SplitPercentages
    ) => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            currency: newCurr,
            denominations: newDenoms,
            showQuickAdd: newQuickAdd,
            splitEnabled: newSplitEnabled,
            splitPercentages: newSplitPercentages,
          })
        );
      } catch (e) {
        console.error('Failed to persist cashier settings', e);
      }
    },
    []
  );

  const setCurrency = useCallback(
    (newCurr: CurrencyCode) => {
      setCurrencyState(newCurr);
      saveSettings(newCurr, denominations, showQuickAdd, splitEnabled, splitPercentages);
    },
    [denominations, showQuickAdd, splitEnabled, splitPercentages, saveSettings]
  );

  const toggleDenomination = useCallback(
    (value: number) => {
      setDenominations((prev) => {
        const updated = prev.map((item) =>
          item.value === value ? { ...item, active: !item.active } : item
        );
        saveSettings(currency, updated, showQuickAdd, splitEnabled, splitPercentages);
        return updated;
      });
    },
    [currency, showQuickAdd, splitEnabled, splitPercentages, saveSettings]
  );

  const setShowQuickAdd = useCallback(
    (show: boolean) => {
      setShowQuickAddState(show);
      saveSettings(currency, denominations, show, splitEnabled, splitPercentages);
    },
    [currency, denominations, splitEnabled, splitPercentages, saveSettings]
  );

  const toggleQuickAdd = useCallback(() => {
    setShowQuickAddState((prev) => {
      const next = !prev;
      saveSettings(currency, denominations, next, splitEnabled, splitPercentages);
      return next;
    });
  }, [currency, denominations, splitEnabled, splitPercentages, saveSettings]);

  const setSplitEnabled = useCallback(
    (enabled: boolean) => {
      setSplitEnabledState(enabled);
      saveSettings(currency, denominations, showQuickAdd, enabled, splitPercentages);
    },
    [currency, denominations, showQuickAdd, splitPercentages, saveSettings]
  );

  const toggleSplitEnabled = useCallback(() => {
    setSplitEnabledState((prev) => {
      const next = !prev;
      saveSettings(currency, denominations, showQuickAdd, next, splitPercentages);
      return next;
    });
  }, [currency, denominations, showQuickAdd, splitPercentages, saveSettings]);

  const setDenominationPercentage = useCallback(
    (denomValue: number, percentage: number) => {
      setSplitPercentagesState((prev) => {
        const clamped = Math.min(100, Math.max(0, Math.round(percentage)));
        const updated = { ...prev, [denomValue]: clamped };
        saveSettings(currency, denominations, showQuickAdd, splitEnabled, updated);
        return updated;
      });
    },
    [currency, denominations, showQuickAdd, splitEnabled, saveSettings]
  );

  const setSplitPercentages = useCallback(
    (percentages: SplitPercentages) => {
      setSplitPercentagesState(percentages);
      saveSettings(currency, denominations, showQuickAdd, splitEnabled, percentages);
    },
    [currency, denominations, showQuickAdd, splitEnabled, saveSettings]
  );

  const resetSplitPercentages = useCallback(() => {
    setSplitPercentagesState(DEFAULT_SPLIT_PERCENTAGES);
    saveSettings(currency, denominations, showQuickAdd, splitEnabled, DEFAULT_SPLIT_PERCENTAGES);
  }, [currency, denominations, showQuickAdd, splitEnabled, saveSettings]);

  const equalizeSplitPercentages = useCallback(() => {
    const active = denominations.filter((d) => d.active).map((d) => d.value);
    if (active.length === 0) return;
    const basePct = Math.floor(100 / active.length);
    const remainder = 100 - basePct * active.length;
    const newPercentages: SplitPercentages = {};

    active.forEach((val, index) => {
      // distribute leftover 1% among first few items so sum is exactly 100%
      newPercentages[val] = basePct + (index < remainder ? 1 : 0);
    });

    setSplitPercentagesState(newPercentages);
    saveSettings(currency, denominations, showQuickAdd, splitEnabled, newPercentages);
  }, [currency, denominations, showQuickAdd, splitEnabled, saveSettings]);

  const resetDenominations = useCallback(() => {
    setDenominations(DEFAULT_DENOMINATIONS);
    setCurrencyState('INR');
    setShowQuickAddState(true);
    setSplitEnabledState(false);
    setSplitPercentagesState(DEFAULT_SPLIT_PERCENTAGES);
    saveSettings('INR', DEFAULT_DENOMINATIONS, true, false, DEFAULT_SPLIT_PERCENTAGES);
  }, [saveSettings]);

  const activeNotes = useMemo(
    () => denominations.filter((d) => d.active).map((d) => d.value),
    [denominations]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      denominations,
      toggleDenomination,
      resetDenominations,
      showQuickAdd,
      setShowQuickAdd,
      toggleQuickAdd,
      splitEnabled,
      setSplitEnabled,
      toggleSplitEnabled,
      splitPercentages,
      setDenominationPercentage,
      setSplitPercentages,
      resetSplitPercentages,
      equalizeSplitPercentages,
      activeNotes,
      isLoaded,
    }),
    [
      currency,
      setCurrency,
      denominations,
      toggleDenomination,
      resetDenominations,
      showQuickAdd,
      setShowQuickAdd,
      toggleQuickAdd,
      splitEnabled,
      setSplitEnabled,
      toggleSplitEnabled,
      splitPercentages,
      setDenominationPercentage,
      setSplitPercentages,
      resetSplitPercentages,
      equalizeSplitPercentages,
      activeNotes,
      isLoaded,
    ]
  );

  return React.createElement(SettingsContext.Provider, { value }, children);
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export function useDenomination(initialAmount = '') {
  const settings = useSettings();
  const [rawInput, setRawInput] = useState<string>(initialAmount);

  const numericAmount = useMemo(() => {
    const cleaned = rawInput.replace(/[^0-9]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  }, [rawInput]);

  const result = useMemo(() => {
    return calculateBreakdown(
      numericAmount,
      settings.activeNotes,
      settings.splitEnabled,
      settings.splitPercentages
    );
  }, [numericAmount, settings.activeNotes, settings.splitEnabled, settings.splitPercentages]);

  const setAmountString = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    // Limit max to 10 crores (10,00,00,000) to prevent overflow
    if (cleaned.length <= 10) {
      setRawInput(cleaned);
    }
  }, []);

  const addPreset = useCallback((value: number) => {
    setRawInput((prev) => {
      const current = prev.replace(/[^0-9]/g, '');
      const currentNum = current ? parseInt(current, 10) : 0;
      const nextNum = Math.min(currentNum + value, 99999999);
      return nextNum.toString();
    });
  }, []);

  const clearAmount = useCallback(() => {
    setRawInput('');
  }, []);

  return {
    rawInput,
    numericAmount,
    setAmountString,
    addPreset,
    clearAmount,
    result,
    ...settings,
  };
}

