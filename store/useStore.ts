import { create } from 'zustand';
import { User, Board, List, Card, Subtask, ViewMode, Analytics } from '@/types';
import { api } from '@/lib/api';

interface StoreState {
  // Auth & View
  currentUser: User | null;
  viewMode: ViewMode;

  // Data
  users: User[];
  boards: Board[];
  lists: List[];
  cards: Card[];
  subtasks: Subtask[];

  // Admin Analytics
  analytics: Analytics | null;
  isLoadingAnalytics: boolean;
  analyticsLastUpdated: Date | null;

  // Loading States
  isLoadingBoards: boolean;
  isLoadingLists: boolean;
  isLoadingCards: boolean;
  isLoadingSubtasks: boolean;

  // UI State
  selectedBoardId: string | null;
  selectedCardId: string | null;
  isCardModalOpen: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setCurrentUser: (user: User) => void;

  // Board actions
  addBoard: (title: string) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  setSelectedBoard: (id: string | null) => void;

  // List actions
  addList: (boardId: string, title: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  updateListOrder: (listId: string, newOrder: number) => Promise<void>;

  // Card actions
  addCard: (listId: string, title: string) => Promise<void>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (cardId: string, newListId: string, newOrder: number) => Promise<void>;
  openCardModal: (cardId: string) => void;
  closeCardModal: () => void;

  // Subtask actions
  addSubtask: (cardId: string, title: string) => Promise<void>;
  toggleSubtask: (id: string) => Promise<void>;
  deleteSubtask: (id: string) => Promise<void>;

  // User actions
  addUser: (name: string, email: string, role: 'admin' | 'member') => Promise<void>;
  loadUsers: () => Promise<void>;

  // Admin Analytics
  loadAnalytics: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;

  // Data loading
  loadBoards: () => Promise<void>;
  loadLists: (boardId?: string) => Promise<void>;
  loadCards: (boardId?: string) => Promise<void>;
  loadSubtasks: (cardId?: string) => Promise<void>;
}

export const useStore = create<StoreState>()((set) => ({
  // Initial state - will be loaded from Supabase
  currentUser: null,
  viewMode: 'member',
  users: [],
  boards: [],
  lists: [],
  cards: [],
  subtasks: [],
  analytics: null,
  isLoadingAnalytics: false,
  analyticsLastUpdated: null,
  isLoadingBoards: false,
  isLoadingLists: false,
  isLoadingCards: false,
  isLoadingSubtasks: false,
  selectedBoardId: null,
  selectedCardId: null,
  isCardModalOpen: false,

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),

  setCurrentUser: (user) => set({ currentUser: user }),

  // Board actions
  addBoard: async (title) => {
    const state = useStore.getState();

    try {
      const result = await api.boards.create({
        title,
        createdBy: state.currentUser?.id || null,
        members: state.currentUser?.id ? [state.currentUser.id] : [],
      });

      if (result.data) {
        set((state) => ({
          boards: [...state.boards, result.data],
        }));
      } else if (result.error) {
        console.error('Error creating board:', result.error);
      }
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  },

  deleteBoard: async (id) => {
    await api.boards.delete(id);
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
      lists: state.lists.filter((l) => l.boardId !== id),
    }));
  },

  setSelectedBoard: (id) => set({ selectedBoardId: id }),

