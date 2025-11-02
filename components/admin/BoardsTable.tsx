'use client';

import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Folder } from 'lucide-react';

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

export function BoardsTable({ boards }: BoardsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('taskCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = boards.filter(
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
  }, [boards, searchTerm, sortField, sortDirection]);

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

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700">
      {/* Header */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Boards Overview</h3>
          <div className="text-sm text-zinc-400">
            {filteredAndSortedData.length} of {boards.length} boards
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
    </div>
  );
}
