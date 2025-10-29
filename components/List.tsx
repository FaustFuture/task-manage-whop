'use client';

import { useStore } from '@/store/useStore';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { List as ListType } from '@/types';
import { CardItem } from './CardItem';
import { Draggable, Droppable } from '@hello-pangea/dnd';

interface BoardListProps {
  list: ListType;
  index: number;
}

export function BoardList({ list, index }: BoardListProps) {
  const { cards, addCard, deleteList } = useStore();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const listCards = cards
    .filter((c) => c.listId === list.id)
    .sort((a, b) => a.order - b.order);

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(list.id, newCardTitle);
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`w-80 flex-shrink-0 bg-zinc-800 rounded-lg p-4 flex flex-col h-fit ${
            snapshot.isDragging ? 'opacity-50' : ''
          }`}
        >
          <div {...provided.dragHandleProps} className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing">
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

      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`overflow-y-auto flex-1 scrollbar-hide ${
              snapshot.isDraggingOver ? 'bg-zinc-700/30 rounded' : ''
            }`}
          >
            <div className="space-y-2">
              {listCards.map((card, index) => (
                <CardItem key={card.id} card={card} index={index} />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>

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
      )}
    </Draggable>
  );
}