  // List actions
  addList: async (boardId, title) => {
    try {
      const result = await api.lists.create({ boardId, title });

      if (result.data) {
        set((state) => ({
          lists: [...state.lists, result.data],
        }));
      } else if (result.error) {
        console.error('Error creating list:', result.error);
      }
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  },

  deleteList: async (id) => {
    await api.lists.delete(id);
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== id),
      cards: state.cards.filter((c) => c.listId !== id),
    }));
  },

  updateListOrder: async (listId, newOrder) => {
    await api.lists.update(listId, { order: newOrder });
    set((state) => ({
      lists: state.lists.map((l) =>
        l.id === listId ? { ...l, order: newOrder } : l
      ),
    }));
  },

  // Card actions
  addCard: async (listId, title) => {
    const state = useStore.getState();

    try {
      const result = await api.cards.create({
        listId,
        title,
        createdBy: state.currentUser?.id || null,
      });

      if (result.data) {
        set((state) => ({
          cards: [...state.cards, result.data],
        }));
      } else if (result.error) {
        console.error('Error creating card:', result.error);
      }
    } catch (error) {
      console.error('Failed to create card:', error);
    }
  },

  updateCard: async (id, updates) => {
    await api.cards.update(id, updates);
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  deleteCard: async (id) => {
    await api.cards.delete(id);
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
      subtasks: state.subtasks.filter((s) => s.cardId !== id),
    }));
  },

  moveCard: async (cardId, newListId, newOrder) => {
    // Optimistic update
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId ? { ...c, listId: newListId, order: newOrder } : c
      ),
    }));

    // Persist to database
    await api.cards.update(cardId, { listId: newListId, order: newOrder });
  },

  openCardModal: (cardId) => set({ selectedCardId: cardId, isCardModalOpen: true }),

  closeCardModal: () => set({ selectedCardId: null, isCardModalOpen: false }),

  // Subtask actions
  addSubtask: async (cardId, title) => {
    try {
      const result = await api.subtasks.create({ cardId, title });

      if (result.data) {
        set((state) => ({
          subtasks: [...state.subtasks, result.data],
        }));
      } else if (result.error) {
        console.error('Error creating subtask:', result.error);
      }
    } catch (error) {
      console.error('Failed to create subtask:', error);
    }
  },

  toggleSubtask: async (id) => {
    const state = useStore.getState();
    const subtask = state.subtasks.find((s) => s.id === id);
    if (!subtask) return;

    const newCompleted = !subtask.isCompleted;
    await api.subtasks.update(id, { isCompleted: newCompleted });

    set((state) => ({
      subtasks: state.subtasks.map((s) =>
        s.id === id ? { ...s, isCompleted: newCompleted } : s
      ),
    }));
  },

  deleteSubtask: async (id) => {
    await api.subtasks.delete(id);
    set((state) => ({
      subtasks: state.subtasks.filter((s) => s.id !== id),
    }));
  },

  // User actions
  addUser: async (name, email, role) => {
    const result = await api.users.create({ name, email, role });

    if (result.data) {
      set((state) => ({
        users: [...state.users, result.data],
      }));
    }
  },

  loadUsers: async () => {
    const result = await api.users.getAll();
    if (result.data) {
      set({ users: result.data });
    }
  },

  // Data loading
  loadBoards: async () => {
    set({ isLoadingBoards: true });
    try {
      const result = await api.boards.getAll();
      if (result.data) {
        set({ boards: result.data });
      }
    } finally {
      set({ isLoadingBoards: false });
    }
  },

  loadLists: async (boardId?: string) => {
    set({ isLoadingLists: true });
    try {
      const result = await api.lists.getAll(boardId);
      if (result.data) {
        set({ lists: result.data });
      }
    } finally {
      set({ isLoadingLists: false });
    }
  },

  loadCards: async (boardId?: string) => {
    set({ isLoadingCards: true });
    try {
      const result = await api.cards.getAll(boardId ? { boardId } : undefined);
      if (result.data) {
        set({ cards: result.data });
      }
    } finally {
      set({ isLoadingCards: false });
    }
  },

  loadSubtasks: async (cardId?: string) => {
    set({ isLoadingSubtasks: true });
    try {
      const result = await api.subtasks.getAll(cardId);
      if (result.data) {
        set({ subtasks: result.data });
      }
    } finally {
      set({ isLoadingSubtasks: false });
    }
  },

  // Admin Analytics
  loadAnalytics: async () => {
    const state = useStore.getState();

    // Use cached analytics if less than 5 minutes old
    if (
      state.analytics &&
      state.analyticsLastUpdated &&
      Date.now() - state.analyticsLastUpdated.getTime() < 5 * 60 * 1000
    ) {
      return;
    }

    set({ isLoadingAnalytics: true });
    try {
      const result = await api.admin.getAnalytics();
      if (result.data) {
        set({
          analytics: result.data,
          analyticsLastUpdated: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      set({ isLoadingAnalytics: false });
    }
  },

  refreshAnalytics: async () => {
    set({ isLoadingAnalytics: true });
    try {
      const result = await api.admin.getAnalytics();
      if (result.data) {
        set({
          analytics: result.data,
          analyticsLastUpdated: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      set({ isLoadingAnalytics: false });
    }
  },
}));
