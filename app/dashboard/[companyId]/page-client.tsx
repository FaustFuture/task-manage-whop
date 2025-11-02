"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import { AdminDashboard } from "@/components/AdminDashboard";
import { MemberDashboard } from "@/components/MemberDashboard";
import { CardModal } from "@/components/CardModal";
import { api } from "@/lib/api";

interface HomeProps {
  access: "no_access" | "admin" | "customer";
  userId?: string;
  username?: string;
  name: string | null;
  companyId?: string;
}

export default function Home({ access, userId, username, name, companyId }: HomeProps) {
  const {
    viewMode,
    currentUser,
    selectedBoardId,
    loadBoards,
    loadLists,
    loadCards,
    setCurrentUser,
  } = useStore();

  // Initialize Whop user on mount
  useEffect(() => {
    if (userId && username && companyId) {
      // Map Whop access level to our role system
      const role = access === 'admin' ? 'admin' : 'member';

      setCurrentUser({
        id: userId,
        name: name || null,
        username: username,
        role: role,
      }, companyId);
    }
  }, [userId, username, name, companyId, access, setCurrentUser]);

  // Load data from Supabase after user is set
  useEffect(() => {
    if (!currentUser || !companyId) return;

    const loadData = async () => {
      // Load boards filtered by companyId
      await loadBoards();

      // Load users, lists, and all cards if in admin mode
      if (viewMode === "admin") {
        await loadLists(); // Load all lists without board filter
        await loadCards(); // Load all cards without board filter
      }
    };

    loadData();
  }, [viewMode, currentUser, companyId]);

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
              {viewMode === "admin" ? "Admin" : "Member"} view
              {currentUser?.name && ` for ${currentUser.name}`}
            </p>
          </div>
          {access === "admin" ? <ViewSwitcher /> : null}
        </div>
      </header>
      {access === "admin" ? (
        viewMode === "admin" ? (
          <AdminDashboard />
        ) : (
          <MemberDashboard />
        )
      ) : (
        <MemberDashboard />
      )}
      <CardModal />
    </main>
  );
}
