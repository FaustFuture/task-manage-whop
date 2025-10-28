import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/lists - Get all lists (optionally filtered by boardId)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const boardId = searchParams.get('boardId');

    let query = supabase
      .from('lists')
      .select('*')
      .order('order', { ascending: true });

    if (boardId) {
      query = query.eq('board_id', boardId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform snake_case to camelCase for frontend
    const transformedData = data?.map((list: any) => ({
      id: list.id,
      boardId: list.board_id,
      title: list.title,
      order: list.order,
    }));

    return NextResponse.json({ data: transformedData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    );
  }
}

// POST /api/lists - Create a new list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardId, title, order } = body;

    if (!boardId || !title) {
      return NextResponse.json(
        { error: 'boardId and title are required' },
        { status: 400 }
      );
    }

    // If order is not provided, get the max order and add 1
    let listOrder = order;
    if (listOrder === undefined) {
      const { data: existingLists } = await supabase
        .from('lists')
        .select('order')
        .eq('board_id', boardId)
        .order('order', { ascending: false })
        .limit(1);

      listOrder = existingLists && existingLists.length > 0
        ? existingLists[0].order + 1
        : 0;
    }

    const { data, error } = await supabase
      .from('lists')
      .insert([{ board_id: boardId, title, order: listOrder }])
      .select()
      .single();

    if (error) throw error;

    // Transform snake_case to camelCase for frontend
    const transformedData = {
      id: data.id,
      boardId: data.board_id,
      title: data.title,
      order: data.order,
    };

    return NextResponse.json({ data: transformedData }, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    );
  }
}
