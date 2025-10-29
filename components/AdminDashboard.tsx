'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { UserDetailModal } from './admin/UserDetailModal';
import { generateExtendedUserData, seedMockData } from '@/lib/mockData';
import { Users, CheckCircle, Clock, XCircle, Sparkles, Folder, ListTodo, TrendingUp } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { MetricCardSkeleton, UserCardSkeleton } from './Skeletons';

export function AdminDashboard() {
  const {
    users,
    boards,
    cards,
    lists,
    loadBoards,
    loadLists,
    loadCards,
    isLoadingBoards,
    isLoadingCards,
    setSelectedBoard,
    openCardModal,
    setViewMode,
  } = useStore();

  const { success, error } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Track when initial loading completes - set immediately when loading finishes
  useEffect(() => {
    if (!isLoadingBoards && !isLoadingCards) {
      // Use a small delay to ensure state updates are complete
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoadingBoards, isLoadingCards]);

  // Show loader ONLY before initial load completes (never show again after first load)
  const isLoading = !initialLoadComplete;

  // Generate mock data based on real data
  const extendedUserData = useMemo(() => generateExtendedUserData(users), [users]);

  // Get selected user
  const selectedUser = useMemo(
    () => users.find(u => u.id === selectedUserId),
    [users, selectedUserId]
  );

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const totalTasks = cards.length;
    const notStarted = cards.filter(c => c.status === 'not_started').length;
    const inProgress = cards.filter(c => c.status === 'in_progress').length;
    const done = cards.filter(c => c.status === 'done').length;
    const completionRate = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

    return {
      totalUsers: users.length,
      totalBoards: boards.length,
      totalTasks,
      notStarted,
      inProgress,
      done,
      completionRate,
    };
  }, [users, boards, cards]);

  // Calculate user task stats
  const userStats = useMemo(() => {
    return users.map(user => {
      const userCards = cards.filter(card => card.assignedTo.includes(user.id));
      const userBoards = boards.filter(board => board.users.includes(user.id));

      const notStarted = userCards.filter(c => c.status === 'not_started').length;
      const inProgress = userCards.filter(c => c.status === 'in_progress').length;
      const done = userCards.filter(c => c.status === 'done').length;
      const total = userCards.length;
      const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        user,
        boardCount: userBoards.length,
        total,
        notStarted,
        inProgress,
        done,
        completionRate,
      };
    });
  }, [users, cards, boards]);

  // Handle card click from user modal
  const handleCardClick = (cardId: string, boardId: string) => {
    // Close user modal
    setSelectedUserId(null);

    // Switch to member view
    setViewMode('member');

    // Select the board
    setSelectedBoard(boardId);

    // Open the card modal (with a small delay to ensure board loads)
    setTimeout(() => {
      openCardModal(cardId);
    }, 100);
  };

  // Handle seed mock data
  const handleSeedMockData = async () => {
    if (users.length === 0) {
      error('Please create users first before seeding mock data');
      return;
    }

    setIsSeeding(true);

    try {
      const result = await seedMockData(users);

      if (result.success) {
        success(result.message);

        // Reload data
        await loadBoards();
        await loadLists();
        await loadCards();
      } else {
        error(result.message);
      }
    } catch (err) {
      console.error('Failed to seed mock data:', err);
      error('Failed to seed mock data');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Team Overview</h2>
            <p className="text-zinc-400">
              Monitor user activity, boards, and task progress
            </p>
          </div>

          {/* Seed Mock Data Button */}
          <button
            onClick={handleSeedMockData}
            disabled={isSeeding || users.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={18} className={isSeeding ? 'animate-spin' : ''} />
            <span className="text-sm font-medium">
              {isSeeding ? 'Generating...' : 'Generate Mock Data'}
            </span>
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              {/* Total Users */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Users className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{overallMetrics.totalUsers}</div>
                    <div className="text-xs text-zinc-500">Users</div>
                  </div>
                </div>
              </div>

              {/* Total Boards */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{overallMetrics.totalBoards}</div>
                    <div className="text-xs text-zinc-500">Boards</div>
                  </div>
                </div>
              </div>

              {/* Total Tasks */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <ListTodo className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{overallMetrics.totalTasks}</div>
                    <div className="text-xs text-zinc-500">Total Tasks</div>
                  </div>
                </div>
              </div>

              {/* In Progress */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{overallMetrics.inProgress}</div>
                    <div className="text-xs text-zinc-500">In Progress</div>
                  </div>
                </div>
              </div>

              {/* Done */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{overallMetrics.done}</div>
                    <div className="text-xs text-zinc-500">Completed</div>
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{overallMetrics.completionRate}%</div>
                    <div className="text-xs text-zinc-500">Completion</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UserCardSkeleton />
            <UserCardSkeleton />
            <UserCardSkeleton />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-12 text-center">
            <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Users Yet</h3>
            <p className="text-zinc-400">Add users to start monitoring their activity</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userStats.map(({ user, boardCount, total, notStarted, inProgress, done, completionRate }) => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all text-left group cursor-pointer"
              >
                {/* User Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate group-hover:text-emerald-400 transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  {/* Boards */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Boards</span>
                    <span className="text-white font-medium">{boardCount}</span>
                  </div>

                  {/* Total Tasks */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Total Tasks</span>
                    <span className="text-white font-medium">{total}</span>
                  </div>

                  {/* Status Breakdown */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-zinc-800 rounded p-2 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <XCircle className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div className="text-lg font-bold text-zinc-400">{notStarted}</div>
                      <div className="text-xs text-zinc-600">Not Started</div>
                    </div>
                    <div className="bg-blue-500/10 rounded p-2 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-lg font-bold text-blue-400">{inProgress}</div>
                      <div className="text-xs text-blue-600">In Progress</div>
                    </div>
                    <div className="bg-emerald-500/10 rounded p-2 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-lg font-bold text-emerald-400">{done}</div>
                      <div className="text-xs text-emerald-600">Done</div>
                    </div>
                  </div>

                  {/* Completion Progress */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-zinc-400">Completion</span>
                      <span className="text-white font-medium">{completionRate}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          extendedData={extendedUserData.get(selectedUser.id)}
          boards={boards}
          cards={cards}
          lists={lists}
          onClose={() => setSelectedUserId(null)}
          onCardClick={handleCardClick}
        />
      )}
    </div>
  );
}
