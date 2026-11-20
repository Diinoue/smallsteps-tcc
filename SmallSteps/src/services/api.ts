import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const getBaseUrl = (): string => {
  if(process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "web") {
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

// Interceptor para injetar o JWT nas requisições
api.interceptors.request.use(async (config) => {
  // Apenas cadastro de novo usuário (POST /users) e login não precisam de JWT
  const ehCadastro = config.method?.toLowerCase() === 'post' && (config.url === '/users' || config.url === '/users/');
  const ehLogin = config.url?.includes('/login');
  const ehRotaPublica = ehCadastro || ehLogin;

  if (!ehRotaPublica) {
    const token = await SecureStore.getItemAsync('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

// // Interceptor para tratar 401 do Spring Security
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Ex: Redirecionar para login ou limpar sessão
//     }
//     return Promise.reject(error);
//   }
// );