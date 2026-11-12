// src/pages/NotificationSettings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Package,
  CreditCard,
  Truck,
  Sparkles,
  Heart,
  ShoppingCart,
  Shield,
  Save,
  CheckCircle,
  Smartphone,
  Sliders,
  Volume2,
  Info
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { DEFAULT_PREFERENCES } from "../services/notificationService";

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { preferences, updatePreferences, permissionStatus, requestPermission } = useNotifications();

  const [settings, setSettings] = useState(DEFAULT_PREFERENCES);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setSettings(preferences);
    }
  }, [preferences]);

  const handleToggle = (key) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(settings);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const preferenceGroups = [
    {
      title: "Transactional Updates",
      description: "Essential updates about your orders, deliveries, and payment status.",
      items: [
        {
          key: "orderUpdates",
          label: "Order Status Updates",
          description: "Order confirmations, packing, shipping, delivery, cancellations & returns.",
          icon: Package,
          essential: true
        },
        {
          key: "paymentUpdates",
          label: "Payment & Refund Notifications",
          description: "Payment confirmations, refunds initiated, completed refunds, and COD alerts.",
          icon: CreditCard,
          essential: true
        },
        {
          key: "deliveryUpdates",
          label: "Live Delivery & Tracking",
          description: "Courier partner details, out for delivery alerts, and rescheduling updates.",
          icon: Truck,
          essential: true
        }
      ]
    },
    {
      title: "Promotions & Shopping Reminders",
      description: "Personalized deals, discounts, and inventory notifications.",
      items: [
        {
          key: "offersPromotions",
          label: "Special Offers & Flash Sales",
          description: "Discounts, festival offers, coupon drops, and seasonal campaigns.",
          icon: Sparkles
        },
        {
          key: "wishlistPriceDrop",
          label: "Price Drop & Back-in-Stock Alerts",
          description: "Get notified when items you viewed or saved drop in price or restock.",
          icon: Heart
        },
        {
          key: "cartReminders",
          label: "Abandoned Cart Reminders",
          description: "Friendly reminders about fresh items left in your shopping cart.",
          icon: ShoppingCart
        }
      ]
    },
    {
      title: "System & Account Notifications",
      description: "Important security and platform notices.",
      items: [
        {
          key: "appAnnouncements",
          label: "Security & Platform Announcements",
          description: "New features, security alerts, login warnings, and terms updates.",
          icon: Shield
        }
      ]
    },
    {
      title: "Delivery Channels",
      description: "Choose how notifications are presented on your device.",
      items: [
        {
          key: "pushNotifications",
          label: "Device Push Notifications",
          description: "Receive push alerts on your lock screen and notification shade.",
          icon: Smartphone
        },
        {
          key: "inAppToasts",
          label: "In-App Notification Banners",
          description: "Show instant banners inside the app while shopping.",
          icon: Volume2
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-3 sm:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Notification Preferences
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Customize alerts to stay informed on what matters most to you
            </p>
          </div>
        </div>

        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs rounded-xl transition shadow-lg shadow-emerald-950/40"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {/* OS Push Permission status */}
      <div className="mb-8 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
            <Smartphone size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">System Push Status</h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  permissionStatus === "granted"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {permissionStatus === "granted" ? "Active" : "Permission Needed"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {permissionStatus === "granted"
                ? "Your browser and mobile device are registered for real-time notifications."
                : "Grant notification permissions in your browser or device settings to receive background alerts."}
            </p>
          </div>
        </div>

        {permissionStatus !== "granted" && (
          <button
            onClick={requestPermission}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs transition whitespace-nowrap"
          >
            Enable
          </button>
        )}
      </div>

      {/* Settings Groups */}
      <div className="space-y-8">
        {preferenceGroups.map((group, gIdx) => (
          <div key={gIdx} className="bg-[#121214] rounded-2xl border border-zinc-800/80 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {group.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {group.description}
              </p>
            </div>

            <div className="space-y-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isChecked = settings[item.key] !== false;

                return (
                  <div
                    key={item.key}
                    className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0 mt-0.5">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-white">
                            {item.label}
                          </h4>
                          {item.essential && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isChecked}
                      onClick={() => handleToggle(item.key)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isChecked ? "bg-emerald-600" : "bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isChecked ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Info Notice */}
      <div className="mt-8 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/60 flex items-start gap-3 text-xs text-zinc-400">
        <Info size={16} className="text-zinc-500 flex-shrink-0 mt-0.5" />
        <p>
          Transactional alerts (order confirmations, delivery tracking, and critical payment notices) ensure timely order fulfillment. Promotional notifications can be freely toggled on or off without affecting your shopping experience.
        </p>
      </div>

      {/* Bottom Sticky Save Bar if Changes Exist */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#18181b] border border-emerald-500/40 rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-4">
          <span className="text-xs text-zinc-300">You have unsaved changes</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs rounded-xl transition"
          >
            {saving ? "Saving..." : "Save Now"}
          </button>
        </div>
      )}
    </div>
  );
}

