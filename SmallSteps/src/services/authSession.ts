import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'token';
const USER_ID_KEY = 'userId';

type AuthStateListener = (authenticated: boolean) => void;
type UnauthorizedListener = () => void;

const authStateListeners = new Set<AuthStateListener>();
const unauthorizedListeners = new Set<UnauthorizedListener>();

let cachedToken: string | null | undefined = undefined;
let cachedUserId: number | null | undefined = undefined;
let isHandlingUnauthorized = false;

async function storageGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  }
  return await SecureStore.getItemAsync(key);
}

async function storageSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {
      // ignore storage errors on restricted web contexts
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function storageDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {
      // ignore storage errors
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

function notifyAuthState(authenticated: boolean) {
  authStateListeners.forEach((listener) => {
    try {
      listener(authenticated);
    } catch (e) {
      console.warn('Erro no listener de autenticação:', e);
    }
  });
}

export const authSession = {
  async getToken(): Promise<string | null> {
    if (cachedToken !== undefined) {
      return cachedToken;
    }
    const stored = await storageGet(TOKEN_KEY);
    cachedToken = stored;
    return stored;
  },

  async getUserId(): Promise<number | null> {
    if (cachedUserId !== undefined) {
      return cachedUserId;
    }
    const stored = await storageGet(USER_ID_KEY);
    const parsed = stored ? Number(stored) : null;
    cachedUserId = parsed && !Number.isNaN(parsed) ? parsed : null;
    return cachedUserId;
  },

  async setSession(token: string, userId?: number | null): Promise<void> {
    cachedToken = token;
    await storageSet(TOKEN_KEY, token);
    if (userId != null && userId > 0) {
      cachedUserId = userId;
      await storageSet(USER_ID_KEY, String(userId));
    }
    isHandlingUnauthorized = false;
    notifyAuthState(true);
  },

  async setUserId(userId: number): Promise<void> {
    if (userId > 0) {
      cachedUserId = userId;
      await storageSet(USER_ID_KEY, String(userId));
    }
  },

  async clearSession(): Promise<void> {
    cachedToken = null;
    cachedUserId = null;
    await Promise.all([storageDelete(TOKEN_KEY), storageDelete(USER_ID_KEY)]);
    notifyAuthState(false);
  },

  async handleUnauthorized(): Promise<void> {
    if (isHandlingUnauthorized) return;
    isHandlingUnauthorized = true;
    try {
      await this.clearSession();
      unauthorizedListeners.forEach((listener) => {
        try {
          listener();
        } catch (e) {
          console.warn('Erro no listener de 401:', e);
        }
      });
    } finally {
      setTimeout(() => {
        isHandlingUnauthorized = false;
      }, 500);
    }
  },

  subscribeAuthState(listener: AuthStateListener): () => void {
    authStateListeners.add(listener);
    return () => {
      authStateListeners.delete(listener);
    };
  },

  subscribeUnauthorized(listener: UnauthorizedListener): () => void {
    unauthorizedListeners.add(listener);
    return () => {
      unauthorizedListeners.delete(listener);
    };
  },
};
