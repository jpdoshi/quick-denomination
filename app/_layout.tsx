import { Stack } from "expo-router";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import "../global.css";
import { SettingsProvider } from "../hooks/useDenomination";

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SettingsProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#FFFDF0" },
          }}
        />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}


