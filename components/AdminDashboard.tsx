'use client';

import { useStore } from '@/store/useStore';
import { Users, CheckSquare, Clock } from 'lucide-react';

export function AdminDashboard() {
  const { users, cards, subtasks } = useStore();

  const members = users.filter((u) => u.role === 'member');

  const getMemberStats = (userId: string) => {
    const memberCards = cards.filter((c) => c.assignedTo.includes(userId));
    const memberSubtasks = subtasks.filter((s) =>
      memberCards.some((c) => c.id === s.cardId)
    );
    const completedSubtasks = memberSubtasks.filter((s) => s.isCompleted).length;

    return {
      totalCards: memberCards.length,
      totalSubtasks: memberSubtasks.length,
      completedSubtasks,
      inProgress: memberCards.length - completedSubtasks,
    };
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h2>
          <p className="text-zinc-400">Manage team members and monitor their tasks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-zinc-400 text-sm font-medium">Total Members</h3>
              <Users className="text-emerald-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{members.length}</p>
          </div>

          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-zinc-400 text-sm font-medium">Total Tasks</h3>
              <CheckSquare className="text-blue-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{cards.length}</p>
          </div>

          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-zinc-400 text-sm font-medium">In Progress</h3>
              <Clock className="text-yellow-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">
              {cards.filter((c) => c.assignedTo.length > 0).length}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4">Team Members</h3>
          <div className="space-y-4">
            {members.map((member) => {
              const stats = getMemberStats(member.id);
              const memberCards = cards.filter((c) => c.assignedTo.includes(member.id));

              return (
                <div
                  key={member.id}
                  className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{member.name}</h4>
                          <p className="text-zinc-400 text-sm">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{stats.totalCards}</p>
                          <p className="text-xs text-zinc-400">Tasks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-500">
                            {stats.completedSubtasks}
                          </p>
                          <p className="text-xs text-zinc-400">Completed</p>
                        </div>
                      </div>
                    </div>

                    {memberCards.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-zinc-400 mb-2">
                          Assigned Tasks
                        </h5>
                        {memberCards.map((card) => {
                          const cardSubtasks = subtasks.filter((s) => s.cardId === card.id);
                          const completed = cardSubtasks.filter((s) => s.isCompleted).length;
                          const total = cardSubtasks.length;

                          return (
                            <div
                              key={card.id}
                              className="bg-zinc-900 p-3 rounded-lg border border-zinc-700"
                            >
                              <div className="flex items-center justify-between">
                                <h6 className="text-white font-medium">{card.title}</h6>
                                {total > 0 && (
                                  <span className="text-xs text-zinc-400">
                                    {completed}/{total}
                                  </span>
                                )}
                              </div>
                              {card.description && (
                                <p className="text-sm text-zinc-500 mt-1 line-clamp-1">
                                  {card.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
