'use client';

import { useStore } from '@/store/useStore';
import { X, Trash2, Plus, Check, UserPlus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { SubtaskSkeleton } from './Skeletons';

export function CardModal() {
  const {
    cards,
    subtasks,
    users,
    selectedCardId,
    isCardModalOpen,
    closeCardModal,
    updateCard,
    deleteCard,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    isLoadingSubtasks,
    loadSubtasks,
  } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  const memberPickerRef = useRef<HTMLDivElement>(null);

  const card = cards.find((c) => c.id === selectedCardId);
  const cardSubtasks = subtasks
    .filter((s) => s.cardId === selectedCardId)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      // Load subtasks for this card
      loadSubtasks(card.id);
    }
  }, [card]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (memberPickerRef.current && !memberPickerRef.current.contains(event.target as Node)) {
        setShowMemberPicker(false);
      }
    };

    if (showMemberPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMemberPicker]);

  if (!isCardModalOpen || !card) return null;

  const handleSave = () => {
    updateCard(card.id, { title, description });
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubtask(card.id, newSubtaskTitle);
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCard(card.id);
      closeCardModal();
    }
  };

  const handleAssignMember = (userId: string) => {
    if (!card.assignedTo.includes(userId)) {
      updateCard(card.id, { assignedTo: [...card.assignedTo, userId] });
    }
    setShowMemberPicker(false);
  };

  const handleUnassignMember = (userId: string) => {
    updateCard(card.id, { assignedTo: card.assignedTo.filter((id) => id !== userId) });
  };

  const completedCount = cardSubtasks.filter((s) => s.isCompleted).length;
  const totalCount = cardSubtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-800">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-start justify-between">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="text-2xl font-bold text-white bg-transparent border-none focus:outline-none w-full"
            />
          </div>
          <button
            onClick={closeCardModal}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="text-zinc-400" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              placeholder="Add a more detailed description..."
              className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400 mb-3 block">
              Members
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {card.assignedTo.map((userId) => {
                const user = users.find((u) => u.id === userId);
                if (!user) return null;
                return (
                  <div
                    key={userId}
                    className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-lg group"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-sm">{user.name}</span>
                    <button
                      onClick={() => handleUnassignMember(userId)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded transition-all cursor-pointer"
                    >
                      <X className="text-zinc-400 hover:text-red-400" size={14} />
                    </button>
                  </div>
                );
              })}

              <div className="relative" ref={memberPickerRef}>
                <button
                  onClick={() => setShowMemberPicker(!showMemberPicker)}
                  className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-700 hover:border-emerald-500 flex items-center justify-center text-zinc-400 hover:text-emerald-500 transition-all cursor-pointer"
                >
                  <UserPlus size={18} />
                </button>

                {showMemberPicker && (
                  <div className="absolute left-0 top-12 w-64 bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl z-10 p-2">
                    <div className="text-xs text-zinc-400 px-3 py-2 font-medium">
                      Assign member
                    </div>
                    {users
                      .filter((u) => !card.assignedTo.includes(u.id))
                      .map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleAssignMember(user.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-white text-sm">{user.name}</div>
                            <div className="text-zinc-400 text-xs">{user.email}</div>
                          </div>
                        </button>
                      ))}
                    {users.filter((u) => !card.assignedTo.includes(u.id)).length === 0 && (
                      <div className="text-zinc-500 text-sm px-3 py-2">
                        All members assigned
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-zinc-400">
                Subtasks
              </label>
              {totalCount > 0 && (
                <span className="text-sm text-zinc-500">
                  {completedCount} of {totalCount} completed
                </span>
              )}
            </div>

            {totalCount > 0 && (
              <div className="mb-4">
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 mb-3">
              {isLoadingSubtasks ? (
                // Show skeleton loaders while loading
                <>
                  <SubtaskSkeleton />
                  <SubtaskSkeleton />
                  <SubtaskSkeleton />
                </>
              ) : (
                cardSubtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg group"
                  >
                    <button
                      onClick={() => toggleSubtask(subtask.id)}
                      className={`
                        flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer
                        ${subtask.isCompleted
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-zinc-600 hover:border-emerald-500'
                        }
                      `}
                    >
                      {subtask.isCompleted && (
                        <Check className="text-white" size={14} />
                      )}
                    </button>
                    <span
                      className={`
                        flex-1 text-white
                        ${subtask.isCompleted ? 'line-through text-zinc-500' : ''}
                      `}
                    >
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => deleteSubtask(subtask.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="text-zinc-400 hover:text-red-400" size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {isAddingSubtask ? (
              <div>
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtask();
                    if (e.key === 'Escape') {
                      setIsAddingSubtask(false);
                      setNewSubtaskTitle('');
                    }
                  }}
                  placeholder="Subtask title..."
                  className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSubtask}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingSubtask(false);
                      setNewSubtaskTitle('');
                    }}
                    className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingSubtask(true)}
                className="w-full p-3 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg transition-all flex items-center gap-2 text-sm border-2 border-dashed border-zinc-700 hover:border-emerald-500 cursor-pointer"
              >
                <Plus size={16} />
                Add subtask
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
            >
              <Trash2 size={16} />
              Delete Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
