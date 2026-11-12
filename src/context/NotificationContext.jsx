import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import notificationService from "../services/notificationService";
import { toast } from "react-hot-toast";
import { Bell, Package, CheckCircle, AlertTriangle, Tag, Sparkles } from "lucide-react";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  );

  // Load preferences
  useEffect(() => {
    let isMounted = true;
    notificationService.getPreferences(user?.uid).then((prefs) => {
      if (isMounted) setPreferences(prefs);
    });
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Subscribe to real-time notifications
  useEffect(() => {
    setLoading(true);
    const userId = user?.uid || "guest";

    const unsubscribe = notificationService.subscribeUserNotifications(
      userId,
      (items) => {
        setNotifications(items);
        const unread = items.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
        setLoading(false);
      }
    );

    // Listen to local notifications updated event
    const handleLocalUpdate = () => {
      const items = notificationService.getLocalNotifications(userId);
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.isRead).length);
    };

    // Listen for newly arrived notifications for in-app toast
    const handleNewNotif = (e) => {
      const notif = e.detail;
      if (!notif) return;

      // Show toast if in-app toasts are enabled
      if (preferences?.inAppToasts !== false) {
        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? "animate-enter" : "animate-leave"
                } max-w-md w-full bg-[#18181b] border border-emerald-500/40 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 text-white cursor-pointer hover:border-emerald-500 transition-all`}
              onClick={() => {
                toast.dismiss(t.id);
                if (notif.deepLink) {
                  window.location.href = notif.deepLink;
                }
              }}
            >
              <div className="flex-1 w-0">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    {notif.category === "orders" ? (
                      <Package className="h-6 w-6 text-emerald-400" />
                    ) : notif.category === "payments" ? (
                      <CheckCircle className="h-6 w-6 text-blue-400" />
                    ) : notif.category === "offers" ? (
                      <Sparkles className="h-6 w-6 text-amber-400" />
                    ) : (
                      <Bell className="h-6 w-6 text-emerald-400" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {notif.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-300 line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-zinc-700 pl-3 ml-3 items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-1 flex items-center justify-center text-xs font-medium text-emerald-400 hover:text-emerald-300 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          { duration: 4000 }
        );
      }
    };

    window.addEventListener("notificationsUpdated", handleLocalUpdate);
    window.addEventListener("newNotificationReceived", handleNewNotif);

    return () => {
      unsubscribe();
      window.removeEventListener("notificationsUpdated", handleLocalUpdate);
      window.removeEventListener("newNotificationReceived", handleNewNotif);
    };
  }, [user, preferences]);

  const markAsRead = useCallback(
    async (notificationId) => {
      await notificationService.markAsRead(notificationId, user?.uid || "guest");
    },
    [user]
  );

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead(user?.uid || "guest");
    toast.success("All notifications marked as read");
  }, [user]);

  const deleteNotification = useCallback(
    async (notificationId) => {
      await notificationService.deleteNotification(
        notificationId,
        user?.uid || "guest"
      );
      toast.success("Notification removed");
    },
    [user]
  );

  const clearAllNotifications = useCallback(async () => {
    await notificationService.clearAllNotifications(user?.uid || "guest");
    toast.success("All notifications cleared");
  }, [user]);

  const updatePreferences = useCallback(
    async (newPrefs) => {
      const saved = await notificationService.savePreferences(
        user?.uid || "guest",
        newPrefs
      );
      setPreferences(saved);
      toast.success("Preferences updated successfully");
      return saved;
    },
    [user]
  );

  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
    if (granted) {
      toast.success("Push notifications enabled!");
    } else {
      toast.error("Notification permission denied or dismissed");
    }
    return granted;
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    preferences,
    permissionStatus,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    requestPermission,
    service: notificationService
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
export default NotificationContext;