import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/subtasks/[id] - Get a specific subtask
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 }
      );
    }

    // Transform snake_case to camelCase for frontend
    const transformedData = {
      id: data.id,
      cardId: data.card_id,
      title: data.title,
      isCompleted: data.is_completed,
      order: data.order,
    };

    return NextResponse.json({ data: transformedData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching subtask:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtask' },
      { status: 500 }
    );
  }
}

// PATCH /api/subtasks/[id] - Update a subtask
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, isCompleted, order } = body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (isCompleted !== undefined) updates.is_completed = isCompleted;
    if (order !== undefined) updates.order = order;

    const { data, error } = await supabase
      .from('subtasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 }
      );
    }

    // Transform snake_case to camelCase for frontend
    const transformedData = {
      id: data.id,
      cardId: data.card_id,
      title: data.title,
      isCompleted: data.is_completed,
      order: data.order,
    };

    return NextResponse.json({ data: transformedData }, { status: 200 });
  } catch (error) {
    console.error('Error updating subtask:', error);
    return NextResponse.json(
      { error: 'Failed to update subtask' },
      { status: 500 }
    );
  }
}

// DELETE /api/subtasks/[id] - Delete a subtask
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json(
      { message: 'Subtask deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting subtask:', error);
    return NextResponse.json(
      { error: 'Failed to delete subtask' },
      { status: 500 }
    );
  }
}
