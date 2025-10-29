'use client';

import { useStore } from '@/store/useStore';
import { Plus, Folder } from 'lucide-react';
import { useState } from 'react';
import { BoardSkeleton } from './Skeletons';

export function BoardList() {
  const { boards, addBoard, setSelectedBoard, currentUser, isLoadingBoards } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const handleAddBoard = () => {
    if (newBoardTitle.trim()) {
      addBoard(newBoardTitle);
      setNewBoardTitle('');
      setIsAdding(false);
    }
  };

  // Show all boards if no current user, otherwise filter by user's boards
  const userBoards = currentUser
    ? boards.filter(board => board.users.includes(currentUser.id))
    : boards;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <h2 className="text-2xl font-bold text-white">Your Boards</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus size={20} />
            New Board
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4 auto-rows-max">
          {isLoadingBoards ? (
            // Show skeleton loaders while loading
            <>
              <BoardSkeleton />
              <BoardSkeleton />
              <BoardSkeleton />
              <BoardSkeleton />
            </>
          ) : (
            userBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => setSelectedBoard(board.id)}
                className="group relative p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-zinc-700 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-left cursor-pointer overflow-hidden h-full w-full"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-zinc-700/50 rounded-xl group-hover:bg-emerald-500/20 transition-all backdrop-blur-sm">
                      <Folder className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg truncate group-hover:text-emerald-400 transition-colors">
                        {board.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-700/50">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-zinc-700/50 rounded-lg backdrop-blur-sm">
                        <span className="text-sm font-semibold text-emerald-400">
                          {board.taskCount}
                        </span>
                        <span className="text-xs text-zinc-400 ml-1">
                          task{board.taskCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 group-hover:text-emerald-500 transition-colors">
                      Open →
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}

          {isAdding && (
            <div className="p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 h-full flex flex-col justify-center">
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddBoard();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewBoardTitle('');
                  }
                }}
                placeholder="Enter board title..."
                className="w-full bg-zinc-900 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mb-3 font-medium"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddBoard}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all text-sm font-semibold cursor-pointer shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                >
                  Create Board
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewBoardTitle('');
                  }}
                  className="px-4 py-2.5 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
