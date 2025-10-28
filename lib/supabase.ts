import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Handle missing env vars gracefully during build
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Only throw in browser during production runtime
    throw new Error('Missing Supabase environment variables');
  }
  // Allow build to proceed with placeholder values
  console.warn('Supabase env vars not set - using placeholder values for build');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
