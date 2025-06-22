import {
  getAccessToken,
  getRefreshToken,
  removeTokens,
  setTokens,
} from './cookies';

const API_BASE_URL = '/api/v1';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
type JsonArray = JsonValue[];

type RequestBody = JsonValue | FormData | URLSearchParams | Blob | ArrayBuffer;

type RequestOptions<T extends RequestBody = RequestBody> = Omit<
  RequestInit,
  'body' | 'headers'
> & {
  body?: T;
  skipAuth?: boolean;
  headers?: HeadersInit & {
    'Content-Type'?: string;
  };
};

export class ApiError<T = unknown> extends Error {
  status: number;
  data?: T;

  constructor(message: string, status: number, data?: T) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  let data: unknown;

  try {
    data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();
  } catch (error) {
    console.error('Failed to parse response:', error);
    throw new ApiError('Failed to parse response', response.status);
  }

  if (!response.ok) {
    throw new ApiError(
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : 'An error occurred',
      response.status,
      data as T,
    );
  }

  return data as T;
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

async function refreshAccessToken(): Promise<void> {
  if (isRefreshing) {
    return refreshPromise!;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const { accessToken, refreshToken: newRefreshToken } =
        (await response.json()) as TokenResponse;
      setTokens({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      removeTokens();
      window.location.href = '/';
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function fetchWithAuth<T, B extends RequestBody = RequestBody>(
  endpoint: string,
  { body, headers = {}, skipAuth = false, ...options }: RequestOptions<B> = {},
): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      (config.headers as HeadersInit) = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  if (body && options.method !== 'GET' && options.method !== 'HEAD') {
    config.body =
      body instanceof FormData ||
      body instanceof URLSearchParams ||
      body instanceof Blob ||
      body instanceof ArrayBuffer
        ? body
        : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await handleResponse<T>(response);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      !skipAuth &&
      getRefreshToken()
    ) {
      try {
        await refreshAccessToken();
        return fetchWithAuth<T, B>(endpoint, {
          body,
          headers,
          ...options,
        } as RequestOptions<B>);
      } catch (error) {
        console.error('Failed to refresh access token:', error);
        removeTokens();
        window.location.href = '/';
        throw new Error('Session expired. Please log in again.');
      }
    }
    throw error;
  }
}

// Convenience HTTP methods
export const api = {
  /**
   * Make a GET request
   * @param endpoint API endpoint (without /api prefix)
   * @param options Request options
   */
  get: <T>(
    endpoint: string,
    options: Omit<RequestOptions<never>, 'body'> = {},
  ) => fetchWithAuth<T, never>(endpoint, { ...options, method: 'GET' }),

  /**
   * Make a POST request
   * @param endpoint API endpoint (without /api prefix)
   * @param body Request body
   * @param options Request options
   */
  post: <T, B extends RequestBody = JsonValue>(
    endpoint: string,
    body?: B,
    options: Omit<RequestOptions<B>, 'body'> = {},
  ) => fetchWithAuth<T, B>(endpoint, { ...options, method: 'POST', body }),

  /**
   * Make a PUT request
   * @param endpoint API endpoint (without /api prefix)
   * @param body Request body
   * @param options Request options
   */
  put: <T, B extends RequestBody = JsonValue>(
    endpoint: string,
    body?: B,
    options: Omit<RequestOptions<B>, 'body'> = {},
  ) => fetchWithAuth<T, B>(endpoint, { ...options, method: 'PUT', body }),

  /**
   * Make a DELETE request
   * @param endpoint API endpoint (without /api prefix)
   * @param options Request options
   */
  delete: <T>(
    endpoint: string,
    options: Omit<RequestOptions<never>, 'body'> = {},
  ) => fetchWithAuth<T, never>(endpoint, { ...options, method: 'DELETE' }),

  /**
   * Make a PATCH request
   * @param endpoint API endpoint (without /api prefix)
   * @param body Request body
   * @param options Request options
   */
  patch: <T, B extends RequestBody = JsonValue>(
    endpoint: string,
    body?: B,
    options: Omit<RequestOptions<B>, 'body'> = {},
  ) => fetchWithAuth<T, B>(endpoint, { ...options, method: 'PATCH', body }),
};
