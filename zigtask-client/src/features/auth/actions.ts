import { setTokens, removeTokens } from '@/lib/cookies';
import { api } from '@/lib/api';

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = LoginCredentials & {
  name: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthResponse = AuthTokens & {
  user: User;
};

type AuthResult = {
  success: boolean;
  user?: User;
  error?: string;
};

export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const data = await api.post<AuthResponse>('/auth/login', credentials, {
      skipAuth: true,
    });

    // Store tokens in cookies
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return { success: true, user: data.user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}

export async function register(userData: RegisterData): Promise<AuthResult> {
  try {
    const data = await api.post<AuthResponse>('/auth/register', userData, {
      skipAuth: true,
    });

    // Store tokens in cookies
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return { success: true, user: data.user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout', undefined, { skipAuth: true });
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    // Clear all auth tokens
    removeTokens();
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await api.get<User>('/auth/me');
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
}
