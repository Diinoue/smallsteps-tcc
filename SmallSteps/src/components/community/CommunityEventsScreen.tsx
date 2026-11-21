import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CommunityEvent } from '@/src/types/event';
import { eventService } from '@/src/services/eventService';
import { uploadMedia } from '@/src/services/communityService';
import { EventCard } from './EventCard';
import { EventCommentsScreen } from './EventCommentsScreen';

export interface CommunityEventsScreenProps {
  communityId?: number | string;
  communityName?: string;
  userRole?: string;
  isAdmin?: boolean;
  onBackPress?: () => void;
}

export function CommunityEventsScreen({
  communityId = 'default',
  communityName = 'Grupo #1 musica',
  userRole,
  isAdmin = true, // Por padrão habilitado para que os administradores possam adicionar
  onBackPress,
}: CommunityEventsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = isDark ? '#2D3748' : '#EEEEEE';
  const inputBg = isDark ? '#2D3748' : '#F3F4F6';

  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados do Modal de Criação / Edição de Evento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string | null>(null);

  // Estados do Dropdown de Opções do Evento (3 pontos estilo Perfil)
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number }>({ top: 54, right: 20 });
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);

  // Visualização de Comentários do Evento
  const [selectedEventForComments, setSelectedEventForComments] = useState<CommunityEvent | null>(null);

  // Hardware Back Handler para fechar comentários do evento
  useEffect(() => {
    if (!selectedEventForComments) return;
    const backAction = () => {
      setSelectedEventForComments(null);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [selectedEventForComments]);

  const loadEvents = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await eventService.getCommunityEvents(communityId);
      setEvents(data);
    } catch (error) {
      console.error('Erro ao carregar eventos da comunidade:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [communityId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadEvents(false);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para anexar a imagem do evento.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedImageUri(asset.uri);
      setSelectedMimeType(asset.mimeType || 'image/jpeg');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageUri(null);
    setSelectedMimeType(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    handleRemoveImage();
  };

  const handleOpenCreateModal = () => {
    // Sugere datas e horários padrão
    setEditingEvent(null);
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    setStartDate(formattedToday);
    setEndDate(formattedToday);
    setStartTime('13:00');
    setEndTime('19:00');
    setTitle('');
    setLocation('');
    setDescription('');
    handleRemoveImage();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: CommunityEvent) => {
    setEditingEvent(event);
    setTitle(event.titulo || '');
    setLocation(event.local || '');
    setDescription(event.descricao || '');
    setStartDate(event.diaInicio || '');
    setEndDate(event.diaFim || event.diaInicio || '');
    setStartTime(event.horarioInicio ? event.horarioInicio.slice(0, 5) : '13:00');
    setEndTime(event.horarioFim ? event.horarioFim.slice(0, 5) : '19:00');
    setSelectedImageUri(event.foto || event.bannerUrl || null);
    setSelectedMimeType(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!title.trim() || !location.trim() || !description.trim()) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha o título, local e descrição do evento.');
      return;
    }

    try {
      setIsSubmitting(true);

      let fotoUrl: string | null = null;
      if (selectedImageUri && selectedMimeType) {
        try {
          fotoUrl = await uploadMedia(selectedImageUri, selectedMimeType);
        } catch (uploadError) {
          console.error('Erro no upload da foto do evento:', uploadError);
          Alert.alert('Erro no Upload', 'Não foi possível enviar a imagem. Tente novamente.');
          return;
        }
      } else if (selectedImageUri) {
        fotoUrl = selectedImageUri;
      }

      if (editingEvent) {
        // Atualizar Evento Existente
        const updatedEvent = await eventService.updateEvent(editingEvent.id, {
          titulo: title.trim(),
          local: location.trim(),
          descricao: description.trim(),
          diaInicio: startDate || editingEvent.diaInicio || new Date().toISOString().split('T')[0],
          diaFim: endDate || startDate || editingEvent.diaFim,
          horarioInicio: startTime || '13:00',
          horarioFim: endTime || '19:00',
          idComunidade: Number(communityId) || editingEvent.idComunidade,
          foto: fotoUrl,
        });

        setEvents((prev) =>
          prev.map((e) => (e.id === editingEvent.id ? { ...e, ...updatedEvent } : e))
        );
        handleCloseModal();
        Alert.alert('Sucesso', 'Evento atualizado na comunidade!');
      } else {
        // Criar Novo Evento
        const newEvent = await eventService.createEvent(communityId, {
          titulo: title.trim(),
          local: location.trim(),
          descricao: description.trim(),
          diaInicio: startDate || new Date().toISOString().split('T')[0],
          diaFim: endDate || startDate,
          horarioInicio: startTime || '13:00',
          horarioFim: endTime || '19:00',
          foto: fotoUrl,
        });

        setEvents((prev) => [newEvent, ...prev]);
        handleCloseModal();
        Alert.alert('Sucesso', 'Evento publicado na comunidade!');
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      Alert.alert(
        'Erro',
        editingEvent ? 'Não foi possível atualizar o evento.' : 'Não foi possível cadastrar o evento.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventOptions = (event: CommunityEvent, gestureEvent?: GestureResponderEvent) => {
    const pageY = gestureEvent?.nativeEvent?.pageY;
    if (pageY !== undefined) {
      const windowHeight = Dimensions.get('window').height;
      const top = Math.max(60, Math.min(pageY - 10, windowHeight - 160));
      setMenuPosition({ top, right: 20 });
    } else {
      setMenuPosition({ top: 120, right: 20 });
    }
    setSelectedEvent(event);
    setMenuVisible(true);
  };

  const handleEditEventPress = () => {
    setMenuVisible(false);
    if (selectedEvent) {
      handleOpenEditModal(selectedEvent);
    }
  };

  const handleDeleteEventPress = () => {
    setMenuVisible(false);
    if (!selectedEvent) return;
    const eventToDelete = selectedEvent;

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente remover o evento "${eventToDelete.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventService.deleteEvent(eventToDelete.id);
              setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
              Alert.alert('Sucesso', 'Evento removido com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir evento:', error);
              Alert.alert('Erro', 'Não foi possível remover o evento.');
            }
          },
        },
      ]
    );
  };

  const handleComments = (event: CommunityEvent) => {
    setSelectedEventForComments(event);
  };

  if (selectedEventForComments) {
    return (
      <EventCommentsScreen
        communityId={communityId}
        communityName={communityName}
        userRole={userRole}
        isAdmin={isAdmin}
        event={selectedEventForComments}
        onBackPress={() => setSelectedEventForComments(null)}
        onCommentCountChange={(newCount) => {
          setEvents((prev) =>
            prev.map((e) =>
              e.id === selectedEventForComments.id ? { ...e, commentsCount: newCount } : e
            )
          );
          setSelectedEventForComments((prev) =>
            prev ? { ...prev, commentsCount: newCount } : null
          );
        }}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Top Header conforme o protótipo: Título "Events" */}
      <View style={[styles.headerContainer, { borderBottomColor: borderColor }]}>
        <View style={styles.titleSection}>
          {onBackPress && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="arrow-back" size={26} color={textColor} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Events
          </Text>
        </View>

        {/* Botão de Adicionar Evento para Administradores */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: primaryColor }]}
            onPress={handleOpenCreateModal}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de Eventos */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onOptionsPress={isAdmin ? handleEventOptions : undefined}
              onCommentsPress={handleComments}
              onPress={handleComments}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={primaryColor}
              colors={[primaryColor]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={54} color={textMuted} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Nenhum evento agendado</Text>
              <Text style={[styles.emptySubtitle, { color: textMuted }]}>
                {isAdmin
                  ? 'Toque no botão "+" no topo para criar o primeiro evento desta comunidade.'
                  : 'Fique atento! Novos eventos serão divulgados aqui pelos organizadores.'}
              </Text>
            </View>
          }
        />
      )}

      {/* 3-dots Dropdown Modal (estilo Perfil) */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdownModalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdownCard,
                  {
                    top: menuPosition.top,
                    right: menuPosition.right,
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E5E7EB',
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleEditEventPress}
                  style={styles.dropdownItem}
                >
                  <Text style={[styles.dropdownItemText, { color: textColor }]}>
                    Editar Evento
                  </Text>
                </TouchableOpacity>

                <View
                  style={[
                    styles.dropdownDivider,
                    { backgroundColor: isDark ? '#374151' : '#F3F4F6' },
                  ]}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleDeleteEventPress}
                  style={styles.dropdownItem}
                >
                  <Text style={[styles.dropdownItemText, { color: '#EF4444' }]}>
                    Excluir Evento
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de Criação / Edição de Evento */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                {editingEvent ? 'Editar Evento' : 'Criar Novo Evento'}
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
              {/* Campo: Título */}
              <Text style={[styles.inputLabel, { color: textColor }]}>Título do Evento *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                placeholder="ex.: Encontro música ao vivo"
                placeholderTextColor={textMuted}
                value={title}
                onChangeText={setTitle}
              />

              {/* Campo: Local */}
              <Text style={[styles.inputLabel, { color: textColor }]}>Local / Endereço *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                placeholder="ex.: Travessa das Flores, 789, Bairro Novo"
                placeholderTextColor={textMuted}
                value={location}
                onChangeText={setLocation}
              />

              {/* Linha: Datas */}
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Data Início</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={textMuted}
                    value={startDate}
                    onChangeText={setStartDate}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Data Fim</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={textMuted}
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>
              </View>

              {/* Linha: Horários */}
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Horário Início</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                    placeholder="13:00"
                    placeholderTextColor={textMuted}
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Horário Fim</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                    placeholder="19:00"
                    placeholderTextColor={textMuted}
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>

              {/* Campo: Descrição */}
              <Text style={[styles.inputLabel, { color: textColor }]}>Descrição *</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: inputBg, color: textColor }]}
                placeholder="Descreva a programação, atrações ou avisos..."
                placeholderTextColor={textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />

              {/* Campo: Imagem do Evento (Opcional) */}
              <Text style={[styles.inputLabel, { color: textColor }]}>Imagem do Evento (Opcional)</Text>
              {selectedImageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedImageUri }}
                    style={styles.imagePreview}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={styles.imageRemoveButton}
                    onPress={handleRemoveImage}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="close" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.imagePickerButton,
                    {
                      borderColor: isDark ? '#4A5568' : '#CBD5E1',
                      backgroundColor: isDark ? '#2D3748' : '#F8FAFC',
                    },
                  ]}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="add-photo-alternate" size={28} color={primaryColor} />
                  <Text style={[styles.imagePickerText, { color: textColor }]}>
                    Anexar imagem do evento
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botão de Envio */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: primaryColor }]}
                onPress={handleSaveEvent}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingEvent ? 'Salvar Alterações' : 'Publicar Evento'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // 3-dots Dropdown Modal
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  dropdownCard: {
    position: 'absolute',
    width: 160,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownDivider: {
    height: 1,
    width: '100%',
  },
  // Modal de Criação / Edição
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalForm: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    height: 90,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  submitButton: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  imagePickerButton: {
    height: 80,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    marginVertical: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

