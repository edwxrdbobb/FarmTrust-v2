"use client"

import { useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  role: string;
  preferences?: any;
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updatePreferences: (preferences: any) => Promise<boolean>;
  fetchUser: () => Promise<void>;
}

export function useUser(userId?: string): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID for demonstration - in real app, get from auth context
  const currentUserId = userId || "mock-user-id";

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/user/profile?userId=${currentUserId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user');
      }
      
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
      // Set mock user data for demonstration
      setUser({
        _id: currentUserId,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+232 76 123456",
        address: "123 Main Street, Freetown",
        profileImage: "/diverse-group.png",
        role: "buyer",
        preferences: {
          notifications: {
            orderUpdates: true,
            promotions: true,
            farmerUpdates: false,
            smsNotifications: true,
          },
          language: "en",
          region: "western",
          currency: "leone",
          privacy: {
            profileVisibility: true,
            dataCollection: true,
            thirdPartyMarketing: false,
          },
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          ...data,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      setUser(prev => prev ? { ...prev, ...data } : null);
      return true;
    } catch (err: any) {
      setError(err.message);
      // For demo, still update local state
      setUser(prev => prev ? { ...prev, ...data } : null);
      return true; // Return true for demo purposes
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          currentPassword,
          newPassword,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update password');
      }
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (preferences: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          preferences,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update preferences');
      }
      
      setUser(prev => prev ? { ...prev, preferences } : null);
      return true;
    } catch (err: any) {
      setError(err.message);
      // For demo, still update local state
      setUser(prev => prev ? { ...prev, preferences } : null);
      return true; // Return true for demo purposes
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    updateProfile,
    updatePassword,
    updatePreferences,
    fetchUser,
  };
}
