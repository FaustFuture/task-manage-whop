// API helper functions for making requests to the backend

// Users
export const api = {
  users: {
    getAll: async () => {
      const res = await fetch('/api/users');
      return res.json();
    },
    create: async (data: { name: string; email: string; role: 'admin' | 'member'; avatar?: string }) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: string, data: Partial<{ name: string; email: string; role: 'admin' | 'member'; avatar?: string }>) => {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      return res.json();
    },
  },

  // Boards
  boards: {
    getAll: async (companyId: string) => {
      const url = `/api/boards?companyId=${companyId}`;
      const res = await fetch(url);
      return res.json();
    },
    create: async (data: { title: string; companyId: string; createdBy: string | null; members?: string[] }) => {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: string, data: Partial<{ title: string; members: string[] }>) => {
      const res = await fetch(`/api/boards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`/api/boards/${id}`, { method: 'DELETE' });
      return res.json();
    },
  },

  // Lists
  lists: {
    getAll: async (boardId?: string) => {
      const url = boardId ? `/api/lists?boardId=${boardId}` : '/api/lists';
      const res = await fetch(url);
      return res.json();
    },
    create: async (data: { boardId: string; title: string; order?: number }) => {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: string, data: Partial<{ title: string; order: number }>) => {
      const res = await fetch(`/api/lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
      return res.json();
    },
  },

  // Cards
  cards: {
    getAll: async (params?: { listId?: string; boardId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.listId) searchParams.append('listId', params.listId);
      if (params?.boardId) searchParams.append('boardId', params.boardId);
      const url = `/api/cards${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const res = await fetch(url);
      return res.json();
    },
    create: async (data: {
      listId: string;
      title: string;
      description?: string;
      assignedTo?: string[];
      createdBy: string | null;
      order?: number;
    }) => {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (
      id: string,
      data: Partial<{
        title: string;
        description: string;
        listId: string;
        order: number;
        assignedTo: string[];
      }>
    ) => {
      const res = await fetch(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
      return res.json();
    },
  },

  // Subtasks
  subtasks: {
    getAll: async (cardId?: string) => {
      const url = cardId ? `/api/subtasks?cardId=${cardId}` : '/api/subtasks';
      const res = await fetch(url);
      return res.json();
    },
    create: async (data: { cardId: string; title: string; isCompleted?: boolean; order?: number }) => {
      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: string, data: Partial<{ title: string; isCompleted: boolean; order: number }>) => {
      const res = await fetch(`/api/subtasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`/api/subtasks/${id}`, { method: 'DELETE' });
      return res.json();
    },
  },

  // Admin Analytics
  admin: {
    getAnalytics: async (companyId: string) => {
      const res = await fetch(`/api/admin/analytics?companyId=${companyId}`);
      return res.json();
    },
  },
};
