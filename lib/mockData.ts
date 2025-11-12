// Mock data utilities for admin dashboard analytics

import { User, Card, Board } from '@/types';

// Departments and locations for mock data
const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations', 'Product'];
const locations = ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin', 'Remote'];

// Generate random date within last N days
export function getRandomDateWithinDays(days: number): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
  return new Date(randomTime);
}

// Generate random date within specific range
export function getRandomDateBetween(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Mock user extended data
export interface ExtendedUserData {
  userId: string;
  department: string;
  location: string;
  joinedAt: Date;
  lastActive: Date;
}

export function generateExtendedUserData(users: User[]): Map<string, ExtendedUserData> {
  const map = new Map<string, ExtendedUserData>();

  users.forEach(user => {
    map.set(user.id, {
      userId: user.id,
      department: departments[Math.floor(Math.random() * departments.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      joinedAt: getRandomDateWithinDays(180), // Joined within last 6 months
      lastActive: getRandomDateWithinDays(7), // Active within last 7 days
    });
  });

  return map;
}

// Activity types
export type ActivityType =
  | 'task_completed'
  | 'task_created'
  | 'status_changed'
  | 'user_joined'
  | 'board_created'
  | 'card_assigned';

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userInitial: string;
  targetName: string;
  timestamp: Date;
  details?: string;
}

// Generate mock activity feed
export function generateActivityFeed(
  users: User[],
  cards: Card[],
  boards: Board[],
  count: number = 50
): Activity[] {
  // Return empty array if no data available
  if (users.length === 0) {
    return [];
  }

  const activities: Activity[] = [];
  const activityTypes: ActivityType[] = [
    'task_completed',
    'task_created',
    'status_changed',
    'user_joined',
    'board_created',
    'card_assigned'
  ];

  for (let i = 0; i < count; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const user = users[Math.floor(Math.random() * users.length)];

    if (!user) continue;

    let targetName = '';
    let details = '';

    switch (type) {
      case 'task_completed':
        if (cards.length === 0) {
          targetName = 'a task';
        } else {
          const completedCard = cards[Math.floor(Math.random() * cards.length)];
          targetName = completedCard?.title || 'a task';
        }
        break;
      case 'task_created':
        if (cards.length === 0) {
          targetName = 'a new task';
        } else {
          const createdCard = cards[Math.floor(Math.random() * cards.length)];
          targetName = createdCard?.title || 'a new task';
        }
        break;
      case 'status_changed':
        if (cards.length === 0) {
          targetName = 'a task';
        } else {
          const changedCard = cards[Math.floor(Math.random() * cards.length)];
          targetName = changedCard?.title || 'a task';
        }
        const statuses = ['not started', 'in progress', 'completed'];
        details = `to ${statuses[Math.floor(Math.random() * statuses.length)]}`;
        break;
      case 'user_joined':
        targetName = 'the team';
        break;
      case 'board_created':
        if (boards.length === 0) {
          targetName = 'a new board';
        } else {
          const board = boards[Math.floor(Math.random() * boards.length)];
          targetName = board?.title || 'a new board';
        }
        break;
      case 'card_assigned':
        if (cards.length === 0) {
          targetName = 'a task';
          details = `to ${user.name}`;
        } else {
          const assignedCard = cards[Math.floor(Math.random() * cards.length)];
          targetName = assignedCard?.title || 'a task';
          const assignedUser = users[Math.floor(Math.random() * users.length)];
          details = `to ${assignedUser?.name || 'a user'}`;
        }
        break;
    }

    activities.push({
      id: `activity-${i}`,
      type,
      userId: user.id,
      userName: user.name ? user.name : 'Unknown User',
      userInitial: user.name ? user.name.charAt(0).toUpperCase() : 'U',
      targetName,
      timestamp: getRandomDateWithinDays(30),
      details,
    });
  }

  // Sort by timestamp (most recent first)
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Data point for trend charts
export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

// Generate daily trend data
export function generateDailyTrend(days: number = 30): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Generate realistic trend with some randomness
    const baseValue = 10 + Math.random() * 20;
    const trend = (days - i) * 0.3; // Slight upward trend
    const noise = (Math.random() - 0.5) * 5;

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(baseValue + trend + noise),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  return data;
}

// Generate completion rate trend
export function generateCompletionTrend(days: number = 30): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Generate realistic completion rate (40-80%)
    const baseRate = 60;
    const seasonalVariation = Math.sin((days - i) / 7) * 10; // Weekly cycle
    const noise = (Math.random() - 0.5) * 8;

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(30, Math.min(90, Math.round(baseRate + seasonalVariation + noise))),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  return data;
}

// Activity heatmap data (day of week x hour of day)
export interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
}

export function generateActivityHeatmap(): HeatmapCell[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data: HeatmapCell[] = [];

  days.forEach(day => {
    for (let hour = 0; hour < 24; hour++) {
      let value = 0;

      // Simulate work hours pattern (9am-6pm on weekdays)
      const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day);
      const isWorkHour = hour >= 9 && hour <= 18;

      if (isWeekday && isWorkHour) {
        value = 50 + Math.random() * 50; // High activity during work hours
      } else if (isWeekday) {
        value = Math.random() * 20; // Low activity outside work hours
      } else {
        value = Math.random() * 10; // Very low activity on weekends
      }

      data.push({
        day,
        hour,
        value: Math.round(value),
      });
    }
  });

  return data;
}

// Board health status
export type BoardHealth = 'on_track' | 'active' | 'needs_attention' | 'not_started';

export interface BoardHealthData {
  boardId: string;
  boardTitle: string;
  health: BoardHealth;
  taskCount: number;
  notStartedCount: number;
  inProgressCount: number;
  doneCount: number;
  completionRate: number;
}

export function calculateBoardHealth(
  board: Board,
  boardCards: Card[]
): BoardHealthData {
  const taskCount = boardCards.length;
  const notStartedCount = boardCards.filter(c => c.status === 'not_started').length;
  const inProgressCount = boardCards.filter(c => c.status === 'in_progress').length;
  const doneCount = boardCards.filter(c => c.status === 'done').length;

  const completionRate = taskCount > 0 ? (doneCount / taskCount) * 100 : 0;
  const inProgressRate = taskCount > 0 ? (inProgressCount / taskCount) * 100 : 0;
  const notStartedRate = taskCount > 0 ? (notStartedCount / taskCount) * 100 : 0;

  let health: BoardHealth;
  if (completionRate >= 70) {
    health = 'on_track';
  } else if (completionRate >= 40 && inProgressRate >= 20) {
    health = 'active';
  } else if (notStartedRate >= 60) {
    health = 'not_started';
  } else {
    health = 'needs_attention';
  }

  return {
    boardId: board.id,
    boardTitle: board.title,
    health,
    taskCount,
    notStartedCount,
    inProgressCount,
    doneCount,
    completionRate: Math.round(completionRate),
  };
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

// Generate sparkline data (mini trend for table rows)
export function generateSparklineData(points: number = 7): number[] {
  const data: number[] = [];
  const baseValue = 50;

  for (let i = 0; i < points; i++) {
    const trend = i * 2;
    const noise = (Math.random() - 0.5) * 10;
    data.push(Math.max(0, Math.min(100, baseValue + trend + noise)));
  }

  return data;
}
