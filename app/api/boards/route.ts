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
      query = query.in('id',
        supabase
          .from('board_members')
          .select('board_id')
          .eq('user_id', userId)
      );
    }

    const { data: boards, error } = await query;

    if (error) throw error;

    // Transform data to match frontend structure
    const transformedBoards = boards?.map((board: any) => ({
      ...board,
      members: board.board_members?.map((bm: any) => bm.user_id) || [],
      board_members: undefined,
      createdAt: new Date(board.created_at),
    }));

    return NextResponse.json({ data: transformedBoards }, { status: 200 });
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
