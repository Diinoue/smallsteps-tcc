import React, { createContext, useContext, useState, ReactNode } from 'react';
import { userService } from '../services/userService';

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
  carregarPerfil: (idUsuario?: number) => Promise<void>;
  updateProfile: (data: Partial<UserProfileData>) => Promise<void>;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  toggleVisibleAchievement: (id: number) => void;
}

// Mock inicial baseado fielmente nos protótipos
const INITIAL_PROFILE: UserProfileData = {
  id: 1,
  name: 'Lagarto Voador',
  handle: '@Lagarto Voador',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  description: 'Praticando piano por diversão!',
  tags: ['Piano', 'Beginner', 'Casual'],
  streakCount: 127,
  streakFrequencyCount: 2,
  streakFrequencyPeriod: 'week',
  publicStreak: false,
  publicCurrentGoals: true,
  visibleAchievementIds: [2, 3],
  achievements: [
    {
      id: 2,
      title: 'Canon in D:',
      journeyDuration: '3 Month journey',
      subGoalsCount: 17,
      mediaType: 'image',
    },
    {
      id: 3,
      title: 'Prelude No. 1 in C:',
      journeyDuration: '5 Month journey',
      subGoalsCount: 8,
      mediaType: 'video',
    },
  ],
  currentGoals: [
    {
      id: 1,
      title: 'Die Mittsommernacht-Fantasie',
      nodes: [
        { id: 101, label: '3 Months', completed: true },
        { id: 102, label: '2 Months', completed: true },
        { id: 103, label: '2 Months', completed: true },
        { id: 104, label: '17 days', completed: true },
      ],
    },
    {
      id: 2,
      title: 'Tout est bien qui finit bien',
      nodes: [
        { id: 201, label: '1 Months', completed: true },
        { id: 202, label: '1 Months', completed: true },
        { id: 203, label: '2 Months', completed: false },
        { id: 204, label: '15 days', completed: false },
      ],
    },
  ],
};

// Tabela de tags simulada do banco de dados
const AVAILABLE_DB_TAGS = [
  'Piano',
  'Beginner',
  'Casual',
  'Classical',
  'Jazz',
  'Music Theory',
  'Daily Practice',
  'Intermediate',
  'Advanced',
  'Keyboard',
  'Composition',
  'Sight Reading',
];

// Todas as conquistas finalizadas disponíveis para seleção no Editar Perfil
const ALL_COMPLETED_ACHIEVEMENTS: ProfileAchievement[] = [
  {
    id: 1,
    title: 'Die Mittsommernacht-Fantasie',
    journeyDuration: '4 Month journey',
    subGoalsCount: 12,
    mediaType: 'image',
  },
  {
    id: 2,
    title: 'Canon in D',
    journeyDuration: '3 Month journey',
    subGoalsCount: 17,
    mediaType: 'image',
  },
  {
    id: 3,
    title: 'Prelude No. 1 in C',
    journeyDuration: '5 Month journey',
    subGoalsCount: 8,
    mediaType: 'video',
  },
  {
    id: 4,
    title: 'Tout est bien qui finit bien',
    journeyDuration: '2 Month journey',
    subGoalsCount: 6,
    mediaType: 'video',
  },
];

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfileData>(INITIAL_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbTags, setDbTags] = useState<string[]>(AVAILABLE_DB_TAGS);
  const [allCompletedAchievements, setAllCompletedAchievements] =
    useState<ProfileAchievement[]>(ALL_COMPLETED_ACHIEVEMENTS);

  /**
   * Puxa as informações do perfil via userService.
   * Chamado quando o usuário clica na aba de perfil ou abre o perfil.
   */
  const carregarPerfil = async (idUsuario?: number) => {
    try {
      setIsLoading(true);
      const [dadosRemotos, tagsRemotas] = await Promise.all([
        userService.consultarPerfil(idUsuario),
        userService.buscarTags(),
      ]);

      if (dadosRemotos) {
        setProfile(dadosRemotos);
        if (dadosRemotos.allCompletedAchievements) {
          setAllCompletedAchievements(dadosRemotos.allCompletedAchievements);
        }
      }
      if (tagsRemotas && tagsRemotas.length > 0) {
        setDbTags(tagsRemotas);
      }
    } catch (error) {
      console.warn('Erro ao carregar perfil via userService:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfileData>) => {
    // Atualização local imediata
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

    // Envia atualização para a userService
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
