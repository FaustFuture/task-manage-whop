'use client';

import { useState, useMemo } from 'react';
import { UserMetrics } from '@/types';
import { ExtendedUserData } from '@/lib/mockData';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { ProgressRing } from './ProgressRing';

interface UserMetricsTableProps {
  userMetrics: UserMetrics[];
  extendedData: Map<string, ExtendedUserData>;
  onUserClick?: (userId: string) => void;
}

type SortField = 'name' | 'totalTasks' | 'completionRate' | 'boardsCount' | 'lastActive';
type SortDirection = 'asc' | 'desc';

export function UserMetricsTable({ userMetrics, extendedData, onUserClick }: UserMetricsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('completionRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = userMetrics.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'lastActive') {
        const aExtended = extendedData.get(a.userId);
        const bExtended = extendedData.get(b.userId);
        aValue = aExtended?.lastActive.getTime() || 0;
        bValue = bExtended?.lastActive.getTime() || 0;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
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
  }, [userMetrics, extendedData, searchTerm, sortField, sortDirection]);

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

  const getColorForCompletionRate = (rate: number) => {
    if (rate >= 75) return '#10b981'; // emerald
    if (rate >= 50) return '#06b6d4'; // cyan
    if (rate >= 25) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700">
      {/* Header */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">User Performance</h3>
          <div className="text-sm text-zinc-400">
            {filteredAndSortedData.length} of {userMetrics.length} users
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
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
              <th className="px-4 py-3">User</th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('totalTasks')}
              >
                <div className="flex items-center gap-1">
                  Tasks <SortIcon field="totalTasks" />
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('completionRate')}
              >
                <div className="flex items-center gap-1">
                  Completion <SortIcon field="completionRate" />
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('boardsCount')}
              >
                <div className="flex items-center gap-1">
                  Boards <SortIcon field="boardsCount" />
                </div>
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('lastActive')}
              >
                <div className="flex items-center gap-1">
                  Last Active <SortIcon field="lastActive" />
                </div>
              </th>
              {onUserClick && (
                <th className="px-4 py-3 text-right">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {filteredAndSortedData.map((user) => {
              const extended = extendedData.get(user.userId);
              const completionColor = getColorForCompletionRate(user.completionRate);

              return (
                <tr
                  key={user.userId}
                  onClick={() => onUserClick?.(user.userId)}
                  className={`group transition-colors ${
                    onUserClick
                      ? 'hover:bg-zinc-900/70 cursor-pointer'
                      : 'hover:bg-zinc-900/50'
                  }`}
                >
                  {/* User Info */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        {extended && (
                          <div className="text-xs text-zinc-600 mt-0.5">
                            {extended.department} • {extended.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Total Tasks */}
                  <td className="px-4 py-4">
                    <div className="text-white font-semibold text-lg">{user.totalTasks}</div>
                  </td>

                  {/* Completion Rate */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="scale-50 origin-left">
                        <ProgressRing
                          percentage={user.completionRate}
                          size={60}
                          strokeWidth={6}
                          color={completionColor}
                          showPercentage={false}
                        />
                      </div>
                      <span className="text-white font-semibold">{user.completionRate}%</span>
                    </div>
                  </td>

                  {/* Boards Count */}
                  <td className="px-4 py-4">
                    <div className="text-white font-medium">{user.boardsCount}</div>
                  </td>

                  {/* Last Active */}
                  <td className="px-4 py-4">
                    {extended && (
                      <div className="text-sm text-zinc-400">
                        {extended.lastActive.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </td>

                  {/* Action Column */}
                  {onUserClick && (
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 group-hover:opacity-100 transition-opacity">
                        <Eye size={18} className="text-emerald-500" />
                        <span className="text-sm text-emerald-500 font-medium">View Details</span>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            No users found matching &quot;{searchTerm}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
