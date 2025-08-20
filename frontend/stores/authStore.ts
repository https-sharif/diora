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
            return {
              success: false,
              error: data.message,
              details: data.details,
            };
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
            await AsyncStorage.setItem('token', signupData.token);

            const newUser: User = {
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
              stripeCustomerId: signupData.user.stripeCustomerId,
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
                  reportUpdate:
                    signupData.user.settings.notifications.reportUpdate,
                  messages: signupData.user.settings.notifications.messages,
                  emailFrequency:
                    signupData.user.settings.notifications.emailFrequency,
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
          const res = await authService.followUser(
            targetUserId,
            targetType,
            token
          );

          const updatedFollowing = res.following;

          set({
            user: {
              ...user,
              following: updatedFollowing,
            },
          });
        } catch {}
      },

      likePost: async (postId) => {
        const { user, token } = get();
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
        } catch {}
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

            if (updatedUser.status === 'banned') {
              await AsyncStorage.clear();
              set({ user: null, token: null, isAuthenticated: false });
              router.replace('/auth');
              return;
            }

            if (
              updatedUser.status === 'suspended' &&
              updatedUser.suspendedUntil
            ) {
              const suspendedUntil = new Date(updatedUser.suspendedUntil);
              if (new Date() < suspendedUntil) {
                await AsyncStorage.clear();
                set({ user: null, token: null, isAuthenticated: false });
                router.replace('/auth');
                return;
              }
            }

            set({ user: updatedUser });
          } else {
            await AsyncStorage.clear();
            set({ user: null, token: null, isAuthenticated: false });
            router.replace('/auth');
          }
        } catch (error: any) {
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            await AsyncStorage.clear();
            set({ user: null, token: null, isAuthenticated: false });
            router.replace('/auth');
          }
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
