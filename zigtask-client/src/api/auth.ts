import { api } from '@/lib/api';
import { setTokens } from '@/lib/cookies';

// action to login user
export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const result = await api.post<
    { accessToken: string; refreshToken: string; message: string },
    { email: string; password: string }
  >('/auth/login', { email, password }, { skipAuth: true });
  setTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
  return result;
}

// action to register user
export async function register({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return api.post<
    { id: string; email: string; message: string },
    { email: string; password: string }
  >('/auth/register', { email, password }, { skipAuth: true });
}
