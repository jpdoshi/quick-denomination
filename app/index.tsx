import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Image,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AboutScreen } from '../screens/AboutScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ReceiptScreen } from '../screens/ReceiptScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { hardShadow } from '../utils/hardShadow';

type TabKey = 'counter' | 'receipt' | 'settings' | 'about';

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabKey>('counter');
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressTimeRef = useRef<number>(0);

  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === 'web' && width > 768;

  useEffect(() => {
    const onBackPress = () => {
      // If on other tab, navigate back to the home (counter) tab
      if (activeTab !== 'counter') {
        setActiveTab('counter');
        return true;
      }

      // If already on home tab, handle double tap to exit
      const now = Date.now();
      if (now - lastBackPressTimeRef.current < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPressTimeRef.current = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      } else {
        setShowExitToast(true);
        setTimeout(() => setShowExitToast(false), 2000);
      }
      return true;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSubscription.remove();
  }, [activeTab]);

  const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { key: 'counter', label: 'Payment', icon: 'calculator-outline', color: '#FACC15' },
    { key: 'receipt', label: 'Receipt', icon: 'cash-outline', color: '#86EFAC' },
    { key: 'settings', label: 'Settings', icon: 'settings-outline', color: '#67E8F9' },
    { key: 'about', label: 'About', icon: 'heart-outline', color: '#FDA4AF' },
  ];

  return (
    <View style={[styles.outerWrapper, isWebDesktop && styles.outerWrapperWebDesktop]}>
      <StatusBar style="dark" />

      {/* Left-Most Fixed Vertical Navigation Bar (Only on Web Desktop) */}
      {isWebDesktop && (
        <View style={styles.sidebarWrapperFixed}>
          <View style={styles.sidebarTop}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.sidebarLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.sidebarNav}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(tab.key)}
                  style={[
                    styles.sidebarButton,
                    isActive
                      ? [styles.sidebarButtonActive, { backgroundColor: tab.color }, hardShadow(2)]
                      : styles.sidebarButtonInactive,
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={22}
                    color={isActive ? '#000' : '#4B5563'}
                  />
                  <Text
                    style={[
                      styles.sidebarLabel,
                      isActive ? styles.sidebarLabelActive : styles.sidebarLabelInactive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sidebarFooter}>
            {/* <View style={[styles.sidebarPill, hardShadow(1)]}>
              <Text style={styles.sidebarPillText}>v1.0</Text>
            </View> */}
          </View>
        </View>
      )}

      {/* Centered App Container (Max-Width 768px on all devices) */}
      <SafeAreaView
        edges={isWebDesktop ? ['top', 'bottom'] : ['top', 'left', 'right']}
        style={styles.rootContainer}
      >
        {/* Screen Body */}
        <View style={styles.screenContainer}>
          {activeTab === 'counter' && <HomeScreen isActive={activeTab === 'counter'} />}
          {activeTab === 'receipt' && <ReceiptScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
          {activeTab === 'about' && <AboutScreen />}
        </View>

        {/* Neubrutalist Bottom Tab Bar (Only on Mobile / Non-Web-Desktop) */}
        {!isWebDesktop && (
          <SafeAreaView edges={['bottom']} style={styles.tabBarWrapper}>
            <View style={styles.tabBar}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    activeOpacity={0.8}
                    onPress={() => setActiveTab(tab.key)}
                    style={[
                      styles.tabButton,
                      isActive
                        ? [styles.tabButtonActive, { backgroundColor: tab.color }, hardShadow(2)]
                        : styles.tabButtonInactive,
                    ]}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={20}
                      color={isActive ? '#000' : '#4B5563'}
                    />
                    <Text
                      style={[
                        styles.tabLabel,
                        isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SafeAreaView>
        )}

        {/* Exit Toast Alert */}
        {showExitToast && (
          <View style={[styles.exitToast, hardShadow(2)]}>
            <Text style={styles.exitToastText}>Press back again to exit</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#FFFDF0',
    width: '100%',
    alignItems: 'center',
    height: '100%',
  },
  outerWrapperWebDesktop: {
    paddingLeft: 96,
  },
  rootContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 768,
    backgroundColor: '#FFFDF0',
  },
  screenContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  sidebarWrapperFixed: {
    width: 96,
    height: '100%',
    backgroundColor: '#FFF',
    borderRightWidth: 2.5,
    borderRightColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
    ...Platform.select({
      web: {
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      } as any,
      default: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
      },
    }),
  },
  sidebarTop: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sidebarLogo: {
    width: 48,
    height: 48,
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  sidebarNav: {
    width: '100%',
    gap: 10,
  },
  sidebarButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  sidebarButtonActive: {
    // Dynamic background and shadow
  },
  sidebarButtonInactive: {
    backgroundColor: 'transparent',
  },
  sidebarLabel: {
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  sidebarLabelActive: {
    color: '#000',
  },
  sidebarLabelInactive: {
    color: '#4B5563',
  },
  sidebarFooter: {
    alignItems: 'center',
    marginTop: 8,
  },
  sidebarPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sidebarPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
  },
  tabBarWrapper: {
    borderTopWidth: 2.5,
    borderTopColor: '#000',
    backgroundColor: '#FFF',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  tabButtonActive: {
    // Styling handled dynamically
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '900',
  },
  tabLabelActive: {
    color: '#000',
  },
  tabLabelInactive: {
    color: '#4B5563',
  },
  exitToast: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 999,
  },
  exitToastText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
