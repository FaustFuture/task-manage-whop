import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/boards/[id] - Get a specific board with members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: board, error } = await supabase
      .from('boards')
      .select(`
        *,
        board_members (
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Transform data
    const transformedBoard = {
      ...board,
      members: board.board_members?.map((bm: any) => bm.user_id) || [],
      board_members: undefined,
      createdAt: new Date(board.created_at),
    };

    return NextResponse.json({ data: transformedBoard }, { status: 200 });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

// PATCH /api/boards/[id] - Update a board
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, members } = body;

    const updates: any = {};
    if (title) updates.title = title;

    // Update board
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (boardError) throw boardError;

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Update members if provided
    if (members && Array.isArray(members)) {
      // Delete existing members
      await supabase
        .from('board_members')
        .delete()
        .eq('board_id', id);

      // Add new members
      if (members.length > 0) {
        const boardMembers = members.map((userId: string) => ({
          board_id: id,
          user_id: userId,
        }));

        await supabase
          .from('board_members')
          .insert(boardMembers);
      }
    }

    // Fetch updated members
    const { data: boardMembers } = await supabase
      .from('board_members')
      .select('user_id')
      .eq('board_id', id);

    return NextResponse.json(
      {
        data: {
          ...board,
          members: boardMembers?.map(bm => bm.user_id) || [],
          createdAt: new Date(board.created_at),
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[id] - Delete a board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json(
      { message: 'Board deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}
