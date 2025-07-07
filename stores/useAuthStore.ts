import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '@/types/User';
import { router } from 'expo-router';
import { mockUsers } from '@/mock/User';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    username: string,
    fullName: string
  ) => Promise<boolean>;
  logout: () => void;
  followUser: (targetUserId: string) => void;
  likePost: (postId: string) => void;
  setIsAuthenticated: (val: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (val: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,

      setIsAuthenticated: (val) => set({ isAuthenticated: val }),
      setUser: (user) => set({ user }),
      setLoading: (val) => set({ loading: val }),

      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

            // implement later
          if (password !== '1') throw new Error('Invalid credentials');

          set({ user: { ...mockUsers[0], username: '1' }, isAuthenticated: true });
          router.replace('/(tabs)');
          return true;
        } catch (err: any) {
          set({ error: err.message || 'Login failed' });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      signup: async (email, password, username, fullName) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (!email.includes('@') || password.length < 4) {
            throw new Error('Invalid signup info');
          }

          const newUser: User = {
            id: 'u2',
            username,
            fullName,
            email,
            following: [],
            likedPosts: [],
            followers: [],
            posts: 0,
            avatar: '',
            bio: '',
            isVerified: false,
            createdAt: '',
          };

          set({ user: newUser, isAuthenticated: true });
          router.replace('/(tabs)');
          return true;
        } catch (err: any) {
          set({ error: err.message || 'Signup failed' });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        router.replace('/auth');
      },

      followUser: (targetUserId) => {
        const user = get().user;
        if (!user) return;

        const isFollowing = user.following.includes(targetUserId);
        const updatedFollowing = isFollowing
          ? user.following.filter(id => id !== targetUserId)
          : [...user.following, targetUserId];

        set({
          user: {
            ...user,
            following: updatedFollowing,
          },
        });
      },

      likePost: (postId) => {
        const user = get().user;
        if (!user) return;

        const isLiked = user.likedPosts.includes(postId);
        const updatedLikes = isLiked
          ? user.likedPosts.filter(id => id !== postId)
          : [...user.likedPosts, postId];

        set({
          user: {
            ...user,
            likedPosts: updatedLikes,
          },
        });
      },

      reset: () => set({ user: null, isAuthenticated: false, loading: false, error: null }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
