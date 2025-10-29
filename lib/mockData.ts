// Mock data utilities for admin dashboard analytics

import { User, Card, Board, TaskStatus } from '@/types';
import { api } from './api';

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
      userName: user.name,
      userInitial: user.name.charAt(0).toUpperCase(),
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
export type BoardHealth = 'healthy' | 'at_risk' | 'stalled';

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
  const notStartedRate = taskCount > 0 ? (notStartedCount / taskCount) * 100 : 0;

  let health: BoardHealth;
  if (completionRate > 50) {
    health = 'healthy';
  } else if (notStartedRate > 50) {
    health = 'stalled';
  } else {
    health = 'at_risk';
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

// ===== MOCK DATA GENERATION FOR BOARDS, LISTS, AND CARDS =====

// Board templates
const boardTemplates = [
  { title: 'Q1 2025 Goals', lists: ['Backlog', 'In Progress', 'Review', 'Completed'] },
  { title: 'Marketing Campaign', lists: ['Ideas', 'Planning', 'Execution', 'Done'] },
  { title: 'Product Development', lists: ['Backlog', 'Design', 'Development', 'Testing', 'Shipped'] },
  { title: 'Customer Support', lists: ['New', 'Investigating', 'Resolved', 'Closed'] },
  { title: 'Website Redesign', lists: ['Research', 'Wireframes', 'Design', 'Development', 'Launch'] },
  { title: 'Team Operations', lists: ['To Do', 'Doing', 'Done'] },
  { title: 'Sales Pipeline', lists: ['Leads', 'Qualified', 'Proposal', 'Negotiation', 'Closed'] },
  { title: 'Event Planning', lists: ['Ideas', 'Planning', 'Preparation', 'Execution', 'Wrap-up'] },
];

// Task templates by category
const taskTemplates = {
  engineering: [
    'Fix authentication bug',
    'Implement user dashboard',
    'Optimize database queries',
    'Add real-time notifications',
    'Refactor API endpoints',
    'Setup CI/CD pipeline',
    'Write unit tests',
    'Update documentation',
    'Code review PR #123',
    'Deploy to production',
  ],
  design: [
    'Create wireframes for landing page',
    'Design mobile app mockups',
    'Update brand guidelines',
    'Create icon set',
    'User research interviews',
    'Prototype interaction flows',
    'Design system updates',
    'Accessibility audit',
  ],
  marketing: [
    'Write blog post',
    'Create social media campaign',
    'Plan webinar',
    'Design email newsletter',
    'SEO optimization',
    'Competitor analysis',
    'Update website copy',
    'Create case study',
  ],
  general: [
    'Team meeting',
    'Review quarterly goals',
    'Update project timeline',
    'Prepare presentation',
    'Client feedback review',
    'Budget planning',
    'Onboard new team member',
    'Research new tools',
  ],
};

// Get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

// Get random task title
function getRandomTaskTitle(): string {
  const categories = Object.values(taskTemplates);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  return randomCategory[Math.floor(Math.random() * randomCategory.length)];
}

// Get random status with realistic distribution
function getRandomStatus(): TaskStatus {
  const rand = Math.random();
  if (rand < 0.25) return 'not_started';
  if (rand < 0.6) return 'in_progress';
  return 'done';
}

// Seed mock data into database
export async function seedMockData(users: User[]): Promise<{
  success: boolean;
  message: string;
  data?: {
    boardsCreated: number;
    listsCreated: number;
    cardsCreated: number;
  };
}> {
  if (users.length === 0) {
    return {
      success: false,
      message: 'No users found. Please create users first.',
    };
  }

  try {
    let boardsCreated = 0;
    let listsCreated = 0;
    let cardsCreated = 0;

    // Create 3-5 boards
    const numBoards = Math.floor(Math.random() * 3) + 3; // 3-5 boards
    const selectedTemplates = getRandomItems(boardTemplates, numBoards);

    for (const template of selectedTemplates) {
      // Select random users for this board
      const boardMembers = getRandomItems(users, Math.floor(Math.random() * users.length) + 1);
      const boardMemberIds = boardMembers.map(u => u.id);

      // Create board
      const boardResult = await api.boards.create({
        title: template.title,
        createdBy: null, // No authentication, as per CLAUDE.md
        users: boardMemberIds,
      });

      if (!boardResult.data) continue;

      const board = boardResult.data;
      boardsCreated++;

      // Create lists for this board
      for (let i = 0; i < template.lists.length; i++) {
        const listResult = await api.lists.create({
          boardId: board.id,
          title: template.lists[i],
          order: i,
        });

        if (!listResult.data) continue;

        const list = listResult.data;
        listsCreated++;

        // Create 2-5 cards per list
        const numCards = Math.floor(Math.random() * 4) + 2; // 2-5 cards

        for (let j = 0; j < numCards; j++) {
          // Assign to 1-3 random users who are users of this board
          const assignedUsers = getRandomItems(
            users.filter(u => board.users.includes(u.id)),
            Math.floor(Math.random() * 3) + 1
          );

          const cardResult = await api.cards.create({
            listId: list.id,
            title: getRandomTaskTitle(),
            description: Math.random() > 0.5 ? 'Task description goes here...' : '',
            status: getRandomStatus(),
            assignedTo: assignedUsers.map(u => u.id),
            createdBy: null, // No authentication, as per CLAUDE.md
            order: j,
          } as any); // Type assertion needed as status not in API type definition

          if (cardResult.data) {
            cardsCreated++;
          }
        }
      }
    }

    return {
      success: true,
      message: `Successfully created ${boardsCreated} boards, ${listsCreated} lists, and ${cardsCreated} cards`,
      data: {
        boardsCreated,
        listsCreated,
        cardsCreated,
      },
    };
  } catch (error) {
    console.error('Error seeding mock data:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
