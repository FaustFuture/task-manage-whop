'use client';

import { useStore } from '@/store/useStore';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { List as ListType } from '@/types';
import { CardItem } from './CardItem';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface BoardListProps {
  list: ListType;
  activeCardId: string | null;
  overCardId: string | null;
}

export function BoardList({ list, activeCardId, overCardId }: BoardListProps) {
  const { cards, addCard, deleteList } = useStore();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  });

  const listCards = cards
    .filter((c) => c.listId === list.id)
    .sort((a, b) => a.order - b.order);

  const activeCard = activeCardId ? cards.find((c) => c.id === activeCardId) : null;

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(list.id, newCardTitle);
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <div className="w-full bg-zinc-800 rounded-lg p-4 flex flex-col h-fit">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{list.title}</h3>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-zinc-700 rounded transition-colors cursor-pointer"
          >
            <MoreVertical className="text-zinc-400" size={16} />
          </button>
          {showMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-[9]"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              {/* Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-lg border border-zinc-700 shadow-xl z-10">
                <button
                  onClick={() => {
                    deleteList(list.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-zinc-800 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 size={16} />
                  Delete List
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="max-h-[600px] overflow-y-auto mb-4 flex-1 scrollbar-hide"
      >
        <div className="space-y-2">
          <SortableContext items={listCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {listCards.map((card) => {
              const isBeingDragged = card.id === activeCardId;
              const showPlaceholder = activeCardId && overCardId === card.id && activeCardId !== card.id;

              return (
                <div key={card.id}>
                  {showPlaceholder && (
                    <div className="h-[40px] mb-2 bg-emerald-500/10 border-2 border-dashed border-emerald-500 rounded" />
                  )}
                  {!isBeingDragged && <CardItem card={card} />}
                  {isBeingDragged && (
                    <div className="h-[40px] bg-zinc-800/50 border-2 border-dashed border-zinc-600 rounded" />
                  )}
                </div>
              );
            })}
          </SortableContext>

          {listCards.length === 0 && isOver && activeCard && (
            <div className="h-[40px] bg-emerald-500/10 border-2 border-dashed border-emerald-500 rounded" />
          )}
        </div>
      </div>

      {isAddingCard ? (
        <div>
          <textarea
            value={newCardTitle}
            onChange={(e) => {
              setNewCardTitle(e.target.value);
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddCard();
              }
              if (e.key === 'Escape') {
                setIsAddingCard(false);
                setNewCardTitle('');
              }
            }}
            placeholder="Enter card title..."
            className="w-full bg-zinc-900 text-white text-sm px-3 py-2 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none mb-2 resize-none overflow-hidden"
            rows={1}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddCard}
              className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium cursor-pointer"
            >
              Add Card
            </button>
            <button
              onClick={() => {
                setIsAddingCard(false);
                setNewCardTitle('');
              }}
              className="px-3 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="w-full p-2 mt-2 text-zinc-400 hover:bg-zinc-700 hover:text-white rounded-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus size={16} />
          Add a card
        </button>
      )}
    </div>
  );
}
