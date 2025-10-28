# Task Manager App

A modern, real-time task management application built with Next.js, Supabase, and TailwindCSS. Features drag-and-drop card management, board collaboration, and role-based access control.

## Features

- **Drag & Drop Interface**: Intuitive card management with visual feedback
- **Real-time Database**: Powered by Supabase with automatic syncing
- **Role-Based Access**: Admin and Member views with different permissions
- **Board Management**: Create and manage multiple project boards
- **Task Organization**: Lists, cards, and subtasks for detailed project tracking
- **Team Collaboration**: Assign tasks to team members
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **Deployment**: Vercel

## Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)
- Git

### 2. Clone the Repository

```bash
git clone <your-repo-url>
cd simple-card-app
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (takes about 2 minutes)
3. Go to the SQL Editor in your Supabase dashboard
4. Copy the contents of `supabase-schema.sql` from this repo
5. Paste and run it in the SQL Editor
6. Go to Settings > API to get your credentials

### 4. Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Initial Setup (Optional)

The app comes with sample data in the Zustand store for demo purposes. Once connected to Supabase:

1. Create your first user via the API or directly in Supabase
2. Create boards and start organizing tasks
3. All changes will automatically persist to the database

## Deployment

### Deploy to Vercel

1. Push your code to GitHub:

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add your environment variables in the Vercel project settings:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Click Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## Project Structure

```
simple-card-app/
├── app/
│   ├── api/              # API routes for all CRUD operations
│   │   ├── boards/
│   │   ├── cards/
│   │   ├── lists/
│   │   ├── subtasks/
│   │   └── users/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/           # React components
│   ├── AdminDashboard.tsx
│   ├── BoardList.tsx
│   ├── BoardView.tsx
│   ├── CardItem.tsx
│   ├── CardModal.tsx
│   ├── List.tsx
│   ├── MemberDashboard.tsx
│   └── ViewSwitcher.tsx
├── lib/
│   ├── api.ts           # API helper functions
│   └── supabase.ts      # Supabase client
├── store/
│   └── useStore.ts      # Zustand state management
├── types/
│   └── index.ts         # TypeScript types
├── supabase-schema.sql  # Database schema
└── API_DOCUMENTATION.md # API reference
```

## Key Features Explained

### Drag and Drop

Cards can be dragged between lists and reordered within lists. All changes are immediately saved to the database:

```typescript
// In BoardView.tsx
const handleDragEnd = (event: DragEndEvent) => {
  // moveCard automatically saves to Supabase
  moveCard(cardId, newListId, newOrder);
};
```

### Real-time Persistence

All actions (create, update, delete, move) are saved to Supabase:

```typescript
// Example: Adding a card
addCard: async (listId, title) => {
  const result = await api.cards.create({
    listId,
    title,
    createdBy: currentUser.id,
  });
  // Local state updated after successful API call
};
```

### Role-Based Views

- **Admin View**: Full access to all boards, can create/delete boards
- **Member View**: See assigned tasks and boards they're a member of

Switch between views using the ViewSwitcher component in the header.

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference including:

- All available endpoints
- Request/response formats
- Query parameters
- Error handling
- Database schema

## Database Schema

The database uses PostgreSQL with Row Level Security (RLS) enabled:

- **users**: User accounts with roles
- **boards**: Project boards
- **board_members**: Board membership (many-to-many)
- **lists**: Columns within boards
- **cards**: Tasks within lists
- **card_assignees**: Card assignments (many-to-many)
- **subtasks**: Subtasks within cards

All tables use UUIDs and have automatic timestamps.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues and questions:

- Check the [API Documentation](./API_DOCUMENTATION.md)
- Review the [Supabase Documentation](https://supabase.com/docs)
- Open an issue on GitHub

## Roadmap

