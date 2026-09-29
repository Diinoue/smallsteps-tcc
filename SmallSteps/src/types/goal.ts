export type StreakStatus = 'active' | 'warning' | 'frozen';

export interface SubGoal {
  id: string;
  title: string;
  startDate?: string;
  completedDate?: string | null;
  timeAgo?: string;
  completed?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  author: string;
  startDate: string;
  completedDate?: string | null;
  completed: boolean;
  targetMilestone: string;
  subGoals: SubGoal[];
}

export interface StreakData {
  days: number;
  status: StreakStatus;
  statusText?: string;
}
