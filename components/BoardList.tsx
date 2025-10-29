'use client';

import { useStore } from '@/store/useStore';
import { Plus, Folder, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BoardSkeleton } from './Skeletons';

export function BoardList() {
  const { boards, addBoard, setSelectedBoard, deleteBoard, currentUser, isLoadingBoards } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);

  const handleAddBoard = () => {
    if (newBoardTitle.trim()) {
      addBoard(newBoardTitle);
      setNewBoardTitle('');
      setIsAdding(false);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    await deleteBoard(boardId);
    setDeletingBoardId(null);
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
              <div
                key={board.id}
                className="group relative p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-zinc-700 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all overflow-hidden h-full w-full"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-zinc-700/50 rounded-xl group-hover:bg-emerald-500/20 transition-all backdrop-blur-sm">
                      <Folder className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
                    </div>
                    <div
                      onClick={() => setSelectedBoard(board.id)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <h3 className="font-bold text-white text-lg truncate group-hover:text-emerald-400 transition-colors">
                        {board.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingBoardId(board.id);
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete board"
                    >
                      <Trash2 className="text-zinc-400 hover:text-red-500" size={18} />
                    </button>
                  </div>
                  <div
                    onClick={() => setSelectedBoard(board.id)}
                    className="flex items-center justify-between pt-3 border-t border-zinc-700/50 cursor-pointer"
                  >
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
              </div>
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

        {/* Delete Confirmation Modal */}
        {deletingBoardId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 rounded-xl p-6 max-w-md w-full border border-zinc-700 shadow-2xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Trash2 className="text-red-500" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Delete Board?</h3>
                  <p className="text-zinc-400 text-sm">
                    Are you sure you want to delete <span className="font-semibold text-white">{boards.find(b => b.id === deletingBoardId)?.title}</span>? This will permanently delete all lists, cards, and subtasks in this board. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleDeleteBoard(deletingBoardId)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold cursor-pointer"
                >
                  Delete Board
                </button>
                <button
                  onClick={() => setDeletingBoardId(null)}
                  className="flex-1 px-4 py-2.5 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
