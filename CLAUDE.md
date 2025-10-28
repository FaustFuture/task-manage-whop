# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

**Environment Setup Required:**
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Database Setup:**
Run `supabase-combined-migration.sql` in Supabase SQL Editor to create all tables.

## Architecture Overview

This is a Next.js 16 (App Router) task management application using React 19, TypeScript, Tailwind CSS 4, Zustand for state management, and Supabase (PostgreSQL) as the database.

### Data Flow Pattern

```
Supabase Database (snake_case)
    ↓
API Routes (/app/api/*) - Transform to camelCase
    ↓
API Client Layer (/lib/api.ts)
    ↓
Zustand Store (/store/useStore.ts) - Single source of truth
    ↓
React Components - Consume via hooks
```

**Key Pattern:** All state mutations go through Zustand actions which call API routes. Optimistic updates are used for drag-and-drop to ensure smooth UX.

### Database Schema Relationships

```
users ←→ board_members ←→ boards
                          └→ lists
                              └→ cards ←→ card_assignees ←→ users
                                  └→ subtasks
```

**Important:**
- `created_by` fields are **nullable** (no authentication implemented)
- Junction tables: `board_members` (user-board) and `card_assignees` (user-card)
- Cascade deletes: Deleting a board removes all lists, cards, and subtasks
- Foreign key indexes exist on all relationship columns

### State Management (Zustand)

**Store Location:** `/store/useStore.ts`

**State Structure:**
- `currentUser`, `viewMode` - Auth and view mode ('admin' | 'member')
- `users`, `boards`, `lists`, `cards`, `subtasks` - Data collections
- `isLoadingBoards`, `isLoadingLists`, `isLoadingCards`, `isLoadingSubtasks` - Loading states
- `selectedBoardId`, `selectedCardId`, `isCardModalOpen` - UI state

**Key Actions:**
- Board: `addBoard`, `deleteBoard`, `setSelectedBoard`, `loadBoards`
- List: `addList`, `deleteList`, `updateListOrder`, `loadLists`
- Card: `addCard`, `updateCard`, `deleteCard`, `moveCard`, `loadCards`
- Subtask: `addSubtask`, `toggleSubtask`, `deleteSubtask`, `loadSubtasks`

**Important Pattern:** Data is lazily loaded. Boards load on mount, but lists and cards only load when a board is selected (see `app/page.tsx` useEffect).

### API Routes Structure

All entities follow RESTful pattern:
```
/app/api/{entity}/route.ts       # GET (all), POST
/app/api/{entity}/[id]/route.ts  # GET, PATCH, DELETE
```

**Query Parameters:**
- `?boardId=xxx` - Filter lists or cards by board
- `?listId=xxx` - Filter cards by list
- `?userId=xxx` - Filter boards by user membership

**Response Format:** `{ data: T }` on success or `{ error: string }` on failure

**Case Transformation:** API routes convert database `snake_case` to frontend `camelCase` (e.g., `created_at` → `createdAt`, `list_id` → `listId`)

**Task Count Pattern:** Boards include a `taskCount` field calculated server-side by counting cards across all lists in the board. This ensures accurate counts on initial load.

### Component Architecture

**Main Entry:** `app/page.tsx`
- Loads boards on mount
- Conditionally renders AdminDashboard or MemberDashboard based on `viewMode`
- Triggers list/card loading when board selected

**Board Display Flow:**
```
MemberDashboard
├── BoardList (when no board selected)
│   └── Grid of board cards with taskCount
└── BoardView (when board selected)
    ├── DndContext (drag-drop provider)
    ├── List[] (vertical columns)
    │   └── CardItem[] (draggable cards)
    └── DragOverlay (visual feedback during drag)
```

**Key Components:**
- `BoardView.tsx` - Handles drag-and-drop logic, card reordering between lists
- `List.tsx` - Droppable container, manages SortableContext
- `CardItem.tsx` - Draggable card with status bar that expands on hover
- `CardModal.tsx` - Full card editing with subtasks, auto-resizing textareas
- `AdminDashboard.tsx` - Shows all users with their task statistics

### Drag & Drop Implementation

Uses `@dnd-kit` library with these behaviors:

1. **Card → Card:** Insert before target card (same or different list)
2. **Card → List:** Append to end of list
3. **Same List:** Reorder within list
4. **Cross-List:** Move to new list with automatic reordering

**Critical Pattern in `BoardView.tsx`:**
```typescript
handleDragEnd:
  - Dropped on list container → append to end
  - Dropped on card in same list → reorder
  - Dropped on card in different list → move & reorder
  - Uses optimistic UI updates before API confirmation
```

