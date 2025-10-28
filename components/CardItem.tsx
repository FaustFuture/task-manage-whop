'use client';

import { useStore } from '@/store/useStore';
import { Card } from '@/types';
import { CheckSquare } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';

interface CardItemProps {
  card: Card;
}

export function CardItem({ card }: CardItemProps) {
  const { subtasks, users, openCardModal } = useStore();
  const cardSubtasks = subtasks.filter((s) => s.cardId === card.id);
  const completedSubtasks = cardSubtasks.filter((s) => s.isCompleted).length;

  const {
    attributes,
    listeners,
    setNodeRef,
  } = useSortable({
    id: card.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className="bg-zinc-900 p-3 rounded-lg border border-zinc-700 hover:border-emerald-500 group"
    >
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <h4
          onClick={() => openCardModal(card.id)}
          className="text-white font-medium mb-2 select-none cursor-pointer hover:text-emerald-400 transition-colors"
        >
          {card.title}
        </h4>

        {card.description && (
          <p className="text-sm text-zinc-400 mb-2 line-clamp-2 select-none">
            {card.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {cardSubtasks.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 select-none">
              <CheckSquare size={14} />
              <span>
                {completedSubtasks}/{cardSubtasks.length}
              </span>
            </div>
          )}

          {card.assignedTo.length > 0 && (
            <div className="flex -space-x-2">
              {card.assignedTo.slice(0, 3).map((userId) => {
                const user = users.find((u) => u.id === userId);
                return (
                  <div
                    key={userId}
                    className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center text-xs text-white font-medium select-none"
                    title={user?.name}
                  >
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                );
              })}
              {card.assignedTo.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-xs text-zinc-400 select-none">
                  +{card.assignedTo.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
