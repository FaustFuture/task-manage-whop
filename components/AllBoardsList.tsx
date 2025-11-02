'use client';

import { useStore } from '@/store/useStore';
import { Folder, Lock } from 'lucide-react';
import { BoardSkeleton } from './Skeletons';

export function AllBoardsList() {
  const { boards, companyId, isLoadingBoards, setSelectedBoard } = useStore();

  // Show all boards for the current company (no membership filtering)
  const companyBoards = boards.filter((board) => board.companyId === companyId);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">All Company Boards</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-sm">
              <Lock size={14} />
              <span>Read Only</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoadingBoards ? (
            // Show skeleton loaders while loading
            <>
              <BoardSkeleton />
              <BoardSkeleton />
              <BoardSkeleton />
              <BoardSkeleton />
            </>
          ) : companyBoards.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <Folder className="text-zinc-600 mb-4" size={48} />
              <p className="text-zinc-400 text-lg">No boards found</p>
              <p className="text-zinc-500 text-sm mt-2">No boards exist for this company yet.</p>
            </div>
          ) : (
            companyBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => setSelectedBoard(board.id)}
                className="group relative p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-zinc-700 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-left cursor-pointer overflow-hidden opacity-75 hover:opacity-100"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-700/5 rounded-full blur-3xl group-hover:bg-emerald-500/5 transition-all" />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-zinc-700/50 rounded-xl group-hover:bg-emerald-500/20 transition-all">
                      <Folder className="text-zinc-500 group-hover:text-emerald-500 transition-colors" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg mb-1 truncate group-hover:text-emerald-400 transition-colors">
                        {board.title}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {board.members.length} member{board.members.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-700/50">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-zinc-700/50 rounded-lg backdrop-blur-sm">
                        <span className="text-sm font-semibold text-zinc-400">
                          {board.taskCount}
                        </span>
                        <span className="text-xs text-zinc-500 ml-1">
                          task{board.taskCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 group-hover:text-emerald-500 transition-colors">
                      View →
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

