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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useProfile } from '@/src/context/ProfileContext';
import { AchievementCard } from '@/src/components/profile/AchievementCard';
import { CurrentGoalCard } from '@/src/components/profile/CurrentGoalCard';
import { loginService } from '@/src/services/loginService';

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; isPublic?: string }>();
  const isOwnProfile = !params.id && params.isPublic !== 'true';

  const { profile, isLoading, carregarPerfil } = useProfile();
  const [menuVisible, setMenuVisible] = useState(false);

  // Puxa as informações do perfil via userService sempre que a tela é acessada/focada
  useFocusEffect(
    useCallback(() => {
      carregarPerfil(params.id ? Number(params.id) : undefined);
    }, [params.id])
  );

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

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        {!isOwnProfile ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        ) : null}

        <Text style={styles.headerTitle}>
          {isOwnProfile ? 'Your Profile' : profile.name}
        </Text>

        {/* 3-dots button (apenas no próprio perfil) */}
        {isOwnProfile ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setMenuVisible(true)}
            style={styles.moreButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="more-vert" size={26} color="#111827" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 26 }} />
        )}
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
              <View style={styles.dropdownCard}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleEditProfile}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownItemText}>Editar perfil</Text>
                </TouchableOpacity>

                <View style={styles.dropdownDivider} />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleLogout}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownItemText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34c759" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Informações do perfil (Nome, foto perfil, descrição, tags) */}
          <View style={styles.profileInfoSection}>
            <View style={styles.avatarRow}>
              {/* Foto de perfil com fundo estilizado / avatar */}
              <View style={styles.avatarContainer}>
                {profile.avatarUrl ? (
                  <Image
                    source={{ uri: profile.avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialIcons name="person" size={44} color="#9CA3AF" />
                  </View>
                )}
              </View>

              {/* Nome com @ e selo verificado verde */}
              <View style={styles.nameRow}>
                <Text style={styles.atSign}>@</Text>
                <Text style={styles.userName}>{profile.name}</Text>
                <MaterialIcons
                  name="check-circle"
                  size={22}
                  color="#34c759"
                  style={styles.verifiedBadge}
                />
              </View>
            </View>

            {/* Descrição */}
            <Text style={styles.descriptionText}>{profile.description}</Text>

            {/* Tags */}
            <Text style={styles.tagsHeader}>Tags</Text>
            <View style={styles.tagsContainer}>
              {profile.tags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Separador */}
          <View style={styles.divider} />

          {/* 2. Contador de Streak (exibido se for o próprio perfil ou se publicStreak estiver ativo) */}
          {isOwnProfile || profile.publicStreak ? (
            <>
              <View style={styles.streakSection}>
                <View style={styles.streakMainRow}>
                  {/* Número grande de dias */}
                  <Text style={styles.streakNumber}>{profile.streakCount}</Text>
                  {/* Ícone de check circular verde */}
                  <View style={styles.streakCheckWrapper}>
                    <MaterialIcons
                      name="check-circle-outline"
                      size={34}
                      color="#34c759"
                    />
                  </View>
                </View>

                <View style={styles.streakLabelRow}>
                  <Text style={styles.daysText}>DAYS</Text>
                  <View style={styles.streakTextColumn}>
                    <Text style={styles.currentStreakText}>Current</Text>
                    <Text style={styles.currentStreakText}>Streak</Text>
                  </View>
                </View>
              </View>

              {/* Separador */}
              <View style={styles.divider} />
            </>
          ) : null}

          {/* 3. Conquistas principais que o usuário finalizou (Estante de troféus) */}
          <View style={styles.achievementsSection}>
            <Text style={styles.achievementsTitle}>Achievements</Text>

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
              <Text style={styles.emptyNotice}>Nenhuma conquista visível no perfil.</Text>
            )}
          </View>

          {/* Separador */}
          <View style={styles.divider} />

          {/* 4. Metas atuais, que o usuário está focando em completar atualmente (se público ou próprio perfil) */}
          {isOwnProfile || profile.publicCurrentGoals ? (
            <View style={styles.currentGoalsSection}>
              <Text style={styles.currentGoalsTitle}>Current{'\n'}Goals</Text>

              {profile.currentGoals && profile.currentGoals.length > 0 ? (
                profile.currentGoals.map((goal) => (
                  <CurrentGoalCard
                    key={goal.id}
                    goal={goal}
                    onViewPress={handleViewGoal}
                  />
                ))
              ) : (
                <Text style={styles.emptyNotice}>Nenhum objetivo em andamento no momento.</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  backButton: {
    padding: 6,
    marginRight: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 54,
    paddingRight: 20,
  },
  dropdownCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#1F2937',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  profileInfoSection: {
    paddingTop: 10,
    paddingBottom: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarContainer: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#EBF3FE',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EBF3FE',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    flexWrap: 'wrap',
    flex: 1,
  },
  atSign: {
    fontSize: 22,
    fontWeight: '700',
    color: '#34c759',
    marginRight: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 14,
  },
  tagsHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
    width: '100%',
  },
  streakSection: {
    paddingVertical: 4,
  },
  streakMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  streakNumber: {
    fontSize: 66,
    fontWeight: '900',
    color: '#34c759',
    lineHeight: 70,
    letterSpacing: -1,
  },
  streakCheckWrapper: {
    marginLeft: 10,
    paddingTop: 8,
  },
  streakLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
  },
  daysText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#34c759',
    letterSpacing: -0.5,
  },
  streakTextColumn: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  currentStreakText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#34c759',
    lineHeight: 21,
  },
  achievementsSection: {
    paddingVertical: 4,
  },
  achievementsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
  },
  currentGoalsSection: {
    paddingVertical: 4,
  },
  currentGoalsTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#34c759',
    lineHeight: 28,
    marginBottom: 12,
  },
  emptyNotice: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  authLink: {
    marginTop: 24,
    fontSize: 15,
    fontWeight: '600',
    color: '#34C759',
    textDecorationLine: 'underline',
  },
});
