import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StreakStatus } from '@/src/dto/DashboardResponse';

export interface StreakCardProps {
  streakNum: number;
  ultimaAtividade: string | null;
  ultimoPrazo: string | null; // início de um ciclo (âncora)
  intervaloAtividade: number | null; // duração de cada ciclo, em segundos
}

/**
 * Calcula em qual ciclo o usuário está "agora".
 * Os ciclos se repetem a partir do ultimoPrazo, cada um com intervaloAtividade segundos.
 */
function getCicloAtual(
  ultimoPrazo: string,
  intervaloAtividade: number,
  agora: Date = new Date(),
) {
  const duracao = intervaloAtividade * 1000;
  const inicio = new Date(ultimoPrazo).getTime();
  const indice = Math.max(0, Math.floor((agora.getTime() - inicio) / duracao));

  const inicioAtual = inicio + indice * duracao;
  return { indice, inicioAtual, fimAtual: inicioAtual + duracao, duracao };
}

/**
 * - ATIVO:     já fez a atividade no ciclo atual
 * - PENDENTE:  ainda não fez no ciclo atual, mas fez no anterior (dá tempo)
 * - CONGELADO: um ciclo inteiro passou sem atividade
 */
export function calcularStatusStreak(
  ultimaAtividade: string | null,
  ultimoPrazo: string | null,
  intervaloAtividade: number | null,
  agora: Date = new Date(),
): StreakStatus {
  // Sem dados suficientes (ex.: usuário antigo): não há como calcular
  if (!ultimoPrazo || !intervaloAtividade || intervaloAtividade <= 0) {
    return StreakStatus.ATIVO;
  }

  // O primeiro ciclo ainda não começou
  if (agora.getTime() < new Date(ultimoPrazo).getTime()) return StreakStatus.ATIVO;

  const { indice, inicioAtual, duracao } = getCicloAtual(
    ultimoPrazo,
    intervaloAtividade,
    agora,
  );

  if (!ultimaAtividade) {
    // Nunca fez atividade: pendente no primeiro ciclo, congelado depois
    return indice === 0 ? StreakStatus.PENDENTE : StreakStatus.CONGELADO;
  }

  const ultima = new Date(ultimaAtividade).getTime();

  // Fez a atividade no ciclo atual
  if (ultima >= inicioAtual) return StreakStatus.ATIVO;

  // Fez no ciclo anterior e ainda não fez neste: dá tempo
  if (ultima >= inicioAtual - duracao) return StreakStatus.PENDENTE;

  // Passou um ciclo inteiro sem atividade
  return StreakStatus.CONGELADO;
}

function formatTimeLeft(ms: number): string {
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
        if (!ultimoPrazo || !intervaloAtividade) return 'Pending';
        const { fimAtual } = getCicloAtual(ultimoPrazo, intervaloAtividade);
        return formatTimeLeft(fimAtual - Date.now());
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
