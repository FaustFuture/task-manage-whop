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
    <div className="flex-shrink-0 w-72 bg-zinc-800 rounded-lg p-4 flex flex-col max-h-full">
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
          )}
        </div>
      </div>

      {isAddingCard ? (
        <div className="mb-3">
          <textarea
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
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
            className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none mb-2 resize-none"
            rows={3}
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
          className="w-full p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white rounded-lg transition-all flex items-center gap-2 text-sm mb-3 cursor-pointer"
        >
          <Plus size={16} />
          Add a card
        </button>
      )}

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto space-y-2 min-h-[100px] rounded-lg p-2 ${
          isOver && activeCard && activeCard.listId !== list.id ? 'bg-emerald-500/10 ring-2 ring-emerald-500' : ''
        }`}
      >
        <SortableContext items={listCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {listCards.map((card, index) => {
            const isBeingDragged = card.id === activeCardId;

            // Find the original position of the dragged card
            const draggedCard = activeCardId ? cards.find(c => c.id === activeCardId) : null;
            const draggedCardIndex = draggedCard ? listCards.findIndex(c => c.id === draggedCard.id) : -1;
            const currentCardIndex = index;

            // Show placeholder if:
            // 1. We're hovering over this card AND
            // 2. It's not the dragged card itself AND
            // 3. It's not the position right after the dragged card (which is effectively the same position)
            const shouldShowPlaceholder =
              activeCardId &&
              overCardId === card.id &&
              activeCardId !== card.id &&
              !(draggedCard?.listId === list.id && currentCardIndex === draggedCardIndex);

            return (
              <div key={card.id}>
                {shouldShowPlaceholder && (
                  <div className="h-[100px] mb-2 bg-emerald-500/20 border-2 border-dashed border-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-400 text-sm font-medium">Drop here</span>
                  </div>
                )}
                {!isBeingDragged && <CardItem card={card} />}
                {isBeingDragged && (
                  <div className="h-[100px] bg-zinc-800/50 border-2 border-dashed border-zinc-600 rounded-lg" />
                )}
              </div>
            );
          })}
        </SortableContext>
        {listCards.length === 0 && isOver && activeCard && activeCard.listId !== list.id && (
          <div className="h-[100px] bg-emerald-500/20 border-2 border-dashed border-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-emerald-400 text-sm font-medium">Drop here</span>
          </div>
        )}
        {listCards.length === 0 && (!isOver || (activeCard && activeCard.listId === list.id)) && (
          <div className="flex items-center justify-center h-32 text-zinc-600 text-sm border-2 border-dashed border-zinc-700 rounded-lg">
            {activeCard && activeCard.listId === list.id ? 'Original position' : 'Drop cards here'}
          </div>
        )}
      </div>
    </div>
  );
}
