'use client';

import { useStore } from '@/store/useStore';
import { ArrowLeft, Plus } from 'lucide-react';
import { BoardList as ListComponent } from './List';
import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Card } from '@/types';
import { ListSkeleton } from './Skeletons';

export function BoardView() {
  const { boards, lists, cards, selectedBoardId, setSelectedBoard, addList, moveCard, isLoadingLists, isLoadingCards } = useStore();
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const currentBoard = boards.find((b) => b.id === selectedBoardId);
  const boardLists = lists
    .filter((l) => l.boardId === selectedBoardId)
    .sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  if (!currentBoard) return null;

  const handleAddList = () => {
    if (newListTitle.trim() && selectedBoardId) {
      addList(selectedBoardId, newListTitle);
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    setOverId(over ? over.id as string : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeCard = cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    // Check if we're dropping over a list
    const overList = boardLists.find((l) => l.id === overId);
    if (overList) {
      // Dropping into a list
      const cardsInTargetList = cards
        .filter((c) => c.listId === overList.id)
        .sort((a, b) => a.order - b.order);

      const newOrder = cardsInTargetList.length;
      moveCard(activeCard.id, overList.id, newOrder);
      return;
    }

    // Check if we're dropping over another card
    const overCard = cards.find((c) => c.id === overId);
    if (overCard) {
      // Move to the same list as the card we're over
      const cardsInTargetList = cards
        .filter((c) => c.listId === overCard.listId)
        .sort((a, b) => a.order - b.order);

      const overIndex = cardsInTargetList.findIndex((c) => c.id === overId);

      if (activeCard.listId === overCard.listId) {
        // Same list - reorder
        const activeIndex = cardsInTargetList.findIndex((c) => c.id === activeId);
        const reordered = arrayMove(cardsInTargetList, activeIndex, overIndex);

        // Update ALL cards with their new orders
        reordered.forEach((card, index) => {
          moveCard(card.id, card.listId, index);
        });
      } else {
        // Different list - insert at the position where placeholder was shown
        // Insert the active card at the overIndex position
        const updatedTargetList = [...cardsInTargetList];
        updatedTargetList.splice(overIndex, 0, activeCard);

        // Update all cards in the target list with their new orders
        updatedTargetList.forEach((card, index) => {
          moveCard(card.id, overCard.listId, index);
        });
      }
    }
  };

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen bg-zinc-900">
        <div className="flex items-center gap-4 px-8 py-4 border-b border-zinc-800">
          <button
            onClick={() => setSelectedBoard(null)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="text-zinc-400" size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">{currentBoard.title}</h1>
        </div>

        <div className="flex-1 overflow-x-auto p-8">
          <div className="flex gap-4 h-full">
            {isLoadingLists || isLoadingCards ? (
              // Show skeleton loaders while loading
              <>
                <ListSkeleton />
                <ListSkeleton />
                <ListSkeleton />
              </>
            ) : (
              boardLists.map((list) => (
                <ListComponent
                  key={list.id}
                  list={list}
                  activeCardId={activeId}
                  overCardId={overId}
                />
              ))
            )}

            {isAddingList ? (
              <div className="flex-shrink-0 w-72 bg-zinc-800 rounded-lg p-4">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddList();
                    if (e.key === 'Escape') {
                      setIsAddingList(false);
                      setNewListTitle('');
                    }
                  }}
                  placeholder="List title..."
                  className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddList}
                    className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium cursor-pointer"
                  >
                    Add List
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingList(false);
                      setNewListTitle('');
                    }}
                    className="px-3 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="flex-shrink-0 w-72 h-fit p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-700 hover:border-emerald-500 transition-all flex items-center gap-2 text-zinc-400 hover:text-emerald-500 cursor-pointer"
              >
                <Plus size={20} />
                Add List
              </button>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="bg-zinc-900 p-3 rounded-lg border-2 border-emerald-500 shadow-2xl w-72 opacity-95">
            <h4 className="text-white font-medium select-none">{activeCard.title}</h4>
            {activeCard.description && (
              <p className="text-sm text-zinc-400 mt-1 line-clamp-1 select-none">{activeCard.description}</p>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
