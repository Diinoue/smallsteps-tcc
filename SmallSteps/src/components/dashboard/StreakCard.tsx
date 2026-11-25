import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StreakStatus } from '@/src/dto/DashboardResponse';

export interface StreakCardProps {
  streakNum: number;
  ultimaAtividade: string | null;
  ultimoPrazo: string | null; // prazo (deadline) do ciclo atual
  // duração do ciclo: segundos (number) ou ISO-8601 (ex.: "PT24H"), dependendo do Jackson
  intervaloAtividade: number | string | null;
  proximoIntervalo?: number | string | null;
  cicloDescongelamento?: boolean;
  streakStatus?: StreakStatus | string | null;
}

/**
 * Converte "2026-07-27T10:00:00.123456" em timestamp (ms).
 * O Postgres/Jackson podem mandar 6+ casas decimais, que o Date do React Native
 * (Hermes) pode não entender e devolver NaN. Mantemos só 3 (milissegundos).
 */
function parseData(valor: string): number {
  const normalizado = valor.replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1');
  return new Date(normalizado).getTime();
}

/**
 * Converte a duração para segundos. Aceita:
 * - número (86400 ou 86400.000000000)
 * - string numérica ("86400.0")
 * - ISO-8601 ("PT24H", "P1D", "PT1H30M", "PT0.5S")
 */
function parseDuracaoSegundos(valor: number | string | null): number | null {
  if (valor == null) return null;
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;

  const num = Number(valor);
  if (valor.trim() !== '' && Number.isFinite(num)) return num;

  const m = valor.match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/,
  );
  if (!m) return null;

  const [, d = '0', h = '0', min = '0', s = '0'] = m;
  return Number(d) * 86400 + Number(h) * 3600 + Number(min) * 60 + Number(s);
}

/** Retorna o prazo e o fim da carência (prazo + proximoIntervalo/intervalo), ou null se os dados forem inválidos. */
function getJanela(
  ultimoPrazo: string | null,
  intervaloAtividade: number | string | null,
  proximoIntervalo?: number | string | null,
) {
  if (!ultimoPrazo) return null;

  const prazo = parseData(ultimoPrazo);
  const segundos = parseDuracaoSegundos(intervaloAtividade);
  if (Number.isNaN(prazo) || segundos == null || segundos <= 0) return null;

  const duracao = segundos * 1000;
  const segundosProximo = parseDuracaoSegundos(proximoIntervalo ?? null);
  const duracaoProximo =
    segundosProximo != null && segundosProximo > 0 ? segundosProximo * 1000 : duracao;
  return { prazo, duracao, fim: prazo + duracaoProximo };
}

/**
 * Linha do tempo (prazo = ultimoPrazo, intervalo = intervaloAtividade):
 *
 *   [prazo - intervalo ........ prazo] [prazo ........ prazo + proximoIntervalo] [ ...
 *      ciclo atual (ATIVO se fez)         pendente (próximo ciclo)                CONGELADO
 */
export function calcularStatusStreak(
  ultimaAtividade: string | null,
  ultimoPrazo: string | null,
  intervaloAtividade: number | string | null,
  agora: Date = new Date(),
  cicloDescongelamento = false,
  proximoIntervalo?: number | string | null,
): StreakStatus {
  const janela = getJanela(ultimoPrazo, intervaloAtividade, proximoIntervalo);

  // Usuário ainda não iniciou seu primeiro ciclo
  if (!janela) return StreakStatus.PENDENTE;

  const { prazo, duracao, fim } = janela;
  const now = agora.getTime();
  const ultima = ultimaAtividade ? parseData(ultimaAtividade) : NaN;
  const cicloAtualConcluido =
    !cicloDescongelamento && !Number.isNaN(ultima) && ultima > prazo - duracao && ultima <= prazo;

  // Passou do prazo + proximoIntervalo (perdeu 1+ ciclos completos)
  if (now > fim) return StreakStatus.CONGELADO;

  // Passou do prazo do ciclo anterior: está no próximo ciclo imediato [prazo, prazo + proximoIntervalo]
  if (now > prazo) {
    return cicloDescongelamento || cicloAtualConcluido
      ? StreakStatus.PENDENTE
      : StreakStatus.CONGELADO;
  }

  // Dentro do ciclo atual [prazo - intervalo, prazo]
  if (cicloAtualConcluido) {
    return StreakStatus.ATIVO;
  }

  return StreakStatus.PENDENTE;
}

