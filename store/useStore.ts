import { create } from "zustand";
import { User, Board, List, Card, Subtask, ViewMode, Analytics } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/contexts/ToastContext";

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
  reorderLists: (listsToUpdate: List[], allLists: List[]) => Promise<void>;
  addList: (boardId: string, title: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  updateListOrder: (listId: string, newOrder: number) => Promise<void>;

  // Card actions
  addCard: (listId: string, title: string) => Promise<void>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (
    cardId: string,
    newListId: string,
    newOrder: number,
    showToast?: boolean
  ) => Promise<void>;
  openCardModal: (cardId: string) => void;
  closeCardModal: () => void;

  // Subtask actions
  addSubtask: (cardId: string, title: string) => Promise<void>;
  toggleSubtask: (id: string) => Promise<void>;
  deleteSubtask: (id: string) => Promise<void>;

  // User actions
  addUser: (
    name: string,
    email: string,
    role: "admin" | "member"
  ) => Promise<void>;
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
  viewMode: "member",
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
        users: state.currentUser?.id ? [state.currentUser.id] : [],
      });

      if (result.data) {
        set((state) => ({
          boards: [...state.boards, result.data],
        }));
        toast.success(`Board "${title}" created successfully`);
      } else if (result.error) {
        console.error("Error creating board:", result.error);
        toast.error("Failed to create board");
      }
    } catch (error) {
      console.error("Failed to create board:", error);
      toast.error("Failed to create board");
    }
  },

  deleteBoard: async (id) => {
    try {
      const board = useStore.getState().boards.find((b) => b.id === id);
      await api.boards.delete(id);

      // Get list IDs to also remove associated cards and subtasks
      const listIds = useStore.getState().lists
        .filter((l) => l.boardId === id)
        .map((l) => l.id);

      const cardIds = useStore.getState().cards
        .filter((c) => listIds.includes(c.listId))
        .map((c) => c.id);

      set((state) => ({
        boards: state.boards.filter((b) => b.id !== id),
        lists: state.lists.filter((l) => l.boardId !== id),
        cards: state.cards.filter((c) => !listIds.includes(c.listId)),
        subtasks: state.subtasks.filter((s) => !cardIds.includes(s.cardId)),
      }));
      toast.success(`Board "${board?.title || ""}" deleted successfully`);
    } catch (error) {
      console.error("Failed to delete board:", error);
      toast.error("Failed to delete board");
    }
  },

  setSelectedBoard: (id) => set({ selectedBoardId: id }),

  // List actions
  reorderLists: async (listsToUpdate: List[], allLists: List[]) => {
    const previousLists = useStore.getState().lists;

    try {
      // Optimistic update - update state with all lists
      set({ lists: allLists });

      // Persist to database - only update the lists that were reordered
      const updatePromises = listsToUpdate.map((list) =>
        api.lists.update(list.id, { order: list.order })
      );

      await Promise.all(updatePromises);

      toast.success("List reordered successfully");
    } catch (error) {
      console.error("Failed to reorder lists:", error);
      toast.error("Failed to reorder lists");
      // Revert on error
      set({ lists: previousLists });
    }
  },

  addList: async (boardId, title) => {
    try {
      const result = await api.lists.create({ boardId, title });

      if (result.data) {
        set((state) => ({
          lists: [...state.lists, result.data],
        }));
        toast.success(`List "${title}" created successfully`);
      } else if (result.error) {
        console.error("Error creating list:", result.error);
        toast.error("Failed to create list");
      }
    } catch (error) {
      console.error("Failed to create list:", error);
      toast.error("Failed to create list");
    }
  },

  deleteList: async (id) => {
    try {
      const list = useStore.getState().lists.find((l) => l.id === id);
      await api.lists.delete(id);
      set((state) => ({
        lists: state.lists.filter((l) => l.id !== id),
        cards: state.cards.filter((c) => c.listId !== id),
      }));
      toast.success(`List "${list?.title || ""}" deleted successfully`);
    } catch (error) {
      console.error("Failed to delete list:", error);
      toast.error("Failed to delete list");
    }
  },

  updateListOrder: async (listId, newOrder) => {
    try {
      // Optimistic update
      set((state) => ({
        lists: state.lists.map((l) =>
          l.id === listId ? { ...l, order: newOrder } : l
        ),
      }));

      // Persist to database
      await api.lists.update(listId, { order: newOrder });
    } catch (error) {
      console.error("Failed to update list order:", error);
      toast.error("Failed to update list order");
    }
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
        toast.success(`Card "${title}" created successfully`);
      } else if (result.error) {
        console.error("Error creating card:", result.error);
        toast.error("Failed to create card");
      }
    } catch (error) {
      console.error("Failed to create card:", error);
      toast.error("Failed to create card");
    }
  },

  updateCard: async (id, updates) => {
    try {
      const card = useStore.getState().cards.find((c) => c.id === id);
      await api.cards.update(id, updates);
      set((state) => ({
        cards: state.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }));

      // Show toast for different update types
      if (updates.status) {
        // Status changed
        const statusLabels = {
          not_started: "Not Started",
          in_progress: "In Progress",
          done: "Done",
        };
        toast.success(
          `"${card?.title || "Card"}" status updated to ${
            statusLabels[updates.status]
          }`
        );
      } else if (updates.title && updates.title !== card?.title) {
        // Title changed
        toast.success(`Card renamed to "${updates.title}"`);
      } else if (updates.description !== undefined && updates.description !== card?.description) {
        // Description changed
        toast.success(`Description updated successfully`);
      }
    } catch (error) {
      console.error("Failed to update card:", error);
      toast.error("Failed to update card");
    }
  },

  deleteCard: async (id) => {
    try {
      const card = useStore.getState().cards.find((c) => c.id === id);
      await api.cards.delete(id);
      set((state) => ({
        cards: state.cards.filter((c) => c.id !== id),
        subtasks: state.subtasks.filter((s) => s.cardId !== id),
      }));
      toast.success(`Card "${card?.title || ""}" deleted successfully`);
    } catch (error) {
      console.error("Failed to delete card:", error);
      toast.error("Failed to delete card");
    }
  },

  moveCard: async (cardId, newListId, newOrder, showToast = true) => {
    try {
      const card = useStore.getState().cards.find((c) => c.id === cardId);

      // Optimistic update
      set((state) => ({
        cards: state.cards.map((c) =>
          c.id === cardId ? { ...c, listId: newListId, order: newOrder } : c
        ),
      }));

      // Persist to database
      await api.cards.update(cardId, { listId: newListId, order: newOrder });

      if (showToast) {
        toast.success(`"${card?.title || "Card"}" moved successfully`);
      }
    } catch (error) {
      console.error("Failed to move card:", error);
      if (showToast) {
        toast.error("Failed to move card");
      }
    }
  },

  openCardModal: (cardId) =>
    set({ selectedCardId: cardId, isCardModalOpen: true }),

  closeCardModal: () => set({ selectedCardId: null, isCardModalOpen: false }),

  // Subtask actions
  addSubtask: async (cardId, title) => {
    try {
      const result = await api.subtasks.create({ cardId, title });

      if (result.data) {
        set((state) => ({
          subtasks: [...state.subtasks, result.data],
        }));
        toast.success(`Subtask "${title}" created successfully`);
      } else if (result.error) {
        console.error("Error creating subtask:", result.error);
        toast.error("Failed to create subtask");
      }
    } catch (error) {
      console.error("Failed to create subtask:", error);
      toast.error("Failed to create subtask");
    }
  },

  toggleSubtask: async (id) => {
    const state = useStore.getState();
    const subtask = state.subtasks.find((s) => s.id === id);
    if (!subtask) return;

    try {
      const newCompleted = !subtask.isCompleted;
      await api.subtasks.update(id, { isCompleted: newCompleted });

      set((state) => ({
        subtasks: state.subtasks.map((s) =>
          s.id === id ? { ...s, isCompleted: newCompleted } : s
        ),
      }));
      toast.success(
        newCompleted
          ? `"${subtask.title}" completed`
          : `"${subtask.title}" reopened`
      );
    } catch (error) {
      console.error("Failed to toggle subtask:", error);
      toast.error("Failed to update subtask");
    }
  },

  deleteSubtask: async (id) => {
    try {
      const subtask = useStore.getState().subtasks.find((s) => s.id === id);
      await api.subtasks.delete(id);
      set((state) => ({
        subtasks: state.subtasks.filter((s) => s.id !== id),
      }));
      toast.success(`Subtask "${subtask?.title || ""}" deleted successfully`);
    } catch (error) {
      console.error("Failed to delete subtask:", error);
      toast.error("Failed to delete subtask");
    }
  },

  // User actions
  addUser: async (name, email, role) => {
    try {
      const result = await api.users.create({ name, email, role });

      if (result.data) {
        set((state) => ({
          users: [...state.users, result.data],
        }));
        toast.success(`User "${name}" created successfully`);
      } else {
        toast.error("Failed to create user");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("Failed to create user");
    }
  },

  loadUsers: async () => {
    try {
      const result = await api.users.getAll();
      if (result.data) {
        set({ users: result.data });
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    }
  },

  // Data loading
  loadBoards: async () => {
    set({ isLoadingBoards: true });
    try {
      const result = await api.boards.getAll();
      if (result.data) {
        set({ boards: result.data });
      } else {
        toast.error("Failed to load boards");
      }
    } catch (error) {
      console.error("Failed to load boards:", error);
      toast.error("Failed to load boards");
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
      } else {
        toast.error("Failed to load lists");
      }
    } catch (error) {
      console.error("Failed to load lists:", error);
      toast.error("Failed to load lists");
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
      } else {
        toast.error("Failed to load cards");
      }
    } catch (error) {
      console.error("Failed to load cards:", error);
      toast.error("Failed to load cards");
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
      } else {
        toast.error("Failed to load subtasks");
      }
    } catch (error) {
      console.error("Failed to load subtasks:", error);
      toast.error("Failed to load subtasks");
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
      } else {
        toast.error("Failed to load analytics");
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics");
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
        toast.success("Analytics refreshed successfully");
      } else {
        toast.error("Failed to refresh analytics");
      }
    } catch (error) {
      console.error("Failed to refresh analytics:", error);
      toast.error("Failed to refresh analytics");
    } finally {
      set({ isLoadingAnalytics: false });
    }
  },
}));
