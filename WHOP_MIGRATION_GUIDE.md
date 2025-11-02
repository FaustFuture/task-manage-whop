# Whop Authentication Migration Guide

## Overview
This document describes the migration from Supabase users table to Whop authentication with company isolation.

## Changes Made

### 1. Database Schema
**Migration File:** `supabase-whop-migration.sql`

Run this SQL in your Supabase SQL Editor:
- Added `company_id TEXT` column to `boards` table
- Modified `board_members.user_id` to TEXT (for Whop user IDs)
- Modified `card_assignees.user_id` to TEXT (for Whop user IDs)
- Modified `boards.created_by` to TEXT (for Whop user IDs)
- Modified `cards.created_by` to TEXT (for Whop user IDs)
- Added index on `boards.company_id` for fast company filtering
- Removed foreign key constraints from user_id columns

**Note:** The `users` table remains in the database but is no longer used by the application.

### 2. Type System Updates
**File:** `types/index.ts`

Updated interfaces:
```typescript
// User now uses Whop data structure
export interface User {
  id: string; // Whop user ID
  name: string | null; // Display name from Whop
  username: string; // Whop username
  role: UserRole; // Mapped from Whop access_level
  avatar?: string;
}

// Board now includes companyId
export interface Board {
  companyId: string; // Whop company ID for isolation
  // ... other fields
}
```

### 3. Store Updates (Zustand)
**File:** `store/useStore.ts`

Changes:
- Added `companyId: string | null` to state
- Removed `users: User[]` array
- Removed `loadUsers()` and `addUser()` actions
- Updated `setCurrentUser(user, companyId)` to accept companyId
- Added `setCompanyId(companyId)` action
- Modified `loadBoards()` to require and filter by companyId
- Modified `addBoard()` to include companyId
- Modified `loadAnalytics()` to filter by companyId

### 4. API Client Updates
**File:** `lib/api.ts`

Changes:
- `boards.getAll(companyId: string)` - Now requires companyId
- `boards.create()` - Now requires companyId in data
- `admin.getAnalytics(companyId: string)` - Now requires companyId

### 5. API Routes Updates

#### Boards API (`app/api/boards/route.ts`)
- GET requires `?companyId=xxx` query parameter
- Filters all boards by `company_id`
- POST requires `companyId` in request body
- Returns `companyId` in camelCase format

#### Admin Analytics API (`app/api/admin/analytics/route.ts`)
- GET requires `?companyId=xxx` query parameter
- Filters all data (boards, lists, cards) by company
- User metrics based on Whop user IDs from card assignments
- No longer depends on users table

### 6. Component Updates

#### Dashboard Page Client (`app/dashboard/[companyId]/page-client.tsx`)
- Receives Whop data as props: `userId`, `username`, `name`, `companyId`, `access`
- Maps Whop `access_level` to role: "admin" → "admin", "customer" → "member"
- Initializes `currentUser` in store on mount
- Sets `companyId` in store
- Loads boards after user initialization

#### Board List (`components/BoardList.tsx`)
- Removed user-based filtering (now handled by API)
- All boards shown are already filtered by companyId

#### Root Page (`app/page.tsx`)
- Added companyId check with warning
- Removed `loadUsers()` call
- Updated to work with company-filtered data

## How Company Isolation Works

### Data Flow
```
Whop Dashboard
  ↓
/dashboard/[companyId] (Server Component)
  ├─ Authenticates with Whop SDK
  ├─ Retrieves companyId, userId, username, access_level
  ↓
page-client.tsx (Client Component)
  ├─ Receives Whop data as props
  ├─ Maps access_level to role
  ├─ Sets currentUser and companyId in Zustand store
  ↓
API Calls
  ├─ All board queries filtered by companyId
  ├─ Lists and cards filtered via board relationships
  └─ Analytics scoped to company's data
```

### Key Principles

1. **Company-Level Isolation**
   - Every board belongs to exactly one company (`company_id` NOT NULL)
   - API enforces companyId filtering at query time
   - No cross-company data leakage

