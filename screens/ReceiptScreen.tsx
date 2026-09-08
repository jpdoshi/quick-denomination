import { hardShadow } from '@/utils/hardShadow';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSettings } from '../hooks/useDenomination';
import { CURRENCY_CONFIGS, formatCurrencyAmount } from '../types';

const NOTE_THEMES: Record<number, { bg: string; text: string; label: string }> = {
  2000: { bg: '#FBCFE8', text: '#831843', label: 'Pink Note' },
  500: { bg: '#D9F99D', text: '#365314', label: 'Stone Green' },
  200: { bg: '#FED7AA', text: '#7C2D12', label: 'Bright Orange' },
  100: { bg: '#DDD6FE', text: '#4C1D95', label: 'Lavender' },
  50: { bg: '#BAE6FD', text: '#0C4A6E', label: 'Fluorescent Blue' },
  20: { bg: '#FEF08A', text: '#713F12', label: 'Greenish Yellow' },
  10: { bg: '#FDE68A', text: '#78350F', label: 'Chocolate' },
  5: { bg: '#A7F3D0', text: '#064E3B', label: 'Mint / ₹5 Coin' },
  2: { bg: '#E2E8F0', text: '#334155', label: 'Silver / ₹2 Coin' },
  1: { bg: '#FEF3C7', text: '#92400E', label: 'Gold / ₹1 Coin' },
};

export const ReceiptScreen: React.FC = () => {
  const { currency, denominations } = useSettings();
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [keyboardSpace, setKeyboardSpace] = useState<number>(0);

  const activeCurrencyConfig = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;

  // Filter only denominations that are active in Settings, sorted descending
  const visibleDenominations = useMemo(() => {
    return denominations
      .filter((d) => d.active)
      .sort((a, b) => b.value - a.value);
  }, [denominations]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardSpace(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardSpace(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleCountChange = useCallback((value: number, text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCounts((prev) => ({
      ...prev,
      [value]: cleaned,
    }));
  }, []);

  const adjustCount = useCallback((value: number, delta: number) => {
    setCounts((prev) => {
      const current = parseInt(prev[value] || '0', 10);
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        [value]: next === 0 ? '' : next.toString(),
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    setCounts({});
  }, []);

  // Compute total amount and note count
  const { totalAmount, totalNotes } = useMemo(() => {
    let amount = 0;
    let notes = 0;
    visibleDenominations.forEach((denom) => {
      const count = parseInt(counts[denom.value] || '0', 10);
      amount += count * denom.value;
      notes += count;
    });
    return { totalAmount: amount, totalNotes: notes };
  }, [visibleDenominations, counts]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardSpace > 0 ? keyboardSpace + 80 : 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Banner */}
        <View style={[styles.headerCard, hardShadow(4)]}>
          <View style={styles.headerLeft}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>RECEIPT DENOMINATION</Text>
            </View>
            <Text style={styles.headerTitle}>Cash Receipt Counter</Text>
          </View>

          {/* Reset All Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={resetAll}
            style={[styles.resetButton, hardShadow(2.5)]}
          >
            <Ionicons name="refresh-outline" size={16} color="#000" />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Total Summary Card */}
        <View style={[styles.summaryCard, hardShadow(4)]}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryMetric}>
              <Text style={styles.summaryMetricLabel}>TOTAL RECEIVED</Text>
              <Text style={styles.summaryMetricValue}>
                {formatCurrencyAmount(totalAmount, currency)}
              </Text>
            </View>

            <View style={[styles.notesCountBadge, hardShadow(2)]}>
              <Text style={styles.notesCountNumber}>{totalNotes}</Text>
              <Text style={styles.notesCountLabel}>
                {totalNotes === 1 ? 'NOTE' : 'NOTES'}
              </Text>
            </View>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NOTE QUANTITIES</Text>
        </View>

        {/* Note Input Fields List */}
        {visibleDenominations.length === 0 ? (
          <View style={[styles.emptyCard, hardShadow(3)]}>
            <Ionicons name="settings-outline" size={28} color="#4B5563" />
            <Text style={styles.emptyTitle}>No Active Denominations</Text>
            <Text style={styles.emptyText}>Enable notes in Settings to view receipt fields.</Text>
          </View>
        ) : (
          visibleDenominations.map((denom) => {
            const currentCountStr = counts[denom.value] || '';
            const currentCount = parseInt(currentCountStr || '0', 10);
            const subtotal = currentCount * denom.value;
            const theme = NOTE_THEMES[denom.value] || {
              bg: '#E2E8F0',
              text: '#1E293B',
              label: 'Note',
            };
            const hasCount = currentCount > 0;

            return (
              <View
                key={denom.value}
                style={[
                  styles.rowCard,
                  hasCount ? styles.rowCardActive : styles.rowCardIdle,
                  hardShadow(hasCount ? 3 : 2),
                ]}
              >
                {/* Note Badge */}
                <View
                  style={[
                    styles.noteBadge,
                    { backgroundColor: theme.bg },
                    hardShadow(2),
                  ]}
                >
                  <Text style={styles.noteBadgeSymbol}>{activeCurrencyConfig.symbol}</Text>
                  <Text style={styles.noteBadgeValue}>{denom.value}</Text>
                </View>

                <Text style={styles.multiplierText}>×</Text>

                {/* Counter Input with Stepper Controls */}
                <View style={styles.inputControlsGroup}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => adjustCount(denom.value, -1)}
                    style={[styles.stepButton, hardShadow(1.5)]}
                  >
                    <Text style={styles.stepButtonText}>−</Text>
                  </TouchableOpacity>

                  <TextInput
                    value={currentCountStr}
                    onChangeText={(txt) => handleCountChange(denom.value, txt)}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                    style={[
                      styles.countInput,
                      hasCount && styles.countInputActive,
                      hardShadow(1.5),
                    ]}
                  />

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => adjustCount(denom.value, 1)}
                    style={[styles.stepButton, hardShadow(1.5)]}
                  >
                    <Text style={styles.stepButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Subtotal Display */}
                <View style={[styles.subtotalBadge, hasCount && styles.subtotalBadgeActive]}>
                  <Text style={[styles.subtotalText, hasCount && styles.subtotalTextActive]}>
                    {formatCurrencyAmount(subtotal, currency)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default ReceiptScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF0',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#86EFAC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 2,
  },
  resetButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },
  summaryCard: {
    backgroundColor: '#FACC15',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryMetric: {
    flex: 1,
  },
  summaryMetricLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#713F12',
    letterSpacing: 1,
  },
  summaryMetricValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    marginTop: 2,
  },
  notesCountBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 80,
  },
  notesCountNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
  },
  notesCountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
  },
  rowCard: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowCardActive: {
    backgroundColor: '#FFF',
  },
  rowCardIdle: {
    backgroundColor: '#F9FAFB',
    opacity: 0.85,
  },
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 72,
    justifyContent: 'center',
  },
  noteBadgeSymbol: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
    marginRight: 2,
  },
  noteBadgeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  multiplierText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  inputControlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  stepButton: {
    backgroundColor: '#FFF',
    width: 32,
    height: 38,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  countInput: {
    width: 60,
    height: 38,
    backgroundColor: '#FFF',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    includeFontPadding: false,
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    paddingHorizontal: 4,
  },
  countInputActive: {
    backgroundColor: '#FEF08A',
  },
  subtotalBadge: {
    minWidth: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  subtotalBadgeActive: {
    borderRadius: 4,
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B7280',
  },
  subtotalTextActive: {
    color: '#000',
    fontWeight: '900',
  },
});
