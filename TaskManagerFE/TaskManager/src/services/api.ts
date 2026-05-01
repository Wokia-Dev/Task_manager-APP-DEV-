/**
 * TaskFlow API Service
 * Centralized HTTP client with JWT token management.
 */
import { Platform } from 'react-native';

// Use localhost for web, 10.0.2.33 (host IP) for mobile to support physical devices
const getBaseUrl = (): string => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  return 'http://10.0.2.33:5000/api';
};

const API_BASE = getBaseUrl();

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _onTokenRefreshFailed: (() => void) | null = null;

export const api = {
  setTokens(access: string, refresh: string) {
    _accessToken = access;
    _refreshToken = refresh;
  },

  clearTokens() {
    _accessToken = null;
    _refreshToken = null;
  },

  getAccessToken() {
    return _accessToken;
  },

  onTokenRefreshFailed(callback: () => void) {
    _onTokenRefreshFailed = callback;
  },

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (_accessToken) {
      headers['Authorization'] = `Bearer ${_accessToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal as any,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timed out. Server might be unreachable.', 408);
      }
      throw new ApiError(error.message || 'Network error', 0);
    } finally {
      clearTimeout(timeoutId);
    }

    // Try to refresh token on 401
    if (response.status === 401 && _refreshToken) {
      const refreshed = await api.tryRefreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${_accessToken}`;
        const retryResponse = await fetch(url, { ...options, headers });
        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({ error: 'Request failed' }));
          throw new ApiError(error.error || 'Request failed', retryResponse.status, error.details);
        }
        return retryResponse.json();
      } else {
        _onTokenRefreshFailed?.();
        throw new ApiError('Session expired', 401);
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new ApiError(error.error || 'Request failed', response.status, error.details);
    }

    return response.json();
  },

  async tryRefreshToken(): Promise<boolean> {
    if (!_refreshToken) return false;
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${_refreshToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        _accessToken = data.access_token;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // ─── Auth ────────────────────────────────────────
  auth: {
    register(data: { username: string; email: string; password: string; full_name: string }) {
      return api.request<{
        message: string;
        user: import('@/types').User;
        access_token: string;
        refresh_token: string;
      }>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    },

    login(data: { email: string; password: string }) {
      return api.request<{
        message: string;
        user: import('@/types').User;
        access_token: string;
        refresh_token: string;
      }>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
    },

    getProfile() {
      return api.request<{ user: import('@/types').User }>('/auth/me');
    },

    updateProfile(data: { full_name?: string; avatar_color?: string; username?: string }) {
      return api.request<{ message: string; user: import('@/types').User }>('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // ─── Teams ───────────────────────────────────────
  teams: {
    list() {
      return api.request<{ teams: import('@/types').Team[] }>('/teams');
    },

    create(name: string) {
      return api.request<{ message: string; team: import('@/types').Team }>('/teams', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
    },

    join(invite_code: string) {
      return api.request<{ message: string; team: import('@/types').Team }>('/teams/join', {
        method: 'POST',
        body: JSON.stringify({ invite_code }),
      });
    },

    getMembers(teamId: number) {
      return api.request<{ members: import('@/types').TeamMember[] }>(`/teams/${teamId}/members`);
    },
  },

  // ─── Tasks ───────────────────────────────────────
  tasks: {
    list(params: {
      team_id: number;
      status?: string;
      assigned_to?: number;
      my_tasks?: boolean;
      sort?: string;
      order?: string;
    }) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
      return api.request<{ tasks: import('@/types').Task[] }>(`/tasks?${searchParams.toString()}`);
    },

    get(taskId: number) {
      return api.request<{ task: import('@/types').Task }>(`/tasks/${taskId}`);
    },

    create(data: import('@/types').CreateTaskPayload) {
      return api.request<{ message: string; task: import('@/types').Task }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update(taskId: number, data: import('@/types').UpdateTaskPayload) {
      return api.request<{ message: string; task: import('@/types').Task }>(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete(taskId: number) {
      return api.request<{ message: string }>(`/tasks/${taskId}`, { method: 'DELETE' });
    },
  },

  // ─── Dashboard ───────────────────────────────────
  dashboard: {
    getStats(teamId: number) {
      return api.request<{ stats: import('@/types').DashboardStats }>(
        `/dashboard/stats?team_id=${teamId}`,
      );
    },
  },
};

// ─── Error Class ─────────────────────────────────────
export class ApiError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
