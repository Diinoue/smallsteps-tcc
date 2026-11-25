import { api } from './api';
import { formatImageUrl } from './communityService';
import { GoalDTOResponse } from '@/src/dto/DashboardResponse';

// ─── Tipos de request ────────────────────────────────────────────────────────

export interface SubGoalRequest {
  titulo: string;
  concluido?: boolean;
  dtInicio?: string | null;
  dtFim?: string | null;
}

export interface CreateGoalRequest {
  titulo: string;
  milestone?: string | null;
  idUsuario?: number;
  visivel?: boolean;
  dtInicio?: string | null;
  dtFim?: string | null;
  subMetas?: SubGoalRequest[];
}

export interface UpdateGoalRequest {
  titulo?: string;
  milestone?: string | null;
  concluido?: boolean;
  dtFim?: string | null;
  urlMidia?: string | null;
  tipoMidia?: string | null;
  subMetas?: SubGoalRequest[];
}

// ─── Serviço ─────────────────────────────────────────────────────────────────

export const goalService = {
  /**
   * Buscar todas as metas do usuário autenticado na sessão atual.
   */
  async getMyGoals(): Promise<GoalDTOResponse[]> {
    const { data } = await api.get<GoalDTOResponse[]>('/goals/me');
    return (data || []).map((g) => ({
      ...g,
      urlMidia: formatImageUrl(g.urlMidia),
    }));
  },

  /**
   * Buscar todas as metas de um usuário específico (ex.: ao visualizar perfil de outro usuário).
   */
  async getGoalsByUser(userId: number): Promise<GoalDTOResponse[]> {
    const { data } = await api.get<GoalDTOResponse[]>(`/goals/usuario/${userId}`);
    return (data || []).map((g) => ({
      ...g,
      urlMidia: formatImageUrl(g.urlMidia),
    }));
  },

  /**
   * Buscar meta por ID no backend.
   * Retorna GoalDTOResponse ou null se não encontrada.
   */
  async getGoalById(id: string | number): Promise<GoalDTOResponse | null> {
    try {
      const { data } = await api.get<GoalDTOResponse>(`/goals/${id}`);
      return data ? { ...data, urlMidia: formatImageUrl(data.urlMidia) } : null;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },

  /**
   * Criar nova meta no backend.
   */
  async createGoal(payload: CreateGoalRequest): Promise<GoalDTOResponse> {
    const { data } = await api.post<GoalDTOResponse>('/goals', payload);
    return data;
  },

  /**
   * Atualizar meta existente no backend.
   */
  async updateGoal(id: string | number, payload: UpdateGoalRequest): Promise<GoalDTOResponse> {
    const { data } = await api.put<GoalDTOResponse>(`/goals/${id}`, payload);
    return data;
  },

  /**
   * Marcar meta como concluída.
   */
  async concluirGoal(id: string | number): Promise<GoalDTOResponse> {
    const { data } = await api.patch<GoalDTOResponse>(`/goals/${id}/concluir`);
    return data;
  },

  /**
   * Excluir meta.
   */
  async deleteGoal(id: string | number): Promise<void> {
    await api.delete(`/goals/${id}`);
  },
};
