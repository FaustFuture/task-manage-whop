import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/whop-users/upsert - Upsert Whop user data to cache
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, username, name, avatar, company_id } = body;

    console.log('[WHOP USERS CACHE] Upserting user:', { id, username, company_id });

    if (!id || !username || !company_id) {
      return NextResponse.json(
        { error: 'id, username, and company_id are required' },
        { status: 400 }
      );
    }

    // Upsert user data (insert or update if exists)
    const { data, error } = await supabase
      .from('whop_users')
      .upsert({
        id,
        username,
        name: name || null,
        avatar: avatar || null,
        company_id,
        last_seen: new Date().toISOString(),
      }, {
        onConflict: 'id',
        ignoreDuplicates: false // Always update to refresh last_seen
      })
      .select()
      .single();

    if (error) {
      console.error('[WHOP USERS CACHE] Error upserting user:', error);
      throw error;
    }

    console.log('[WHOP USERS CACHE] User upserted successfully:', data);

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error upserting Whop user:', error);
    return NextResponse.json(
      { error: 'Failed to upsert Whop user' },
      { status: 500 }
    );
  }
}
