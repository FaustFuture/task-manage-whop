import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/cards - Get all cards (optionally filtered by listId or boardId)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const listId = searchParams.get("listId");
    const boardId = searchParams.get("boardId");

    let query = supabase
      .from("cards")
      .select(
        `
        *,
        card_assignees (
          user_id
        )
      `
      )
      .order("order", { ascending: true });

    if (listId) {
      query = query.eq("list_id", listId);
    } else if (boardId) {
      // Get cards for all lists in a board
      const { data: lists } = await supabase
        .from("lists")
        .select("id")
        .eq("board_id", boardId);

      if (lists && lists.length > 0) {
        const listIds = lists.map((l) => l.id);
        query = query.in("list_id", listIds);
      } else {
        return NextResponse.json({ data: [] }, { status: 200 });
      }
    }

    const { data: cards, error } = await query;

    if (error) throw error;

    // Transform data to camelCase
    const transformedCards = cards?.map((card: any) => ({
      id: card.id,
      listId: card.list_id,
      title: card.title,
      description: card.description,
      status: card.status || "not_started",
      assignedTo: card.card_assignees?.map((ca: any) => ca.user_id) || [],
      createdBy: card.created_by,
      createdAt: new Date(card.created_at),
      order: card.order,
    }));

    return NextResponse.json({ data: transformedCards }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

// POST /api/cards - Create a new card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listId, title, description, status, assignedTo, createdBy, order } =
      body;

    if (!listId || !title) {
      return NextResponse.json(
        { error: "listId and title are required" },
        { status: 400 }
      );
    }

    // If order is not provided, get the max order and add 1
    let cardOrder = order;
    if (cardOrder === undefined) {
      const { data: existingCards } = await supabase
        .from("cards")
        .select("order")
        .eq("list_id", listId)
        .order("order", { ascending: false })
        .limit(1);

      cardOrder =
        existingCards && existingCards.length > 0
          ? existingCards[0].order + 1
          : 0;
    }

    // Get the board ID from the list to find all board members
    const { data: list } = await supabase
      .from("lists")
      .select("board_id")
      .eq("id", listId)
      .single();

    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Get all board members
    const { data: boardMembers } = await supabase
      .from("board_users")
      .select("user_id")
      .eq("board_id", list.board_id);

    // Create card (createdBy is now optional)
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .insert([
        {
          list_id: listId,
          title,
          description,
          status: status || "not_started",
          created_by: createdBy || null,
          order: cardOrder,
        },
      ])
      .select()
      .single();

    if (cardError) throw cardError;

    // Automatically assign card to all board members
    const memberUserIds = boardMembers?.map((bm) => bm.user_id) || [];

    // Merge with any explicitly provided assignedTo users
    const allAssignees = assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0
      ? [...new Set([...memberUserIds, ...assignedTo])] // Combine and deduplicate
      : memberUserIds;

    if (allAssignees.length > 0) {
      const cardAssignees = allAssignees.map((userId: string) => ({
        card_id: card.id,
        user_id: userId,
      }));

      const { error: assigneesError } = await supabase
        .from("card_assignees")
        .insert(cardAssignees);

      if (assigneesError) throw assigneesError;
    }

    // Transform to camelCase for frontend
    const transformedCard = {
      id: card.id,
      listId: card.list_id,
      title: card.title,
      description: card.description,
      status: card.status || "not_started",
      assignedTo: allAssignees, // Return all assigned users (board members + explicit)
      createdBy: card.created_by,
      createdAt: new Date(card.created_at),
      order: card.order,
    };

    return NextResponse.json({ data: transformedCard }, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}
