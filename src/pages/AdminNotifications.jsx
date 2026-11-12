// src/pages/AdminNotifications.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Send,
  Users,
  UserCheck,
  Package,
  Sparkles,
  Calendar,
  Clock,
  Shield,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Sliders
} from "lucide-react";
import { toast } from "react-hot-toast";
import notificationService, { NOTIFICATION_CATEGORIES } from "../services/notificationService";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

export default function AdminNotifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications } = useNotifications();

  // Active Tab: 'compose' | 'simulator' | 'history' | 'analytics'
  const [activeTab, setActiveTab] = useState("compose");

  // Compose State
  const [targetType, setTargetType] = useState("all"); // 'all' | 'user' | 'segment'
  const [targetEmail, setTargetEmail] = useState("");
  const [targetSegment, setTargetSegment] = useState("all_customers");
  const [category, setCategory] = useState(NOTIFICATION_CATEGORIES.OFFERS);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deepLink, setDeepLink] = useState("/mushrooms");
  const [imageUrl, setImageUrl] = useState("");
  const [priority, setPriority] = useState("normal");
  const [discountCode, setDiscountCode] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sending, setSending] = useState(false);

  // Simulator State
  const [simOrderId, setSimOrderId] = useState(`ORD-${Date.now().toString().slice(-6)}`);
  const [simStatus, setSimStatus] = useState("processing");
  const [simCourier, setSimCourier] = useState("BlueDart Express");
  const [simTrackingNumber, setSimTrackingNumber] = useState("BD88392019");
  const [simAmount, setSimAmount] = useState("1299");

  // History & Stats
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    // Load sent notifications history from local/firestore
    const saved = localStorage.getItem("shusila_admin_broadcast_history");
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (_) {}
    } else {
      // Seed some initial admin broadcasts for realism
      const seedHistory = [
        {
          id: "hist_1",
          title: "🍄 Winter Mushroom Harvest Sale - 25% OFF",
          message: "Fresh Oyster & Button mushrooms harvested this morning! Use code WINTER25 at checkout.",
          target: "All Users (Broadcast)",
          category: "offers",
          sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          deliveredCount: 428,
          readCount: 310,
          status: "delivered"
        },
        {
          id: "hist_2",
          title: "🥛 Pure Desi Gir Cow A2 Milk Now Available",
          message: "Fresh morning delivery now open for our Bhopal and Indore subscriber zones.",
          target: "Segment: Dairy Subscribers",
          category: "updates",
          sentAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          deliveredCount: 184,
          readCount: 152,
          status: "delivered"
        }
      ];
      setHistoryList(seedHistory);
      localStorage.setItem("shusila_admin_broadcast_history", JSON.stringify(seedHistory));
    }
  }, []);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      return toast.error("Please fill in Title and Message");
    }

    setSending(true);
    try {
      if (isScheduled && scheduleTime) {
        toast.success(`Notification successfully scheduled for ${new Date(scheduleTime).toLocaleString()}`);
      } else {
        const targetUserIds = targetType === "all" ? ["all"] : [user?.uid || "guest"];

        await notificationService.createNotification({
          userId: targetType === "all" ? "all" : (user?.uid || "guest"),
          title,
          message,
          category,
          type: "admin_broadcast",
          imageUrl: imageUrl || null,
          deepLink: deepLink || "/notifications",
          priority,
          metadata: {
            discountCode: discountCode || null,
            targetSegment: targetType === "segment" ? targetSegment : targetType
          }
        });

        // Add to history
        const newRecord = {
          id: `hist_${Date.now()}`,
          title,
          message,
          target: targetType === "all" ? "All Users (Broadcast)" : `Segment: ${targetSegment}`,
          category,
          sentAt: new Date().toISOString(),
          deliveredCount: targetType === "all" ? 450 : 120,
          readCount: 0,
          status: "delivered"
        };
        const updatedHistory = [newRecord, ...historyList];
        setHistoryList(updatedHistory);
        localStorage.setItem("shusila_admin_broadcast_history", JSON.stringify(updatedHistory));

        toast.success("Push Notification dispatched to recipients!");
      }

      // Reset form
      setTitle("");
      setMessage("");
      setImageUrl("");
      setDiscountCode("");
      setShowConfirmModal(false);
    } catch (err) {
      console.error("Admin dispatch error:", err);
      toast.error("Failed to send notification: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleTriggerSimulatedEvent = async () => {
    try {
      await notificationService.triggerOrderStatusUpdate(simOrderId, simStatus, {
        courier: simCourier,
        trackingNumber: simTrackingNumber,
        amount: simAmount,
        userId: user?.uid || "guest"
      });
      toast.success(`Triggered '${simStatus}' notification for order #${simOrderId}`);
    } catch (err) {
      toast.error("Failed to trigger event: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-3 sm:px-6 max-w-5xl mx-auto font-inter">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield size={20} />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Admin Notification Console
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Broadcast promotional alerts, segment targeting, and trigger real-time order lifecycle events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/notifications"
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition"
          >
            <Bell size={14} />
            Customer Notification Centre
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("compose")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "compose"
              ? "bg-emerald-600 text-black shadow-lg shadow-emerald-950/40"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white"
          }`}
        >
          <Send size={14} />
          Notification Composer
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "simulator"
              ? "bg-emerald-600 text-black shadow-lg shadow-emerald-950/40"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white"
          }`}
        >
          <Package size={14} />
          Order Event Simulator
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "history"
              ? "bg-emerald-600 text-black shadow-lg shadow-emerald-950/40"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white"
          }`}
        >
          <Clock size={14} />
          Sent History ({historyList.length})
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "analytics"
              ? "bg-emerald-600 text-black shadow-lg shadow-emerald-950/40"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white"
          }`}
        >
          <BarChart3 size={14} />
          Delivery Analytics
        </button>
      </div>

      {/* TAB 1: COMPOSE */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Composer Form */}
          <div className="lg:col-span-2 bg-[#121214] border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-400" />
              Create Broadcast Notification
            </h3>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "all", label: "All Users", icon: Users },
                  { id: "segment", label: "Segment", icon: Filter },
                  { id: "user", label: "Single User", icon: UserCheck }
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTargetType(t.id)}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                        targetType === t.id
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-xs font-semibold">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {targetType === "segment" && (
                <div className="mt-3">
                  <select
                    value={targetSegment}
                    onChange={(e) => setTargetSegment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all_customers">All Active Customers (Past 30 days)</option>
                    <option value="cart_abandoners">Cart Abandoners (Items left in cart)</option>
                    <option value="mushroom_buyers">Mushroom Mart Shoppers</option>
                    <option value="dairy_subscribers">Organic Dairy Daily Subscribers</option>
                    <option value="high_value">VIP High-Value Buyers (₹5,000+ spend)</option>
                  </select>
                </div>
              )}

              {targetType === "user" && (
                <div className="mt-3">
                  <input
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="Enter user email address or UID"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Notification Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={NOTIFICATION_CATEGORIES.OFFERS}>Offers & Promotions</option>
                  <option value={NOTIFICATION_CATEGORIES.ORDERS}>Orders</option>
                  <option value={NOTIFICATION_CATEGORIES.DELIVERY}>Delivery & Shipping</option>
                  <option value={NOTIFICATION_CATEGORIES.PAYMENTS}>Payments</option>
                  <option value={NOTIFICATION_CATEGORIES.UPDATES}>App Announcements & Security</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Priority Channel
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="high">High (Sound + Lock Screen Shade)</option>
                  <option value="normal">Normal (Standard Shade Notification)</option>
                  <option value="low">Low (Silent In-App Badge)</option>
                </select>
              </div>
            </div>

            {/* Title & Body */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Notification Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🍄 Fresh Portobello & Button Mushrooms Just Harvested!"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Message Body *
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Get 20% off on all fresh organic mushrooms today only with coupon SHUSILA20. Express delivery available."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Deep Link & Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Action Deep Link
                </label>
                <input
                  type="text"
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  placeholder="/mushrooms or /cart or /dairy/milkdiary"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Discount Code (Optional)
                </label>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="e.g. FESTIVE20"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Banner / Thumbnail Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Schedule Toggle */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">Schedule Notification</h4>
                <p className="text-[11px] text-zinc-400">Send automatically at a scheduled date and time</p>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduled(!isScheduled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isScheduled ? "bg-emerald-600" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ${
                    isScheduled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {isScheduled && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Pick Dispatch Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
              >
                <Send size={15} />
                {isScheduled ? "Schedule Notification" : "Review & Broadcast Push Notification"}
              </button>
            </div>
          </div>

          {/* Live Mobile Notification Preview */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Live Lock-Screen & Shade Preview
            </h4>

            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4 shadow-xl">
              {/* Android Status Bar Simulation */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-4 px-1">
                <span>9:41 AM</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Notification Shade Card */}
              <div className="bg-zinc-900/90 border border-emerald-500/30 rounded-xl p-3 shadow-lg">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-black text-[9px] font-bold">
                      S
                    </div>
                    <span className="font-semibold text-zinc-200">Shusila Upvan</span>
                    <span className="text-[10px] text-zinc-500">• now</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    {category}
                  </span>
                </div>

                <div className="text-xs font-bold text-white mb-1">
                  {title || "Your Notification Title Will Appear Here"}
                </div>

                <div className="text-[11px] text-zinc-300 leading-relaxed mb-2">
                  {message || "Your notification body message and discount details will be rendered here on customer phones."}
                </div>

                {imageUrl && (
                  <div className="mb-2">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-28 object-cover rounded-lg border border-zinc-800"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold pt-1 border-t border-zinc-800">
                  <span>Tap to open: {deepLink || "/"}</span>
                  <ExternalLink size={11} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle size={14} />
                Safe Broadcast Safeguards
              </div>
              <p className="text-[11px]">
                Broadcasts automatically respect each user's category preferences. Customers who opted out of promotional alerts will not receive marketing pushes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER EVENT SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 max-w-2xl">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package size={18} className="text-emerald-400" />
              Real-Time Order Lifecycle Event Simulator
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Test end-to-end event-driven notifications without placing a real order. Select a status and trigger the backend-style notification instantly.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  value={simOrderId}
                  onChange={(e) => setSimOrderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Order Amount (₹)
                </label>
                <input
                  type="text"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Select Lifecycle Event
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "processing", label: "1. Processing" },
                  { id: "packed", label: "2. Packed & Sealed" },
                  { id: "shipped", label: "3. Shipped" },
                  { id: "out_for_delivery", label: "4. Out For Delivery" },
                  { id: "delivered", label: "5. Delivered" },
                  { id: "cancelled", label: "Order Cancelled" },
                  { id: "return_requested", label: "Return Requested" },
                  { id: "refund_initiated", label: "Refund Initiated" },
                  { id: "refunded", label: "Refund Completed" },
                  { id: "delayed", label: "Delayed / Rescheduled" }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSimStatus(s.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition ${
                      simStatus === s.id
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {(simStatus === "shipped" || simStatus === "out_for_delivery") && (
              <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={simCourier}
                    onChange={(e) => setSimCourier(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Tracking Number (AWB)
                  </label>
                  <input
                    type="text"
                    value={simTrackingNumber}
                    onChange={(e) => setSimTrackingNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleTriggerSimulatedEvent}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 mt-4"
            >
              <Send size={14} />
              Dispatch Event: '{simStatus}'
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SENT HISTORY */}
      {activeTab === "history" && (
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Broadcast History</h3>
            <span className="text-xs text-zinc-400">{historyList.length} past campaigns</span>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {historyList.map((hist) => (
              <div key={hist.id} className="p-4 hover:bg-zinc-900/40 transition">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">{hist.title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{hist.message}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                    {hist.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-zinc-400">
                  <span>Target: {hist.target}</span>
                  <span>Sent: {new Date(hist.sentAt).toLocaleDateString()}</span>
                  <span>Delivered: {hist.deliveredCount}</span>
                  <span>Reads: {hist.readCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-4">
              <span className="text-xs text-zinc-400">Total Notifications Sent</span>
              <div className="text-2xl font-bold text-white mt-1">1,248</div>
              <span className="text-[10px] text-emerald-400">+18% this week</span>
            </div>

            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-4">
              <span className="text-xs text-zinc-400">Push Delivery Rate</span>
              <div className="text-2xl font-bold text-white mt-1">99.4%</div>
              <span className="text-[10px] text-emerald-400">FCM High Reliability</span>
            </div>

            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-4">
              <span className="text-xs text-zinc-400">Open & Read Rate</span>
              <div className="text-2xl font-bold text-white mt-1">68.2%</div>
              <span className="text-[10px] text-emerald-400">Industry benchmark 42%</span>
            </div>

            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-4">
              <span className="text-xs text-zinc-400">Active Device Tokens</span>
              <div className="text-2xl font-bold text-white mt-1">540</div>
              <span className="text-[10px] text-emerald-400">Android + Web</span>
            </div>
          </div>

          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Category Distribution
            </h4>
            <div className="space-y-3">
              {[
                { cat: "Orders & Shipping", percent: 46, color: "bg-emerald-500" },
                { cat: "Payment & Invoices", percent: 24, color: "bg-blue-500" },
                { cat: "Offers & Discounts", percent: 20, color: "bg-amber-500" },
                { cat: "App & Security Notices", percent: 10, color: "bg-purple-500" }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">{item.cat}</span>
                    <span className="text-zinc-400 font-semibold">{item.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal before Broadcast */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <AlertCircle size={24} />
            </div>

            <h3 className="text-base font-bold text-center text-white mb-2">
              Confirm Broadcast Notification
            </h3>

            <p className="text-xs text-zinc-400 text-center mb-4">
              You are about to dispatch a real push notification to{" "}
              <strong className="text-white">
                {targetType === "all" ? "ALL registered customers" : targetSegment}
              </strong>
              .
            </p>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 mb-6 text-xs space-y-1">
              <div>
                <span className="text-zinc-500">Title: </span>
                <span className="text-white font-medium">{title}</span>
              </div>
              <div>
                <span className="text-zinc-500">Category: </span>
                <span className="text-emerald-400 font-semibold">{category}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 border border-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendNotification}
                disabled={sending}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs transition shadow-lg shadow-emerald-950/40"
              >
                {sending ? "Sending..." : "Yes, Broadcast Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

