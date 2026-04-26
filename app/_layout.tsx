import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";

    if (!user) {
      // Redirect to login if not authenticated
      if (!inAuthGroup) {
        router.replace("/login");
      }
    } else {
      // Redirect to appropriate dashboard if authenticated
      if (inAuthGroup) {
        // Redirect based on role
        if (user.role === "admin") {
          router.replace("/(tabs)");
        } else if (user.role === "patient") {
          router.replace("/(tabs)");
        } else if (user.role === "doctor") {
          router.replace("/(tabs)");
        }
      }
    }
  }, [user, segments, loading, router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
