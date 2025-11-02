'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ViewSwitcher } from '@/components/ViewSwitcher';
import { AdminDashboard } from '@/components/AdminDashboard';
import { MemberDashboard } from '@/components/MemberDashboard';
import { CardModal } from '@/components/CardModal';
import { api } from '@/lib/api';

export default function Home() {
  const { viewMode, currentUser, selectedBoardId, loadBoards, loadLists, loadCards, companyId } = useStore();

  // Load data from Supabase on mount
  useEffect(() => {
    if (!companyId) {
      console.warn('No companyId set. Please access via Whop dashboard.');
      return;
    }

    const loadData = async () => {
      // Load boards filtered by companyId
      await loadBoards();

      // Load lists and all cards if in admin mode
      if (viewMode === 'admin') {
        await loadLists(); // Load all lists without board filter
        await loadCards(); // Load all cards without board filter
      }
    };

    loadData();
  }, [viewMode, companyId]);

  // Load lists and cards when board is selected
  useEffect(() => {
    if (selectedBoardId) {
      loadLists(selectedBoardId);
      loadCards(selectedBoardId);
    }
  }, [selectedBoardId]);

  return (
    <main className="min-h-screen bg-zinc-900">
      <header className="border-b border-zinc-800 bg-black">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Task Manager</h1>
            <p className="text-sm text-zinc-400">
              {viewMode === 'admin' ? 'Admin' : 'Member'} view
              {currentUser?.name && ` for ${currentUser.name}`}
            </p>
          </div>
          <ViewSwitcher />
        </div>
      </header>

      {viewMode === 'admin' ? <AdminDashboard /> : <MemberDashboard />}

      <CardModal />
    </main>
  );
}