2. **User ID Format**
   - User IDs are now TEXT strings (Whop user IDs)
   - No foreign key constraints to users table
   - User data comes from Whop SDK, not database

3. **Role Mapping**
   - Whop "admin" → app "admin" role
   - Whop "customer" → app "member" role
   - Whop "no_access" → Access denied

4. **Membership Tracking**
   - `board_members` table stores Whop user IDs
   - `card_assignees` table stores Whop user IDs
   - No validation against users table

## Testing Checklist

### Before Testing
- [ ] Run `supabase-whop-migration.sql` in Supabase SQL Editor
- [ ] Verify `company_id` column exists on boards table
- [ ] Verify user_id columns are TEXT type
- [ ] Install dependencies: `npm install`

### Company Isolation Tests
- [ ] Create board in Company A
- [ ] Verify board has correct `company_id` in database
- [ ] Login as Company B user
- [ ] Verify Company B cannot see Company A's boards
- [ ] Create board in Company B
- [ ] Verify both companies see only their own boards

### User Authentication Tests
- [ ] Access via Whop dashboard URL: `/dashboard/[companyId]`
- [ ] Verify Whop user data loads correctly
- [ ] Check `currentUser` has correct `id`, `username`, `name`, `role`
- [ ] Verify `companyId` is set in store
- [ ] Test with admin user (access_level: "admin")
- [ ] Test with customer user (access_level: "customer")

### Data Operations Tests
- [ ] Create a new board
- [ ] Verify board appears only for same company
- [ ] Add cards to board
- [ ] Assign cards to Whop users (use Whop user IDs)
- [ ] View admin analytics
- [ ] Verify analytics show only company's data
- [ ] Test board membership (add/remove members using Whop user IDs)

### Edge Cases
- [ ] Test with user in multiple companies (switch between them)
- [ ] Test with invalid companyId parameter
- [ ] Test accessing root `/` page (should show warning)
- [ ] Test with missing Whop authentication

## Troubleshooting

### Error: "companyId is required"
**Cause:** API routes require companyId parameter
**Solution:** Ensure you're accessing via `/dashboard/[companyId]`, not root `/` page

### Error: "Cannot load boards without companyId"
**Cause:** Store `companyId` not set
**Solution:** Check that `setCurrentUser()` is called with companyId in page-client.tsx

### Boards not showing
**Cause:** Company isolation - boards created under different companyId
**Solution:** Verify board's `company_id` in database matches current user's companyId

### User metrics showing user IDs instead of names
**Expected behavior:** Analytics API doesn't have access to Whop user names
**Future enhancement:** Fetch user details from Whop SDK and enrich analytics

## Future Enhancements

1. **User Name Resolution**
   - Fetch Whop user details in analytics API
   - Cache Whop user data locally
   - Display real names instead of user IDs

2. **Company Members List**
   - API endpoint to fetch all company members from Whop
   - UI for viewing company team members
   - Invite workflow for adding members to boards

3. **Real-time Sync**
   - Supabase real-time subscriptions scoped by company_id
   - Collaborative editing with company isolation

4. **Audit Trail**
   - Track which Whop user performed each action
   - Company-scoped activity logs

## Rollback Plan

If you need to rollback to the users table system:

1. Restore original `app/layout.tsx` (remove WhopApp wrapper)
2. Restore original `store/useStore.ts` (re-add users array and actions)
3. Restore original API routes (remove companyId filtering)
4. Restore original types (User interface with email field)
5. Run SQL to revert schema changes:
```sql
-- Restore user_id foreign keys (example)
ALTER TABLE board_members ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE board_members ADD CONSTRAINT board_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- Repeat for other tables...
```

## Support

For issues or questions about this migration:
- Check Whop SDK documentation: https://docs.whop.com/sdk
- Review Whop proxy setup: https://www.npmjs.com/package/@whop-apps/dev-proxy
- Verify Supabase schema matches migration SQL
