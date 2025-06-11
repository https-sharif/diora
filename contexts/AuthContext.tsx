import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuthStatus = async () => {
      try {
        // In a real app, you'd check for stored tokens/session
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        email,
        username: email.split('@')[0],
        fullName: 'Fashion Enthusiast',
        avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
        bio: 'Fashion lover & trendsetter ✨',
        followers: 1234,
        following: 567,
        posts: 89
      };
      
      setUser(mockUser);
      router.replace('/(tabs)');
      return true;
    } catch (error) {
      return false;
    }
  };

  const signup = async (email: string, password: string, username: string, fullName: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '2',
        email,
        username,
        fullName,
        avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
        bio: 'New to Diora ✨',
        followers: 0,
        following: 0,
        posts: 0
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

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      loading
    }}>
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