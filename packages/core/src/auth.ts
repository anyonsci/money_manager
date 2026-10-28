import type { UserProfile } from './types/index.js';

export const AUTH_BACKEND_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AUTH_BACKEND_URL) ||
  'https://idp-server.vercel.app';

export const GOOGLE_CLIENT_ID =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) ||
  '719964045968-cmh03lg080igf8f4lh8ng70mhhbqtt3q.apps.googleusercontent.com';

export const mapAuthUser = (user: any): UserProfile | null => {
  if (!user) return null;
  return {
    id: user.id || user._id || user.sub,
    email: user.email || '',
    name: user.name || (user.email ? user.email.split('@')[0] : 'User'),
    avatar: user.avatar || user.picture || '',
    picture: user.picture || user.avatar || '',
  };
};
