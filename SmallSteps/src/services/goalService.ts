import { Goal } from '@/src/types/goal';

// Initial Mock Data Store
let MOCK_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Die Mittsommernacht-Fantasie',
    author: 'Vitor Silva',
    startDate: '15/03/2026',
    completedDate: '20/09/2026',
    completed: true,
    targetMilestone: 'Clean full track run!!',
    subGoals: [
      {
        id: 'sg1',
        title: 'Learn the structure',
        startDate: '15/03/2026',
        completedDate: '20/05/2026',
        timeAgo: '2 Months ago',
        completed: true,
      },
      {
        id: 'sg2',
        title: 'Hard section slow-speed',
        startDate: '21/05/2026',
        completedDate: '15/07/2026',
        timeAgo: '2 Months ago',
        completed: true,
      },
      {
        id: 'sg3',
        title: 'Finish a slow-speed full-track run',
        startDate: '16/07/2026',
        completedDate: '25/08/2026',
        timeAgo: '1 Month ago',
        completed: true,
      },
      {
        id: 'sg4',
        title: 'Clean Hard section normal-speed',
        startDate: '26/08/2026',
        completedDate: '06/09/2026',
        timeAgo: '17 days ago',
        completed: true,
      },
    ],
  },
  {
    id: 'g2',
    title: 'Tout est bien qui finit bien',
    author: 'Vitor Silva',
    startDate: '01/06/2026',
    completedDate: null,
    completed: false,
    targetMilestone: 'Complete final performance',
    subGoals: [
      {
        id: 'sg21',
        title: 'Learn the structure',
        startDate: '01/06/2026',
        completedDate: '25/07/2026',
        timeAgo: '2 Months ago',
        completed: true,
      },
      {
        id: 'sg22',
        title: 'Hard section slow-speed',
        startDate: '26/07/2026',
        completedDate: null,
        timeAgo: '2 Months ago',
        completed: false,
      },
      {
        id: 'sg23',
        title: 'Finish a slow-speed full-track run',
        startDate: '01/09/2026',
        completedDate: null,
        timeAgo: '1 Month ago',
        completed: false,
      },
    ],
  },
];

export const goalService = {
  /**
   * Fetch all goals for current user
   */
  async getGoals(): Promise<Goal[]> {
    // Simulating API network delay
    await new Promise((resolve) => setTimeout(resolve, 50));
    return [...MOCK_GOALS];
  },

  /**
   * Fetch single goal by ID
   */
  async getGoalById(id: string): Promise<Goal | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const goal = MOCK_GOALS.find((g) => g.id === id);
    return goal ? { ...goal } : null;
  },

  /**
   * Create a new goal
   */
  async createGoal(newGoalData: Omit<Goal, 'id'>): Promise<Goal> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const newGoal: Goal = {
      ...newGoalData,
      id: `g_${Date.now()}`,
    };
    MOCK_GOALS.push(newGoal);
    return newGoal;
  },

  /**
   * Update an existing goal
   */
  async updateGoal(id: string, goalData: Partial<Goal>): Promise<Goal> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const index = MOCK_GOALS.findIndex((g) => g.id === id);
    if (index === -1) {
      throw new Error(`Goal with id ${id} not found.`);
    }
    MOCK_GOALS[index] = {
      ...MOCK_GOALS[index],
      ...goalData,
    };
    return MOCK_GOALS[index];
  },

  /**
   * Delete a goal
   */
  async deleteGoal(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const initialLength = MOCK_GOALS.length;
    MOCK_GOALS = MOCK_GOALS.filter((g) => g.id !== id);
    return MOCK_GOALS.length < initialLength;
  },
};
