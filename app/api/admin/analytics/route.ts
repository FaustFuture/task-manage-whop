import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all necessary data
    const [usersRes, boardsRes, cardsRes, listsRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('boards').select('*'),
      supabase.from('cards').select('*'),
      supabase.from('lists').select('*'),
    ]);

    if (usersRes.error) throw usersRes.error;
    if (boardsRes.error) throw boardsRes.error;
    if (cardsRes.error) throw cardsRes.error;
    if (listsRes.error) throw listsRes.error;

    const users = usersRes.data || [];
    const boards = boardsRes.data || [];
    const cards = cardsRes.data || [];
    const lists = listsRes.data || [];

    // Calculate metrics
    const totalUsers = users.length;
    const totalBoards = boards.length;
    const totalCards = cards.length;

    // Status breakdown
    const notStartedCount = cards.filter((c) => c.status === 'not_started').length;
    const inProgressCount = cards.filter((c) => c.status === 'in_progress').length;
    const doneCount = cards.filter((c) => c.status === 'done').length;

    // Calculate active users (users with at least one assigned card)
    const activeUserIds = new Set(
      cards.flatMap((c) => c.assigned_to || [])
    );
    const activeUsers = activeUserIds.size;

    // Completion rate
    const completionRate = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;

    // Average tasks per active user
    const avgTasksPerUser = activeUsers > 0 ? Math.round((totalCards / activeUsers) * 10) / 10 : 0;

    // Board statistics
    const boardStats = boards.map((board) => {
      const boardLists = lists.filter((l) => l.board_id === board.id);
      const boardCards = cards.filter((c) =>
        boardLists.some((l) => l.id === c.list_id)
      );

      const boardNotStarted = boardCards.filter((c) => c.status === 'not_started').length;
      const boardInProgress = boardCards.filter((c) => c.status === 'in_progress').length;
      const boardDone = boardCards.filter((c) => c.status === 'done').length;
      const boardTotal = boardCards.length;

      let health: 'healthy' | 'at_risk' | 'stalled';
      const doneRate = boardTotal > 0 ? (boardDone / boardTotal) * 100 : 0;
      const notStartedRate = boardTotal > 0 ? (boardNotStarted / boardTotal) * 100 : 0;

      if (doneRate > 50) {
        health = 'healthy';
      } else if (notStartedRate > 50) {
        health = 'stalled';
      } else {
        health = 'at_risk';
      }

      return {
        id: board.id,
        title: board.title,
        taskCount: boardTotal,
        notStarted: boardNotStarted,
        inProgress: boardInProgress,
        done: boardDone,
        completionRate: Math.round(doneRate),
        health,
      };
    });

    // Sort boards by task count
    const mostActiveBoards = [...boardStats]
      .sort((a, b) => b.taskCount - a.taskCount)
      .slice(0, 5);

    // User metrics
    const userMetrics = users.map((user) => {
      const userCards = cards.filter((c) => c.assigned_to?.includes(user.id));
      const userNotStarted = userCards.filter((c) => c.status === 'not_started').length;
      const userInProgress = userCards.filter((c) => c.status === 'in_progress').length;
      const userDone = userCards.filter((c) => c.status === 'done').length;
      const userTotal = userCards.length;

      // Calculate boards user is member of
      const userBoards = boards.filter((b) => b.members?.includes(user.id));

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        totalTasks: userTotal,
        notStarted: userNotStarted,
        inProgress: userInProgress,
        done: userDone,
        completionRate: userTotal > 0 ? Math.round((userDone / userTotal) * 100) : 0,
        boardsCount: userBoards.length,
      };
    });

    // Top performers (highest completion rate with at least 3 tasks)
    const topPerformers = userMetrics
      .filter((u) => u.totalTasks >= 3)
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);

    // Users needing support (lowest completion rate with at least 3 tasks)
    const needingSupport = userMetrics
      .filter((u) => u.totalTasks >= 3)
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 5);

    const analytics = {
      overview: {
        totalUsers,
        activeUsers,
        totalBoards,
        totalTasks: totalCards,
        notStarted: notStartedCount,
        inProgress: inProgressCount,
        done: doneCount,
        completionRate,
        avgTasksPerUser,
      },
      boardStats: {
        all: boardStats,
        mostActive: mostActiveBoards,
        healthDistribution: {
          healthy: boardStats.filter((b) => b.health === 'healthy').length,
          atRisk: boardStats.filter((b) => b.health === 'at_risk').length,
          stalled: boardStats.filter((b) => b.health === 'stalled').length,
        },
      },
      userMetrics: {
        all: userMetrics,
        topPerformers,
        needingSupport,
      },
    };

    return NextResponse.json({ data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
