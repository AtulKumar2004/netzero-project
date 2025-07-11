'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  profileImage?: string;
  isVerified: boolean;
  stats: {
    itemsSubmitted: number;
    itemsDonated: number;
    itemsResold: number;
    co2Saved: number;
    revenueGenerated: number;
    ecoPoints: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(data.error || 'Login failed');
        return false;
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        toast.success('Account created successfully!');
        return true;
      } else {
        if (data.details && Array.isArray(data.details)) {
          data.details.forEach((error: string) => toast.error(error));
        } else {
          toast.error(data.error || 'Registration failed');
        }
        return false;
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setUser(null);
        toast.success('Logged out successfully');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(data.error || 'Update failed');
        return false;
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    await checkAuthStatus();
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}