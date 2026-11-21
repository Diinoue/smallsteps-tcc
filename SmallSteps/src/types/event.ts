export interface CommunityEvent {
  id: number;
  titulo: string;
  descricao: string;
  local: string;
  diaInicio: string;
  diaFim: string;
  horarioInicio: string;
  horarioFim: string;
  formattedDate?: string;
  idUsuario: number;
  nomeUsuario?: string;
  idComunidade: number;
  nomeComunidade?: string;
  bannerUrl?: string | null;
  foto?: string | null;
  commentsCount?: number;
}

export interface CreateEventInput {
  titulo: string;
  descricao: string;
  local: string;
  diaInicio: string; // YYYY-MM-DD
  diaFim?: string; // YYYY-MM-DD
  horarioInicio: string; // HH:mm
  horarioFim: string; // HH:mm
  idUsuario?: number;
  foto?: string | null;
}

export interface UpdateEventInput {
  titulo?: string;
  descricao?: string;
  local?: string;
  diaInicio?: string;
  diaFim?: string;
  horarioInicio?: string;
  horarioFim?: string;
  idUsuario?: number;
  idComunidade?: number;
  foto?: string | null;
}
