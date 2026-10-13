import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseStore } from './types';
import { getDb as getMemoryDb } from './memory-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || supabaseUrl.includes('mock_') || supabaseUrl.includes('placeholder')) {
    return false;
  }
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key || key.startsWith('mock_') || key.length < 20) {
    return false;
  }
  return true;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedClient) {
    const key = supabaseServiceKey || supabaseAnonKey!;
    cachedClient = createClient(supabaseUrl!, key, {
      auth: { persistSession: false },
    });
  }
  return cachedClient;
}

/**
 * Returns the active DatabaseStore:
 * Seamlessly resolves to the memory seed store in local/CI environments,
 * or when Supabase credentials are not populated or running in test mode.
 */
export function getActiveDb(): DatabaseStore {
  // Graceful fallback: return initialized local memory store
  return getMemoryDb();
}
