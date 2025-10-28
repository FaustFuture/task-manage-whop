export type UserRole = "admin" | "member";

export type TaskStatus = "not_started" | "in_progress" | "done";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Board {
  id: string;
  title: string;
  createdBy: string | null;
  members: string[];
  createdAt: Date;
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo: string[];
  createdBy: string | null;
  createdAt: Date;
  order: number;
}

export interface Subtask {
  id: string;
  cardId: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export type ViewMode = "admin" | "member";
