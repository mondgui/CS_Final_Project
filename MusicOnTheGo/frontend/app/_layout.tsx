import { useEffect, useState, useRef } from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { trackScreenView } from '../lib/analytics';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { LogBox } from 'react-native';
import 'react-native-reanimated';
import { useColorScheme } from '../hooks/use-color-scheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GuestActionProvider } from '../contexts/GuestActionContext';

// Keep the native splash visible until the app is ready
SplashScreen.preventAutoHideAsync();

// Suppress specific warnings
if (__DEV__) {
  LogBox.ignoreLogs([
    /baseline-browser-mapping/,
    /expo-notifications.*Expo Go/,
    /expo-notifications.*development build/,
    /Require cycle/,
    /Push notifications.*remote notifications/,
  ]);
}

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


// This root layout defines shared UI elements such as headers and tab bars.

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  // Send screen_view to backend for admin "App usage" (most/least used screens)
  useEffect(() => {
    if (pathname && pathname !== lastTracked.current) {
      lastTracked.current = pathname;
      trackScreenView(pathname);
    }
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <GuestActionProvider>
      <SafeAreaProvider
        onLayout={() => {
          if (!appReady) setAppReady(true);
        }}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>

            {/* Public screens */}
            <Stack.Screen name="index" />
            <Stack.Screen name="role-selection" />
            
            {/* Route groups */}
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(teacher)" />
            <Stack.Screen name="booking" />
            <Stack.Screen name="messages" />

          

          </Stack>

          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
      </GuestActionProvider>
    </QueryClientProvider>
  );
}
