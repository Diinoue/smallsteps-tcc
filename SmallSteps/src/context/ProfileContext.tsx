import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { userService } from '../services/userService';
import { authSession } from '../services/authSession';

export interface ProfileAchievement {
  id: number;
  title: string;
  journeyDuration: string;
  subGoalsCount: number;
  mediaType: 'image' | 'video';
  mediaUrl?: string | null;
}

export interface ProfileTimelineNode {
  id: number;
  label: string;
  completed: boolean;
}

export interface ProfileCurrentGoal {
  id: number;
  title: string;
  nodes: ProfileTimelineNode[];
}

export interface UserProfileData {
  id: number;
  name: string;
  handle: string;
  avatarUrl: string;
  description: string;
  tags: string[];
  streakCount: number;
  streakFrequencyCount: number;
  streakFrequencyPeriod: 'day' | 'week' | 'month';
  publicStreak: boolean;
  publicCurrentGoals: boolean;
  visibleAchievementIds: number[];
  achievements: ProfileAchievement[];
  allCompletedAchievements?: ProfileAchievement[];
  currentGoals: ProfileCurrentGoal[];
}

export interface ProfileContextType {
  profile: UserProfileData;
  isLoading: boolean;
  availableDbTags: string[];
  allCompletedAchievements: ProfileAchievement[];
  carregarPerfil: () => Promise<void>;
  limparPerfil: () => void;
  updateProfile: (data: Partial<UserProfileData>) => Promise<void>;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  toggleVisibleAchievement: (id: number) => void;
}

const EMPTY_PROFILE: UserProfileData = {
  id: 0,
  name: '',
  handle: '',
  avatarUrl: '',
  description: '',
  tags: [],
  streakCount: 0,
  streakFrequencyCount: 1,
  streakFrequencyPeriod: 'day',
  publicStreak: false,
  publicCurrentGoals: true,
  visibleAchievementIds: [],
  achievements: [],
  allCompletedAchievements: [],
  currentGoals: [],
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfileData>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbTags, setDbTags] = useState<string[]>([]);
  const [allCompletedAchievements, setAllCompletedAchievements] =
    useState<ProfileAchievement[]>([]);

  const limparPerfil = useCallback(() => {
    setProfile(EMPTY_PROFILE);
    setAllCompletedAchievements([]);
  }, []);

  /**
   * Puxa as informações do perfil do usuário autenticado na sessão atual (GET /users/profile).
   */
  const carregarPerfil = useCallback(async () => {
    const token = await authSession.getToken();
    if (!token) {
      limparPerfil();
      return;
    }

    try {
      setIsLoading(true);
      const [dadosRemotos, tagsRemotas] = await Promise.all([
        userService.consultarPerfil(),
        userService.buscarTags(),
      ]);

      if (dadosRemotos) {
        setProfile(dadosRemotos);
        if (dadosRemotos.id > 0) {
          await authSession.setUserId(dadosRemotos.id);
        }
        setAllCompletedAchievements(dadosRemotos.allCompletedAchievements || []);
      }
      if (tagsRemotas && tagsRemotas.length > 0) {
        setDbTags(tagsRemotas);
      }
    } catch (error) {
      console.warn('Erro ao carregar perfil via userService:', error);
    } finally {
      setIsLoading(false);
    }
  }, [limparPerfil]);

  useEffect(() => {
    carregarPerfil();

    const unsubscribe = authSession.subscribeAuthState((authenticated) => {
      if (authenticated) {
        carregarPerfil();
      } else {
        limparPerfil();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [carregarPerfil, limparPerfil]);

  const updateProfile = async (data: Partial<UserProfileData>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...data };
      if (data.visibleAchievementIds) {
        const newAchievements = allCompletedAchievements.filter((item) =>
          data.visibleAchievementIds?.includes(item.id)
        );
        updated.achievements = newAchievements;
      }
      return updated;
    });

    const ok = await userService.atualizarPerfil(data);
    if (ok) {
      await carregarPerfil();
    }
  };

  const addTag = (tag: string) => {
    if (!profile.tags.includes(tag)) {
      setProfile((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const toggleVisibleAchievement = (id: number) => {
    setProfile((prev) => {
      const exists = prev.visibleAchievementIds.includes(id);
      let updatedIds: number[];
      if (exists) {
        updatedIds = prev.visibleAchievementIds.filter((item) => item !== id);
      } else {
        if (prev.visibleAchievementIds.length >= 5) {
          return prev;
        }
        updatedIds = [...prev.visibleAchievementIds, id];
      }

      const newAchievements = allCompletedAchievements.filter((item) =>
        updatedIds.includes(item.id)
      );

      return {
        ...prev,
        visibleAchievementIds: updatedIds,
        achievements: newAchievements,
      };
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        availableDbTags: dbTags,
        allCompletedAchievements,
        carregarPerfil,
        limparPerfil,
        updateProfile,
        addTag,
        removeTag,
        toggleVisibleAchievement,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
