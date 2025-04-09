import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  } | null;
  setAuth: (isAuthenticated: boolean, user: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setAuth: (isAuthenticated, user) => set({ isAuthenticated, user }),
  clearAuth: () => set({ isAuthenticated: false, user: null }),
}));

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: true }),
}));

interface NotificationState {
  notifications: any[];
  unreadCount: number;
  setNotifications: (notifications: any[]) => void;
  addNotification: (notification: any) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => 
    set({ 
      notifications, 
      unreadCount: notifications.filter(n => !n.readBy?.includes(localStorage.getItem('userId'))).length 
    }),
  addNotification: (notification) => 
    set((state) => ({ 
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    })),
  markAsRead: (id) => 
    set((state) => ({
      notifications: state.notifications.map(n => 
        n._id === id ? { ...n, readBy: [...(n.readBy || []), localStorage.getItem('userId')] } : n
      ),
      unreadCount: state.unreadCount - 1
    })),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
