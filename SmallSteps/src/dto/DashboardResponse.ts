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
  idUsuario?: number;
  title: string;
  milestone?: string | null;
  concluido: boolean;
  dtInicio: string;
  dtFim: string;
  urlMidia?: string | null;
  tipoMidia?: 'IMAGE' | 'VIDEO' | string | null;
  subMetas: SubGoalDTOResponse[];
}

export interface DashboardDTOResponse {
  streakNum: number;
  ultimaAtividade: string | null;
  ultimoPrazo: string | null; // ISO-8601, ex: "2026-10-21T14:30:00"
  intervaloAtividade: number | string | null; // duração em segundos ou ISO-8601
  proximoIntervalo?: number | string | null;
  cicloDescongelamento?: boolean;
  streakStatus?: StreakStatus | string | null;
  metas: GoalDTOResponse[];
}