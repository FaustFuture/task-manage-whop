'use client';

import { useStore } from '@/store/useStore';
import { Card, TaskStatus } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { useState, useRef, useEffect, useMemo } from 'react';
import { CheckSquare } from 'lucide-react';

const statusConfig: Record<TaskStatus, { label: string; dotColor: string; bgColor: string; textColor: string }> = {
  not_started: {
    label: 'Not Started',
    dotColor: 'bg-zinc-500',
    bgColor: 'bg-zinc-700/50',
    textColor: 'text-zinc-400'
  },
  in_progress: {
    label: 'In Progress',
    dotColor: 'bg-blue-500',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400'
  },
  done: {
    label: 'Done',
    dotColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-400'
  },
};

// Define which statuses to show for each current status
const getAvailableStatuses = (currentStatus: TaskStatus): TaskStatus[] => {
  switch (currentStatus) {
    case 'not_started':
      return ['in_progress'];
    case 'in_progress':
      return ['not_started', 'done'];
    case 'done':
      return ['in_progress', 'not_started'];
    default:
      return [];
  }
};

interface CardItemProps {
  card: Card;
}

export function CardItem({ card }: CardItemProps) {
  const { openCardModal, updateCard, subtasks } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
  } = useSortable({
    id: card.id,
  });

  // Calculate subtask stats
  const subtaskStats = useMemo(() => {
    const cardSubtasks = subtasks.filter(s => s.cardId === card.id);
    const completed = cardSubtasks.filter(s => s.isCompleted).length;
    const total = cardSubtasks.length;
    return { completed, total, hasSubtasks: total > 0 };
  }, [subtasks, card.id]);

  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [showDropdown]);

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateCard(card.id, { status: newStatus });
    setShowDropdown(false);
  };

  const availableStatuses = getAvailableStatuses(card.status);
  const currentConfig = statusConfig[card.status];

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className="relative bg-zinc-900 rounded-lg border border-zinc-700 hover:border-zinc-600 group hover:bg-zinc-800/50 transition-all duration-200"
    >
      {/* Card Content */}
      <div
        {...listeners}
        onClick={() => openCardModal(card.id)}
        className="px-3 py-1.5 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 mb-1">
          {/* Status Badge - aligned with title */}
          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${currentConfig.dotColor} hover:scale-125 transition-transform cursor-pointer`}
            title={currentConfig.label}
          />
          <div className="text-sm leading-tight text-white select-none break-words flex-1">
            {card.title}
          </div>
        </div>

        {/* Subtask Count */}
        {subtaskStats.hasSubtasks && (
          <div className="flex items-center gap-1.5 ml-4 mt-1">
            <CheckSquare size={12} className="text-zinc-500" />
            <span className={`text-xs ${
              subtaskStats.completed === subtaskStats.total
                ? 'text-emerald-400'
                : 'text-zinc-500'
            }`}>
              {subtaskStats.completed}/{subtaskStats.total}
            </span>
          </div>
        )}
      </div>

      {/* Dropdown Menu - Rendered at root level with fixed positioning */}
      {showDropdown && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(false);
            }}
          />
          {/* Dropdown */}
          <div
            className="fixed w-36 bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl z-[9999] overflow-hidden"
            style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
          >
            {availableStatuses.map((status) => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(status);
                }}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors hover:bg-zinc-700 ${statusConfig[status].textColor}`}
              >
                <div className={`w-2 h-2 rounded-full ${statusConfig[status].dotColor}`} />
                {statusConfig[status].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
