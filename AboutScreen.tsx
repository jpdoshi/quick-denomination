import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

const UPI_ID = 'jpdoshi2811@okaxis';
const GITHUB_URL = 'https://github.com/jpdoshi/quick-denominator';

export const AboutScreen: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyUPI = async () => {
    try {
      await Clipboard.setStringAsync(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  const handleOpenGitHub = async () => {
    try {
      await Linking.openURL(GITHUB_URL);
    } catch (e) {
      console.error('Failed to open GitHub link', e);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={[styles.headerCard, hardShadow(4)]}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>ABOUT & DEDICATION</Text>
          </View>
          <Text style={styles.headerTitle}>Built for Quick Calculation</Text>
        </View>

        {/* Dedication Card */}
        <View style={[styles.dedicationCard, hardShadow(4)]}>
          <View style={styles.dedicationHeader}>
            <View style={[styles.heartBadge, hardShadow(2)]}>
              <Text style={styles.heartText}>❤️</Text>
            </View>
            <View style={styles.dedicationTextGroup}>
              <Text style={styles.dedicationTitle}>Dedicated to Cashiers</Text>
              <Text style={styles.dedicationRole}>Quick Denomination Calculator</Text>
            </View>
          </View>
          <Text style={styles.dedicationParagraph}>
            Every single working day, cashiers count and verify money amount across thousands
            of physical currency notes under immense pressure.
          </Text>
          <Text style={styles.dedicationParagraph}>
            This tool is built to eliminate mental fatigue, guarantee zero calculation errors, and
            provide an instant greedy denomination breakdown for any cheque amount.
          </Text>
        </View>

        {/* Buy Me a Chai / Donate Card */}
        <View style={[styles.chaiCard, hardShadow(4)]}>
          <View style={styles.chaiHeaderRow}>
            <View style={[styles.chaiIconBadge, hardShadow(2)]}>
              <Text style={styles.chaiEmoji}>☕</Text>
            </View>
            <View style={styles.chaiTitleGroup}>
              <Text style={styles.chaiTitle}>Buy Me a Chai</Text>
              <Text style={styles.chaiSubtitle}>Support open-source development</Text>
            </View>
          </View>

          {/* Copyable UPI Box */}
          <View style={styles.upiContainer}>
            <Text style={styles.upiLabel}>UPI ID:</Text>
            <View style={[styles.upiInputRow, hardShadow(2)]}>
              <Text style={styles.upiIdText}>{UPI_ID}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCopyUPI}
                style={[
                  styles.copyButton,
                  copied ? styles.copyButtonDone : styles.copyButtonIdle,
                  hardShadow(1.5),
                ]}
              >
                <Ionicons
                  name={copied ? 'checkmark-circle' : 'copy-outline'}
                  size={16}
                  color={copied ? '#065F46' : '#000'}
                />
                <Text
                  style={[
                    styles.copyButtonText,
                    copied ? styles.copyButtonTextDone : styles.copyButtonTextIdle,
                  ]}
                >
                  {copied ? 'COPIED!' : 'COPY'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* GitHub Repository Link Button */}
          <View style={styles.githubContainer}>
            <Text style={styles.githubLabel}>GITHUB REPO:</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenGitHub}
              style={[styles.githubButton, hardShadow(2)]}
            >
              <View style={styles.githubButtonLeft}>
                <Ionicons name="logo-github" size={20} color="#FFF" />
                <Text style={styles.githubButtonText}>Explore Github Repo</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutScreen;

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
    backgroundColor: '#FDA4AF',
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
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  dedicationCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  dedicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  heartBadge: {
    backgroundColor: '#FEE2E2',
    width: 44,
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartText: {
    fontSize: 20,
  },
  dedicationTextGroup: {
    flex: 1,
  },
  dedicationTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  dedicationRole: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  dedicationParagraph: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  chaiCard: {
    backgroundColor: '#FEF08A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  chaiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  chaiIconBadge: {
    backgroundColor: '#FFF',
    width: 44,
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chaiEmoji: {
    fontSize: 22,
  },
  chaiTitleGroup: {
    flex: 1,
  },
  chaiTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  chaiSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#713F12',
  },
  qrOuterFrame: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  qrInnerBox: {
    width: 170,
    height: 170,
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: 6,
    backgroundColor: '#FAFAFA',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  qrCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#FFF',
  },
  qrCornerTL: {
    top: 8,
    left: 8,
  },
  qrCornerTR: {
    top: 8,
    right: 8,
  },
  qrCornerBL: {
    bottom: 8,
    left: 8,
  },
  qrGridPattern: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qrDotFilled: {
    width: 10,
    height: 10,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  qrDotEmpty: {
    width: 10,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 1,
  },
  qrCenterLogo: {
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  qrLogoText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  qrScanLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  upiContainer: {
    gap: 6,
  },
  upiLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  upiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  upiIdText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  copyButtonIdle: {
    backgroundColor: '#67E8F9',
  },
  copyButtonDone: {
    backgroundColor: '#86EFAC',
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: '900',
  },
  copyButtonTextIdle: {
    color: '#000',
  },
  copyButtonTextDone: {
    color: '#065F46',
  },
  githubContainer: {
    marginTop: 12,
    gap: 6,
  },
  githubLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  githubButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  githubButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  githubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#67E8F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  githubBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  techCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
  },
  techTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  techKey: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  techValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
});
