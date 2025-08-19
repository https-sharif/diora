import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '@/types/User';
import { AuthState } from '@/types/Auth';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginSchema, signupSchema } from '@/validation/authSchema';
import { authService } from '@/services';


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      setIsAuthenticated: (val) => set({ isAuthenticated: val }),
      setUser: (user) => set({ user }),
      setLoading: (val) => set({ loading: val }),
      setToken: (token: string) => set({ token }),

      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const validated = loginSchema.safeParse({ username, password });

          if (!validated.success) {
            const msg = validated.error?.issues[0]?.message || 'Invalid input';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
          }

          const data = await authService.login({ email: username, password });

          if (data.status) {
            await AsyncStorage.setItem('token', data.token);
            set({
              token: data.token,
              user: data.user,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            return { success: true, error: null };
          } else {
            set({ error: data.message, loading: false });
            return { success: false, error: data.message, details: data.details };
          }
        } catch (err: any) {
          let errorMsg = err.message || 'Login failed';
          let details = null;
          
          if (err.response?.data) {
            errorMsg = err.response.data.message || errorMsg;
            details = err.response.data.details;
          }
          
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg, details };
        }
      },

      signup: async (data) => {
        set({ loading: true, error: null });
        try {
          const validated = signupSchema.safeParse(data);
          if (!validated.success) {
            const msg = validated.error?.issues[0]?.message || 'Invalid input';
            set({ error: msg, loading: false });
            return { success: false, error: msg };
          }

          const signupData = await authService.signup(data);

          if (signupData.status) {
            await AsyncStorage.setItem('token', signupData.token);            const newUser: User = {
              _id: signupData.user._id,
              username: signupData.user.username,
              fullName: signupData.user.fullName,
              email: signupData.user.email,
              following: signupData.user.following,
              likedPosts: signupData.user.likedPosts,
              followers: signupData.user.followers,
              posts: signupData.user.posts,
              avatar: signupData.user.avatar,
              bio: signupData.user.bio,
              isVerified: signupData.user.isVerified,
              createdAt: signupData.user.createdAt,
              type: signupData.user.type,
              onboarding: signupData.user.onboarding,
              settings: {
                theme: signupData.user.settings.theme,
                notifications: {
                  likes: signupData.user.settings.notifications.likes,
                  comments: signupData.user.settings.notifications.comments,
                  follow: signupData.user.settings.notifications.follow,
                  mention: signupData.user.settings.notifications.mention,
                  order: signupData.user.settings.notifications.order,
                  promotion: signupData.user.settings.notifications.promotion,
                  system: signupData.user.settings.notifications.system,
                  warning: signupData.user.settings.notifications.warning,
                  reportUpdate: signupData.user.settings.notifications.reportUpdate,
                  messages: signupData.user.settings.notifications.messages,
                  emailFrequency: signupData.user.settings.notifications.emailFrequency,
                },
              },
              avatarId: signupData.user.avatarId,
            };

            set({
              token: signupData.token,
              user: newUser,
              isAuthenticated: true,
              loading: false,
              error: null,
            });

            return { success: true, error: null };
          } else {
            set({ error: signupData.message, loading: false });
            return { success: false, error: signupData.message };
          }
        } catch (err: any) {
          const errorMsg = err.message || 'Signup failed';
          set({ error: errorMsg, loading: false });
          return { success: false, error: errorMsg };
        }
      },

      logout: async () => {
        await AsyncStorage.clear();
        set({ user: null, token: null, isAuthenticated: false });
        router.replace('/auth');
      },

      followUser: async (targetUserId, targetType) => {
        const { user, token } = get();
        if (!user || !token) return;

        try {
          const res = await authService.followUser(targetUserId, targetType, token);

          const updatedFollowing = res.following;

          set({
            user: {
              ...user,
              following: updatedFollowing,
            },
          });
        } catch (err: any) {
          console.error(
            '❌ Follow/unfollow failed:',
            err.response?.data || err.message
          );
        }
      },

      likePost: async (postId) => {
        const { user, token } = get();
        console.log('Like post called', postId);
        if (!user || !token) return;

        try {
          const res = await authService.likePost(postId, token);

          const updatedLikedPosts = res.user.likedPosts;

          set({
            user: {
              ...user,
              likedPosts: updatedLikedPosts,
            },
          });
        } catch (err: any) {
          console.error('❌ Like/unlike failed:', err.response?.data || err.message);
        }
      },

      reset: () =>
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        }),

      syncUser: async () => {
        const { token, isAuthenticated } = get();
        if (!token || !isAuthenticated) return;

        try {
          const response = await authService.getMe(token);

          if (response.status) {
            const updatedUser = response.user;
            
            // Check if user is banned or suspended
            if (updatedUser.status === 'banned') {
              // Force logout if user is banned
              await AsyncStorage.clear();
              set({ user: null, token: null, isAuthenticated: false });
              router.replace('/auth');
              return;
            }

            if (updatedUser.status === 'suspended' && updatedUser.suspendedUntil) {
              const suspendedUntil = new Date(updatedUser.suspendedUntil);
              if (new Date() < suspendedUntil) {
                // Force logout if still suspended
                await AsyncStorage.clear();
                set({ user: null, token: null, isAuthenticated: false });
                router.replace('/auth');
                return;
              }
            }

            // Update user data
            console.log('🔄 syncUser - Updated user from API:', {
              userId: updatedUser._id,
              onboarding: updatedUser.onboarding,
              timestamp: new Date().toISOString()
            });
            
            set({ user: updatedUser });
            
            // Verify store state immediately after set
            const storeAfterSet = get();
            console.log('🔄 syncUser - Store state after set:', {
              userId: storeAfterSet.user?._id,
              onboarding: storeAfterSet.user?.onboarding,
              timestamp: new Date().toISOString()
            });

            // Verify AsyncStorage persistence after a short delay
            setTimeout(() => {
              AsyncStorage.getItem('auth-store').then(stored => {
                const parsed = stored ? JSON.parse(stored) : null;
                console.log('🔄 syncUser - AsyncStorage verification:', {
                  userId: parsed?.state?.user?._id,
                  onboarding: parsed?.state?.user?.onboarding,
                  timestamp: new Date().toISOString()
                });
              }).catch(err => console.error('AsyncStorage check failed:', err));
            }, 100);
          } else {
            // Invalid token or user not found
            await AsyncStorage.clear();
            set({ user: null, token: null, isAuthenticated: false });
            router.replace('/auth');
          }
        } catch (error: any) {
          // If unauthorized, clear auth state
          if (error.response?.status === 401 || error.response?.status === 403) {
            await AsyncStorage.clear();
            set({ user: null, token: null, isAuthenticated: false });
            router.replace('/auth');
          }
          console.error('Failed to sync user:', error);
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
