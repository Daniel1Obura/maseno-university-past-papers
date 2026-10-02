import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

import BrandedSplash from '@/components/branded-splash';
import {
  ThemeProvider as AppThemeProvider,
  useTheme,
} from '../context/theme-context';

SplashScreen.preventAutoHideAsync();

function ThemedNavigation() {
  const { mode } = useTheme();

  return (
    <NavigationThemeProvider
      value={mode === 'dark' ? DarkTheme : DefaultTheme}
    >
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />

          <Stack.Screen
            name="pdf-viewer"
            options={{
              headerShown: false,
            }}
          />
        </Stack>

        <BrandedSplash />
      </View>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <ThemedNavigation />
    </AppThemeProvider>
  );
}