import { api } from './api';
import { Post, CreatePostInput } from '../types/community';
import { Platform } from 'react-native';

export interface CommunityItem {
  id: number;
  nome: string;
  privado?: boolean;
  foto?: string | null;
  descricao?: string;
  codigoConvite?: string;
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

export interface CommunityMemberItem {
  idUsuario: number;
  idComunidade: number;
  nome: string;
  foto?: string | null;
  pontos: number;
  cargo: 'DONO' | 'ADMINISTRADOR' | 'MEMBRO' | string;
  dtInicio?: string;
}

export interface JoinRequestItem {
  idUsuario: number;
  idComunidade: number;
  nomeUsuario: string;
  fotoUsuario?: string | null;
  dtInicio?: string;
}

export interface CriarCommunityRequest {
  nome: string;
  descricao?: string;
  privado: boolean;
  foto?: string | null;
  tags?: string[];
  idUsuario?: number;
}

export interface PublicCommunityItem {
  id: number;
  nome: string;
  privado: boolean;
  foto?: string | null;
  descricao?: string;
  codigoConvite?: string;
  quantidadeMembros?: number;
  tags: string[];
  jaParticipa?: boolean;
  jaSolicitou?: boolean;
}

const DEFAULT_COMMUNITIES: CommunityItem[] = [];

let MOCK_COMMUNITY_POSTS: Record<string | number, Post[]> = {};

/**
 * Converte qualquer caminho de imagem (URL completa, caminho relativo /uploads/..., ou nome de arquivo)
 * em uma URL absoluta acessível pelo frontend.
 */
export function formatImageUrl(foto?: string | null): string | null {
  if (!foto) return null;
  const trimmed = foto.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const baseUrl = api.defaults.baseURL || '';
  if (trimmed.startsWith('/')) {
    return `${baseUrl}${trimmed}`;
  }
  // Se for apenas o nome do arquivo, direciona para /uploads/
  return `${baseUrl}/uploads/${trimmed}`;
}

/**
 * Faz upload de uma mídia (imagem ou vídeo) para o backend.
 * Retorna o caminho relativo do arquivo no servidor (ex: /uploads/abc.jpg).
 */
export async function uploadMedia(fileUri: string, mimeType: string): Promise<string> {
  const formData = new FormData();

  // Extrair nome do arquivo a partir da URI
  const fileName = fileUri.split('/').pop() || `upload_${Date.now()}`;

  // No React Native, FormData espera um objeto com uri, type e name
  formData.append('file', {
    uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
    type: mimeType,
    name: fileName,
  } as any);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60s para uploads grandes
  });

  return response.data.url; // ex: "/uploads/uuid.jpg"
}

