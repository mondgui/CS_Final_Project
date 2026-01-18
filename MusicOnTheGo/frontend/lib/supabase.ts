// frontend/lib/supabase.ts
// Supabase client setup for real-time features

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { storage } from './storage';

// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get Supabase client with authentication token
 * This allows us to use our existing JWT tokens with Supabase
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  try {
    const token = await storage.getItem('token');
    
    if (!token) {
      return supabase;
    }

    // Create a new client instance with the token in headers
    // Note: This uses the anon key but passes JWT in Authorization header
    // For RLS to work, you'll need to configure Supabase to accept your JWT
    // OR use Service Role key (bypasses RLS - for MVP)
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false, // We're using our own token storage
        autoRefreshToken: false,
      },
    });
  } catch (error) {
    console.error('[Supabase] Error getting client:', error);
    return supabase;
  }
}

/**
 * Initialize Supabase with current user's token
 * Call this after login to set up authentication
 */
export async function initSupabaseAuth(): Promise<boolean> {
  try {
    const token = await storage.getItem('token');
    
    if (!token) {
      return false;
    }

    // For now, we'll use the token in headers
    // In production, you might want to:
    // 1. Use Supabase Auth instead of custom JWT
    // 2. Or configure Supabase to verify your custom JWT
    // 3. Or use Service Role key (bypasses RLS)
    
    return true;
  } catch (error) {
    console.error('[Supabase] Auth initialization error:', error);
    return false;
  }
}

/**
 * Disconnect Supabase (cleanup)
 */
export function disconnectSupabase() {
  // Supabase client doesn't need explicit disconnection
  // But we can clear any cached data if needed
}
