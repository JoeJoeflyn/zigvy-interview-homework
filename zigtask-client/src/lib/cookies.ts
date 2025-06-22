// Utility functions for working with cookies
import Cookies from 'js-cookie';

export const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  path: '/',
  sameSite: 'Lax',
  secure: process.env.NODE_ENV === 'production',
};

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export function setTokens({ accessToken, refreshToken }: TokenPair, options: Cookies.CookieAttributes = {}) {
  const cookieOptions = { ...COOKIE_OPTIONS, ...options };

  // Set access token with shorter expiration
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    ...cookieOptions,
  });

  // Set refresh token with longer expiration
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    ...cookieOptions,
  });
}

export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function removeTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY, COOKIE_OPTIONS);
  Cookies.remove(REFRESH_TOKEN_KEY, COOKIE_OPTIONS);
}

export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function clearAllCookies() {
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const [name] = cookie.trim().split('=');
    if (name) {
      Cookies.remove(name, { path: '/' });
      Cookies.remove(name, { path: '/', domain: window.location.hostname });
    }
  });
}
