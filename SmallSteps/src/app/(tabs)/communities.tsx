import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CommunityItem, communityService } from '@/src/services';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginService } from '@/src/services/loginService';
import { Button } from '@/src/components/ui/Button';
import { CommunityFeedScreen } from '@/src/components/community/CommunityFeedScreen';
import { CommunityEventsScreen } from '@/src/components/community/CommunityEventsScreen';
import { CommunityMembersScreen } from '@/src/components/community/CommunityMembersScreen';
import { CommunityAddMembersScreen } from '@/src/components/community/CommunityAddMembersScreen';
import { PostCommentsScreen } from '@/src/components/community/PostCommentsScreen';
import { Post } from '@/src/types/community';

const ACCENT_GREEN = '#34C759';

export default function CommunitiesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = isDark ? '#2D3748' : '#EEEEEE';

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityItem | null>(null);
  const [currentView, setCurrentView] = useState<'feed' | 'events' | 'members' | 'addMembers' | 'comments'>('feed');
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const isFetchingRef = useRef(false);

  const insets = useSafeAreaInsets();

  const defaultTabBarStyle = useMemo(
    () => ({
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      borderTopColor: isDark ? '#1E293B' : '#E5E7EB',
      borderTopWidth: 1,
      height: 56 + insets.bottom,
      paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
      paddingTop: 8,
      elevation: 0,
    }),
    [isDark, insets.bottom]
  );

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: selectedCommunity ? { display: 'none' } : defaultTabBarStyle,
    });
    return () => {
      navigation.setOptions({
        tabBarStyle: defaultTabBarStyle,
      });
    };
  }, [selectedCommunity, navigation, defaultTabBarStyle]);

  // Suporte ao botão voltar físico / nativo do Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentView === 'addMembers') {
          setCurrentView('members');
          return true;
        }
        if (currentView === 'events' || currentView === 'members') {
          setCurrentView('feed');
          return true;
        }
        if (selectedCommunity) {
          setSelectedCommunity(null);
          setCurrentView('feed');
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [currentView, selectedCommunity])
  );

  const loadCommunities = useCallback(async (force = false) => {
    if (isFetchingRef.current) return;

    if (!force && communities.length > 0) {
      setIsLoading(false);
      return;
    }

    isFetchingRef.current = true;
    if (communities.length === 0) setIsLoading(true);

    try {
      const data = await communityService.getCommunities();
      setCommunities(data);
    } catch (error) {
      console.error('Erro ao carregar comunidades:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [communities.length]);

  useFocusEffect(
    useCallback(() => {
      loadCommunities(false);
    }, [loadCommunities])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCommunities(true);
  };

  const handleAddCommunity = () => {
    router.push('/(community)/addCommunity');
  };

  const handleSelectCommunity = (community: CommunityItem) => {
    setSelectedCommunity(community);
  };

  const renderCommunityItem = ({ item }: { item: CommunityItem }) => {
    const hasPhoto = !!item.foto && !failedImages[item.id];

    return (
      <TouchableOpacity
        style={[styles.itemContainer, { borderBottomColor: borderColor }]}
        onPress={() => handleSelectCommunity(item)}
        activeOpacity={0.7}
      >
        {/* Avatar circular */}
        <View style={styles.avatarWrapper}>
          {hasPhoto ? (
            <Image
              source={{ uri: item.foto! }}
              style={styles.avatarImage}
              onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
            />
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
  };

// TEMPORÁRIO: exibe o JWT salvo no SecureStore
  const handlePrintJwt = async () => {
    await loginService.getValueFor();
  };

  // TEMPORÁRIO: remove o JWT do SecureStore
  const handleClearJwt = async () => {
    await loginService.removeToken();
    Alert.alert('JWT removido', 'O token foi apagado do armazenamento seguro.');
  };

  // Se uma comunidade for selecionada, exibe a tela de feed, eventos, membros ou adicionar membros
  if (selectedCommunity) {
    const isAdminOrOwner =
      selectedCommunity.cargo === 'DONO' || selectedCommunity.cargo === 'ADMINISTRADOR';
    const isPrivateCommunity = Boolean(selectedCommunity.privado);

    if (currentView === 'events') {
      return (
        <CommunityEventsScreen
          communityId={selectedCommunity.id}
          communityName={selectedCommunity.nome}
          isAdmin={isAdminOrOwner || !selectedCommunity.cargo}
          userRole={selectedCommunity.cargo}
          onBackPress={() => setCurrentView('feed')}
        />
      );
    }

    if (currentView === 'addMembers' && isPrivateCommunity && isAdminOrOwner) {
      return (
        <CommunityAddMembersScreen
          communityId={selectedCommunity.id}
          communityName={selectedCommunity.nome}
          initialInviteCode={selectedCommunity.codigoConvite}
          onBackPress={() => setCurrentView('members')}
          onInviteCodeUpdated={(newCode) =>
            setSelectedCommunity((prev) => (prev ? { ...prev, codigoConvite: newCode } : prev))
          }
        />
      );
    }

    if (currentView === 'members') {
      return (
        <CommunityMembersScreen
          communityId={selectedCommunity.id}
          communityName={selectedCommunity.nome}
          isPrivate={isPrivateCommunity}
          userRole={selectedCommunity.cargo}
          onBackPress={() => setCurrentView('feed')}
          onAddMembersPress={
            isPrivateCommunity && isAdminOrOwner
              ? () => setCurrentView('addMembers')
              : undefined
          }
        />
      );
    }

    if (currentView === 'comments' && selectedPostForComments) {
      const isCommunityAdminOrDono =
        selectedCommunity.cargo === 'DONO' ||
        selectedCommunity.cargo === 'ADMINISTRADOR' ||
        selectedCommunity.cargo === 'ADMIN';

      return (
        <PostCommentsScreen
          communityId={selectedCommunity.id}
          communityName={selectedCommunity.nome}
          userRole={selectedCommunity.cargo}
          isAdmin={isCommunityAdminOrDono}
          post={selectedPostForComments}
          onBackPress={() => {
            setSelectedPostForComments(null);
            setCurrentView('feed');
          }}
          onEventsPress={() => setCurrentView('events')}
        />
      );
    }

    return (
      <CommunityFeedScreen
        communityId={selectedCommunity.id}
        communityName={selectedCommunity.nome}
        userRole={selectedCommunity.cargo}
        onBackPress={() => {
          setSelectedCommunity(null);
          setCurrentView('feed');
        }}
        onEventsPress={() => setCurrentView('events')}
        onMembersPress={() => setCurrentView('members')}
        onCommentsPress={(post) => {
          setSelectedPostForComments(post);
          setCurrentView('comments');
        }}
        onLeaveCommunity={() => {
          setSelectedCommunity(null);
          loadCommunities(true);
        }}
      />
    );
  }

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
              <TouchableOpacity
                style={{
                  marginTop: 16,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: isDark ? '#2D3748' : '#E2E8F0',
                }}
                onPress={() =>
                  setSelectedCommunity({
                    id: 1,
                    nome: 'Grupo #1 musica',
                  })
                }
              >
                <Text style={{ fontWeight: '700', color: textColor }}>
                  Ver Grupo #1 musica (Protótipo)
                </Text>
              </TouchableOpacity>
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
   debugButtons: {
    marginTop: 24,
    gap: 12,
    width: '100%',
  },
});
