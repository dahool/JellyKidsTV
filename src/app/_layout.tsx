import { Buffer } from 'buffer'
global.Buffer = Buffer

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Roboto_400Regular } from "@expo-google-fonts/roboto/400Regular"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import * as ScreenOrientation from 'expo-screen-orientation'
import * as NavigationBar from 'expo-navigation-bar'
import { setStatusBarHidden } from "expo-status-bar"
import { useEffect } from "react"
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated"
import { useColorScheme } from "~/hooks/useColorScheme"
import { Provider } from "react-redux"
import { store } from "@/src/store"
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Platform } from "react-native"
import { useAuthBootstrap } from "../auth"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

// Disable reanimated warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
})

async function changeScreenOrientation() {
  // for testing purpose
  if (Platform.OS !== 'web') await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  useEffect(() => {
    changeScreenOrientation()
    NavigationBar.setPositionAsync("relative")
    NavigationBar.setVisibilityAsync("hidden")
    NavigationBar.setBehaviorAsync("inset-swipe")
    setStatusBarHidden(true, 'slide')
  }, [])

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BootstrapLayout>
            <Stack screenOptions={{ headerShown: false }}></Stack>
          </BootstrapLayout>
        </GestureHandlerRootView>
      </ThemeProvider>
    </Provider>
  )

}

function BootstrapLayout({ children }: { children: React.ReactNode }) {
  const ready = useAuthBootstrap()
  const [loaded] = useFonts({ Roboto_400Regular })

  useEffect(() => {
    if (loaded && ready) {
      SplashScreen.hideAsync()
    }
  }, [loaded, ready])

  if (!ready) return null

  return <>{children}</>
}