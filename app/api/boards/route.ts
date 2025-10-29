import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/boards - Get all boards with members
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let query = supabase
      .from('boards')
      .select(`
        *,
        board_users (
          user_id
        )
      `)
      .order('created_at', { ascending: false });

    // Optionally filter by user
    if (userId) {
      // First, get the board IDs for the user
      const { data: userBoards } = await supabase
        .from('board_users')
        .select('board_id')
        .eq('user_id', userId);

      const boardIds = userBoards?.map(ub => ub.board_id) || [];

      if (boardIds.length > 0) {
        query = query.in('id', boardIds);
      }
    }

    const { data: boards, error } = await query;

    if (error) throw error;

    // For each board, count the tasks
    const boardsWithTaskCounts = await Promise.all(
      (boards || []).map(async (board: any) => {
        // First get all list IDs for this board
        const { data: lists } = await supabase
          .from('lists')
          .select('id')
          .eq('board_id', board.id);

        const listIds = lists?.map((list: any) => list.id) || [];

        // Count cards in those lists
        let taskCount = 0;
        if (listIds.length > 0) {
          const { count, error: countError } = await supabase
            .from('cards')
            .select('id', { count: 'exact', head: true })
            .in('list_id', listIds);

          if (countError) {
            console.error('Error counting tasks for board:', board.id, countError);
          } else {
            taskCount = count || 0;
          }
        }

        return {
          ...board,
          users: board.board_users?.map((bu: any) => bu.user_id) || [],
          board_users: undefined,
          createdAt: new Date(board.created_at),
          taskCount,
        };
      })
    );

    return NextResponse.json({ data: boardsWithTaskCounts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create a new board
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, createdBy, users } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create board (createdBy is now optional)
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert([{ title, created_by: createdBy || null }])
      .select()
      .single();

    if (boardError) throw boardError;

    // Add board users if provided
    const usersList = users || (createdBy ? [createdBy] : []);
    if (usersList.length > 0) {
      const boardUsers = usersList.map((userId: string) => ({
        board_id: board.id,
        user_id: userId,
      }));

      const { error: usersError } = await supabase
        .from('board_users')
        .insert(boardUsers);

      if (usersError) throw usersError;
    }

    return NextResponse.json(
      {
        data: {
          ...board,
          users: usersList,
          createdAt: new Date(board.created_at),
          taskCount: 0,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}
