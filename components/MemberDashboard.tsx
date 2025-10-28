'use client';

import { useStore } from '@/store/useStore';
import { BoardList } from './BoardList';
import { BoardView } from './BoardView';

export function MemberDashboard() {
  const { selectedBoardId } = useStore();

  if (selectedBoardId) {
    return <BoardView />;
  }

  return <BoardList />;
}
