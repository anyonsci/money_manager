import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import type { UserProfile } from './types/index';

export const DEFAULT_SUPABASE_URL = 'https://cmbjedfxyrrytsafymmm.supabase.co';
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6VPhNR8k-QeDrxK84BKNpA_HdNUo8q2';

export const getSupabaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) {
    return String(import.meta.env.VITE_SUPABASE_URL);
  }
  return DEFAULT_SUPABASE_URL;
};

export const getSupabasePublishableKey = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  }
  return DEFAULT_SUPABASE_PUBLISHABLE_KEY;
};

export const getSupabaseRedirectUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_REDIRECT_URL) {
    return String(import.meta.env.VITE_SUPABASE_REDIRECT_URL);
  }
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin + window.location.pathname;
  }
  return '';
};

export const createSupabaseAuthClient = (
  url = getSupabaseUrl(),
  publishableKey = getSupabasePublishableKey()
): SupabaseClient => {
  return createClient(url, publishableKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
};

export const supabase: SupabaseClient = createSupabaseAuthClient();

export const mapSupabaseUser = (user: User | null | undefined): UserProfile | null => {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || '',
    name: metadata.full_name || metadata.name || (user.email ? user.email.split('@')[0] : 'User'),
    avatar: metadata.avatar_url || metadata.picture || '',
    picture: metadata.picture || metadata.avatar_url || '',
  };
};
