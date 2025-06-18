import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_API_KEY = "apiKey";
const STORAGE_USER_ID = "userId";
const STORAGE_HOST_URL = "hostUrl";
const STORAGE_USER_NAME = "userName";

const getSecureValue = async (key: string) => {
  return Platform.OS === 'web'
    ? AsyncStorage.getItem(key)
    : SecureStore.getItemAsync(key);
};

const clearSecureValue = async (key: string) => {
  return Platform.OS === 'web'
    ? AsyncStorage.removeItem(key)
    : SecureStore.deleteItemAsync(key);
};

const saveSecureValue = async (key: string, value: string) => {
  return Platform.OS === 'web'
    ? AsyncStorage.setItem(key, value)
    : SecureStore.setItemAsync(key, value);
};

export const saveAuth = async (userId: string, userName: string, apiKey: string) => {
  await Promise.all([
    saveSecureValue(STORAGE_USER_ID, userId),
    saveSecureValue(STORAGE_API_KEY, apiKey),
    saveSecureValue(STORAGE_USER_NAME, userName),
  ]);
};

export const saveHost = async (hostUrl: string | null) => {
  if (!hostUrl) {
    await AsyncStorage.removeItem(STORAGE_HOST_URL);
  } else {
    await AsyncStorage.setItem(STORAGE_HOST_URL, hostUrl);
  }
};

export const getAuth = async () => {
  return Promise.all([
    getSecureValue(STORAGE_API_KEY),
    getSecureValue(STORAGE_USER_ID),
    getSecureValue(STORAGE_USER_NAME),
  ]);
};

export const getHost = async () => {
  return AsyncStorage.getItem(STORAGE_HOST_URL);
};

export const clearAuthStorage = async () => {
  await Promise.all([
    clearSecureValue(STORAGE_USER_ID),
    clearSecureValue(STORAGE_API_KEY),
    clearSecureValue(STORAGE_USER_NAME),
  ]);
};
