import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/whop-users - Get all users for a company
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    const { data: users, error } = await supabase
      .from('whop_users')
      .select('id, username, name, avatar')
      .eq('company_id', companyId)
      .order('name', { ascending: true, nullsLast: true });

    if (error) throw error;

    // Transform to match User interface format
    const transformedUsers = (users || []).map((user: any) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar || undefined,
    }));

    return NextResponse.json({ data: transformedUsers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching company users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company users' },
      { status: 500 }
    );
  }
}

