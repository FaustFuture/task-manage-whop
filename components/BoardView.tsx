'use client';

import { useStore } from '@/store/useStore';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { BoardList as ListComponent } from './List';
import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { ListSkeleton } from './Skeletons';

export function BoardView() {
  const { boards, lists, cards, selectedBoardId, setSelectedBoard, addList, moveCard, reorderLists, deleteBoard, isLoadingLists, isLoadingCards } = useStore();
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const currentBoard = boards.find((b) => b.id === selectedBoardId);
  const boardLists = lists
    .filter((l) => l.boardId === selectedBoardId)
    .sort((a, b) => a.order - b.order);

  // Check scroll position to show/hide fade indicators
  const checkScrollPosition = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;

    // Show left fade if scrolled from start
    setShowLeftFade(scrollLeft > 0);

    // Show right fade if not scrolled to end
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
  };

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

    const handleScroll = () => {
      checkScrollPosition();
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    scrollContainer.addEventListener('scroll', handleScroll);

    // Initial check
    checkScrollPosition();

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Recheck on lists change
  useEffect(() => {
    checkScrollPosition();
  }, [boardLists.length]);

  if (!currentBoard) return null;

  const handleAddList = () => {
    if (newListTitle.trim() && selectedBoardId) {
      addList(selectedBoardId, newListTitle);
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (selectedBoardId) {
      await deleteBoard(selectedBoardId);
      setSelectedBoard(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // Dropped outside
    if (!destination) return;

    // No movement
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Handle list reordering
    if (type === 'list') {
      const reorderedLists = Array.from(boardLists);
      const [movedList] = reorderedLists.splice(source.index, 1);
      reorderedLists.splice(destination.index, 0, movedList);

      // Update order property for each list in current board
      const updatedBoardLists = reorderedLists.map((list, index) => ({
        ...list,
        order: index,
      }));

      // Merge with other lists (from other boards)
      const allLists = lists.map(list => {
        const updatedList = updatedBoardLists.find(l => l.id === list.id);
        return updatedList || list;
      });

      // Save to database - pass only the updated board lists
      reorderLists(updatedBoardLists, allLists);
      return;
    }

    // Handle card reordering
    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;

    if (sourceListId === destListId) {
      // Same list - just reorder
      const listCards = cards
        .filter((c) => c.listId === sourceListId)
        .sort((a, b) => a.order - b.order);

      const [movedCard] = listCards.splice(source.index, 1);
      listCards.splice(destination.index, 0, movedCard);

      listCards.forEach((card, index) => {
        moveCard(card.id, sourceListId, index, card.id === draggableId);
      });
    } else {
      // Different list - move card
      moveCard(draggableId, destListId, destination.index);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col bg-zinc-900">
        <div className="flex items-center gap-4 px-8 py-4 border-b border-zinc-800">
          <button
            onClick={() => setSelectedBoard(null)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="text-zinc-400" size={20} />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">{currentBoard.title}</h1>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer group"
            title="Delete board"
          >
            <Trash2 className="text-zinc-400 group-hover:text-red-500" size={20} />
          </button>
        </div>

        <div className="flex-1 relative">
          {/* Left fade indicator */}
          {showLeftFade && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-zinc-900 to-transparent z-10 pointer-events-none" />
          )}

          {/* Right fade indicator */}
          {showRightFade && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-zinc-900 to-transparent z-10 pointer-events-none" />
          )}

          <div
            ref={scrollContainerRef}
            className="h-full overflow-x-auto overflow-y-hidden p-8 scrollbar-hide"
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
              <Droppable droppableId="all-lists" direction="horizontal" type="list">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex gap-4"
                  >
                    {boardLists.map((list, index) => (
                      <ListComponent
                        key={list.id}
                        list={list}
                        index={index}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 max-w-md w-full border border-zinc-700 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <Trash2 className="text-red-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Delete Board?</h3>
                <p className="text-zinc-400 text-sm">
                  Are you sure you want to delete <span className="font-semibold text-white">{currentBoard.title}</span>? This will permanently delete all lists, cards, and subtasks in this board. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDeleteBoard}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold cursor-pointer"
              >
                Delete Board
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DragDropContext>
  );
}
