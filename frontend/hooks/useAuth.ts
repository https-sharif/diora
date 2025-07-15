import { useAuthStore } from '@/stores/useAuthStore';

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
  const setIsAuthenticated = useAuthStore(state => state.setIsAuthenticated);
  const setUser = useAuthStore(state => state.setUser);
  const setLoading = useAuthStore(state => state.setLoading);
  const reset = useAuthStore(state => state.reset);
  const token = useAuthStore(state => state.token);

  return { user, logout, login, signup, loading, error, isAuthenticated, followUser, likePost, setIsAuthenticated, setUser, setLoading, reset, token };
};
