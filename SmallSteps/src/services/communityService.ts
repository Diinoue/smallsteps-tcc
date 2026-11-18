import { api } from './api';
import { Post, CreatePostInput } from '../types/community';
import { Platform } from 'react-native';

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

const DEFAULT_COMMUNITIES: CommunityItem[] = [];

let MOCK_COMMUNITY_POSTS: Record<string | number, Post[]> = {
  default: [
    {
      id: 'p1',
      communityId: 1,
      author: {
        id: 'u1',
        name: 'Lagarto Voador',
        streakDays: 315,
        avatarUrl: null,
      },
      content: 'Praticando... Sugestões para melhorar?',
      createdAt: '14/6/26',
      mediaType: 'video',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: null,
      aspectRatio: 16 / 9,
      commentsCount: 4,
    },
    {
      id: 'p2',
      communityId: 1,
      author: {
        id: 'u2',
        name: 'Cachorro Cansado',
        streakDays: 98,
        avatarUrl: null,
      },
      content: 'Quase lá, hoje consegui completar todas as metas sem falhas!',
      createdAt: '14/6/26',
      mediaType: 'text',
      commentsCount: 1,
    },
    {
      id: 'p3',
      communityId: 1,
      author: {
        id: 'u3',
        name: 'Rato Pacifista',
        streakDays: 15,
        avatarUrl: null,
      },
      content: 'Novo setup pronto para as gravações da semana 🎵',
      createdAt: '13/6/26',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      aspectRatio: 16 / 9,
      commentsCount: 0,
    },
  ],
};

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

  async getCommunityPosts(communityId: number | string = 'default'): Promise<Post[]> {
    try {
      const response = await api.get<any[]>(`/community/${communityId}/posts`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const baseUrl = api.defaults.baseURL || '';
        return response.data.map((p) => {
          let mediaUrl = p.mediaUrl;
          if (mediaUrl && mediaUrl.startsWith('/')) {
            mediaUrl = `${baseUrl}${mediaUrl}`;
          }

          let thumbnailUrl = p.thumbnailUrl;
          if (thumbnailUrl && thumbnailUrl.startsWith('/')) {
            thumbnailUrl = `${baseUrl}${thumbnailUrl}`;
          }

          return {
            id: p.id,
            communityId: p.communityId,
            author: {
              id: p.author?.id || 0,
              name: p.author?.name || 'Membro',
              avatarUrl: p.author?.avatarUrl || null,
              streakDays: p.author?.streakDays || 0,
            },
            content: p.content || '',
            createdAt: p.createdAt || '',
            mediaType: (p.mediaType || 'text').toLowerCase(),
            mediaUrl,
            thumbnailUrl,
            aspectRatio: 16 / 9,
            commentsCount: p.commentsCount || 0,
          } as Post;
        });
      }
    } catch (error) {
      console.warn('API /community/:id/posts indisponível, usando dados mockados:', error);
    }

    const posts = MOCK_COMMUNITY_POSTS[communityId] || MOCK_COMMUNITY_POSTS['default'] || [];
    return [...posts];
  },

  async createPost(
    communityId: number | string = 'default',
    input: CreatePostInput
  ): Promise<Post> {
    try {
      const payload = {
        descricao: input.content,
        tipoMidia: (input.mediaType || 'TEXT').toUpperCase(),
        urlMidia: input.mediaUrl || null,
        urlThumbnail: input.thumbnailUrl || null,
      };

      const response = await api.post(`/community/${communityId}/posts`, payload);
      const p = response.data;
      if (p && p.id) {
        const baseUrl = api.defaults.baseURL || '';
        let mediaUrl = p.mediaUrl;
        if (mediaUrl && mediaUrl.startsWith('/')) {
          mediaUrl = `${baseUrl}${mediaUrl}`;
        }

        return {
          id: p.id,
          communityId: p.communityId,
          author: {
            id: p.author?.id || 0,
            name: p.author?.name || 'Você',
            avatarUrl: p.author?.avatarUrl || null,
            streakDays: p.author?.streakDays || 0,
          },
          content: p.content || '',
          createdAt: p.createdAt || new Date().toLocaleDateString('pt-BR'),
          mediaType: (p.mediaType || 'text').toLowerCase(),
          mediaUrl,
          thumbnailUrl: p.thumbnailUrl || null,
          aspectRatio: 16 / 9,
          commentsCount: 0,
        };
      }
    } catch (error) {
      console.warn('Erro ao chamar POST /community/:id/posts na API, salvando localmente:', error);
    }

    const newPost: Post = {
      id: `p_${Date.now()}`,
      communityId,
      author: {
        id: 'me',
        name: 'Você',
        streakDays: 42,
        avatarUrl: null,
      },
      content: input.content,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      mediaType: input.mediaType || 'text',
      mediaUrl: input.mediaUrl || null,
      thumbnailUrl: input.thumbnailUrl || null,
      commentsCount: 0,
    };

    if (!MOCK_COMMUNITY_POSTS[communityId]) {
      MOCK_COMMUNITY_POSTS[communityId] = [...(MOCK_COMMUNITY_POSTS['default'] || [])];
    }
    MOCK_COMMUNITY_POSTS[communityId] = [newPost, ...MOCK_COMMUNITY_POSTS[communityId]];
    return newPost;
  },
};

export async function criarComunidade(dados: CriarCommunityRequest): Promise<any> {
  const { data } = await api.post("/community", dados);
  return data;
}