export const communityService = {
  async getCommunities(): Promise<CommunityItem[]> {
    try {
      // 1. Busca participações do usuário autenticado na sessão atual
      const participamRes = await api.get<ParticipamResponse[]>('/participam/me');
      const participacoes = participamRes.data;

      if (!Array.isArray(participacoes) || participacoes.length === 0) {
        return DEFAULT_COMMUNITIES;
      }

      // 2. Busca lista de comunidades para cruzar detalhes
      const comRes = await api.get<any[]>('/community');
      const comunidades = comRes.data;

      if (Array.isArray(comunidades)) {
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
                foto: formatImageUrl(c.foto),
                descricao: c.descricao,
                codigoConvite: c.codigoConvite,
                cargo: p.cargo,
                pontos: p.pontos,
              });
            }
          }
        }

        return result;
      }

      return DEFAULT_COMMUNITIES;
    } catch (error) {
      console.warn('Não foi possível carregar comunidades da API:', error);
      return DEFAULT_COMMUNITIES;
    }
  },

  async getCommunityPosts(
    communityId: number | string = 'default',
    searchQuery?: string
  ): Promise<Post[]> {
    try {
      const trimmed = searchQuery?.trim();
      const response = await api.get<any[]>(`/community/${communityId}/posts`, {
        params: trimmed ? { q: trimmed } : undefined,
      });
      if (Array.isArray(response.data)) {
        const baseUrl = api.defaults.baseURL || '';
        return response.data.map((p) => {
          let mediaUrl = p.mediaUrl;
          if (mediaUrl && mediaUrl.startsWith('/')) {
            mediaUrl = `${baseUrl}${mediaUrl}`;
          }

          let avatarUrl = p.author?.avatarUrl || null;
          if (avatarUrl && avatarUrl.startsWith('/')) {
            avatarUrl = `${baseUrl}${avatarUrl}`;
          }

          return {
            id: p.id,
            communityId: p.communityId,
            author: {
              id: p.author?.id || 0,
              name: p.author?.name || 'Membro',
              avatarUrl,
              streakDays: p.author?.streakDays || 0,
            },
            content: p.content || '',
            createdAt: p.createdAt || '',
            mediaType: (p.mediaType || 'text').toLowerCase(),
            mediaUrl,
            aspectRatio: 16 / 9,
            commentsCount: p.commentsCount || 0,
          } as Post;
        });
      }
    } catch (error) {
      console.warn('API /community/:id/posts indisponível:', error);
    }

    const posts = MOCK_COMMUNITY_POSTS[communityId] || [];
    return [...posts];
  },

  async createPost(
    communityId: number | string = 'default',
    input: CreatePostInput
  ): Promise<Post> {
    const payload = {
      descricao: input.content,
      tipoMidia: (input.mediaType || 'TEXT').toUpperCase(),
      urlMidia: input.mediaUrl || null,
    };

    const response = await api.post(`/community/${communityId}/posts`, payload);
    const p = response.data;
    const baseUrl = api.defaults.baseURL || '';
    let mediaUrl = p.mediaUrl;
    if (mediaUrl && mediaUrl.startsWith('/')) {
      mediaUrl = `${baseUrl}${mediaUrl}`;
    }

    let avatarUrl = p.author?.avatarUrl || null;
    if (avatarUrl && avatarUrl.startsWith('/')) {
      avatarUrl = `${baseUrl}${avatarUrl}`;
    }

    return {
      id: p.id,
      communityId: p.communityId,
      author: {
        id: p.author?.id || 0,
        name: p.author?.name || 'Você',
        avatarUrl,
        streakDays: p.author?.streakDays || 0,
      },
      content: p.content || '',
      createdAt: p.createdAt || new Date().toLocaleDateString('pt-BR'),
      mediaType: (p.mediaType || 'text').toLowerCase(),
      mediaUrl,
      aspectRatio: 16 / 9,
      commentsCount: 0,
      streakAction: p.streakAction ?? null,
      streakMessage: p.streakMessage ?? null,
    };
  },

  async leaveCommunity(communityId: number | string): Promise<void> {
    await api.delete(`/participam/me/${communityId}`);
  },

  async getUserRole(communityId: number | string): Promise<string | null> {
    try {
      const response = await api.get<ParticipamResponse>(`/participam/me/${communityId}`);
      return response.data?.cargo || null;
    } catch {
      return null;
    }
  },

  async deletePost(communityId: number | string, postId: number | string): Promise<void> {
    await api.delete(`/community/${communityId}/posts/${postId}`);
  },

  async getPublicCommunities(searchTerm?: string): Promise<PublicCommunityItem[]> {
    try {
      const params: Record<string, any> = {};
      if (searchTerm && searchTerm.trim().length > 0) {
        params.nome = searchTerm.trim();
      }
      const response = await api.get<PublicCommunityItem[]>('/community/public', { params });
      return (response.data || []).map((c) => ({
        ...c,
        foto: formatImageUrl(c.foto),
        tags: c.tags || [],
      }));
    } catch (error) {
      console.error('Erro ao buscar comunidades públicas:', error);
      return [];
    }
  },

  async joinCommunity(communityId: number | string): Promise<void> {
    await api.post('/participam', {
      idComunidade: Number(communityId),
      cargo: 'MEMBRO',
      pontos: 0,
    });
  },

  async getCommunityById(communityId: number | string): Promise<CommunityItem> {
    const response = await api.get<any>(`/community/${communityId}`);
    const c = response.data;
    return {
      id: c.id,
      nome: c.nome,
      privado: c.privado,
      foto: formatImageUrl(c.foto),
      descricao: c.descricao,
      codigoConvite: c.codigoConvite,
    };
  },

  async getCommunityByCode(codigo: string): Promise<PublicCommunityItem> {
    const response = await api.get<PublicCommunityItem>('/community/by-code', {
      params: { codigo },
    });
    const c = response.data;
    return {
      ...c,
      foto: formatImageUrl(c.foto),
      tags: c.tags || [],
    };
  },

  async rerollInviteCode(communityId: number | string): Promise<string> {
    const response = await api.post<any>(`/community/${communityId}/reroll-code`);
    return response.data?.codigoConvite || '';
  },

  async getCommunityMembers(communityId: number | string): Promise<CommunityMemberItem[]> {
    const response = await api.get<CommunityMemberItem[]>(
      `/participam/comunidade/${communityId}/membros`
    );
    return (response.data || []).map((m) => ({
      ...m,
      foto: formatImageUrl(m.foto),
    }));
  },

  async updateMemberRole(
    communityId: number | string,
    targetUserId: number,
    cargo: 'ADMINISTRADOR' | 'MEMBRO' | 'DONO'
  ): Promise<void> {
    await api.put(`/participam/${targetUserId}/${communityId}/cargo`, { cargo });
  },

  async kickMember(communityId: number | string, targetUserId: number): Promise<void> {
    await api.delete(`/participam/${targetUserId}/${communityId}`);
  },

  async requestJoinCommunity(communityId: number | string): Promise<void> {
    await api.post('/solicitam', {
      idComunidade: Number(communityId),
    });
  },

  async getJoinRequests(communityId: number | string): Promise<JoinRequestItem[]> {
    const response = await api.get<JoinRequestItem[]>(`/solicitam/comunidade/${communityId}`);
    return (response.data || []).map((r) => ({
      ...r,
      fotoUsuario: formatImageUrl(r.fotoUsuario),
    }));
  },

  async acceptJoinRequest(communityId: number | string, targetUserId: number): Promise<void> {
    await api.post(`/solicitam/${communityId}/${targetUserId}/aceitar`);
  },

  async rejectJoinRequest(communityId: number | string, targetUserId: number): Promise<void> {
    await api.delete(`/solicitam/${communityId}/${targetUserId}`);
  },

  async getCommunityDetails(
    communityId: number | string
  ): Promise<PublicCommunityItem> {
    const response = await api.get<PublicCommunityItem>(`/community/${communityId}/details`);
    const c = response.data;
    return {
      ...c,
      foto: formatImageUrl(c.foto),
      tags: c.tags || [],
    };
  },

  async updateCommunity(
    communityId: number | string,
    dados: {
      nome: string;
      descricao?: string;
      privado: boolean;
      foto?: string | null;
      tags?: string[];
    }
  ): Promise<CommunityItem> {
    const response = await api.put<any>(`/community/${communityId}`, dados);
    const c = response.data;
    return {
      id: c.id,
      nome: c.nome,
      privado: c.privado,
      foto: formatImageUrl(c.foto),
      descricao: c.descricao,
      codigoConvite: c.codigoConvite,
    };
  },

  async deleteCommunity(communityId: number | string): Promise<void> {
    await api.delete(`/community/${communityId}`);
  },
};

export async function criarComunidade(dados: CriarCommunityRequest): Promise<any> {
  const { data } = await api.post("/community", dados);
  return data;
}

export async function sairDaComunidade(communityId: number | string): Promise<void> {
  await api.delete(`/participam/me/${communityId}`);
}

export async function deletarPost(communityId: number | string, postId: number | string): Promise<void> {
  await api.delete(`/community/${communityId}/posts/${postId}`);
}

export async function getPublicCommunities(searchTerm?: string): Promise<PublicCommunityItem[]> {
  return communityService.getPublicCommunities(searchTerm);
}

export async function entrarNaComunidade(communityId: number | string): Promise<void> {
  return communityService.joinCommunity(communityId);
}
