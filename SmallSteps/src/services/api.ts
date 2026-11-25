import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { authSession } from './authSession';

const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:8080';
  }

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) {
    return `http://${host}:8080`;
  }
  // No emulador Android, 10.0.2.2 acessa o localhost da máquina host
  return Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isPublicAuthRoute = (method?: string, url?: string): boolean => {
  const ehCadastro =
    method?.toLowerCase() === 'post' && (url === '/users' || url === '/users/');
  const ehLogin = url === '/login' || url === '/login/' || Boolean(url?.endsWith('/login'));
  return ehCadastro || ehLogin;
};

// Interceptor para injetar o JWT nas requisições
api.interceptors.request.use(async (config) => {
  if (!isPublicAuthRoute(config.method, config.url)) {
    const token = await authSession.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Interceptor para tratar 401 do Spring Security (sessão ausente/expirada)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const reqUrl = error?.config?.url;
    const reqMethod = error?.config?.method;

    if (status === 401 && !isPublicAuthRoute(reqMethod, reqUrl)) {
      await authSession.handleUnauthorized();
    }

    return Promise.reject(error);
  }
);