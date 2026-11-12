// src/pages/NotificationCentre.jsx
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Package,
  CheckCircle,
  Truck,
  Sparkles,
  Tag,
  CreditCard,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  CheckCheck,
  Filter,
  Search,
  Settings,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  X,
  RefreshCw,
  BellRing
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const CATEGORY_TABS = [
  { id: "all", label: "All", icon: Bell },
  { id: "orders", label: "Orders", icon: Package },
  { id: "offers", label: "Offers", icon: Sparkles },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "updates", label: "Updates", icon: Info }
];

export default function NotificationCentre() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    permissionStatus,
    requestPermission
  } = useNotifications();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [displayCount, setDisplayCount] = useState(15);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Category check
      const matchesTab =
        activeTab === "all" ||
        notif.category?.toLowerCase() === activeTab.toLowerCase();

      // Search query
      const queryLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !queryLower ||
        notif.title?.toLowerCase().includes(queryLower) ||
        notif.message?.toLowerCase().includes(queryLower) ||
        notif.orderId?.toLowerCase().includes(queryLower);

      return matchesTab && matchesSearch;
    });
  }, [notifications, activeTab, searchQuery]);

  // Group notifications by date: Today, Yesterday, Earlier
  const groupedNotifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      today: [],
      yesterday: [],
      earlier: []
    };

    const paginated = filteredNotifications.slice(0, displayCount);

    paginated.forEach((notif) => {
      const d = new Date(notif.createdAt || Date.now());
      d.setHours(0, 0, 0, 0);

      if (d.getTime() === today.getTime()) {
        groups.today.push(notif);
      } else if (d.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notif);
      } else {
        groups.earlier.push(notif);
      }
    });

    return groups;
  }, [filteredNotifications, displayCount]);

  // Helper for icon based on category and type
  const getCategoryIcon = (category, type) => {
    switch (category?.toLowerCase()) {
      case "orders":
        if (type?.includes("delivered")) {
          return <CheckCircle className="text-emerald-400" size={20} />;
        }
        if (type?.includes("cancelled")) {
          return <X className="text-red-400" size={20} />;
        }
        return <Package className="text-emerald-400" size={20} />;

      case "payments":
        if (type?.includes("failed")) {
          return <AlertTriangle className="text-red-400" size={20} />;
        }
        return <CreditCard className="text-blue-400" size={20} />;

      case "offers":
        return <Sparkles className="text-amber-400" size={20} />;

      case "delivery":
        return <Truck className="text-purple-400" size={20} />;

      case "updates":
        return <ShieldCheck className="text-cyan-400" size={20} />;

      default:
        return <Bell className="text-emerald-400" size={20} />;
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category?.toLowerCase()) {
      case "orders":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "payments":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "offers":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "delivery":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "updates":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleCardClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    if (notif.deepLink) {
      if (notif.deepLink.startsWith("http")) {
        window.open(notif.deepLink, "_blank");
      } else {
        navigate(notif.deepLink);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 px-3 sm:px-6 max-w-4xl mx-auto">
      {/* Top Banner for Permission (if not granted) */}
      {permissionStatus !== "granted" && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BellRing size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Enable Instant Push Alerts
              </h4>
              <p className="text-xs text-zinc-400">
                Get real-time updates on orders, live delivery tracking, and flash sales.
              </p>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs rounded-xl transition shadow-lg shadow-emerald-900/30 whitespace-nowrap self-start sm:self-center"
          >
            Allow Notifications
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-black animate-pulse">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live updates for your orders, deliveries, payments, and discounts
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1.5 transition"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 transition"
              title="Clear all notifications"
            >
              <Trash2 size={16} />
            </button>
          )}

          <Link
            to="/notification-settings"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
            title="Notification Settings"
          >
            <Settings size={16} />
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const tabCount =
            tab.id === "all"
              ? notifications.length
              : notifications.filter(
                  (n) => n.category?.toLowerCase() === tab.id
                ).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                isActive
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm"
                  : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tabCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-emerald-500 text-black font-bold"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order ID, title, keyword..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="p-12 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="opacity-80" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            No Notifications Here
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
            {searchQuery
              ? "No notifications matching your search filter."
              : activeTab === "all"
              ? "You're all caught up! Updates regarding your orders, shipping, and special offers will show up here."
              : `No updates currently under the ${activeTab} category.`}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/mushrooms"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs rounded-xl transition"
            >
              Shop Mushrooms
            </Link>
            <Link
              to="/dairy/milkdiary"
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs rounded-xl transition"
            >
              Explore Dairy
            </Link>
          </div>
        </div>
      )}

      {/* Notification Groups */}
      <div className="space-y-6">
        {/* Today */}
        {groupedNotifications.today.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">
              Today
            </h3>
            <div className="space-y-3">
              {groupedNotifications.today.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  notif={notif}
                  onCardClick={() => handleCardClick(notif)}
                  onMarkRead={() => markAsRead(notif.id)}
                  onDelete={() => deleteNotification(notif.id)}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryBadgeColor={getCategoryBadgeColor}
                  formatRelativeTime={formatRelativeTime}
                />
              ))}
            </div>
          </div>
        )}

        {/* Yesterday */}
        {groupedNotifications.yesterday.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">
              Yesterday
            </h3>
            <div className="space-y-3">
              {groupedNotifications.yesterday.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  notif={notif}
                  onCardClick={() => handleCardClick(notif)}
                  onMarkRead={() => markAsRead(notif.id)}
                  onDelete={() => deleteNotification(notif.id)}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryBadgeColor={getCategoryBadgeColor}
                  formatRelativeTime={formatRelativeTime}
                />
              ))}
            </div>
          </div>
        )}

        {/* Earlier */}
        {groupedNotifications.earlier.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">
              Earlier
            </h3>
            <div className="space-y-3">
              {groupedNotifications.earlier.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  notif={notif}
                  onCardClick={() => handleCardClick(notif)}
                  onMarkRead={() => markAsRead(notif.id)}
                  onDelete={() => deleteNotification(notif.id)}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryBadgeColor={getCategoryBadgeColor}
                  formatRelativeTime={formatRelativeTime}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pagination Load More */}
        {filteredNotifications.length > displayCount && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayCount((prev) => prev + 15)}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition"
            >
              Load Older Notifications ({filteredNotifications.length - displayCount} more)
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clear All */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-center text-white mb-2">
              Clear All Notifications?
            </h3>
            <p className="text-xs text-zinc-400 text-center mb-6">
              This will permanently delete all your notification history. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllNotifications();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition shadow-lg shadow-red-950/40"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Notification Card Sub-component
function NotificationCard({
  notif,
  onCardClick,
  onMarkRead,
  onDelete,
  getCategoryIcon,
  getCategoryBadgeColor,
  formatRelativeTime
}) {
  const isUnread = !notif.isRead;

  return (
    <div
      onClick={onCardClick}
      className={`group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
        isUnread
          ? "bg-[#141416] border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/20"
          : "bg-[#0f0f10] border-zinc-800/80 hover:border-zinc-700 opacity-90 hover:opacity-100"
      }`}
    >
      {/* Unread indicator glow dot */}
      {isUnread && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
      )}

      <div className="flex items-start gap-3.5">
        {/* Category Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${getCategoryBadgeColor(
            notif.category
          )}`}
        >
          {getCategoryIcon(notif.category, notif.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadgeColor(
                notif.category
              )}`}
            >
              {notif.category || "General"}
            </span>

            {notif.orderId && (
              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                #{notif.orderId}
              </span>
            )}

            <span className="text-[11px] text-zinc-500 flex items-center gap-1 ml-auto">
              <Clock size={11} />
              {formatRelativeTime(notif.createdAt)}
            </span>
          </div>

          <h4
            className={`text-sm mb-1 line-clamp-1 ${
              isUnread ? "font-bold text-white" : "font-medium text-zinc-300"
            }`}
          >
            {notif.title}
          </h4>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {notif.message}
          </p>

          {/* Optional Image Preview thumbnail */}
          {notif.imageUrl && (
            <div className="mb-3">
              <img
                src={notif.imageUrl}
                alt="Notification attachment"
                className="w-16 h-16 rounded-xl object-cover border border-zinc-800 bg-zinc-900"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Card Footer / Action Links */}
          <div className="flex items-center justify-between pt-1">
            {notif.deepLink ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition">
                {notif.category === "orders"
                  ? "Track Order"
                  : notif.category === "payments"
                  ? "View Payment Details"
                  : notif.category === "offers"
                  ? "View Offer"
                  : "View Details"}
                <ChevronRight size={13} />
              </span>
            ) : (
              <span />
            )}

            {/* Quick Action Buttons */}
            <div
              className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition"
              onClick={(e) => e.stopPropagation()}
            >
              {isUnread && (
                <button
                  onClick={onMarkRead}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-emerald-400 text-xs transition"
                  title="Mark as read"
                >
                  <CheckCheck size={13} />
                </button>
              )}

              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 text-xs transition"
                title="Delete notification"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

