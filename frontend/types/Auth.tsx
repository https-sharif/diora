export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  username: string;
  fullName: string;
  password: string;
}

export interface AuthResponse {
  status: boolean;
  message?: string;
  details?: string;
  token: string;
  user: any;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error: string | null; details?: string }>;
  signup: (
    data: SignupData
  ) => Promise<{ success: boolean; error: string | null } | undefined>;
  logout: () => Promise<void>;
  followUser: (
    targetUserId: string,
    targetType: 'user' | 'shop'
  ) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  syncUser: () => Promise<void>;
  setIsAuthenticated: (val: boolean) => void;
  setUser: (user: any | null) => void;
  setLoading: (val: boolean) => void;
  reset: () => void;
}
