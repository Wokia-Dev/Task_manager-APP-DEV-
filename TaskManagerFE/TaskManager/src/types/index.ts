/**
 * TaskFlow TypeScript Type Definitions
 */

// ─── User ────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatar_color: string;
  initials: string;
  created_at: string;
}

// ─── Auth ────────────────────────────────────────────
export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  full_name: string;
  avatar_color?: string;
}

// ─── Team ────────────────────────────────────────────
export interface Team {
  id: number;
  name: string;
  invite_code: string;
  created_by: number;
  created_at: string;
  creator: User;
  member_count: number;
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: 'owner' | 'member';
  joined_at: string;
  user: User;
}

// ─── Task ────────────────────────────────────────────
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: number;
  team_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_by: number;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  creator: User;
  assignee: User | null;
  is_overdue: boolean;
}

export interface CreateTaskPayload {
  team_id: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  assigned_to?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assigned_to?: number | null;
}

// ─── Dashboard ───────────────────────────────────────
export interface DashboardStats {
  total: number;
  todo: number;
  in_progress: number;
  completed: number;
  overdue: number;
  progress: number;
  my_tasks: {
    total: number;
    completed: number;
    progress: number;
  };
  member_count: number;
  recent_tasks: Task[];
}

// ─── API ─────────────────────────────────────────────
export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

// ─── Filters ─────────────────────────────────────────
export interface TaskFilters {
  status?: TaskStatus | 'all';
  assigned_to?: number;
  my_tasks?: boolean;
  sort?: 'created_at' | 'due_date' | 'priority' | 'title';
  order?: 'asc' | 'desc';
}
