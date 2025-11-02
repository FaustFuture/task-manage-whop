'use client';

import { LayoutGrid, User, Kanban } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function ViewSwitcher() {
  const { viewMode, setViewMode } = useStore();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setViewMode('admin')}
        className={`
          flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all cursor-pointer
          ${viewMode === 'admin'
            ? 'bg-emerald-500 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }
        `}
      >
        <LayoutGrid size={18} />
        Admin View
      </button>
      <button
        onClick={() => setViewMode('member')}
        className={`
          flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all cursor-pointer
          ${viewMode === 'member'
            ? 'bg-emerald-500 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }
        `}
      >
        <User size={18} />
        Member View
      </button>
      <button
        onClick={() => setViewMode('boards')}
        className={`
          flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all cursor-pointer
          ${viewMode === 'boards'
            ? 'bg-emerald-500 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }
        `}
      >
        <Kanban size={18} />
        Boards
      </button>
    </div>
  );
}
