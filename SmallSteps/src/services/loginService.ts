import * as SecureStore from "expo-secure-store";
import { LoginRequest } from "../dto/LoginRequest";
import { LoginResponse } from "../dto/LoginResponse";
import { api } from "./api";

const TOKEN_KEY = "token";

export const loginService = {
  // Salva o token JWT no armazenamento seguro
  async save(key: string = TOKEN_KEY, value: string) {
    await SecureStore.setItemAsync(key, value);
  },

  // Retorna o token armazenado
  async getToken(key: string = TOKEN_KEY): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },

  // Remove o token para logout
  async removeToken(key: string = TOKEN_KEY): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  // Realiza autenticação no backend
  async logIn(data: LoginRequest): Promise<string> {
    const response = await api.post<LoginResponse>("/login", data);
    return response.data.token;
  },

  // Realiza logout limpando a sessão
  async logOut(): Promise<void> {
    await this.removeToken();
  },

  // Método auxiliar para testes e depuração
  async getValueFor(key: string = TOKEN_KEY) {
    const result = await SecureStore.getItemAsync(key);
    if (result) {
      alert("🔐 Token JWT: 🔐 \n" + result);
    } else {
      alert("Sem token.");
    }
  },
};