/**
 * Retorna o tempo que falta a partir de hoje até o dia do ultimo_prazo.
 * Aceita a string da data (ex: "2026-10-26 23:59:00") ou milissegundos restantes.
 */
export function formatTimeLeft(
  prazoOrMs: string | number | null,
  agora: Date = new Date(),
): string {
  if (prazoOrMs == null) return 'Pendente';

  let diffMs: number;
  if (typeof prazoOrMs === 'number') {
    diffMs = prazoOrMs;
  } else {
    const prazo = parseData(prazoOrMs);
    if (!Number.isFinite(prazo) || Number.isNaN(prazo)) return 'Pendente';
    diffMs = prazo - agora.getTime();
  }

  if (!Number.isFinite(diffMs)) return 'Pendente';
  if (diffMs <= 0) return 'Prazo encerrado';

  const totalMin = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    const dayLabel = days === 1 ? 'dia' : 'dias';
    const hourLabel = remHours === 1 ? 'hora' : 'horas';
    return `${days} ${dayLabel} e ${remHours} ${hourLabel} restantes`;
  }
  if (hours > 0) return `${hours}h ${minutes}min restantes`;
  return `${minutes} min restantes`;
}

export function StreakCard({
  streakNum,
  ultimaAtividade,
  ultimoPrazo,
  intervaloAtividade,
  proximoIntervalo,
  cicloDescongelamento = false,
  streakStatus,
}: StreakCardProps) {
  const activeColor = useThemeColor({}, 'streakActive');
  const warningColor = useThemeColor({}, 'streakWarning');
  const frozenColor = useThemeColor({}, 'streakFrozen');
  const surfaceColor = useThemeColor({}, 'surface');

  const days = streakNum;
  const status: StreakStatus =
    streakStatus === StreakStatus.ATIVO ||
    streakStatus === StreakStatus.PENDENTE ||
    streakStatus === StreakStatus.CONGELADO
      ? streakStatus
      : calcularStatusStreak(
          ultimaAtividade,
          ultimoPrazo,
          intervaloAtividade,
          new Date(),
          cicloDescongelamento,
          proximoIntervalo,
        );

  const getStatusColor = (): string => {
    switch (status) {
      case StreakStatus.ATIVO:
        return activeColor;
      case StreakStatus.PENDENTE:
        return warningColor;
      case StreakStatus.CONGELADO:
        return frozenColor;
      default:
        return activeColor;
    }
  };

  const statusColor = getStatusColor();

  const getSubtext = (): string => {
    switch (status) {
      case StreakStatus.ATIVO:
        return 'Passo concluído!';
      case StreakStatus.PENDENTE: {
        const janela = getJanela(ultimoPrazo, intervaloAtividade, proximoIntervalo);
        if (!janela) return 'Faça uma publicação para começar!';
        const now = Date.now();
        if (cicloDescongelamento && now <= janela.prazo) {
          return `Em descongelamento • ${formatTimeLeft(janela.prazo - now)}`;
        }
        const alvoMs = now > janela.prazo ? janela.fim - now : janela.prazo - now;
        return formatTimeLeft(alvoMs);
      }
      case StreakStatus.CONGELADO:
        return 'Congelada';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.cardContainer, { backgroundColor: surfaceColor }]}>
      {/* Top Header Section */}
      <View style={styles.topSection}>
        <View style={styles.daysRow}>
          <Text style={[styles.daysNumber, { color: statusColor }]}>{days}</Text>
          <View style={styles.daysLabelColumn}>
            <Text style={[styles.daysText, { color: statusColor }]}>
              {days === 1 ? 'DIA' : 'DIAS'}
            </Text>
            <Text style={[styles.streakSublabel, { color: statusColor }]}>
              Sequência Atual
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: statusColor, opacity: 0.3 }]} />

      {/* Bottom Status Row */}
      <View style={styles.bottomSection}>
        <Text style={[styles.statusMessage, { color: statusColor }]}>
          {getSubtext()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  daysNumber: {
    fontSize: 54,
    fontWeight: '900',
    lineHeight: 60,
    letterSpacing: -1,
  },
  daysLabelColumn: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  daysText: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  streakSublabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  practiceBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  divider: {
    height: 1.5,
    marginVertical: 14,
    width: '100%',
  },
  bottomSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusMessage: {
    fontSize: 15,
    fontWeight: '700',
  },
});
