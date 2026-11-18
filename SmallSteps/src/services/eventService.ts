import { api } from './api';
import { CommunityEvent, CreateEventInput } from '../types/event';

const MOCK_EVENTS: Record<number | string, CommunityEvent[]> = {
  default: [
    {
      id: 1,
      idComunidade: 1,
      idUsuario: 1,
      nomeUsuario: 'Lagarto Voador',
      titulo: 'Encontro musica',
      local: 'Travessa das Flores, 789, Bairro Novo, Vila Fictícia, RJ',
      descricao: 'Uma noite de música ao vivo e confraternização para toda a comunidade.',
      diaInicio: '2026-06-14',
      diaFim: '2026-06-19',
      horarioInicio: '13:00',
      horarioFim: '19:00',
      formattedDate: '14/6/26 - 19/6/26 13:00 - 19:00',
      bannerUrl: null,
      commentsCount: 2,
    },
    {
      id: 2,
      idComunidade: 1,
      idUsuario: 2,
      nomeUsuario: 'Cachorro Cansado',
      titulo: 'Encontro musica',
      local: 'Travessa das Flores, 789, Bairro Novo, Vila Fictícia, RJ',
      descricao: 'Ensaio aberto para iniciantes e troca de experiências sobre teoria musical.',
      diaInicio: '2026-07-18',
      diaFim: '2026-07-18',
      horarioInicio: '13:00',
      horarioFim: '19:00',
      formattedDate: '18/07/26 - 18/07/26 13:00 - 19:00',
      bannerUrl: null,
      commentsCount: 0,
    },
  ],
};

function formatEventDate(diaInicio?: string, diaFim?: string, horarioInicio?: string, horarioFim?: string): string {
  if (!diaInicio) return '';

  const formatSingle = (isoDate: string) => {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const year = parts[0].slice(-2);
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
    return isoDate;
  };

  const d1 = formatSingle(diaInicio);
  const d2 = diaFim ? formatSingle(diaFim) : d1;
  const time = horarioInicio && horarioFim ? ` ${horarioInicio.slice(0, 5)} - ${horarioFim.slice(0, 5)}` : '';

  return `${d1} - ${d2}${time}`;
}

export const eventService = {
  async getCommunityEvents(communityId: number | string = 'default'): Promise<CommunityEvent[]> {
    try {
      const response = await api.get<any[]>(`/community/${communityId}/events`);
      if (Array.isArray(response.data)) {
        const baseUrl = api.defaults.baseURL || '';
        return response.data.map((e) => {
          let fotoUrl = e.foto || e.bannerUrl || null;
          if (fotoUrl && fotoUrl.startsWith('/')) {
            fotoUrl = `${baseUrl}${fotoUrl}`;
          }

          return {
            id: e.id,
            idComunidade: e.idComunidade || Number(communityId),
            idUsuario: e.idUsuario || 0,
            nomeUsuario: e.nomeUsuario || 'Organizador',
            titulo: e.titulo || '',
            local: e.local || '',
            descricao: e.descricao || '',
            diaInicio: e.diaInicio || '',
            diaFim: e.diaFim || e.diaInicio || '',
            horarioInicio: e.horarioInicio || '',
            horarioFim: e.horarioFim || '',
            formattedDate: e.formattedDate || formatEventDate(e.diaInicio, e.diaFim, e.horarioInicio, e.horarioFim),
            bannerUrl: fotoUrl,
            foto: fotoUrl,
            commentsCount: e.commentsCount || 0,
          };
        });
      }
    } catch (error) {
      console.warn('API /community/:id/events indisponível, usando dados de demonstração:', error);
    }

    const fallback = MOCK_EVENTS[communityId] || MOCK_EVENTS['default'] || [];
    return [...fallback];
  },

  async createEvent(communityId: number | string = 'default', input: CreateEventInput): Promise<CommunityEvent> {
    try {
      const response = await api.post(`/community/${communityId}/events`, {
        titulo: input.titulo,
        descricao: input.descricao,
        local: input.local,
        diaInicio: input.diaInicio,
        diaFim: input.diaFim || input.diaInicio,
        horarioInicio: input.horarioInicio,
        horarioFim: input.horarioFim,
        idUsuario: input.idUsuario,
        foto: input.foto || null,
      });

      const e = response.data;
      if (e && e.id) {
        const baseUrl = api.defaults.baseURL || '';
        let fotoUrl = e.foto || null;
        if (fotoUrl && fotoUrl.startsWith('/')) {
          fotoUrl = `${baseUrl}${fotoUrl}`;
        }

        return {
          id: e.id,
          idComunidade: e.idComunidade || Number(communityId),
          idUsuario: e.idUsuario || 0,
          nomeUsuario: e.nomeUsuario || 'Você',
          titulo: e.titulo || input.titulo,
          local: e.local || input.local,
          descricao: e.descricao || input.descricao,
          diaInicio: e.diaInicio || input.diaInicio,
          diaFim: e.diaFim || input.diaFim || input.diaInicio,
          horarioInicio: e.horarioInicio || input.horarioInicio,
          horarioFim: e.horarioFim || input.horarioFim,
          formattedDate: e.formattedDate || formatEventDate(input.diaInicio, input.diaFim, input.horarioInicio, input.horarioFim),
          bannerUrl: fotoUrl,
          foto: fotoUrl,
          commentsCount: 0,
        };
      }
    } catch (error) {
      console.warn('Erro ao criar evento na API, salvando localmente:', error);
    }

    const newEvent: CommunityEvent = {
      id: Date.now(),
      idComunidade: Number(communityId) || 1,
      idUsuario: 1,
      nomeUsuario: 'Você',
      titulo: input.titulo,
      local: input.local,
      descricao: input.descricao,
      diaInicio: input.diaInicio,
      diaFim: input.diaFim || input.diaInicio,
      horarioInicio: input.horarioInicio,
      horarioFim: input.horarioFim,
      formattedDate: formatEventDate(input.diaInicio, input.diaFim, input.horarioInicio, input.horarioFim),
      bannerUrl: input.foto || null,
      foto: input.foto || null,
      commentsCount: 0,
    };

    if (!MOCK_EVENTS[communityId]) {
      MOCK_EVENTS[communityId] = [...(MOCK_EVENTS['default'] || [])];
    }
    MOCK_EVENTS[communityId] = [newEvent, ...MOCK_EVENTS[communityId]];
    return newEvent;
  },

  async deleteEvent(eventId: number): Promise<void> {
    try {
      await api.delete(`/events/${eventId}`);
    } catch (error) {
      console.warn('Erro ao deletar evento na API:', error);
    }
  },
};
