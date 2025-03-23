"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Notification } from "@/types";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch notifications from API
      const fetchNotifications = async () => {
        try {
          const response = await fetch(
            `/api/notifications?userId=${session.user.id}`
          );
          const data = await response.json();
          setNotifications(data);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      };

      fetchNotifications();

      // Set up WebSocket or polling for real-time notifications
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

      return () => clearInterval(interval);
    }
  }, [session]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    toast.success(notification.message);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
