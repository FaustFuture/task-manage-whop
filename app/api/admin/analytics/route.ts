import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    // Fetch all necessary data filtered by companyId
    const [boardsRes, cardsRes, listsRes, whopUsersRes] = await Promise.all([
      supabase.from('boards').select('*').eq('company_id', companyId),
      supabase.from('cards').select('*'),
      supabase.from('lists').select('*'),
      supabase.from('whop_users').select('*').eq('company_id', companyId),
    ]);

    if (boardsRes.error) throw boardsRes.error;
    if (cardsRes.error) throw cardsRes.error;
    if (listsRes.error) throw listsRes.error;
    if (whopUsersRes.error) {
      console.warn('[ANALYTICS] Could not fetch whop_users cache:', whopUsersRes.error);
    }

    const boards = boardsRes.data || [];
    const allCards = cardsRes.data || [];
    const allLists = listsRes.data || [];
    const whopUsers = whopUsersRes.data || [];

    // Create a map of userId -> user data for quick lookup
    const whopUsersMap = new Map(
      whopUsers.map(u => [u.id, { name: u.name, username: u.username, avatar: u.avatar }])
    );

    // Filter lists to only those in company's boards
    const boardIds = boards.map(b => b.id);
    const lists = allLists.filter(l => boardIds.includes(l.board_id));

    // Filter cards to only those in company's lists
    const listIds = lists.map(l => l.id);
    const cards = allCards.filter(c => listIds.includes(c.list_id));

    // Status breakdown
    const notStartedCount = cards.filter((c) => c.status === 'not_started').length;
    const inProgressCount = cards.filter((c) => c.status === 'in_progress').length;
    const doneCount = cards.filter((c) => c.status === 'done').length;

    // Calculate active users (users with at least one assigned card in this company)
    const activeUserIds = new Set(
      cards.flatMap((c) => c.assigned_to || [])
    );
    const activeUsers = activeUserIds.size;

    // Get all user IDs from whop_users cache (includes all company members, not just those with tasks)
    const allUserIds = new Set([
      ...whopUsers.map(u => u.id),
      ...Array.from(activeUserIds)
    ]);

    // Calculate metrics
    const totalUsers = allUserIds.size; // Count all users in this company (from cache + assigned cards)
    const totalBoards = boards.length;
    const totalCards = cards.length;

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

    // User metrics (based on ALL users in company from whop_users cache + card assignments)
    const userMetrics = await Promise.all(
      Array.from(allUserIds).map(async (userId) => {
        const userCards = cards.filter((c) => c.assigned_to?.includes(userId));
        const userNotStarted = userCards.filter((c) => c.status === 'not_started').length;
        const userInProgress = userCards.filter((c) => c.status === 'in_progress').length;
        const userDone = userCards.filter((c) => c.status === 'done').length;
        const userTotal = userCards.length;

        // Calculate boards user is member of (check board_users table)
        const { data: memberBoards } = await supabase
          .from('board_users')
          .select('board_id')
          .eq('user_id', userId)
          .in('board_id', boardIds);

        // Get user data from whop_users cache, fallback to userId if not found
        const whopUserData = whopUsersMap.get(userId);

        return {
          userId: userId,
          name: whopUserData?.name || userId, // Use real name from cache
          username: whopUserData?.username || userId, // Use username from cache
          role: 'member' as const, // Default role, actual role comes from Whop
          totalTasks: userTotal,
          notStarted: userNotStarted,
          inProgress: userInProgress,
          done: userDone,
          completionRate: userTotal > 0 ? Math.round((userDone / userTotal) * 100) : 0,
          boardsCount: memberBoards?.length || 0,
        };
      })
    );

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
