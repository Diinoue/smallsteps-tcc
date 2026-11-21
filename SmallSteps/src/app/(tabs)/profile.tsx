import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useProfile } from '@/src/context/ProfileContext';
import { AchievementCard } from '@/src/components/profile/AchievementCard';
import { CurrentGoalCard } from '@/src/components/profile/CurrentGoalCard';
import { loginService } from '@/src/services/loginService';

const ACCENT_GREEN = '#34C759';

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; isPublic?: string }>();
  const isOwnProfile = !params.id && params.isPublic !== 'true';

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const activeColor = useThemeColor({}, 'streakActive');
  const errorColor = useThemeColor({}, 'error');

  const tagBg = isDark ? '#1E293B' : '#E8F2FF';
  const tagTextColor = isDark ? '#60A5FA' : '#2563EB';

  const { profile, isLoading, carregarPerfil } = useProfile();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setAvatarError(false);
      carregarPerfil(params.id ? Number(params.id) : undefined);
    }, [params.id])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await carregarPerfil(params.id ? Number(params.id) : undefined);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    setMenuVisible(false);
    router.push('/profile/edit');
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    try {
      await loginService.logOut();
    } catch (e) {
      console.warn('Erro ao deslogar:', e);
    }
    router.replace('/login');
  };

  const handleViewGoal = (goalId: number) => {
    router.push(`/goal/view/${goalId}`);
  };

  const hasAvatar = Boolean(profile.avatarUrl) && !avatarError;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />

      {/* Top Header */}
      <View
        style={[
          styles.header,
          !isOwnProfile && { borderBottomWidth: 1, borderBottomColor: borderColor },
        ]}
      >
        <View style={styles.headerLeft}>
          {!isOwnProfile ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          ) : null}

          <Text
            style={[
              styles.headerTitle,
              { color: textColor, fontSize: isOwnProfile ? 26 : 22 },
            ]}
            numberOfLines={1}
          >
            {isOwnProfile ? 'Your Profile' : profile.name || 'Perfil'}
          </Text>
        </View>

        {isOwnProfile ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setMenuVisible(true)}
            style={styles.moreButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="more-vert" size={26} color={textColor} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 3-dots Dropdown Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdownCard,
                  { backgroundColor: surfaceColor, borderColor },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleEditProfile}
                  style={styles.dropdownItem}
                >
                  <MaterialIcons name="edit" size={19} color={textColor} />
                  <Text style={[styles.dropdownItemText, { color: textColor }]}>
                    Editar perfil
                  </Text>
                </TouchableOpacity>

                <View style={[styles.dropdownDivider, { backgroundColor: borderColor }]} />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleLogout}
                  style={styles.dropdownItem}
                >
                  <MaterialIcons name="logout" size={19} color={errorColor} />
                  <Text style={[styles.dropdownItemText, { color: errorColor }]}>
                    Sair
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeColor} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={activeColor}
              colors={[activeColor]}
            />
          }
        >
          {/* 1. Card de Informações do Perfil */}
          <View
            style={[
              styles.card,
              { backgroundColor: surfaceColor, borderColor },
            ]}
          >
            <View style={styles.avatarRow}>
              <View
                style={[
                  styles.avatarContainer,
                  { borderColor: isDark ? '#374151' : '#E5E7EB' },
                ]}
              >
                {hasAvatar ? (
                  <Image
                    source={{ uri: profile.avatarUrl }}
                    style={styles.avatarImage}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialIcons name="person" size={40} color="#60A5FA" />
                  </View>
                )}
              </View>

              <View style={styles.nameColumn}>
                <View style={styles.nameRow}>
                  <Text style={[styles.atSign, { color: activeColor }]}>@</Text>
                  <Text style={[styles.userName, { color: textColor }]} numberOfLines={2}>
                    {profile.name}
                  </Text>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color={ACCENT_GREEN}
                    style={styles.verifiedBadge}
                  />
                </View>

                {isOwnProfile ? (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={handleEditProfile}
                    style={[
                      styles.inlineEditButton,
                      {
                        backgroundColor: isDark ? '#143322' : '#ECFDF5',
                        borderColor: activeColor + '40',
                      },
                    ]}
                  >
                    <MaterialIcons name="edit" size={14} color={activeColor} />
                    <Text style={[styles.inlineEditText, { color: activeColor }]}>
                      Editar perfil
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Descrição */}
            {profile.description ? (
              <Text style={[styles.descriptionText, { color: textSecondary }]}>
                {profile.description}
              </Text>
            ) : (
              <Text style={[styles.emptyInlineText, { color: textMuted }]}>
                Nenhuma descrição adicionada.
              </Text>
            )}

            {/* Tags */}
            {profile.tags && profile.tags.length > 0 ? (
              <View style={styles.tagsWrapper}>
                <Text style={[styles.subLabel, { color: textMuted }]}>INTERESSES</Text>
                <View style={styles.tagsContainer}>
                  {profile.tags.map((tag) => (
                    <View key={tag} style={[styles.tagPill, { backgroundColor: tagBg }]}>
                      <Text style={[styles.tagText, { color: tagTextColor }]}>
                        {tag.toLowerCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>

          {/* 2. Card de Streak (no mesmo padrão visual do StreakCard do Dashboard) */}
          {isOwnProfile || profile.publicStreak ? (
            <View
              style={[
                styles.streakCard,
                { backgroundColor: surfaceColor, borderColor },
              ]}
            >
              <View style={styles.streakTopRow}>
                <Text style={[styles.streakNumber, { color: activeColor }]}>
                  {profile.streakCount}
                </Text>
                <View style={styles.streakLabelColumn}>
                  <Text style={[styles.daysText, { color: activeColor }]}>
                    {profile.streakCount === 1 ? 'DAY' : 'DAYS'}
                  </Text>
                  <Text style={[styles.streakSublabel, { color: activeColor }]}>
                    Current Streak
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.streakDivider,
                  { backgroundColor: activeColor, opacity: 0.3 },
                ]}
              />

              <View style={styles.streakFooterRow}>
                <MaterialIcons name="check-circle-outline" size={18} color={activeColor} />
                <Text style={[styles.streakFooterText, { color: activeColor }]}>
                  Sequência ativa
                </Text>
              </View>
            </View>
          ) : null}

          {/* 3. Conquistas */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Achievements</Text>
              {profile.achievements && profile.achievements.length > 0 ? (
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: isDark ? '#143322' : '#ECFDF5' },
                  ]}
                >
                  <Text style={[styles.countBadgeText, { color: activeColor }]}>
                    {profile.achievements.length}
                  </Text>
                </View>
              ) : null}
            </View>

            {profile.achievements && profile.achievements.length > 0 ? (
              profile.achievements.map((item, index) => (
                <AchievementCard
                  key={item.id}
                  achievement={item}
                  layoutVariant={index % 2 === 0 ? 'left' : 'right'}
                  onViewPress={handleViewGoal}
                />
              ))
            ) : (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: surfaceColor, borderColor },
                ]}
              >
                <MaterialIcons name="emoji-events" size={32} color={textMuted} />
                <Text style={[styles.emptyNotice, { color: textMuted }]}>
                  Nenhuma conquista visível no perfil.
                </Text>
              </View>
            )}
          </View>

          {/* 4. Metas Atuais */}
          {isOwnProfile || profile.publicCurrentGoals ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Current Goals
                </Text>
                {profile.currentGoals && profile.currentGoals.length > 0 ? (
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: isDark ? '#143322' : '#ECFDF5' },
                    ]}
                  >
                    <Text style={[styles.countBadgeText, { color: activeColor }]}>
                      {profile.currentGoals.length}
                    </Text>
                  </View>
                ) : null}
              </View>

              {profile.currentGoals && profile.currentGoals.length > 0 ? (
                profile.currentGoals.map((goal) => (
                  <CurrentGoalCard
                    key={goal.id}
                    goal={goal}
                    onViewPress={handleViewGoal}
                  />
                ))
              ) : (
                <View
                  style={[
                    styles.emptyCard,
                    { backgroundColor: surfaceColor, borderColor },
                  ]}
                >
                  <MaterialIcons name="flag" size={32} color={textMuted} />
                  <Text style={[styles.emptyNotice, { color: textMuted }]}>
                    Nenhum objetivo em andamento no momento.
                  </Text>
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
    flex: 1,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  moreButton: {
    padding: 6,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 58,
    paddingRight: 20,
  },
  dropdownCard: {
    width: 170,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownDivider: {
    height: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 48,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#DBEAFE',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
  },
  nameColumn: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  atSign: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    flexShrink: 1,
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  inlineEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  inlineEditText: {
    fontSize: 12,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
  },
  emptyInlineText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  tagsWrapper: {
    marginTop: 14,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  streakCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  streakTopRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  streakNumber: {
    fontSize: 54,
    fontWeight: '900',
    lineHeight: 60,
    letterSpacing: -1,
  },
  streakLabelColumn: {
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
  streakDivider: {
    height: 1.5,
    marginVertical: 14,
    width: '100%',
  },
  streakFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  streakFooterText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyNotice: {
    fontSize: 14,
    textAlign: 'center',
  },
});
