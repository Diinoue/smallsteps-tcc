export interface LoginResponse {
  token: string;
  userId?: number;
  email?: string;
  nome?: string;
}