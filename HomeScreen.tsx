import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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
import { CURRENCY_CONFIGS, formatCurrencyAmount } from './types';
import { useDenomination } from './useDenomination';

// Hard flat Neubrutalist shadow definition for universal cross-platform rendering
const hardShadow = (offset = 3, bg = '#000') => ({
  borderWidth: 2.5,
  borderColor: '#000',
  ...Platform.select({
    web: {
      boxShadow: `${offset}px ${offset}px 0px 0px ${bg}`,
    },
    default: {
      shadowColor: bg,
      shadowOffset: { width: offset, height: offset },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
  }),
});

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

interface HomeScreenProps {
  isActive?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ isActive = true }) => {
  const inputRef = useRef<TextInput>(null);
  const [keyboardSpace, setKeyboardSpace] = useState<number>(0);
  const {
    rawInput,
    numericAmount,
    setAmountString,
    addPreset,
    clearAmount,
    result,
    currency,
    showQuickAdd,
    splitEnabled,
    toggleSplitEnabled,
    splitPercentages,
  } = useDenomination();

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

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const activeCurrencyConfig = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;

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
              <Text style={styles.headerBadgeText}>TELLER DESK</Text>
            </View>
            <Text style={styles.headerTitle}>Cash Payment Counter</Text>
          </View>
        </View>

        {/* Amount Input Card */}
        <View style={[styles.inputCard, hardShadow(4)]}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>CHEQUE / CASH AMOUNT</Text>
            {numericAmount > 0 && (
              <View style={styles.livePreviewBadge}>
                <Text style={styles.livePreviewText}>
                  {formatCurrencyAmount(numericAmount, currency)}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.inputRow, !showQuickAdd && { marginBottom: 0 }]}>
            <View style={[styles.currencySymbolBadge, hardShadow(2)]}>
              <Text style={styles.currencySymbolText}>{activeCurrencyConfig.symbol}</Text>
            </View>

            <TextInput
              ref={inputRef}
              value={rawInput}
              onChangeText={setAmountString}
              placeholder="Enter Amount"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              style={styles.textInput}
              maxLength={10}
            />

            {rawInput.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={clearAmount}
                style={[styles.clearCharButton, hardShadow(2)]}
              >
                <Text style={styles.clearCharText}>C</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Add Presets */}
          {showQuickAdd && (
            <View style={styles.presetsContainer}>
              <Text style={styles.presetsLabel}>QUICK ADD:</Text>
              <View style={styles.presetButtonsRow}>
                {[
                  { label: '+1K', value: 1000, color: '#86EFAC' },
                  { label: '+5K', value: 5000, color: '#67E8F9' },
                  { label: '+10K', value: 10000, color: '#FDE047' },
                  { label: '+50K', value: 50000, color: '#FDA4AF' },
                ].map((preset) => (
                  <TouchableOpacity
                    key={preset.value}
                    activeOpacity={0.8}
                    onPress={() => addPreset(preset.value)}
                    style={[
                      styles.presetButton,
                      { backgroundColor: preset.color },
                      hardShadow(2),
                    ]}
                  >
                    <Text style={styles.presetButtonText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Split Dispense Mode Toggle Card */}
        <View style={[styles.splitCard, hardShadow(4)]}>
          <View style={styles.splitCardHeader}>
            <View style={styles.splitCardLeft}>
              <View style={styles.splitCardTitleRow}>
                <Ionicons
                  name={splitEnabled ? 'pie-chart' : 'pie-chart-outline'}
                  size={18}
                  color={splitEnabled ? '#831843' : '#000'}
                />
                <Text style={styles.splitCardTitle}>SPLIT DISPENSE MODE</Text>
              </View>
              <Text style={styles.splitPreviewLabel}>CURRENT ALLOCATIONS</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleSplitEnabled}
              style={[
                styles.splitToggleBtn,
                splitEnabled ? styles.splitToggleBtnOn : styles.splitToggleBtnOff,
                hardShadow(1.5),
              ]}
            >
              <View
                style={[
                  styles.splitToggleThumb,
                  splitEnabled ? styles.splitToggleThumbOn : styles.splitToggleThumbOff,
                ]}
              />
              <Text
                style={[
                  styles.splitToggleText,
                  splitEnabled ? styles.splitToggleTextOn : styles.splitToggleTextOff,
                ]}
              >
                {splitEnabled ? 'ACTIVE' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active Split Percentages Preview Chips */}
          {splitEnabled && (
            <View style={styles.splitPreviewContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.splitChipsRow}
              >
                {Object.entries(splitPercentages)
                  .filter(([_, pct]) => pct > 0)
                  .sort(([a], [b]) => parseInt(b, 10) - parseInt(a, 10))
                  .map(([val, pct]) => (
                    <View key={val} style={[styles.splitChip, hardShadow(1)]}>
                      <Text style={styles.splitChipDenom}>
                        {activeCurrencyConfig.symbol}{val}:
                      </Text>
                      <Text style={styles.splitChipPct}>{pct}%</Text>
                    </View>
                  ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, hardShadow(4)]}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryMetric}>
              <View style={styles.summaryLabelRow}>
                <Text style={styles.summaryMetricLabel}>TOTAL PAYABLE</Text>
              </View>
              <Text style={styles.summaryMetricValue}>
                {formatCurrencyAmount(result.totalAmount, currency)}
              </Text>
            </View>

            <View style={[styles.notesCountBadge, hardShadow(2)]}>
              <Text style={styles.notesCountNumber}>{result.totalNotes}</Text>
              <Text style={styles.notesCountLabel}>
                {result.totalNotes === 1 ? 'NOTE' : 'NOTES'}
              </Text>
            </View>
          </View>

          {/* Unpayable Warning */}
          {result.unpayableAmount > 0 && (
            <View style={[styles.unpayableAlert, hardShadow(2)]}>
              <Ionicons name="warning-outline" size={20} color="#7F1D1D" />
              <View style={styles.unpayableTextGroup}>
                <Text style={styles.unpayableTitle}>
                  Unpayable Balance: {formatCurrencyAmount(result.unpayableAmount, currency)}
                </Text>
                <Text style={styles.unpayableSubtitle}>
                  Amount is not divisible by active denominations. Adjust or issue coins.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Denomination Breakdown Title */}
        <View style={styles.breakdownHeader}>
          <Text style={styles.breakdownTitle}>DENOMINATION BREAKDOWN</Text>
        </View>

        {/* Breakdown List - Only show denominations that need to be paid */}
        {result.breakdown.length === 0 ? (
          <View style={[styles.emptyCard, hardShadow(3)]}>
            <Ionicons name="settings-outline" size={28} color="#4B5563" />
            <Text style={styles.emptyTitle}>No Active Denominations</Text>
            <Text style={styles.emptyText}>Enable notes in Settings to compute breakdown.</Text>
          </View>
        ) : result.breakdown.filter((item) => item.count > 0).length === 0 ? (
          <View style={[styles.emptyCard, hardShadow(3)]}>
            <Ionicons name="cash-outline" size={28} color="#4B5563" />
            <Text style={styles.emptyTitle}>
              {numericAmount > 0 ? 'No Matching Notes' : 'No Notes to Dispense'}
            </Text>
            <Text style={styles.emptyText}>
              {numericAmount > 0
                ? 'Amount cannot be satisfied by enabled denominations.'
                : 'Enter a cheque or cash amount above to see required notes.'}
            </Text>
          </View>
        ) : (
          result.breakdown
            .filter((item) => item.count > 0)
            .map((item) => {
              const theme = NOTE_THEMES[item.denomination] || {
                bg: '#E2E8F0',
                text: '#1E293B',
                label: 'Note',
              };

              return (
                <View
                  key={item.denomination}
                  style={[styles.noteCard, styles.noteCardActive, hardShadow(3)]}
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
                    <Text style={styles.noteBadgeValue}>{item.denomination}</Text>
                  </View>

                  {/* Calculation math */}
                  <View style={styles.noteFormulaGroup}>
                    <Text style={styles.noteFormulaText}>
                      {activeCurrencyConfig.symbol}
                      {item.denomination} × {item.count}
                    </Text>
                    <Text style={styles.noteSubtotalText}>
                      ={' '}
                      {formatCurrencyAmount(item.subtotal, currency)}
                    </Text>
                  </View>

                  {/* Note count pill */}
                  <View
                    style={[styles.noteCountPill, styles.noteCountPillActive, hardShadow(2)]}
                  >
                    <Text style={[styles.noteCountText, styles.noteCountTextActive]}>
                      {item.count}
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

export default HomeScreen;

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
    backgroundColor: '#FACC15',
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
    fontWeight: '600',
    color: '#1F2937',
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
  inputCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  livePreviewBadge: {
    backgroundColor: '#67E8F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#000',
  },
  livePreviewText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  currencySymbolBadge: {
    backgroundColor: '#FDE047',
    width: 48,
    height: 52,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbolText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
  },
  textInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#F9FAFB',
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    fontSize: 26,
    fontWeight: '900',
    color: '#000',
  },
  clearCharButton: {
    backgroundColor: '#F87171',
    width: 48,
    height: 52,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearCharText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
  },
  presetsContainer: {
    borderTopWidth: 2,
    borderTopColor: '#000',
    paddingTop: 12,
  },
  presetsLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#4B5563',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
  },
  summaryCard: {
    backgroundColor: '#86EFAC',
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
    color: '#064E3B',
    letterSpacing: 1,
  },
  summaryMetricValue: {
    fontSize: 30,
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
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
  },
  notesCountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
  },
  unpayableAlert: {
    marginTop: 12,
    backgroundColor: '#FECDD3',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unpayableTextGroup: {
    flex: 1,
  },
  unpayableTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#7F1D1D',
  },
  unpayableSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 1,
  },
  breakdownHeader: {
    marginBottom: 10,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  breakdownSubtitle: {
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
  noteCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteCardActive: {
    backgroundColor: '#FFF',
  },
  noteCardZero: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 85,
    justifyContent: 'center',
  },
  noteBadgeSymbol: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    marginRight: 2,
  },
  noteBadgeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  noteFormulaGroup: {
    flex: 1,
    marginLeft: 14,
  },
  noteFormulaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  noteSubtotalText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
    marginTop: 2,
  },
  noteCountPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 54,
    alignItems: 'center',
  },
  noteCountPillActive: {
    backgroundColor: '#FACC15',
  },
  noteCountPillZero: {
    backgroundColor: '#E5E7EB',
  },
  noteCountText: {
    fontSize: 18,
    fontWeight: '900',
  },
  noteCountTextActive: {
    color: '#000',
  },
  noteCountTextZero: {
    color: '#9CA3AF',
  },
  splitCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  splitCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  splitCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  splitCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  splitCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  splitModeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#000',
  },
  splitModeBadgeOn: {
    backgroundColor: '#FBCFE8',
  },
  splitModeBadgeOff: {
    backgroundColor: '#E5E7EB',
  },
  splitModeBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  splitModeBadgeTextOn: {
    color: '#831843',
  },
  splitModeBadgeTextOff: {
    color: '#4B5563',
  },
  splitCardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  splitToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  splitToggleBtnOn: {
    backgroundColor: '#86EFAC',
  },
  splitToggleBtnOff: {
    backgroundColor: '#E5E7EB',
  },
  splitToggleThumb: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  splitToggleThumbOn: {
    backgroundColor: '#065F46',
  },
  splitToggleThumbOff: {
    backgroundColor: '#9CA3AF',
  },
  splitToggleText: {
    fontSize: 11,
    fontWeight: '900',
  },
  splitToggleTextOn: {
    color: '#064E3B',
  },
  splitToggleTextOff: {
    color: '#6B7280',
  },
  splitPreviewContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: '#E5E7EB',
  },
  splitPreviewLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  splitChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  splitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  splitChipDenom: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
  },
  splitChipPct: {
    fontSize: 11,
    fontWeight: '900',
    color: '#854D0E',
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#000',
  },
  modePillSplit: {
    backgroundColor: '#FBCFE8',
  },
  modePillGreedy: {
    backgroundColor: '#FEF08A',
  },
  modePillText: {
    fontSize: 9,
    fontWeight: '900',
  },
  modePillTextSplit: {
    color: '#831843',
  },
  modePillTextGreedy: {
    color: '#713F12',
  },
});
