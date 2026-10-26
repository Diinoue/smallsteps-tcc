export enum StreakStatus {
  ATIVO = "ATIVO",
  PENDENTE = "PENDENTE",
  CONGELADO = "CONGELADO",
}

export interface SubGoalDTOResponse {
  id: number;
  concluido: boolean;
  titulo: string;
  dtInicio: string; // ISO-8601, ex: "2026-10-21T14:30:00"
  dtFim: string;
  pos: number;
}

export interface GoalDTOResponse {
  id: number;
  title: string;
  concluido: boolean;
  dtInicio: string;
  dtFim: string;
  subMetas: SubGoalDTOResponse[];
}

export interface DashboardDTOResponse {
  streakNum: number;
  ultimaAtividade: string | null;
  ultimoPrazo: string | null; // ISO-8601, ex: "2026-10-21T14:30:00"
  intervaloAtividade: number | null; // duração em segundos, ex: 86400 = 1 dia
  metas: GoalDTOResponse[];
}