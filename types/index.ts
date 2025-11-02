export type UserRole = "admin" | "member";

export type TaskStatus = "not_started" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

// Whop User interface (no email, uses Whop data)
export interface User {
  id: string; // Whop user ID
  name: string | null; // Display name from Whop
  username: string; // Whop username
  role: UserRole; // Mapped from Whop access_level
  avatar?: string;
}

export interface Board {
  id: string;
  title: string;
  companyId: string; // Whop company ID for isolation
  createdBy: string | null; // Whop user ID
  members: string[]; // Array of Whop user IDs
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
  username: string; // Changed from email to username (Whop)
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
