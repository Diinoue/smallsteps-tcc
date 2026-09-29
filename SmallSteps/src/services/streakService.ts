import { StreakData } from '@/types/goal';

let MOCK_STREAK: StreakData = {
  days: 127,
  status: 'active',
  statusText: '6 days and 23 hours until freeze',
};

export const streakService = {
  /**
   * Get user streak status
   */
  async getStreak(): Promise<StreakData> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { ...MOCK_STREAK };
  },

  /**
   * Update streak status or practice count
   */
  async updateStreak(updated: Partial<StreakData>): Promise<StreakData> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    MOCK_STREAK = {
      ...MOCK_STREAK,
      ...updated,
    };
    return { ...MOCK_STREAK };
  },
};
