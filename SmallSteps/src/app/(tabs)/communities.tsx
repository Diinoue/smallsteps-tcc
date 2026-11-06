import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CommunityItem, communityService } from '@/src/services';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT_GREEN = '#34C759';

export default function CommunitiesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = isDark ? '#2D3748' : '#EEEEEE';

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCommunities = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await communityService.getCommunities();
      setCommunities(data);
    } catch (error) {
      console.error('Erro ao carregar comunidades:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCommunities(communities.length === 0);
    }, [loadCommunities, communities.length])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCommunities(false);
  };

  const handleAddCommunity = () => {
    router.push('/(community)/addCommunity');
  };

  const handleSelectCommunity = (community: CommunityItem) => {
    // Ação ao clicar na comunidade
    console.log('Comunidade selecionada:', community.id, community.nome);
  };

  const renderCommunityItem = ({ item }: { item: CommunityItem }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { borderBottomColor: borderColor }]}
      onPress={() => handleSelectCommunity(item)}
      activeOpacity={0.7}
    >
      {/* Avatar circular */}
      <View style={styles.avatarWrapper}>
        {item.foto ? (
          <Image source={{ uri: item.foto }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <View style={styles.avatarPatternOverlay} />
            <MaterialIcons name="groups" size={24} color="#7EA8DE" />
          </View>
        )}
      </View>

      {/* Nome da comunidade */}
      <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={1}>
        {item.nome}
      </Text>

      {/* Botão de seta verde circular */}
      <View style={styles.arrowCircle}>
        <MaterialIcons name="arrow-forward" size={18} color={ACCENT_GREEN} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Header com Título */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Your communities</Text>
      </View>

      {/* Botão "Add community" posicionado acima da lista conforme solicitado */}
      <TouchableOpacity
        style={[styles.addCommunityButton, { borderBottomColor: borderColor }]}
        onPress={handleAddCommunity}
        activeOpacity={0.7}
      >
        <MaterialIcons name="add-circle-outline" size={26} color={textColor} />
        <Text style={[styles.addCommunityText, { color: textColor }]}>Add community</Text>
      </TouchableOpacity>

      {/* Conteúdo principal / Lista */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCENT_GREEN} />
        </View>
      ) : (
        <FlatList
          data={communities}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCommunityItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={ACCENT_GREEN}
              colors={[ACCENT_GREEN]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: textMuted }]}>
                Nenhuma comunidade encontrada.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  addCommunityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  addCommunityText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 14,
  },
  listContent: {
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  avatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#D9E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D9E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPatternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    backgroundColor: '#4A90E2',
    borderRadius: 26,
  },
  itemTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
