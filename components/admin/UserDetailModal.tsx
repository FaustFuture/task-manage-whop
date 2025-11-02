'use client';

import { useState, useMemo } from 'react';
import { User, Board, Card, List, TaskStatus } from '@/types';
import { ExtendedUserData } from '@/lib/mockData';
import { X, Folder, CheckSquare, Filter, Calendar, Clock } from 'lucide-react';
import { ProgressRing } from './ProgressRing';

interface UserDetailModalProps {
  user: User;
  extendedData?: ExtendedUserData;
  boards: Board[];
  cards: Card[];
  lists: List[];
  onClose: () => void;
}

const statusConfig: Record<TaskStatus, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
  not_started: {
    label: 'Not Started',
    bgColor: 'bg-zinc-800',
    textColor: 'text-zinc-400',
    borderColor: 'border-zinc-700'
  },
  in_progress: {
    label: 'In Progress',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30'
  },
  done: {
    label: 'Done',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30'
  },
};

export function UserDetailModal({ user, extendedData, boards, cards, lists, onClose }: UserDetailModalProps) {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [boardFilter, setBoardFilter] = useState<string | 'all'>('all');

  // Get user's boards
  const userBoards = useMemo(() =>
    boards.filter(board => board.members.includes(user.id)),
    [boards, user.id]
  );

  // Get user's cards
  const userCards = useMemo(() =>
    cards.filter(card => card.assignedTo.includes(user.id)),
    [cards, user.id]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const notStarted = userCards.filter(c => c.status === 'not_started').length;
    const inProgress = userCards.filter(c => c.status === 'in_progress').length;
    const done = userCards.filter(c => c.status === 'done').length;
    const total = userCards.length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { notStarted, inProgress, done, total, completionRate };
  }, [userCards]);

  // Filter cards
  const filteredCards = useMemo(() => {
    let filtered = userCards;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(card => card.status === statusFilter);
    }

    if (boardFilter !== 'all') {
      const boardLists = lists.filter(list => list.boardId === boardFilter);
      filtered = filtered.filter(card =>
        boardLists.some(list => list.id === card.listId)
      );
    }

    return filtered;
  }, [userCards, statusFilter, boardFilter, lists]);

  // Group cards by board
  const cardsByBoard = useMemo(() => {
    const grouped = new Map<string, Card[]>();

    filteredCards.forEach(card => {
      const list = lists.find(l => l.id === card.listId);
      if (!list) return;

      const board = boards.find(b => b.id === list.boardId);
      if (!board) return;

      if (!grouped.has(board.id)) {
        grouped.set(board.id, []);
      }
      grouped.get(board.id)!.push(card);
    });

    return grouped;
  }, [filteredCards, lists, boards]);

  const getColorForCompletionRate = (rate: number) => {
    if (rate >= 75) return '#10b981'; // emerald
    if (rate >= 50) return '#06b6d4'; // cyan
    if (rate >= 25) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border-b border-zinc-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* User Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "@"}
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                {/* <p className="text-zinc-400">{user.email}</p> */}
                {extendedData && (
                  <div className="flex gap-3 mt-2 text-sm">
                    <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-400">
                      {extendedData.department}
                    </span>
                    <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-400">
                      {extendedData.location}
                    </span>
                    <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-400">
                      {user.role}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-zinc-400 mt-1">Total Tasks</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-zinc-400">{stats.notStarted}</div>
              <div className="text-xs text-zinc-500 mt-1">Not Started</div>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
              <div className="text-xs text-blue-500 mt-1">In Progress</div>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{stats.done}</div>
              <div className="text-xs text-emerald-500 mt-1">Done</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 flex items-center justify-center">
              <div className="scale-75">
                <ProgressRing
                  percentage={stats.completionRate}
                  size={60}
                  strokeWidth={6}
                  color={getColorForCompletionRate(stats.completionRate)}
                  showPercentage={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-zinc-700 p-4 bg-zinc-800/50">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-zinc-400" />
              <span className="text-sm text-zinc-400">Filters:</span>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(['all', 'not_started', 'in_progress', 'done'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {status === 'all' ? 'All Status' : statusConfig[status].label}
                </button>
              ))}
            </div>

            {/* Board Filter */}
            {userBoards.length > 1 && (
              <>
                <div className="w-px h-6 bg-zinc-700" />
                <select
                  value={boardFilter}
                  onChange={(e) => setBoardFilter(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="all">All Boards ({userBoards.length})</option>
                  {userBoards.map(board => (
                    <option key={board.id} value={board.id}>
                      {board.title}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="ml-auto text-sm text-zinc-400">
              Showing {filteredCards.length} of {stats.total} tasks
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-emerald">
          {/* Boards Section */}
          {userBoards.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Folder className="text-indigo-500" size={20} />
                Member of {userBoards.length} Board{userBoards.length !== 1 ? 's' : ''}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {userBoards.map(board => {
                  const boardLists = lists.filter(l => l.boardId === board.id);
                  const boardCards = userCards.filter(c =>
                    boardLists.some(l => l.id === c.listId)
                  );

                  return (
                    <div
                      key={board.id}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-emerald-500/50 transition-colors cursor-pointer"
                      onClick={() => setBoardFilter(board.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center">
                          <Folder className="text-white" size={16} />
                        </div>
                        <h4 className="text-white font-medium truncate flex-1">{board.title}</h4>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {boardCards.length} task{boardCards.length !== 1 ? 's' : ''} assigned
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckSquare className="text-emerald-500" size={20} />
              Tasks
            </h3>

            {filteredCards.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tasks found</p>
                {(statusFilter !== 'all' || boardFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setBoardFilter('all');
                    }}
                    className="mt-2 text-emerald-500 hover:text-emerald-400 text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from(cardsByBoard.entries()).map(([boardId, boardCards]) => {
                  const board = boards.find(b => b.id === boardId);
                  if (!board) return null;

                  return (
                    <div key={boardId}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center">
                          <Folder className="text-white" size={14} />
                        </div>
                        <h4 className="text-white font-medium">{board.title}</h4>
                        <span className="text-xs text-zinc-500">
                          ({boardCards.length} task{boardCards.length !== 1 ? 's' : ''})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                        {boardCards.map(card => {
                          const cardList = lists.find(l => l.id === card.listId);
                          const config = statusConfig[card.status];

                          return (
                            <div
                              key={card.id}
                              className={`bg-zinc-800 border ${config.borderColor} rounded-lg p-4 hover:bg-zinc-800/80 transition-colors`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="text-white font-medium flex-1">{card.title}</h5>
                                <span className={`text-xs px-2 py-1 rounded ${config.bgColor} ${config.textColor} font-medium ml-2 whitespace-nowrap`}>
                                  {config.label}
                                </span>
                              </div>

                              {card.description && (
                                <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                                  {card.description}
                                </p>
                              )}

                              <div className="flex items-center gap-3 text-xs text-zinc-500">
                                {cardList && (
                                  <span className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-zinc-600 rounded-full" />
                                    {cardList.title}
                                  </span>
                                )}
                                {card.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(card.dueDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                )}
                                {card.createdAt && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(card.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
