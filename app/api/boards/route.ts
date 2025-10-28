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
        board_members (
          user_id
        )
      `)
      .order('created_at', { ascending: false });

    // Optionally filter by user
    if (userId) {
      // First, get the board IDs for the user
      const { data: memberBoards } = await supabase
        .from('board_members')
        .select('board_id')
        .eq('user_id', userId);

      const boardIds = memberBoards?.map(bm => bm.board_id) || [];

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
          members: board.board_members?.map((bm: any) => bm.user_id) || [],
          board_members: undefined,
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
    const { title, createdBy, members } = body;

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

    // Add board members if provided
    const membersList = members || (createdBy ? [createdBy] : []);
    if (membersList.length > 0) {
      const boardMembers = membersList.map((userId: string) => ({
        board_id: board.id,
        user_id: userId,
      }));

      const { error: membersError } = await supabase
        .from('board_members')
        .insert(boardMembers);

      if (membersError) throw membersError;
    }

    return NextResponse.json(
      {
        data: {
          ...board,
          members: membersList,
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
