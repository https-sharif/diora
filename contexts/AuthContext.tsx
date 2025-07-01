import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { User } from '@/types/User';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    username: string,
    fullName: string
  ) => Promise<boolean>;
  logout: () => void;
  followUser: (targetUserId: string) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Simulate checking for existing session
  //   const checkAuthStatus = async () => {
  //     try {
  //       // In a real app, you'd check for stored tokens/session
  //       await new Promise(resolve => setTimeout(resolve, 1000));
  //       setLoading(false);
  //     } catch (error) {
  //       setLoading(false);
  //     }
  //   };

  //   checkAuthStatus();
  // }, []);

  // useEffect(() => {
  //   if (!loading && user) {
  //     router.replace('/(tabs)');
  //   } else if (!loading && !user) {
  //     router.replace('/auth');
  //   }
  // }, [loading, user]);

  useEffect(() => {
    if (__DEV__) {
      const mockUser: User = {
        id: '1',
        email: 'dev@example.com',
        username: 'devUser',
        fullName: 'Dev User',
        avatar:
          'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
        bio: 'Dev mode auto-login',
        followers: ['dev1', 'dev2'],
        following: ['dev3', 'dev4'],
        likedPosts: ['1', '2', '3'],
        posts: 3,
      };
      setUser(mockUser);
      setLoading(false);
    } else {
      const checkAuthStatus = async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setLoading(false);
        } catch {
          setLoading(false);
        }
      };
      checkAuthStatus();
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser: User = {
        id: '1',
        email,
        username: email.split('@')[0],
        fullName: 'Fashion Enthusiast',
        avatar:
          'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
        bio: 'Fashion lover & trendsetter ✨',
        followers: ['dev1', 'dev2'],
        following: ['dev3', 'dev4'],
        likedPosts: ['1', '2', '3'],
        posts: 3,
      };

      setUser(mockUser);
      router.replace('/(tabs)');
      return true;
    } catch (error) {
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    fullName: string
  ): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: '2',
        email,
        username,
        fullName,
        avatar:
          'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
        bio: 'New to Diora ✨',
        followers: [],
        following: [],
        likedPosts: [],
        posts: 0,
      };

      setUser(mockUser);
      router.replace('/(tabs)');
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    router.replace('/auth');
  };

  const followUser = (targetUserId: string) => {
    if (!user) return;

    const isFollowing = user.following.includes(targetUserId);

    setUser(prev => {
      if (!prev) return prev;

      let updatedFollowing = [...prev.following];
      let updatedFollowers = [...prev.followers];

      if (isFollowing) {
        // Unfollow: remove targetUserId from following
        updatedFollowing = updatedFollowing.filter(id => id !== targetUserId);
        // Also remove this user from target's followers (simulate)
        // For demo: assume you fetch target user and update their followers in real app
      } else {
        // Follow: add targetUserId to following
        updatedFollowing.push(targetUserId);
        // Also add this user to target's followers (simulate)
      }

      return {
        ...prev,
        following: updatedFollowing,
        // followers remain same here, you need to update target user's followers separately
      };
    });
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        followUser,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
