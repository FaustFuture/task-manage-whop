import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/subtasks - Get all subtasks (optionally filtered by cardId)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cardId = searchParams.get('cardId');

    let query = supabase
      .from('subtasks')
      .select('*')
      .order('order', { ascending: true });

    if (cardId) {
      query = query.eq('card_id', cardId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform snake_case to camelCase for frontend
    const transformedData = data?.map((subtask: any) => ({
      id: subtask.id,
      cardId: subtask.card_id,
      title: subtask.title,
      isCompleted: subtask.is_completed,
      order: subtask.order,
    }));

    return NextResponse.json({ data: transformedData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtasks' },
      { status: 500 }
    );
  }
}

// POST /api/subtasks - Create a new subtask
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, title, isCompleted, order } = body;

    if (!cardId || !title) {
      return NextResponse.json(
        { error: 'cardId and title are required' },
        { status: 400 }
      );
    }

    // If order is not provided, get the max order and add 1
    let subtaskOrder = order;
    if (subtaskOrder === undefined) {
      const { data: existingSubtasks } = await supabase
        .from('subtasks')
        .select('order')
        .eq('card_id', cardId)
        .order('order', { ascending: false })
        .limit(1);

      subtaskOrder = existingSubtasks && existingSubtasks.length > 0
        ? existingSubtasks[0].order + 1
        : 0;
    }

    const { data, error } = await supabase
      .from('subtasks')
      .insert([{
        card_id: cardId,
        title,
        is_completed: isCompleted || false,
        order: subtaskOrder,
      }])
      .select()
      .single();

    if (error) throw error;

    // Transform snake_case to camelCase for frontend
    const transformedData = {
      id: data.id,
      cardId: data.card_id,
      title: data.title,
      isCompleted: data.is_completed,
      order: data.order,
    };

    return NextResponse.json({ data: transformedData }, { status: 201 });
  } catch (error) {
    console.error('Error creating subtask:', error);
    return NextResponse.json(
      { error: 'Failed to create subtask' },
      { status: 500 }
    );
  }
}
