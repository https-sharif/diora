import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const login = useAuthStore(state => state.login);
  const signup = useAuthStore(state => state.signup);
  const loading = useAuthStore(state => state.loading);
  const error = useAuthStore(state => state.error);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const followUser = useAuthStore(state => state.followUser);
  const likePost = useAuthStore(state => state.likePost);
  const syncUser = useAuthStore(state => state.syncUser);
  const setIsAuthenticated = useAuthStore(state => state.setIsAuthenticated);
  const setUser = useAuthStore(state => state.setUser);
  const setLoading = useAuthStore(state => state.setLoading);
  const reset = useAuthStore(state => state.reset);
  const token = useAuthStore(state => state.token);

  const refreshUser = syncUser;

  return { 
    user, 
    logout, 
    login, 
    signup, 
    loading, 
    error, 
    isAuthenticated, 
    followUser, 
    likePost, 
    syncUser, 
    refreshUser,
    setIsAuthenticated, 
    setUser, 
    setLoading, 
    reset, 
    token 
  };
};
