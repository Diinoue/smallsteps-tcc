import { api } from "./api";

export interface CriarCommunityRequest {
  nome: string;
  descricao?: string;
  privado: boolean;
  foto?: string | null;
  tags?: string[];
}

export async function criarComunidade(dados: CriarCommunityRequest): Promise<any> {
  const { data } = await api.post("/community", dados);
  return data;
}
