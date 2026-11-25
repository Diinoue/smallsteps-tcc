import { LoginRequest } from "../dto/LoginRequest";
import { LoginResponse } from "../dto/LoginResponse";
import { api } from "./api";
import { authSession } from "./authSession";

export const loginService = {
  // Salva o token JWT (e opcionalmente o userId) no armazenamento seguro
  async save(_key: string = "token", value: string, userId?: number | null) {
    await authSession.setSession(value, userId);
  },

  // Retorna o token armazenado
  async getToken(): Promise<string | null> {
    return await authSession.getToken();
  },

  // Retorna o userId armazenado da sessão atual
  async getUserId(): Promise<number | null> {
    return await authSession.getUserId();
  },

  // Remove o token para logout
  async removeToken(): Promise<void> {
    await authSession.clearSession();
  },

  // Realiza autenticação no backend e salva a sessão
  async logIn(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/login", data);
    await authSession.setSession(response.data.token, response.data.userId ?? null);
    return response.data;
  },

  // Realiza logout limpando a sessão
  async logOut(): Promise<void> {
    await authSession.clearSession();
  },

  // Método auxiliar para testes e depuração
  async getValueFor() {
    const result = await authSession.getToken();
    if (result) {
      alert("🔐 Token JWT: 🔐 \n" + result);
    } else {
      alert("Sem token.");
    }
  },
};
