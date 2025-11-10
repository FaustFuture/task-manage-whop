'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Folder, Plus, Edit2, X, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface BoardMetrics {
  id: string;
  title: string;
  taskCount: number;
  notStarted: number;
  inProgress: number;
  done: number;
  completionRate: number;
  health: 'healthy' | 'at_risk' | 'stalled';
  membersCount: number;
  createdAt: Date;
}

interface BoardsTableProps {
  boards: BoardMetrics[];
}

type SortField = 'title' | 'taskCount' | 'completionRate' | 'membersCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function BoardsTable({ boards: boardMetrics }: BoardsTableProps) {
  const { 
    addBoard, 
    updateBoard, 
    companyUsers, 
    loadCompanyUsers, 
    isLoadingUsers,
    companyId,
    currentUser,
    boards: storeBoards
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('taskCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isAdding, setIsAdding] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardAssignedTo, setNewBoardAssignedTo] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editAssignedTo, setEditAssignedTo] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Load company users when component mounts
  useEffect(() => {
    if (isAdmin && companyId) {
      loadCompanyUsers();
    }
  }, [isAdmin, companyId, loadCompanyUsers]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = boardMetrics.filter(
      (board) =>
        board.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'createdAt') {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [boardMetrics, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-zinc-600" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="text-emerald-500" />
    ) : (
      <ArrowDown size={14} className="text-emerald-500" />
    );
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'at_risk':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'stalled':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getHealthLabel = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'Healthy';
      case 'at_risk':
        return 'At Risk';
      case 'stalled':
        return 'Stalled';
      default:
        return 'Unknown';
    }
  };

  const handleAddBoard = async () => {
    if (newBoardTitle.trim()) {
      await addBoard(newBoardTitle, newBoardAssignedTo);
      setNewBoardTitle('');
      setNewBoardAssignedTo(null);
      setIsAdding(false);
    }
  };

  const handleEditAssignment = (board: BoardMetrics) => {
    setEditingBoardId(board.id);
    // Get the actual board from store to check members
    const actualBoard = storeBoards.find(b => b.id === board.id);
    if (actualBoard) {
      // Get the assigned member (first member that's not the creator)
      const assignedMember = actualBoard.members.find(m => m !== actualBoard.createdBy) || null;
      setEditAssignedTo(assignedMember);
    } else {
      setEditAssignedTo(null);
    }
  };

  const handleSaveAssignment = async (boardId: string) => {
    // Get the actual board from store
    const actualBoard = storeBoards.find(b => b.id === boardId);
    if (!actualBoard) return;

    // Build members array - include assigned member and creator
    const members: string[] = [];
    if (editAssignedTo) {
      members.push(editAssignedTo);
    }
    // Always include creator
    if (actualBoard.createdBy && !members.includes(actualBoard.createdBy)) {
      members.push(actualBoard.createdBy);
    }
    
    await updateBoard(boardId, { members });
    setEditingBoardId(null);
    setEditAssignedTo(null);
  };

  // Helper to get assigned member name
  const getAssignedMemberName = (board: BoardMetrics) => {
    const actualBoard = storeBoards.find(b => b.id === board.id);
    if (!actualBoard) return null;
    
    const assignedMemberId = actualBoard.members.find(m => m !== actualBoard.createdBy);
    if (!assignedMemberId) return null;
    
    const member = companyUsers.find(u => u.id === assignedMemberId);
    return member?.name || member?.username || null;
  };

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700">
      {/* Header */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Boards Overview</h3>
          <div className="flex items-center gap-3">
            <div className="text-sm text-zinc-400">
              {filteredAndSortedData.length} of {boardMetrics.length} boards
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium cursor-pointer"
              >
                <Plus size={16} />
                New Board
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search boards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-emerald">
        <table className="w-full">
          <thead className="bg-zinc-900/50">
            <tr className="text-left text-xs text-zinc-400 uppercase tracking-wider">
              <th className="px-4 py-3">
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('title')}
                >
                  Board <SortIcon field="title" />
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('taskCount')}
              >
                <div className="flex items-center gap-1">
                  Tasks <SortIcon field="taskCount" />
                </div>
              </th>
              <th className="px-4 py-3">
                Status Breakdown
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('completionRate')}
              >
                <div className="flex items-center gap-1">
                  Completion <SortIcon field="completionRate" />
                </div>
              </th>
              <th className="px-4 py-3">
                Health
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('membersCount')}
              >
                <div className="flex items-center gap-1">
                  Members <SortIcon field="membersCount" />
                </div>
              </th>
              <th className="px-4 py-3">
                Assignments
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  Created <SortIcon field="createdAt" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {filteredAndSortedData.map((board) => {
              return (
                <tr
                  key={board.id}
                  className="hover:bg-zinc-900/50 transition-colors"
                >
                  {/* Board Title */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Folder className="text-emerald-500" size={20} />
                      </div>
                      <div className="text-white font-medium">{board.title}</div>
                    </div>
                  </td>

                  {/* Total Tasks */}
                  <td className="px-4 py-4">
                    <div className="text-white font-semibold text-lg">{board.taskCount}</div>
                  </td>

                  {/* Status Breakdown */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                        <span className="text-zinc-400">{board.notStarted}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span className="text-zinc-400">{board.inProgress}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-zinc-400">{board.done}</span>
                      </div>
                    </div>
                  </td>

                  {/* Completion Rate */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                          style={{ width: `${board.completionRate}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold text-sm w-10 text-right">
                        {board.completionRate}%
                      </span>
                    </div>
                  </td>

                  {/* Health Status */}
                  <td className="px-4 py-4">
                    <div
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getHealthColor(
                        board.health
                      )}`}
                    >
                      {getHealthLabel(board.health)}
                    </div>
                  </td>

                  {/* Members Count */}
                  <td className="px-4 py-4">
                    <div className="text-white font-medium">{board.membersCount}</div>
                  </td>

                  {/* Assignments */}
                  <td className="px-4 py-4">
                    {editingBoardId === board.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editAssignedTo || ''}
                          onChange={(e) => setEditAssignedTo(e.target.value || null)}
                          className="flex-1 bg-zinc-900 text-white px-2 py-1 rounded border border-zinc-700 focus:border-emerald-500 focus:outline-none text-sm"
                          autoFocus
                        >
                          <option value="">No assignment</option>
                          {companyUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name || user.username}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleSaveAssignment(board.id)}
                          className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors cursor-pointer"
                          title="Save"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingBoardId(null);
                            setEditAssignedTo(null);
                          }}
                          className="p-1.5 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {getAssignedMemberName(board) ? (
                          <>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                              <span>Assignments</span>
                            </div>
                            <span className="text-sm text-zinc-300">{getAssignedMemberName(board)}</span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-700/50 text-zinc-400 rounded text-xs font-medium">
                              <span>Assignments</span>
                            </div>
                            <span className="text-sm text-zinc-500 italic">Unassigned</span>
                          </>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleEditAssignment(board)}
                            className="p-1 hover:bg-zinc-700 rounded transition-colors cursor-pointer ml-1"
                            title="Edit assignment"
                          >
                            <Edit2 className="text-zinc-400 hover:text-emerald-400" size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Created Date */}
                  <td className="px-4 py-4">
                    <div className="text-sm text-zinc-400">
                      {new Date(board.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            No boards found matching &quot;{searchTerm}&quot;
          </div>
        )}
      </div>

      {/* Add Board Form */}
      {isAdding && (
        <div className="p-4 border-t border-zinc-700 bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-sm font-semibold text-white">Create New Board</h4>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewBoardTitle('');
                setNewBoardAssignedTo(null);
              }}
              className="ml-auto p-1 hover:bg-zinc-700 rounded transition-colors cursor-pointer"
            >
              <X className="text-zinc-400" size={16} />
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddBoard();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewBoardTitle('');
                  setNewBoardAssignedTo(null);
                }
              }}
              placeholder="Board title..."
              className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none text-sm"
              autoFocus
            />
            <select
              value={newBoardAssignedTo || ''}
              onChange={(e) => setNewBoardAssignedTo(e.target.value || null)}
              className="bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none text-sm min-w-[200px]"
            >
              <option value="">No assignment</option>
              {isLoadingUsers ? (
                <option disabled>Loading users...</option>
              ) : (
                companyUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username}
                  </option>
                ))
              )}
            </select>
            <button
              onClick={handleAddBoard}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium cursor-pointer"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewBoardTitle('');
                setNewBoardAssignedTo(null);
              }}
              className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
