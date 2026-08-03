export interface UserProfile {
  email: string;
  name?: string;
  picture?: string;
  exp?: number;
}

export const getStoredIdToken = (): string | null => {
  return localStorage.getItem('google_id_token');
};

export const setStoredIdToken = (token: string): void => {
  localStorage.setItem('google_id_token', token);
};

export const removeStoredIdToken = (): void => {
  localStorage.removeItem('google_id_token');
};

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
      email: parsed.email,
      name: parsed.name,
      picture: parsed.picture,
      exp: parsed.exp
    };
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const user = parseJwt(token);
  if (!user || !user.exp) return true;
  // Consider token expired 60 seconds before official expiration to prevent API failures
  return Date.now() >= user.exp * 1000 - 60000;
};

