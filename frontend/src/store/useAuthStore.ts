import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  plan: 'FREE' | 'PREMIUM' | 'FAMILY';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { user, token } = data;

    localStorage.setItem('yola_token', token);
    localStorage.setItem('yola_user', JSON.stringify(user));

    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  register: async (email: string, password: string, name: string) => {
    const { data } = await api.post('/auth/register', { email, password, name });
    const { user, token } = data;

    localStorage.setItem('yola_token', token);
    localStorage.setItem('yola_user', JSON.stringify(user));

    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('yola_token');
    localStorage.removeItem('yola_user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem('yola_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const { data } = await api.get('/auth/me');
      set({ user: data.user, token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('yola_token');
      localStorage.removeItem('yola_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (profileData: Partial<User>) => {
    await api.put('/auth/profile', profileData);
    const user = get().user;
    if (user) {
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('yola_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  setUser: (user: User | null) => set({ user }),
}));