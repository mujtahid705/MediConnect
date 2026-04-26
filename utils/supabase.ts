import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// Create a safe storage adapter that handles AsyncStorage initialization
const memoryStorage: Record<string, string> = {};

const safeStorage = {
  getItem: async (key: string) => {
    try {
      // On web or if AsyncStorage is unavailable, use memory storage
      if (Platform.OS === "web") {
        return memoryStorage[key] || null;
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      // Fallback to memory storage if AsyncStorage fails
      return memoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // On web or if AsyncStorage is unavailable, use memory storage
      if (Platform.OS === "web") {
        memoryStorage[key] = value;
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      // Fallback to memory storage if AsyncStorage fails
      memoryStorage[key] = value;
    }
  },
  removeItem: async (key: string) => {
    try {
      // On web or if AsyncStorage is unavailable, use memory storage
      if (Platform.OS === "web") {
        delete memoryStorage[key];
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // Fallback to memory storage if AsyncStorage fails
      delete memoryStorage[key];
    }
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: safeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// Admin client for operations that need to bypass RLS (used during signup/auth)
export const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);
