import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/cards/[id] - Get a specific card with assignees
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: card, error } = await supabase
      .from('cards')
      .select(`
        *,
        card_assignees (
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Transform data to camelCase
    const transformedCard = {
      id: card.id,
      listId: card.list_id,
      title: card.title,
      description: card.description,
      status: card.status || 'not_started',
      assignedTo: card.card_assignees?.map((ca: any) => ca.user_id) || [],
      createdBy: card.created_by,
      createdAt: new Date(card.created_at),
      order: card.order,
    };

    return NextResponse.json({ data: transformedCard }, { status: 200 });
  } catch (error) {
    console.error('Error fetching card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card' },
      { status: 500 }
    );
  }
}

// PATCH /api/cards/[id] - Update a card
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, listId, order, assignedTo } = body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (listId !== undefined) updates.list_id = listId;
    if (order !== undefined) updates.order = order;

    // Update card
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (cardError) throw cardError;

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Update assignees if provided
    if (assignedTo && Array.isArray(assignedTo)) {
      // Delete existing assignees
      await supabase
        .from('card_assignees')
        .delete()
        .eq('card_id', id);

      // Add new assignees
      if (assignedTo.length > 0) {
        const cardAssignees = assignedTo.map((userId: string) => ({
          card_id: id,
          user_id: userId,
        }));

        await supabase
          .from('card_assignees')
          .insert(cardAssignees);
      }
    }

    // Fetch updated assignees
    const { data: cardAssignees } = await supabase
      .from('card_assignees')
      .select('user_id')
      .eq('card_id', id);

    // Transform to camelCase for frontend
    const transformedCard = {
      id: card.id,
      listId: card.list_id,
      title: card.title,
      description: card.description,
      status: card.status || 'not_started',
      assignedTo: cardAssignees?.map(ca => ca.user_id) || [],
      createdBy: card.created_by,
      createdAt: new Date(card.created_at),
      order: card.order,
    };

    return NextResponse.json(
      { data: transformedCard },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[id] - Delete a card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json(
      { message: 'Card deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}
