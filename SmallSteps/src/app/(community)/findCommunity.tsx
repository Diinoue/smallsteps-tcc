import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CommunityPreviewModal } from '@/src/components/community/CommunityPreviewModal';
import { getPublicCommunities, PublicCommunityItem } from '@/src/services/communityService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT_GREEN = '#34C759';
const ACCENT_BLUE = '#2563EB';

export default function FindCommunity() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const inputBg = isDark ? '#1F2937' : '#FFFFFF';
  const tagBg = isDark ? '#1E293B' : '#E8F2FF';
  const tagTextColor = isDark ? '#60A5FA' : '#2563EB';

  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState<PublicCommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<PublicCommunityItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const loadCommunities = useCallback(async (search?: string, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await getPublicCommunities(search, 1);
      // Filtra para garantir que apenas comunidades que o usuário NÃO participa sejam exibidas
      setCommunities((data || []).filter((c) => !c.jaParticipa));
    } catch (error) {
      console.error('Erro ao buscar comunidades:', error);
      Alert.alert('Erro', 'Não foi possível carregar as comunidades públicas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Busca inicial
  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  // Debounce na pesquisa
  useEffect(() => {
    const handler = setTimeout(() => {
      loadCommunities(searchTerm);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm, loadCommunities]);

  const handleOpenModal = (community: PublicCommunityItem) => {
    setSelectedCommunity(community);
  };

  const handleJoinedCommunity = (community: PublicCommunityItem) => {
    setSelectedCommunity(null);
    setCommunities((prev) => prev.filter((c) => c.id !== community.id));
    Alert.alert('Sucesso!', `Você agora faz parte da comunidade "${community.nome}"!`, [
      {
        text: 'Continuar explorando',
        style: 'cancel',
      },
      {
        text: 'Ver minhas comunidades',
        onPress: () => router.push('/(tabs)/communities'),
      },
    ]);
  };

  const renderCommunityItem = ({ item }: { item: PublicCommunityItem }) => {
    const hasPhoto = !!item.foto && !failedImages[item.id];

    return (
      <TouchableOpacity
        style={[styles.itemContainer, { borderBottomColor: borderColor }]}
        activeOpacity={0.7}
        onPress={() => handleOpenModal(item)}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {hasPhoto ? (
            <Image
              source={{ uri: item.foto! }}
              style={styles.avatarImage}
              onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              {/* Pontinhos estilizados de padrão decorativo do mockup */}
              <View style={styles.dotPatternRow}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
              <View style={styles.dotPatternRow}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
              <View style={styles.dotPatternRow}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          )}
        </View>

        {/* Informações da Comunidade */}
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={1}>
            {item.nome}
          </Text>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={[styles.tagBadge, { backgroundColor: tagBg }]}>
                  <Text style={[styles.tagText, { color: tagTextColor }]}>
                    {tag.toLowerCase()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Ação */}
        <View style={styles.itemAction}>
          <MaterialIcons name="chevron-right" size={24} color={textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={backgroundColor} />

      {/* Header com Botão Voltar */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Pesquisar Comunidades</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        {/* Barra de Pesquisa em formato Pílula */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: inputBg,
                borderColor: borderColor,
              },
            ]}
          >
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="pesquise por um grupo aqui..."
              placeholderTextColor={textMuted}
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchTerm.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchTerm('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="close" size={20} color={textMuted} />
              </TouchableOpacity>
            ) : (
              <MaterialIcons name="search" size={22} color={textMuted} />
            )}
          </View>
        </View>

        {/* Lista de Comunidades */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={ACCENT_GREEN} />
            <Text style={[styles.loadingText, { color: textMuted }]}>Buscando comunidades...</Text>
          </View>
        ) : (
          <FlatList
            data={communities}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCommunityItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadCommunities(searchTerm, true)}
                tintColor={ACCENT_GREEN}
                colors={[ACCENT_GREEN]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={64} color={textMuted} />
                <Text style={[styles.emptyTitle, { color: textColor }]}>Nenhuma comunidade encontrada</Text>
                <Text style={[styles.emptySubtitle, { color: textMuted }]}>
                  {searchTerm.trim().length > 0
                    ? `Não encontramos grupos correspondentes a "${searchTerm}".`
                    : 'Não há comunidades públicas disponíveis no momento.'}
                </Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>

      <CommunityPreviewModal
        visible={!!selectedCommunity}
        community={selectedCommunity}
        userId={1}
        onClose={() => setSelectedCommunity(null)}
        onJoined={handleJoinedCommunity}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    marginRight: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  avatarWrapper: {
    marginRight: 16,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  dotPatternRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#93C5FD',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemAction: {
    marginLeft: 8,
    alignItems: 'flex-end',
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  joinedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
