import { api } from './api';
import { PostComment } from '../types/community';

// Armazena comentários criados localmente por post e evento (sem mocks pré-carregados)
const MOCK_COMMENTS: Record<string | number, PostComment[]> = {};
const MOCK_EVENT_COMMENTS: Record<string | number, PostComment[]> = {};

export interface CommentUserParam {
  id?: number | string;
  name?: string;
  avatarUrl?: string | null;
}

export const commentService = {
  async getPostComments(postId: string | number): Promise<PostComment[]> {
    try {
      const response = await api.get<any[]>(`/posts/${postId}/comments`);
      if (Array.isArray(response.data)) {
        const baseUrl = api.defaults.baseURL || '';
        return response.data.map((c) => {
          let avatarUrl = c.author?.avatarUrl || null;
          if (avatarUrl && avatarUrl.startsWith('/')) {
            avatarUrl = `${baseUrl}${avatarUrl}`;
          }

          return {
            id: c.id,
            postId: c.idPost || postId,
            author: {
              id: c.author?.id || 0,
              name: c.author?.name || 'Membro',
              avatarUrl,
            },
            content: c.conteudo || '',
            createdAt: c.createdAt || '',
          } as PostComment;
        });
      }
    } catch (error) {
      console.warn('API /posts/:id/comments indisponível, usando mock:', error);
    }

    if (!MOCK_COMMENTS[postId]) {
      MOCK_COMMENTS[postId] = [];
    }
    return [...MOCK_COMMENTS[postId]];
  },

  async getEventComments(eventId: number | string): Promise<PostComment[]> {
    try {
      const response = await api.get<any[]>(`/events/${eventId}/comments`);
      if (Array.isArray(response.data)) {
        const baseUrl = api.defaults.baseURL || '';
        return response.data.map((c) => {
          let avatarUrl = c.author?.avatarUrl || null;
          if (avatarUrl && avatarUrl.startsWith('/')) {
            avatarUrl = `${baseUrl}${avatarUrl}`;
          }

          return {
            id: c.id,
            postId: c.idEvento || eventId,
            author: {
              id: c.author?.id || 0,
              name: c.author?.name || 'Membro',
              avatarUrl,
            },
            content: c.conteudo || '',
            createdAt: c.createdAt || '',
          } as PostComment;
        });
      }
    } catch (error) {
      console.warn('API /events/:id/comments indisponível, usando mock:', error);
    }

    if (!MOCK_EVENT_COMMENTS[eventId]) {
      MOCK_EVENT_COMMENTS[eventId] = [];
    }
    return [...MOCK_EVENT_COMMENTS[eventId]];
  },

  async createComment(
    postId: string | number,
    content: string,
    currentUser?: CommentUserParam
  ): Promise<PostComment> {
    const response = await api.post(`/posts/${postId}/comments`, {
      conteudo: content,
    });

    const c = response.data;
    const baseUrl = api.defaults.baseURL || '';
    let avatarUrl = c.author?.avatarUrl || null;
    if (avatarUrl && avatarUrl.startsWith('/')) {
      avatarUrl = `${baseUrl}${avatarUrl}`;
    }
    if (!avatarUrl && currentUser?.avatarUrl) {
      avatarUrl = currentUser.avatarUrl;
    }

    return {
      id: c.id,
      postId: c.idPost || postId,
      author: {
        id: c.author?.id || currentUser?.id || 0,
        name: c.author?.name || currentUser?.name || 'Você',
        avatarUrl,
      },
      content: c.conteudo || content,
      createdAt: c.createdAt || new Date().toLocaleDateString('pt-BR'),
    };
  },

  async createEventComment(
    eventId: number | string,
    content: string,
    currentUser?: CommentUserParam
  ): Promise<PostComment> {
    const response = await api.post(`/events/${eventId}/comments`, {
      conteudo: content,
    });

    const c = response.data;
    const baseUrl = api.defaults.baseURL || '';
    let avatarUrl = c.author?.avatarUrl || null;
    if (avatarUrl && avatarUrl.startsWith('/')) {
      avatarUrl = `${baseUrl}${avatarUrl}`;
    }
    if (!avatarUrl && currentUser?.avatarUrl) {
      avatarUrl = currentUser.avatarUrl;
    }

    return {
      id: c.id,
      postId: c.idEvento || eventId,
      author: {
        id: c.author?.id || currentUser?.id || 0,
        name: c.author?.name || currentUser?.name || 'Você',
        avatarUrl,
      },
      content: c.conteudo || content,
      createdAt: c.createdAt || new Date().toLocaleDateString('pt-BR'),
    };
  },

  async deleteComment(commentId: string | number): Promise<void> {
    try {
      await api.delete(`/comments/${commentId}`);
    } catch (error) {
      console.warn('Erro ao deletar comentário na API:', error);
    }

    for (const key of Object.keys(MOCK_COMMENTS)) {
      MOCK_COMMENTS[key] = MOCK_COMMENTS[key].filter((c) => String(c.id) !== String(commentId));
    }
    for (const key of Object.keys(MOCK_EVENT_COMMENTS)) {
      MOCK_EVENT_COMMENTS[key] = MOCK_EVENT_COMMENTS[key].filter((c) => String(c.id) !== String(commentId));
    }
  },
};
