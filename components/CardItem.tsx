'use client';

import { useStore } from '@/store/useStore';
import { Card, TaskStatus } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { useState } from 'react';

const statusConfig: Record<TaskStatus, { label: string; dotColor: string; bgColor: string; textColor: string; hoverBorder: string; hoverText: string }> = {
  not_started: {
    label: 'Not Started',
    dotColor: 'bg-zinc-500',
    bgColor: 'bg-zinc-700/50',
    textColor: 'text-zinc-400',
    hoverBorder: 'hover:border-zinc-500',
    hoverText: 'hover:text-zinc-400'
  },
  in_progress: {
    label: 'In Progress',
    dotColor: 'bg-blue-500',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    hoverBorder: 'hover:border-blue-500',
    hoverText: 'hover:text-blue-400'
  },
  done: {
    label: 'Done',
    dotColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    hoverBorder: 'hover:border-emerald-500',
    hoverText: 'hover:text-emerald-400'
  },
};

const allStatuses: TaskStatus[] = ['not_started', 'in_progress', 'done'];

interface CardItemProps {
  card: Card;
  readOnly?: boolean;
}

export function CardItem({ card, readOnly = false }: CardItemProps) {
  const { openCardModal, updateCard } = useStore();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
  } = useSortable({
    id: card.id,
    disabled: readOnly, // Disable sorting in read-only mode
  });

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateCard(card.id, { status: newStatus });
    setShowStatusDropdown(false);
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={`relative bg-zinc-900 rounded-lg border border-zinc-700 ${statusConfig[card.status].hoverBorder} group hover:bg-zinc-800/50 transition-colors duration-200`}
    >
      {/* Interactive Status Bar - Left Edge */}
      {readOnly ? (
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${statusConfig[card.status].dotColor} rounded-l-lg`}
          title={statusConfig[card.status].label}
        />
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowStatusDropdown(!showStatusDropdown);
          }}
          className={`absolute left-0 top-0 bottom-0 w-1 ${statusConfig[card.status].dotColor} group-hover:w-5 transition-all duration-200 cursor-pointer z-10 rounded-l-lg`}
          title={statusConfig[card.status].label}
        />
      )}

      {/* Dropdown Menu */}
      {showStatusDropdown && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowStatusDropdown(false)}
          />
          <div className="absolute left-7 top-0 w-40 bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl z-30 overflow-hidden">
            {allStatuses.map((status, index) => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(status);
                }}
                className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                  card.status === status
                    ? `${statusConfig[status].bgColor} ${statusConfig[status].textColor} font-medium`
                    : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                } ${index === 0 ? 'rounded-t-lg' : ''} ${index === allStatuses.length - 1 ? 'rounded-b-lg' : ''}`}
              >
                <div className={`w-3 h-3 rounded-sm ${statusConfig[status].dotColor}`} />
                {statusConfig[status].label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Card Content */}
      <div
        {...(readOnly ? {} : listeners)}
        onClick={() => openCardModal(card.id)}
        className={`pl-3 ${readOnly ? '' : 'group-hover:pl-7'} pr-2 py-1.5 ${readOnly ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'} transition-all duration-200`}
      >
        <div
          className={`text-sm leading-tight text-white select-none ${statusConfig[card.status].hoverText} break-words`}
        >
          {card.title}
        </div>
      </div>
    </div>
  );
}
