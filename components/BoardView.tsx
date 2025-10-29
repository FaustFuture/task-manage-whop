'use client';

import { useStore } from '@/store/useStore';
import { ArrowLeft, Plus } from 'lucide-react';
import { BoardList as ListComponent } from './List';
import { useState, useRef, useEffect } from 'react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const currentBoard = boards.find((b) => b.id === selectedBoardId);
  const boardLists = lists
    .filter((l) => l.boardId === selectedBoardId)
    .sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Convert vertical scroll to horizontal scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      // Always convert vertical scroll to horizontal scroll
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener('wheel', handleWheel);
  }, []);

  // Drag-to-scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the scroll container itself (not on lists or cards)
    if (e.target === scrollContainerRef.current ||
        (e.target as HTMLElement).classList.contains('board-drag-area')) {
      setIsDragging(true);
      setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
      setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5; // Multiply by 1.5 for faster scrolling
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

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

    // Check if dropping over a list container
    const overList = boardLists.find((l) => l.id === overId);
    if (overList) {
      // Dropping at the end of a list
      const cardsInList = cards
        .filter((c) => c.listId === overList.id)
        .sort((a, b) => a.order - b.order);

      moveCard(activeCard.id, overList.id, cardsInList.length);
      return;
    }

    // Check if dropping over a card
    const overCard = cards.find((c) => c.id === overId);
    if (overCard) {
      const targetListId = overCard.listId;
      const cardsInTargetList = cards
        .filter((c) => c.listId === targetListId)
        .sort((a, b) => a.order - b.order);

      const overIndex = cardsInTargetList.findIndex((c) => c.id === overId);

      if (activeCard.listId === targetListId) {
        // Same list - reorder
        const activeIndex = cardsInTargetList.findIndex((c) => c.id === activeId);
        const reordered = arrayMove(cardsInTargetList, activeIndex, overIndex);

        reordered.forEach((card, index) => {
          moveCard(card.id, targetListId, index);
        });
      } else {
        // Different list - move to position
        // First move the card
        moveCard(activeCard.id, targetListId, overIndex);

        // Then reorder the rest
        const filteredList = cardsInTargetList.filter(c => c.id !== activeCard.id);
        filteredList.forEach((card, index) => {
          const newIndex = index >= overIndex ? index + 1 : index;
          moveCard(card.id, targetListId, newIndex);
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
      <div className="flex flex-col bg-zinc-900">
        <div className="flex items-center gap-4 px-8 py-4 border-b border-zinc-800">
          <button
            onClick={() => setSelectedBoard(null)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="text-zinc-400" size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">{currentBoard.title}</h1>
        </div>

        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-x-auto overflow-y-hidden p-8 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex gap-4 h-full board-drag-area">
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
              <div className="w-80 flex-shrink-0 bg-zinc-800 rounded-lg p-4 h-fit cursor-default">
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
                className="w-80 flex-shrink-0 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-700 hover:border-emerald-500 transition-all flex items-center justify-center gap-2 text-zinc-400 hover:text-emerald-500 text-sm h-fit cursor-pointer"
              >
                <Plus size={16} />
                Add List
              </button>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="bg-zinc-900 px-3 py-2 rounded-lg border-2 border-emerald-500 shadow-lg w-72 flex items-start gap-2 opacity-80">
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
            <span className="text-sm text-white select-none break-words flex-1 min-w-0">{activeCard.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
