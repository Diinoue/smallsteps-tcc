import { api } from './api';

export interface CommunityItem {
  id: number;
  nome: string;
  privado?: boolean;
  foto?: string | null;
  cargo?: string;
  pontos?: number;
}

export interface ParticipamResponse {
  idUsuario: number;
  idComunidade: number;
  pontos: number;
  cargo: string;
  dtInicio: string;
}


export interface CriarCommunityRequest {
  nome: string;
  descricao?: string;
  privado: boolean;
  foto?: string | null;
  tags?: string[];
}

const DEFAULT_COMMUNITIES: CommunityItem[] = [
  { id: 1, nome: 'Piano Barigui', privado: false, foto: null },
  { id: 2, nome: 'Grupo #1 musica', privado: false, foto: null },
  { id: 3, nome: 'Academia facul', privado: false, foto: null },
];

export const communityService = {
  async getCommunities(): Promise<CommunityItem[]> {
    try {
      // 1. Busca participações
      const participamRes = await api.get<ParticipamResponse[]>('/participam');
      const participacoes = participamRes.data;

      // 2. Busca lista de comunidades
      const comRes = await api.get<any[]>('/community');
      const comunidades = comRes.data;

      if (Array.isArray(participacoes) && participacoes.length > 0 && Array.isArray(comunidades)) {
        const comMap = new Map(comunidades.map((c) => [c.id, c]));
        const result: CommunityItem[] = [];
        const seenIds = new Set<number>();

        for (const p of participacoes) {
          if (p.idComunidade && !seenIds.has(p.idComunidade)) {
            seenIds.add(p.idComunidade);
            const c = comMap.get(p.idComunidade);
            if (c) {
              result.push({
                id: c.id,
                nome: c.nome,
                privado: c.privado,
                foto: c.foto,
                cargo: p.cargo,
                pontos: p.pontos,
              });
            }
          }
        }

        if (result.length > 0) {
          return result;
        }
      }

      // Se participam estiver vazio mas houver comunidades cadastradas
      if (Array.isArray(comunidades) && comunidades.length > 0) {
        return comunidades.map((c) => ({
          id: c.id,
          nome: c.nome,
          privado: c.privado,
          foto: c.foto,
        }));
      }

      return DEFAULT_COMMUNITIES;
    } catch (error) {
      console.warn('Não foi possível carregar comunidades da API, utilizando dados padrão:', error);
      return DEFAULT_COMMUNITIES;
    }
  },
};

export async function criarComunidade(dados: CriarCommunityRequest): Promise<any> {
  const { data } = await api.post("/community", dados);
  return data;
}
