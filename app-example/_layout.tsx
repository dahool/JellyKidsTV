import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as NavigationBar from 'expo-navigation-bar'
import { setStatusBarHidden } from "expo-status-bar"
import { useEffect } from 'react'
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated'

import { useColorScheme } from '@/src/hooks/useColorScheme'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Disable reanimated warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

async function changeScreenOrientation() {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    changeScreenOrientation()
    NavigationBar.setPositionAsync("relative")
    NavigationBar.setVisibilityAsync("hidden")
    NavigationBar.setBehaviorAsync("inset-swipe")
    setStatusBarHidden(true, 'slide')
  }, [])

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      if (error) {
        console.warn(`Error in loading fonts: ${error}`);
      }
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
