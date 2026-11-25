export type MediaType = 'text' | 'image' | 'video';

export interface PostAuthor {
  id: string | number;
  name: string;
  avatarUrl?: string | null;
  streakDays: number;
}

export interface Post {
  id: string | number;
  communityId: string | number;
  author: PostAuthor;
  content: string;
  createdAt: string;
  mediaType: MediaType;
  mediaUrl?: string | null;
  aspectRatio?: number;
  commentsCount: number;
  streakAction?: string | null;
  streakMessage?: string | null;
}

export interface CreatePostInput {
  content: string;
  mediaType?: MediaType;
  mediaUrl?: string | null;
}

export interface CommentAuthor {
  id: string | number;
  name: string;
  avatarUrl?: string | null;
}

export interface PostComment {
  id: string | number;
  postId: string | number;
  author: CommentAuthor;
  content: string;
  createdAt: string;
}

export interface CreateCommentInput {
  conteudo: string;
  idUsuario?: number;
}
