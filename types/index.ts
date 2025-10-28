export type UserRole = "admin" | "member";

export type TaskStatus = "not_started" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  lastActive?: Date;
}

export interface Board {
  id: string;
  title: string;
  createdBy: string | null;
  members: string[];
  createdAt: Date;
  taskCount: number;
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assignedTo: string[];
  createdBy: string | null;
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  order: number;
}

export interface Subtask {
  id: string;
  cardId: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export type ViewMode = "admin" | "member";

// Admin Analytics Types
export type BoardHealth = 'healthy' | 'at_risk' | 'stalled';

export interface BoardAnalytics {
  id: string;
  title: string;
  taskCount: number;
  notStarted: number;
  inProgress: number;
  done: number;
  completionRate: number;
  health: BoardHealth;
}

export interface UserMetrics {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  totalTasks: number;
  notStarted: number;
  inProgress: number;
  done: number;
  completionRate: number;
  boardsCount: number;
}

export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  totalBoards: number;
  totalTasks: number;
  notStarted: number;
  inProgress: number;
  done: number;
  completionRate: number;
  avgTasksPerUser: number;
}

export interface Analytics {
  overview: AnalyticsOverview;
  boardStats: {
    all: BoardAnalytics[];
    mostActive: BoardAnalytics[];
    healthDistribution: {
      healthy: number;
      atRisk: number;
      stalled: number;
    };
  };
  userMetrics: {
    all: UserMetrics[];
    topPerformers: UserMetrics[];
    needingSupport: UserMetrics[];
  };
}
