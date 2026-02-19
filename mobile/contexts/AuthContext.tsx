import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/api';
import { notificationService } from '../src/services/notificationService';

type User = {
  user_id: string | number;
  email: string;
  full_name?: string;
  role?: string;
  role_id?: number;
  hostel_id?: number;
  hostel_name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error: any; user?: User }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initializing auth state from storage
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (identifier: string, password: string) => {
    try {
      console.log('Mobile - Attempting Login:', identifier);
      const response = await api.post('/auth/login', { identifier, password });

      // Extract data with maximum flexibility
      const contentType = response.headers['content-type'];
      if (contentType && !contentType.includes('application/json')) {
        console.warn('Mobile - Received HTML instead of JSON. Check backend port.');
        return { error: 'Server configuration error: Received HTML instead of JSON.' };
      }

      const body = response.data;
      const token = body?.token || body?.data?.token || body?.accessToken;
      const userData = body?.user || body?.data?.user || body?.profile;

      if (response.status === 200 && token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const finalUser = userData || { email: identifier, user_id: 'unknown' };
        setUser(finalUser);

        // Persist data
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(finalUser));


        console.log('Mobile - Login Success');

        // Register for push notifications
        try {
          const pushToken = await notificationService.registerForPushNotificationsAsync();
          if (pushToken) {
            await notificationService.sendTokenToBackend(pushToken);
          }
        } catch (e) {
          console.error('Notification setup failed:', e);
        }

        return { error: null, user: userData };

      } else {
        const errorMessage = body?.error || body?.message || 'Authentication failed.';
        console.warn('Mobile - Login Rejected:', errorMessage);
        return { error: errorMessage };
      }
    } catch (error: any) {
      console.error('Mobile - Request Failed:', error.message);
      const targetUrl = api.defaults.baseURL;
      const errorMessage = error.response?.data?.error || error.response?.data?.message || `Cannot reach server at ${targetUrl}. Check WiFi/Firewall.`;
      return { error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      const pushToken = await notificationService.registerForPushNotificationsAsync();
      if (pushToken) {
        await notificationService.removeTokenFromBackend(pushToken);
      }

      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      await AsyncStorage.multiRemove(['token', 'user']);
    } catch (e) {
      console.error('Error signing out', e);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
