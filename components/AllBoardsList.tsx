'use client';

import { useStore } from '@/store/useStore';
import { Folder, Lock, Edit2, Trash2, Plus } from 'lucide-react';
import { BoardSkeleton } from './Skeletons';
import { useState, useEffect } from 'react';

export function AllBoardsList() {
  const { 
    boards, 
    companyId, 
    isLoadingBoards, 
    setSelectedBoard, 
    updateBoard, 
    deleteBoard, 
    addBoard, 
    currentUser,
    companyUsers,
    loadCompanyUsers,
    isLoadingUsers
  } = useStore();
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardAssignedTo, setNewBoardAssignedTo] = useState<string | null>(null);
  
  const isAdmin = currentUser?.role === 'admin';
  const isReadOnly = !isAdmin;

  // Load company users when component mounts (if admin)
  useEffect(() => {
    if (isAdmin && companyId) {
      loadCompanyUsers();
    }
  }, [isAdmin, companyId, loadCompanyUsers]);

  // Show all boards for the current company (no membership filtering)
  const companyBoards = boards.filter((board) => board.companyId === companyId);

  const handleEdit = (board: typeof companyBoards[0]) => {
    setEditingBoardId(board.id);
    setEditTitle(board.title);
    // Get the assigned member (first member that's not the creator, or null)
    const assignedMember = board.members.find(m => m !== board.createdBy) || null;
    setEditAssignedTo(assignedMember);
  };

  const handleSaveEdit = async (boardId: string) => {
    if (editTitle.trim()) {
      // Build members array - include assigned member and creator
      const members: string[] = [];
      if (editAssignedTo) {
        members.push(editAssignedTo);
      }
      // Always include creator
      const board = boards.find(b => b.id === boardId);
      if (board?.createdBy && !members.includes(board.createdBy)) {
        members.push(board.createdBy);
      }
      
      await updateBoard(boardId, { title: editTitle, members });
      setEditingBoardId(null);
      setEditTitle('');
      setEditAssignedTo(null);
    }
  };

  const handleDelete = async (boardId: string) => {
    if (confirm('Are you sure you want to delete this board? This will also delete all lists and tasks in it.')) {
      await deleteBoard(boardId);
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

  // Helper function to get assigned member name
  const getAssignedMemberName = (board: typeof companyBoards[0]) => {
    const assignedMemberId = board.members.find(m => m !== board.createdBy);
    if (!assignedMemberId) return null;
    const member = companyUsers.find(u => u.id === assignedMemberId);
    return member?.name || member?.username || null;
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">All Company Boards</h2>
            {isReadOnly && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-sm">
                <Lock size={14} />
                <span>Read Only</span>
              </div>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              <Plus size={20} />
              New Board
            </button>
          )}
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
            <>
              {companyBoards.map((board) => (
                <div
                  key={board.id}
                  className="group relative p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-zinc-700 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all overflow-hidden opacity-75 hover:opacity-100"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-700/5 rounded-full blur-3xl group-hover:bg-emerald-500/5 transition-all" />
                  {editingBoardId === board.id ? (
                    <div className="relative flex flex-col gap-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(board.id);
                          if (e.key === 'Escape') {
                            setEditingBoardId(null);
                            setEditTitle('');
                            setEditAssignedTo(null);
                          }
                        }}
                        className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none font-bold text-lg mb-2"
                        autoFocus
                      />
                      {isAdmin && (
                        <select
                          value={editAssignedTo || ''}
                          onChange={(e) => setEditAssignedTo(e.target.value || null)}
                          className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none text-sm"
                        >
                          <option value="">No assignment</option>
                          {companyUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name || user.username}
                            </option>
                          ))}
                        </select>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(board.id)}
                          className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingBoardId(null);
                            setEditTitle('');
                            setEditAssignedTo(null);
                          }}
                          className="px-3 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-zinc-700/50 rounded-xl group-hover:bg-emerald-500/20 transition-all">
                          <Folder className="text-zinc-500 group-hover:text-emerald-500 transition-colors" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-lg mb-1 truncate group-hover:text-emerald-400 transition-colors">
                            {board.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getAssignedMemberName(board) ? (
                              <>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                                  <span>Assignments</span>
                                </div>
                                <p className="text-sm text-zinc-400">
                                  {getAssignedMemberName(board)}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-700/50 text-zinc-400 rounded text-xs font-medium">
                                  <span>Assignments</span>
                                </div>
                                <p className="text-sm text-zinc-500 italic">
                                  Unassigned
                                </p>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-zinc-500 mt-1">
                            {board.members.length} member{board.members.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEdit(board)}
                              className="p-1.5 hover:bg-zinc-700 rounded transition-colors cursor-pointer"
                            >
                              <Edit2 className="text-zinc-400 hover:text-emerald-400" size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(board.id)}
                              className="p-1.5 hover:bg-zinc-700 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="text-zinc-400 hover:text-red-400" size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedBoard(board.id)}
                        className="flex items-center justify-between pt-3 border-t border-zinc-700/50 text-left w-full"
                      >
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
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isAdding && (
                <div className="p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border-2 border-emerald-500 shadow-lg shadow-emerald-500/20">
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
                    placeholder="Enter board title..."
                    className="w-full bg-zinc-900 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mb-3 font-medium"
                    autoFocus
                  />
                  {isAdmin && (
                    <select
                      value={newBoardAssignedTo || ''}
                      onChange={(e) => setNewBoardAssignedTo(e.target.value || null)}
                      className="w-full bg-zinc-900 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none mb-3 text-sm"
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
                  )}
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
                        setNewBoardAssignedTo(null);
                      }}
                      className="px-4 py-2.5 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