The `moveCard` action calculates new order values, updates local state immediately, then persists to database.

## Important Development Notes

### Authentication Status
**NO AUTHENTICATION IMPLEMENTED** - This is a development/demo application:
- No login/signup flow
- No session management
- Row Level Security (RLS) disabled in Supabase
- `currentUser` can be manually set in the store for testing
- All `created_by` fields are nullable

**Do NOT** assume auth exists when adding features. If auth is needed, it must be implemented from scratch.

### Type System
**Location:** `/types/index.ts`

Key types: `User`, `Board`, `List`, `Card`, `Subtask`
- `TaskStatus`: `'not_started' | 'in_progress' | 'done'`
- `UserRole`: `'admin' | 'member'`
- All IDs are strings (UUIDs)
- Dates are Date objects in frontend, timestamps in database

### Case Naming Convention
- **Database:** `snake_case` (e.g., `created_at`, `board_id`)
- **Frontend:** `camelCase` (e.g., `createdAt`, `boardId`)
- **API Routes:** Handle transformation between conventions

### Order Field Pattern
Lists and cards have an `order` field for positioning:
- New items calculate order as `Math.max(...existingOrders) + 1`
- Reordering updates order values sequentially
- Order is managed automatically by store actions

### Status System
Cards have 3 visual states:
- `not_started` - Gray/neutral
- `in_progress` - Blue/cyan
- `done` - Green/emerald

Status bar in `CardItem.tsx` expands on hover to show dropdown for quick status changes.

### Subtask Progress
CardModal shows a progress bar calculated as:
```
(completed subtasks / total subtasks) × 100
```
Progress bar uses emerald color and updates in real-time as subtasks are toggled.

## Common Patterns to Follow

### Adding a New Feature to Cards
1. Update `Card` type in `/types/index.ts`
2. Add database column in Supabase (run migration SQL)
3. Update API routes in `/app/api/cards/route.ts` and `/app/api/cards/[id]/route.ts`
4. Add store action in `/store/useStore.ts`
5. Update `CardModal.tsx` to display/edit the field
6. Optionally update `CardItem.tsx` if it should show in card preview

### Adding a New Entity Type
1. Create TypeScript interface in `/types/index.ts`
2. Create database table in Supabase with UUID primary key, timestamps
3. Create API routes: `/app/api/{entity}/route.ts` and `/app/api/{entity}/[id]/route.ts`
4. Add API client functions in `/lib/api.ts`
5. Add state and actions to Zustand store in `/store/useStore.ts`
6. Create React components for display/editing

### Modifying Database Schema
1. Write SQL migration (reference `supabase-combined-migration.sql` for patterns)
2. Test migration in Supabase SQL Editor
3. Update TypeScript types to match
4. Update API routes to handle new fields (remember case transformation)
5. Update store if state structure changes
6. Update relevant components

### Adding Drag & Drop to New Items
1. Wrap in `<SortableContext>` (see `List.tsx`)
2. Use `useSortable` hook in item component (see `CardItem.tsx`)
3. Implement `handleDragEnd` logic in parent (see `BoardView.tsx`)
4. Add optimistic update in store action
5. Persist order changes via API

## Known Limitations

- No real-time synchronization (changes by other users require refresh)
- No offline support or caching
- No undo/redo functionality
- No data validation on inputs (can create empty titles)
- No error boundaries implemented
- No comprehensive loading states for all actions
- No automated tests
- RLS disabled - not production-ready for security

## File Paths Reference

**Core Files:**
- Types: `/types/index.ts`
- Store: `/store/useStore.ts`
- API Client: `/lib/api.ts`
- Supabase Config: `/lib/supabase.ts`
- Main Page: `/app/page.tsx`
- Database Schema: `/supabase-combined-migration.sql`

**Key Components:**
- `/components/BoardView.tsx` - Drag-drop logic
- `/components/List.tsx` - List container
- `/components/CardItem.tsx` - Individual cards
- `/components/CardModal.tsx` - Card editing modal
- `/components/BoardList.tsx` - Board grid view
- `/components/AdminDashboard.tsx` - Admin view
- `/components/MemberDashboard.tsx` - Member view

**API Routes:**
- `/app/api/boards/` - Board CRUD
- `/app/api/lists/` - List CRUD
- `/app/api/cards/` - Card CRUD
- `/app/api/subtasks/` - Subtask CRUD
- `/app/api/users/` - User CRUD
