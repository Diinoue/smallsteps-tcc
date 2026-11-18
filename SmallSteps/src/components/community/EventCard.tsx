import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CommunityEvent } from '@/src/types/event';

export interface EventCardProps {
  event: CommunityEvent;
  onOptionsPress?: (event: CommunityEvent) => void;
  onCommentsPress?: (event: CommunityEvent) => void;
  onPress?: (event: CommunityEvent) => void;
}

function formatSingleDate(isoDate?: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const year = parts[0].slice(-2);
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  return isoDate;
}

function getEventDateAndTimeString(event: CommunityEvent): { dateRange: string; timeRange: string } {
  const d1 = formatSingleDate(event.diaInicio);
  const d2 = formatSingleDate(event.diaFim || event.diaInicio);

  const startTime = event.horarioInicio ? event.horarioInicio.slice(0, 5) : '';
  const endTime = event.horarioFim ? event.horarioFim.slice(0, 5) : '';
  const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : (startTime || endTime || '');

  const dateRange = d1 && d2 ? `${d1} - ${d2}` : (d1 || d2 || event.formattedDate || '');

  return { dateRange, timeRange };
}

export function EventCard({
  event,
  onOptionsPress,
  onCommentsPress,
  onPress,
}: EventCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = isDark ? '#2D3748' : '#EEEEEE';
  const cardBoxBorder = isDark ? '#374151' : '#E5E7EB';
  const imagePlaceholderBg = isDark ? '#2D3748' : '#E2E8F0';

  const { dateRange, timeRange } = getEventDateAndTimeString(event);

  return (
    <View style={[styles.container, { borderBottomColor: borderColor }]}>
      {/* 1. Header do Evento: Período/Horário à esquerda e Botão de Opções '•••' no canto superior direito */}
      <View style={styles.headerRow}>
        <View style={styles.dateContainer}>
          <Text style={[styles.dateHeader, { color: textColor }]}>
            {dateRange}
          </Text>
          {timeRange ? (
            <Text style={[styles.timeHeader, { color: textMuted }]}>
              {timeRange}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => onOptionsPress?.(event)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.optionsButton}
        >
          <Text style={[styles.optionsText, { color: textColor }]}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Banner / Imagem do Evento */}
      <TouchableOpacity
        activeOpacity={onPress ? 0.85 : 1}
        onPress={() => onPress?.(event)}
        disabled={!onPress}
        style={[styles.mediaContainer, { backgroundColor: imagePlaceholderBg }]}
      >
        {event.foto || event.bannerUrl ? (
          <Image
            source={{ uri: (event.foto || event.bannerUrl)! }}
            style={styles.bannerImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons
              name="image"
              size={56}
              color={isDark ? '#4B5563' : '#CBD5E1'}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* 3. Título do Evento */}
      <Text style={[styles.title, { color: textColor }]}>
        {event.titulo}
      </Text>

      {/* 4. Localização / Endereço */}
      {event.local ? (
        <Text style={[styles.location, { color: textMuted }]}>
          {event.local}
        </Text>
      ) : null}

      {/* 5. Caixa de Descrição com borda fina */}
      {event.descricao ? (
        <View style={[styles.descriptionBox, { borderColor: cardBoxBorder }]}>
          <Text style={[styles.descriptionText, { color: textColor }]}>
            {event.descricao}
          </Text>
        </View>
      ) : null}

      {/* 6. Rodapé: Botão de Comentários à direita */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          onPress={() => onCommentsPress?.(event)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.commentButton}
        >
          <MaterialIcons
            name="chat-bubble-outline"
            size={22}
            color={textColor}
          />
          {typeof event.commentsCount === 'number' && event.commentsCount > 0 ? (
            <Text style={[styles.commentsCount, { color: textMuted }]}>
              {event.commentsCount}
            </Text>
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
    marginRight: 8,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  timeHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  optionsButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  optionsText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  mediaContainer: {
    width: '100%',
    height: 170,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
    marginBottom: 12,
  },
  descriptionBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 2,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  commentsCount: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
