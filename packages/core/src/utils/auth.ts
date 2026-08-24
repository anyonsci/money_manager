import { UserProfile } from '../types/index';

export const parseJwt = (token: string): UserProfile | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      id: parsed.sub || parsed.id,
      email: parsed.email || parsed.sub || '',
      name: parsed.name,
      picture: parsed.picture || parsed.avatar,
      avatar: parsed.avatar || parsed.picture,
      exp: parsed.exp
    };
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const user = parseJwt(token);
  if (!user || !user.exp) return true;
  return Date.now() >= user.exp * 1000 - 60000;
};
