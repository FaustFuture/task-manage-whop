'use client';

import { useStore } from '@/store/useStore';
import { TaskStatus } from '@/types';
import { X, Trash2, Plus, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

const statusConfig: Record<TaskStatus, { label: string; bgColor: string; textColor: string }> = {
  not_started: { label: 'Not Started', bgColor: 'bg-zinc-700', textColor: 'text-zinc-400' },
  in_progress: { label: 'In Progress', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
  done: { label: 'Done', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
};

export function CardModal() {
  const {
    cards,
    subtasks,
    selectedCardId,
    isCardModalOpen,
    closeCardModal,
    updateCard,
    deleteCard,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const card = cards.find((c) => c.id === selectedCardId);
  const cardSubtasks = subtasks
    .filter((s) => s.cardId === selectedCardId)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
    }
  }, [card]);

  // Auto-adjust textarea height when title changes
  useEffect(() => {
    const textarea = document.getElementById('card-title-textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [title, isCardModalOpen]);

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

  const completedCount = cardSubtasks.filter((s) => s.isCompleted).length;
  const totalCount = cardSubtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-800 scrollbar-emerald">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <textarea
              id="card-title-textarea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="text-2xl font-bold text-white bg-transparent border-none focus:outline-none w-full resize-none break-words min-h-[2.5rem]"
              rows={1}
              style={{ overflow: 'hidden' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
          <button
            onClick={closeCardModal}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer flex-shrink-0"
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
              Status
            </label>
            <div className="flex gap-2">
              {(Object.keys(statusConfig) as TaskStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => updateCard(card.id, { status })}
                  className={`
                    flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer
                    ${card.status === status
                      ? `${statusConfig[status].bgColor} ${statusConfig[status].textColor} ring-2 ring-offset-2 ring-offset-zinc-900 ${status === 'done' ? 'ring-emerald-500' : status === 'in_progress' ? 'ring-blue-500' : 'ring-zinc-600'}`
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }
                  `}
                >
                  {statusConfig[status].label}
                </button>
              ))}
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
              {cardSubtasks.map((subtask) => (
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
              ))}
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
