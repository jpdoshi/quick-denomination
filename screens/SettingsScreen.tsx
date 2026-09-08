import { hardShadow } from '@/utils/hardShadow';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSettings } from '../hooks/useDenomination';
import { CURRENCY_CONFIGS, CurrencyCode } from '../types';

const CURRENCIES: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP'];

export const SettingsScreen: React.FC = () => {
  const {
    currency,
    setCurrency,
    denominations,
    toggleDenomination,
    resetDenominations,
    showQuickAdd,
    toggleQuickAdd,
    splitEnabled,
    toggleSplitEnabled,
    splitPercentages,
    setSplitPercentages,
  } = useSettings();

  const activeDenominations = useMemo(() => {
    return denominations.filter((d) => d.active).sort((a, b) => b.value - a.value);
  }, [denominations]);

  // Local draft state for selected notes and their draft percentages
  const [selectedNotes, setSelectedNotes] = useState<number[]>(() => {
    const active = denominations.filter((d) => d.active).map((d) => d.value);
    const selected = active.filter((val) => (splitPercentages[val] || 0) > 0);
    return selected.length > 0 ? selected : active.slice(0, 3);
  });

  const [draftPercentages, setDraftPercentages] = useState<Record<number, number>>(
    () => ({ ...splitPercentages })
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync draft when splitPercentages from context updates
  useEffect(() => {
    setDraftPercentages({ ...splitPercentages });
    const active = denominations.filter((d) => d.active).map((d) => d.value);
    const selected = active.filter((val) => (splitPercentages[val] || 0) > 0);
    if (selected.length > 0) {
      setSelectedNotes(selected);
    }
  }, [splitPercentages, denominations]);

  // Calculate live sum of draft percentages for selected notes
  const totalPercentage = useMemo(() => {
    return selectedNotes.reduce((sum, val) => sum + (draftPercentages[val] || 0), 0);
  }, [selectedNotes, draftPercentages]);

  const isExact100 = totalPercentage === 100;

  const toggleNoteSelection = (val: number) => {
    if (selectedNotes.includes(val)) {
      setSelectedNotes((prev) => prev.filter((item) => item !== val));
      setDraftPercentages((prev) => ({ ...prev, [val]: 0 }));
    } else {
      setSelectedNotes((prev) => [...prev, val].sort((a, b) => b - a));
      setDraftPercentages((prev) => ({
        ...prev,
        [val]: prev[val] || 0,
      }));
    }
  };

  const updateDraftPercentage = (denomValue: number, newPct: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(newPct)));
    setDraftPercentages((prev) => ({
      ...prev,
      [denomValue]: clamped,
    }));
  };

  const adjustDraftPercentage = (denomValue: number, delta: number) => {
    const current = draftPercentages[denomValue] || 0;
    updateDraftPercentage(denomValue, current + delta);
  };

  const handleAutoBalance = () => {
    if (selectedNotes.length === 0) return;
    const base = Math.floor(100 / selectedNotes.length);
    const remainder = 100 - base * selectedNotes.length;
    const newPercentages: Record<number, number> = {};

    activeDenominations.forEach((d) => {
      newPercentages[d.value] = 0;
    });

    selectedNotes.forEach((val, idx) => {
      newPercentages[val] = base + (idx < remainder ? 1 : 0);
    });

    setDraftPercentages(newPercentages);
  };

  const handleApplyBankPreset = () => {
    const bankNotes = [500, 200, 100].filter((val) =>
      activeDenominations.some((d) => d.value === val)
    );
    setSelectedNotes(bankNotes);
    const newPercentages: Record<number, number> = {};
    activeDenominations.forEach((d) => {
      newPercentages[d.value] = 0;
    });
    if (bankNotes.includes(500)) newPercentages[500] = 50;
    if (bankNotes.includes(200)) newPercentages[200] = 30;
    if (bankNotes.includes(100)) newPercentages[100] = 20;
    setDraftPercentages(newPercentages);
  };

  const handleResetToSaved = () => {
    setDraftPercentages({ ...splitPercentages });
    const active = denominations.filter((d) => d.active).map((d) => d.value);
    const selected = active.filter((val) => (splitPercentages[val] || 0) > 0);
    if (selected.length > 0) {
      setSelectedNotes(selected);
    }
  };

  const handleSavePreset = () => {
    if (!isExact100) return;

    const cleanPercentages: Record<number, number> = {};
    activeDenominations.forEach((d) => {
      cleanPercentages[d.value] = selectedNotes.includes(d.value)
        ? draftPercentages[d.value] || 0
        : 0;
    });

    setSplitPercentages(cleanPercentages);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.headerCard, hardShadow(4)]}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>PREFERENCES</Text>
          </View>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Currency Selector Section */}
        <View style={[styles.sectionCard, hardShadow(4)]}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="cash-outline" size={20} color="#000" />
            <Text style={styles.sectionTitle}>CURRENCY SYSTEM</Text>
          </View>

          <View style={styles.currencyChipsGrid}>
            {CURRENCIES.map((code) => {
              const cfg = CURRENCY_CONFIGS[code];
              const isSelected = currency === code;

              return (
                <TouchableOpacity
                  key={code}
                  activeOpacity={0.8}
                  onPress={() => setCurrency(code)}
                  style={[
                    styles.currencyChip,
                    isSelected ? styles.currencyChipSelected : styles.currencyChipUnselected,
                    hardShadow(isSelected ? 3 : 2),
                  ]}
                >
                  <Text
                    style={[
                      styles.currencySymbol,
                      isSelected ? styles.currencySymbolSelected : styles.currencySymbolUnselected,
                    ]}
                  >
                    {cfg.symbol}
                  </Text>
                  <View>
                    <Text
                      style={[
                        styles.currencyCode,
                        isSelected ? styles.currencyCodeSelected : styles.currencyCodeUnselected,
                      ]}
                    >
                      {cfg.code}
                    </Text>
                    <Text
                      style={[
                        styles.currencyName,
                        isSelected ? styles.currencyNameSelected : styles.currencyNameUnselected,
                      ]}
                    >
                      {cfg.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Add Presets Feature */}
        <View style={[styles.sectionCard, hardShadow(4)]}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="flash-outline" size={20} color="#000" />
            <Text style={styles.sectionTitle}>QUICK-ADD PRESETS</Text>
          </View>

          <View
            style={[
              styles.denomRow,
              showQuickAdd ? styles.denomRowActive : styles.denomRowInactive,
              hardShadow(2),
            ]}
          >
            <View style={styles.denomLeft}>
              <View style={styles.denomMeta}>
                <Text style={styles.denomLabel}>Quick Add Buttons</Text>
                <Text style={styles.denomSubLabelText}>
                  {showQuickAdd ? 'Visible on Cashier Counter' : 'Hidden from Cashier Counter'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleQuickAdd}
              style={[
                styles.toggleButton,
                showQuickAdd ? styles.toggleButtonOn : styles.toggleButtonOff,
                hardShadow(1.5),
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  showQuickAdd ? styles.toggleThumbOn : styles.toggleThumbOff,
                ]}
              />
              <Text
                style={[
                  styles.toggleText,
                  showQuickAdd ? styles.toggleTextOn : styles.toggleTextOff,
                ]}
              >
                {showQuickAdd ? 'ACTIVE' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Percentage Split Section */}
        <View style={[styles.sectionCard, hardShadow(4)]}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="pie-chart-outline" size={20} color="#000" />
            <Text style={styles.sectionTitle}>PERCENTAGE SPLIT CONFIGURATION</Text>
          </View>

          {/* Master Split Feature Toggle */}
          <View
            style={[
              styles.denomRow,
              splitEnabled ? styles.denomRowActive : styles.denomRowInactive,
              hardShadow(2),
              { marginBottom: 14 },
            ]}
          >
            <View style={styles.denomLeft}>
              <View style={styles.denomMeta}>
                <Text style={styles.denomLabel}>Split Dispense Feature</Text>
                <Text style={styles.denomSubLabelText}>
                  {splitEnabled ? 'Split Denomination' : 'Standard denomination'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleSplitEnabled}
              style={[
                styles.toggleButton,
                splitEnabled ? styles.toggleButtonOn : styles.toggleButtonOff,
                hardShadow(1.5),
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  splitEnabled ? styles.toggleThumbOn : styles.toggleThumbOff,
                ]}
              />
              <Text
                style={[
                  styles.toggleText,
                  splitEnabled ? styles.toggleTextOn : styles.toggleTextOff,
                ]}
              >
                {splitEnabled ? 'ACTIVE' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Step 1: Check buttons for notes */}
          <View style={styles.splitSubSection}>
            <View style={styles.splitStepHeader}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepHeaderTextGroup}>
                <Text style={styles.stepTitle}>SELECT NOTES TO SPLIT</Text>
              </View>
            </View>

            <View style={styles.checkButtonsGrid}>
              {activeDenominations.map((denom) => {
                const isSelected = selectedNotes.includes(denom.value);
                return (
                  <TouchableOpacity
                    key={denom.value}
                    activeOpacity={0.8}
                    onPress={() => toggleNoteSelection(denom.value)}
                    style={[
                      styles.checkButton,
                      isSelected ? styles.checkButtonSelected : styles.checkButtonUnselected,
                      hardShadow(isSelected ? 2 : 1),
                    ]}
                  >
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={isSelected ? '#000' : '#4B5563'}
                    />
                    <Text
                      style={[
                        styles.checkButtonText,
                        isSelected ? styles.checkButtonTextSelected : styles.checkButtonTextUnselected,
                      ]}
                    >
                      {CURRENCY_CONFIGS[currency]?.symbol || '₹'}{denom.value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Step 2: Configure percentages for selected notes */}
          <View style={styles.splitSubSection}>
            <View style={styles.splitStepHeader}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepHeaderTextGroup}>
                <Text style={styles.stepTitle}>ADJUST NOTE PERCENTAGES</Text>
              </View>
            </View>

            {selectedNotes.length === 0 ? (
              <View style={[styles.emptySelectedCard, hardShadow(1.5)]}>
                <Ionicons name="checkbox-outline" size={24} color="#6B7280" />
                <Text style={styles.emptySelectedTitle}>No Notes Selected</Text>
                <Text style={styles.emptySelectedText}>
                  Check at least one note in Step 1 above to configure its percentage.
                </Text>
              </View>
            ) : (
              <View style={styles.sliderCardsList}>
                {selectedNotes.map((denomVal) => {
                  const denomItem = activeDenominations.find((d) => d.value === denomVal);
                  const pct = draftPercentages[denomVal] || 0;

                  return (
                    <View
                      key={denomVal}
                      style={[styles.sliderCard, hardShadow(2)]}
                    >
                      <View style={styles.sliderCardHeader}>
                        <View style={styles.sliderCardLeft}>
                          <View
                            style={[
                              styles.denomBadge,
                              { backgroundColor: '#FACC15' },
                              hardShadow(1.5),
                            ]}
                          >
                            <Text style={styles.denomBadgeText}>
                              {CURRENCY_CONFIGS[currency]?.symbol || '₹'}
                              {denomVal}
                            </Text>
                          </View>
                          <Text style={styles.sliderNoteLabel} numberOfLines={1}>
                            {denomItem?.label || `${CURRENCY_CONFIGS[currency]?.symbol}${denomVal} Note`}
                          </Text>
                        </View>

                        <View style={styles.percentControlRow}>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => adjustDraftPercentage(denomVal, -1)}
                            style={[styles.stepperMiniBtn, hardShadow(1)]}
                          >
                            <Ionicons name="remove" size={16} color="#000" />
                          </TouchableOpacity>

                          <View style={[styles.percentInputBox, hardShadow(1.5)]}>
                            <TextInput
                              value={pct > 0 ? pct.toString() : '0'}
                              onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9]/g, '');
                                const val = cleaned ? parseInt(cleaned, 10) : 0;
                                updateDraftPercentage(denomVal, val);
                              }}
                              keyboardType="number-pad"
                              maxLength={3}
                              style={styles.percentTextInput}
                              selectTextOnFocus
                            />
                            <Text style={styles.percentSuffixText}>%</Text>
                          </View>

                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => adjustDraftPercentage(denomVal, 1)}
                            style={[styles.stepperMiniBtn, hardShadow(1)]}
                          >
                            <Ionicons name="add" size={16} color="#000" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Visual Progress Fill Bar */}
                      <View style={styles.noteProgressTrack}>
                        <View
                          style={[
                            styles.noteProgressFill,
                            {
                              width: `${Math.min(100, Math.max(0, pct))}%`,
                              backgroundColor: pct > 0 ? '#FACC15' : '#E5E7EB',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Step 3: Preset Validation & Save */}
          <View style={styles.splitSubSection}>
            <View style={styles.splitStepHeader}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepHeaderTextGroup}>
                <Text style={styles.stepTitle}>VALIDATE & SAVE PRESET</Text>
              </View>
            </View>

            {/* Validation Banner */}
            <View
              style={[
                styles.validationBanner,
                isExact100
                  ? styles.validationBannerGreen
                  : totalPercentage < 100
                    ? styles.validationBannerAmber
                    : styles.validationBannerRed,
                hardShadow(2),
              ]}
            >
              <Ionicons
                name={
                  isExact100
                    ? 'checkmark-circle'
                    : totalPercentage < 100
                      ? 'warning'
                      : 'alert-circle'
                }
                size={22}
                color={
                  isExact100
                    ? '#065F46'
                    : totalPercentage < 100
                      ? '#92400E'
                      : '#991B1B'
                }
              />
              <View style={styles.validationTextGroup}>
                <Text
                  style={[
                    styles.validationTitle,
                    isExact100
                      ? styles.validationTitleGreen
                      : totalPercentage < 100
                        ? styles.validationTitleAmber
                        : styles.validationTitleRed,
                  ]}
                >
                  {isExact100
                    ? 'TOTAL: 100% (BALANCED)'
                    : totalPercentage < 100
                      ? `TOTAL: ${totalPercentage}% (${100 - totalPercentage}% SHORT OF 100%)`
                      : `TOTAL: ${totalPercentage}% (EXCEEDS 100% BY ${totalPercentage - 100}%)`}
                </Text>
                <Text
                  style={[
                    styles.validationSubtitle,
                    isExact100
                      ? styles.validationSubtitleGreen
                      : totalPercentage < 100
                        ? styles.validationSubtitleAmber
                        : styles.validationSubtitleRed,
                  ]}
                >
                  {isExact100
                    ? 'Preset is perfectly balanced! Tap Save Split Preset below.'
                    : totalPercentage < 100
                      ? 'Cannot save: total must not be less than 100%. Tap "Auto-Balance" or adjust sliders.'
                      : 'Cannot save: total must not exceed 100%. Reduce sliders or tap "Auto-Balance".'}
                </Text>
              </View>
            </View>

            {/* Allocation Progress Bar */}
            <View style={[styles.progressBarTrack, { marginBottom: 12 }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, totalPercentage)}%`,
                    backgroundColor: isExact100
                      ? '#10B981'
                      : totalPercentage < 100
                        ? '#F59E0B'
                        : '#EF4444',
                  },
                ]}
              />
            </View>

            {/* Quick Helper Tools */}
            <View style={styles.presetButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleAutoBalance}
                style={[styles.splitPresetBtn, { backgroundColor: '#BAE6FD' }, hardShadow(1.5)]}
              >
                <Ionicons name="git-merge-outline" size={15} color="#000" />
                <Text style={styles.splitPresetBtnText}>Auto-Balance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleApplyBankPreset}
                style={[styles.splitPresetBtn, { backgroundColor: '#FDE047' }, hardShadow(1.5)]}
              >
                <Ionicons name="sparkles-outline" size={15} color="#000" />
                <Text style={styles.splitPresetBtnText}>50/30/20 Bank</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleResetToSaved}
                style={[styles.splitPresetBtn, { backgroundColor: '#F3F4F6' }, hardShadow(1.5)]}
              >
                <Ionicons name="refresh-outline" size={15} color="#000" />
                <Text style={styles.splitPresetBtnText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Save Preset Button */}
            <TouchableOpacity
              activeOpacity={isExact100 ? 0.8 : 1}
              onPress={handleSavePreset}
              disabled={!isExact100}
              style={[
                styles.savePresetButton,
                isExact100 ? styles.savePresetButtonActive : styles.savePresetButtonDisabled,
                isExact100 && hardShadow(3),
              ]}
            >
              <Ionicons
                name={isExact100 ? 'checkmark-circle' : 'lock-closed-outline'}
                size={20}
                color={isExact100 ? '#000' : '#6B7280'}
              />
              <Text
                style={[
                  styles.savePresetButtonText,
                  isExact100
                    ? styles.savePresetButtonTextActive
                    : styles.savePresetButtonTextDisabled,
                ]}
              >
                {isExact100
                  ? 'SAVE SPLIT PRESET'
                  : `CANNOT SAVE (TOTAL ${totalPercentage}%, MUST BE 100%)`}
              </Text>
            </TouchableOpacity>

            {/* Save Success Alert */}
            {savedSuccess && (
              <View style={[styles.savedSuccessCard, hardShadow(2)]}>
                <Ionicons name="checkmark-done-circle" size={20} color="#065F46" />
                <Text style={styles.savedSuccessText}>
                  Split preset saved successfully! Active on Cashier counter.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Denomination Manager Section */}
        <View style={[styles.sectionCard, hardShadow(4)]}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="list-circle-outline" size={22} color="#000" />
            <Text style={styles.sectionTitle}>DENOMINATION MANAGER</Text>
          </View>

          <View style={styles.denominationsList}>
            {denominations.map((denom) => {
              const is2000 = denom.value === 2000;
              return (
                <View
                  key={denom.value}
                  style={[
                    styles.denomRow,
                    denom.active ? styles.denomRowActive : styles.denomRowInactive,
                    hardShadow(2),
                  ]}
                >
                  <View style={styles.denomLeft}>
                    <View
                      style={[
                        styles.denomBadge,
                        { backgroundColor: denom.active ? '#FACC15' : '#E5E7EB' },
                        hardShadow(1.5),
                      ]}
                    >
                      <Text style={styles.denomBadgeText}>
                        {CURRENCY_CONFIGS[currency]?.symbol || '₹'}
                        {denom.value}
                      </Text>
                    </View>
                    <View style={styles.denomMeta}>
                      <Text style={styles.denomLabel}>
                        {denom.label || `${CURRENCY_CONFIGS[currency]?.symbol}${denom.value} Note`}
                      </Text>
                      {is2000 && (
                        <Text style={styles.denomSubLabel}>Withdrawn from regular circulation</Text>
                      )}
                    </View>
                  </View>

                  {/* Neubrutalist Toggle Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleDenomination(denom.value)}
                    style={[
                      styles.toggleButton,
                      denom.active ? styles.toggleButtonOn : styles.toggleButtonOff,
                      hardShadow(1.5),
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        denom.active ? styles.toggleThumbOn : styles.toggleThumbOff,
                      ]}
                    />
                    <Text
                      style={[
                        styles.toggleText,
                        denom.active ? styles.toggleTextOn : styles.toggleTextOff,
                      ]}
                    >
                      {denom.active ? 'ACTIVE' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Reset button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={resetDenominations}
            style={[styles.resetDefaultsButton, hardShadow(2.5)]}
          >
            <Ionicons name="refresh-circle-outline" size={20} color="#000" />
            <Text style={styles.resetDefaultsText}>RESET TO BANK DEFAULTS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

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
    backgroundColor: '#67E8F9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
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
    color: '#0F172A',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 14,
    lineHeight: 18,
  },
  currencyChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  currencyChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  currencyChipSelected: {
    backgroundColor: '#FACC15',
  },
  currencyChipUnselected: {
    backgroundColor: '#F9FAFB',
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '900',
  },
  currencySymbolSelected: {
    color: '#000',
  },
  currencySymbolUnselected: {
    color: '#6B7280',
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '900',
  },
  currencyCodeSelected: {
    color: '#000',
  },
  currencyCodeUnselected: {
    color: '#374151',
  },
  currencyName: {
    fontSize: 10,
    fontWeight: '700',
  },
  currencyNameSelected: {
    color: '#1F2937',
  },
  currencyNameUnselected: {
    color: '#9CA3AF',
  },
  denominationsList: {
    gap: 10,
    marginBottom: 16,
  },
  denomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  denomRowActive: {
    backgroundColor: '#FFF',
  },
  denomRowInactive: {
    backgroundColor: '#F3F4F6',
    opacity: 0.8,
  },
  denomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  denomBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  denomBadgeText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
  },
  denomMeta: {
    flex: 1,
  },
  denomLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },
  denomSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 1,
  },
  denomSubLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 1,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  toggleButtonOn: {
    backgroundColor: '#86EFAC',
  },
  toggleButtonOff: {
    backgroundColor: '#E5E7EB',
  },
  toggleThumb: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  toggleThumbOn: {
    backgroundColor: '#065F46',
  },
  toggleThumbOff: {
    backgroundColor: '#9CA3AF',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '900',
  },
  toggleTextOn: {
    color: '#064E3B',
  },
  toggleTextOff: {
    color: '#6B7280',
  },
  resetDefaultsButton: {
    backgroundColor: '#FED7AA',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  resetDefaultsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  splitSubSection: {
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
  },
  splitStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
  },
  stepHeaderTextGroup: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  stepSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 1,
  },
  checkButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  checkButtonSelected: {
    backgroundColor: '#86EFAC',
  },
  checkButtonUnselected: {
    backgroundColor: '#FFF',
  },
  checkButtonText: {
    fontSize: 13,
    fontWeight: '900',
  },
  checkButtonTextSelected: {
    color: '#000',
  },
  checkButtonTextUnselected: {
    color: '#4B5563',
  },
  emptySelectedCard: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  emptySelectedTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
    marginTop: 4,
  },
  emptySelectedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  sliderCardsList: {
    gap: 5,
  },
  sliderCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
  },
  sliderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sliderNoteLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },
  splitPctPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 52,
    alignItems: 'center',
  },
  splitPctPillActive: {
    backgroundColor: '#FACC15',
  },
  splitPctPillZero: {
    backgroundColor: '#E5E7EB',
  },
  splitPctPillText: {
    fontSize: 14,
    fontWeight: '900',
  },
  splitPctPillTextActive: {
    color: '#000',
  },
  splitPctPillTextZero: {
    color: '#9CA3AF',
  },
  noteProgressTrack: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#000',
    overflow: 'hidden',
    marginVertical: 8,
  },
  noteProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  percentInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FACC15',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 34,
    minWidth: 58,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  percentTextInput: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
    padding: 0,
    textAlign: 'center',
    minWidth: 26,
  },
  percentSuffixText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
    marginLeft: 1,
  },
  validationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  validationBannerGreen: {
    backgroundColor: '#DCFCE7',
  },
  validationBannerAmber: {
    backgroundColor: '#FEF3C7',
  },
  validationBannerRed: {
    backgroundColor: '#FEE2E2',
  },
  validationTextGroup: {
    flex: 1,
  },
  validationTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  validationTitleGreen: {
    color: '#065F46',
  },
  validationTitleAmber: {
    color: '#92400E',
  },
  validationTitleRed: {
    color: '#991B1B',
  },
  validationSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 14,
  },
  validationSubtitleGreen: {
    color: '#047857',
  },
  validationSubtitleAmber: {
    color: '#B45309',
  },
  validationSubtitleRed: {
    color: '#B91C1C',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#000',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  splitPresetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6,
  },
  splitPresetBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
  },
  savePresetButton: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  savePresetButtonActive: {
    backgroundColor: '#86EFAC',
  },
  savePresetButtonDisabled: {
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  savePresetButtonText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  savePresetButtonTextActive: {
    color: '#000',
  },
  savePresetButtonTextDisabled: {
    color: '#6B7280',
  },
  savedSuccessCard: {
    marginTop: 10,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savedSuccessText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    flex: 1,
  },
  noticeCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
});
