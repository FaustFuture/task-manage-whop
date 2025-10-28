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
    ? boards.filter(board => board.members.includes(currentUser.id))
    : boards;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Your Boards</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            <Plus size={20} />
            New Board
          </button>
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
          ) : (
            userBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => setSelectedBoard(board.id)}
                className="group p-6 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-emerald-500 transition-all text-left cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-zinc-700 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <Folder className="text-emerald-500" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 truncate">
                      {board.title}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {board.members.length} member{board.members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}

          {isAdding && (
            <div className="p-6 bg-zinc-800 rounded-lg border border-emerald-500">
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
                placeholder="Board title..."
                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddBoard}
                  className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium cursor-pointer"
                >
                  Add Board
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewBoardTitle('');
                  }}
                  className="px-3 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm font-medium cursor-pointer"
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
