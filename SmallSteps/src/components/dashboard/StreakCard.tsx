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
}

/**
 * Converte "2026-07-27T10:00:00.123456" em timestamp (ms).
 * O Postgres/Jackson podem mandar 6+ casas decimais, que o Date do React Native
 * (Hermes) pode não entender e devolver NaN. Mantemos só 3 (milissegundos).
 */
function parseData(valor: string): number {
  const normalizado = valor.replace(/(\.\d{3})\d+/, '$1');
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

/** Retorna o prazo e o fim da carência (prazo + intervalo), ou null se os dados forem inválidos. */
function getJanela(
  ultimoPrazo: string | null,
  intervaloAtividade: number | string | null,
) {
  if (!ultimoPrazo) return null;

  const prazo = parseData(ultimoPrazo);
  const segundos = parseDuracaoSegundos(intervaloAtividade);
  if (Number.isNaN(prazo) || segundos == null || segundos <= 0) return null;

  const duracao = segundos * 1000;
  return { prazo, duracao, fim: prazo + duracao };
}

/**
 * Linha do tempo (prazo = ultimoPrazo, intervalo = intervaloAtividade):
 *
 *   [prazo - intervalo ........ prazo] [prazo ........ prazo + intervalo] [prazo + intervalo ...
 *      ciclo atual (ATIVO se fez)         pendente (carência)                  CONGELADO
 *
 * - ATIVO:     o prazo está no futuro E a última atividade está em [prazo - intervalo, prazo]
 * - PENDENTE:  hoje está em [prazo, prazo + intervalo]
 *              (ou o prazo está no futuro, mas ainda não há atividade no ciclo)
 * - CONGELADO: hoje é maior que prazo + intervalo
 */
export function calcularStatusStreak(
  ultimaAtividade: string | null,
  ultimoPrazo: string | null,
  intervaloAtividade: number | string | null,
  agora: Date = new Date(),
): StreakStatus {
  const janela = getJanela(ultimoPrazo, intervaloAtividade);

  // Sem dados válidos (ex.: usuário antigo): não há como calcular
  if (!janela) return StreakStatus.ATIVO;

  const { prazo, duracao, fim } = janela;
  const now = agora.getTime();

  // Passou do prazo + intervalo
  if (now > fim) return StreakStatus.CONGELADO;

  // Prazo já passou, mas ainda está dentro do intervalo de carência
  if (now >= prazo) return StreakStatus.PENDENTE;

  // Prazo no futuro: ATIVO se a última atividade está dentro do ciclo atual
  if (ultimaAtividade) {
    const ultima = parseData(ultimaAtividade);
    if (!Number.isNaN(ultima) && ultima >= prazo - duracao && ultima <= prazo) {
      return StreakStatus.ATIVO;
    }
  }

  // Prazo no futuro, mas ainda sem atividade neste ciclo
  return StreakStatus.PENDENTE;
}

function formatTimeLeft(ms: number): string {
  if (!Number.isFinite(ms)) return 'Pending';
  if (ms <= 0) return 'Deadline passed';

  const totalMin = Math.floor(ms / 60000);
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? 'day' : 'days'} until freeze`;
  }
  if (hours > 0) return `${hours}h ${minutes}min until freeze`;
  return `${minutes} min until freeze`;
}

export function StreakCard({
  streakNum,
  ultimaAtividade,
  ultimoPrazo,
  intervaloAtividade,
}: StreakCardProps) {
  const activeColor = useThemeColor({}, 'streakActive');
  const warningColor = useThemeColor({}, 'streakWarning');
  const frozenColor = useThemeColor({}, 'streakFrozen');
  const surfaceColor = useThemeColor({}, 'surface');

  const days = streakNum;
  const status = calcularStatusStreak(ultimaAtividade, ultimoPrazo, intervaloAtividade);

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
        return 'Step Taken!';
      case StreakStatus.PENDENTE: {
        const janela = getJanela(ultimoPrazo, intervaloAtividade);
        if (!janela) return 'Pending';
        // O congelamento acontece em prazo + intervalo
        return formatTimeLeft(janela.fim - Date.now());
      }
      case StreakStatus.CONGELADO:
        return 'Frozen';
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
              {days === 1 ? 'DAY' : 'DAYS'}
            </Text>
            <Text style={[styles.streakSublabel, { color: statusColor }]}>
              Current Streak
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
