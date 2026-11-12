// src/services/notificationService.js
/**
 * Complete Real-Time E-Commerce Push Notification Service
 * Inspired by Flipkart, Amazon, and Meesho.
 * Supports Firestore persistence, real-time listeners, web notifications,
 * and Flutter native bridge messaging.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { db, auth } from "../firebase";

// Category definitions matching e-commerce standards
export const NOTIFICATION_CATEGORIES = {
  ORDERS: "orders",
  PAYMENTS: "payments",
  OFFERS: "offers",
  DELIVERY: "delivery",
  UPDATES: "updates",
  OTHER: "other"
};

// Default Notification Preferences
export const DEFAULT_PREFERENCES = {
  orderUpdates: true,        // Order confirmation, processing, packed, shipped, delivered, cancelled
  paymentUpdates: true,      // Payment successful, failed, pending, refunds
  deliveryUpdates: true,     // Courier tracking, out for delivery, rescheduling
  offersPromotions: true,    // Flash sales, discount codes, festive deals
  wishlistPriceDrop: true,   // Price drop on viewed/wishlist items, back in stock
  cartReminders: true,       // Cart abandonment reminders
  appAnnouncements: true,    // New features, security alerts, policy updates
  pushNotifications: true,   // System push alerts
  inAppToasts: true          // Foreground in-app notification toasts
};

// Local storage key for offline fallback
const LOCAL_STORAGE_KEY = "shusila_notifications_";
const LOCAL_PREFS_KEY = "shusila_notification_prefs_";

class NotificationService {
  constructor() {
    this.listeners = new Map();
    this.fcmToken = null;
    this.isFlutterApp = typeof window !== "undefined" && !!window.FlutterBridge;
    this.initFlutterBridge();
  }

  /**
   * Initialize bridge communication with the Flutter Android/iOS WebView container
   */
  initFlutterBridge() {
    if (typeof window === "undefined") return;

    // Listen for custom token messages from Flutter
    window.addEventListener("flutterFCMTokenReceived", (e) => {
      if (e.detail?.token) {
        this.fcmToken = e.detail.token;
        this.saveDeviceToken(e.detail.token, "flutter_mobile");
      }
    });

    // Listen for notification taps inside Flutter
    window.addEventListener("flutterNotificationTapped", (e) => {
      const deepLink = e.detail?.deepLink;
      if (deepLink) {
        window.location.href = deepLink;
      }
    });
  }

  /**
   * Request push notification permission in browser or Flutter container
   */
  async requestPermission() {
    if (typeof window === "undefined") return false;

    // If inside Flutter mobile app, request through native bridge
    if (window.FlutterBridge) {
      try {
        window.FlutterBridge.postMessage(JSON.stringify({ action: "REQUEST_PUSH_PERMISSION" }));
        return true;
      } catch (err) {
        console.warn("Flutter bridge permission error:", err);
      }
    }

    // Standard Web Notification API
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      } catch (e) {
        console.warn("Web Notification permission error:", e);
        return false;
      }
    }

    return false;
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId) {
    if (!userId) {
      const stored = localStorage.getItem(`${LOCAL_PREFS_KEY}guest`);
      return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
    }

    try {
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data().notificationPreferences) {
        return { ...DEFAULT_PREFERENCES, ...snap.data().notificationPreferences };
      }
    } catch (err) {
      console.warn("Error reading preferences from Firestore:", err);
    }

    const local = localStorage.getItem(`${LOCAL_PREFS_KEY}${userId}`);
    return local ? JSON.parse(local) : DEFAULT_PREFERENCES;
  }

  /**
   * Save user notification preferences
   */
  async savePreferences(userId, prefs) {
    const updated = { ...DEFAULT_PREFERENCES, ...prefs };
    if (!userId) {
      localStorage.setItem(`${LOCAL_PREFS_KEY}guest`, JSON.stringify(updated));
      return updated;
    }

    localStorage.setItem(`${LOCAL_PREFS_KEY}${userId}`, JSON.stringify(updated));

    try {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { notificationPreferences: updated }, { merge: true });
    } catch (err) {
      console.warn("Error saving preferences to Firestore:", err);
    }

    return updated;
  }

  /**
   * Check if category should be sent according to user preferences
   */
  shouldDeliverCategory(category, prefs) {
    if (!prefs) return true;
    switch (category) {
      case NOTIFICATION_CATEGORIES.ORDERS:
        return prefs.orderUpdates !== false;
      case NOTIFICATION_CATEGORIES.PAYMENTS:
        return prefs.paymentUpdates !== false;
      case NOTIFICATION_CATEGORIES.DELIVERY:
        return prefs.deliveryUpdates !== false;
      case NOTIFICATION_CATEGORIES.OFFERS:
        return prefs.offersPromotions !== false;
      case NOTIFICATION_CATEGORIES.UPDATES:
        return prefs.appAnnouncements !== false;
      case NOTIFICATION_CATEGORIES.OTHER:
        return prefs.cartReminders !== false || prefs.wishlistPriceDrop !== false;
      default:
        return true;
    }
  }

  /**
   * Core method to generate and save a notification
   */
  async createNotification({
    userId,
    title,
    message,
    category = NOTIFICATION_CATEGORIES.ORDERS,
    type = "general",
    orderId = null,
    productId = null,
    imageUrl = null,
    deepLink = "/notifications",
    priority = "normal",
    metadata = {}
  }) {
    if (!title || !message) {
      throw new Error("Title and message are required for notifications");
    }

    // Determine target user
    const targetUserId = userId || auth.currentUser?.uid || "guest";

    // Check user preferences
    const prefs = await this.getPreferences(targetUserId);
    if (!this.shouldDeliverCategory(category, prefs)) {
      console.log(`Notification of category '${category}' skipped per user preferences.`);
      return null;
    }

    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const notificationPayload = {
      id: notifId,
      userId: targetUserId,
      title,
      message,
      category,
      type,
      orderId,
      productId,
      imageUrl,
      deepLink,
      priority,
      metadata,
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      channelId: `${category}_channel`,
      deliveryStatus: "sent"
    };

    // 1. Save to Firestore
    let firestoreSaved = false;
    try {
      const notifRef = doc(db, "notifications", notifId);
      await setDoc(notifRef, {
        ...notificationPayload,
        serverTimestamp: serverTimestamp()
      });
      firestoreSaved = true;
    } catch (err) {
      console.warn("Could not save to Firestore, using offline fallback:", err);
    }

    // 2. LocalStorage persistence (resilience fallback)
    try {
      const key = `${LOCAL_STORAGE_KEY}${targetUserId}`;
      const existingRaw = localStorage.getItem(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [notificationPayload, ...existing].slice(0, 100); // keep last 100
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage error:", e);
    }

    // 3. Dispatch in-app UI event for instant reactive badge and toast
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("newNotificationReceived", {
          detail: notificationPayload
        })
      );
    }

    // 4. Send to Flutter Mobile Bridge if app is running in WebView
    if (typeof window !== "undefined" && window.FlutterBridge) {
      try {
        window.FlutterBridge.postMessage(
          JSON.stringify({
            action: "SHOW_NOTIFICATION",
            payload: notificationPayload
          })
        );
      } catch (err) {
        console.warn("Flutter Bridge notification error:", err);
      }
    }

    // 5. Send Web Push Notification if browser allows
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const notifOptions = {
          body: message,
          icon: imageUrl || "/logo.svg",
          badge: "/logo.svg",
          tag: notifId,
          data: { deepLink, id: notifId },
          renotify: true
        };

        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "PUSH_NOTIFICATION",
            title,
            options: notifOptions
          });
        } else {
          const webNotif = new Notification(title, notifOptions);
          webNotif.onclick = () => {
            window.focus();
            if (deepLink) window.location.href = deepLink;
            webNotif.close();
          };
        }
      } catch (e) {
        console.warn("Web notification show error:", e);
      }
    }

    return notificationPayload;
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribeUserNotifications(userId, callback) {
    if (!userId) {
      // Offline fallback
      const local = this.getLocalNotifications("guest");
      callback(local);
      return () => {};
    }

    try {
      const notifsRef = collection(db, "notifications");
      const q = query(
        notifsRef,
        where("userId", "in", [userId, "all"]),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data());
          });
          // Sort descending by createdAt
          items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          callback(items);
        },
        (error) => {
          console.warn("Firestore snapshot error, falling back to local:", error);
          const local = this.getLocalNotifications(userId);
          callback(local);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn("Failed to attach Firestore listener, using local:", err);
      const local = this.getLocalNotifications(userId);
      callback(local);
      return () => {};
    }
  }

  /**
   * Get notifications from LocalStorage
   */
  getLocalNotifications(userId = "guest") {
    try {
      const key = `${LOCAL_STORAGE_KEY}${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const list = JSON.parse(stored);
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } catch (_) {}
    return [];
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId, userId = "guest") {
    // 1. Update Firestore
    try {
      const notifRef = doc(db, "notifications", notificationId);
      await updateDoc(notifRef, {
        isRead: true,
        readAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore markAsRead error:", err);
    }

    // 2. Update LocalStorage
    try {
      const key = `${LOCAL_STORAGE_KEY}${userId}`;
      const existing = this.getLocalNotifications(userId);
      const updated = existing.map((n) =>
        n.id === notificationId
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      );
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error("Local markAsRead error:", e);
    }

    // Dispatch update event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notificationsUpdated"));
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId = "guest") {
    // 1. Update Firestore batch if available
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "in", [userId, "all"]),
        where("isRead", "==", false)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.update(d.ref, { isRead: true, readAt: new Date().toISOString() });
      });
      await batch.commit();
    } catch (err) {
      console.warn("Firestore markAllAsRead error:", err);
    }

    // 2. Update LocalStorage
    try {
      const key = `${LOCAL_STORAGE_KEY}${userId}`;
      const existing = this.getLocalNotifications(userId);
      const updated = existing.map((n) => ({
        ...n,
        isRead: true,
        readAt: new Date().toISOString()
      }));
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error("Local markAllAsRead error:", e);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notificationsUpdated"));
    }
  }

  /**
   * Delete single notification
   */
  async deleteNotification(notificationId, userId = "guest") {
    try {
      const notifRef = doc(db, "notifications", notificationId);
      await deleteDoc(notifRef);
    } catch (err) {
      console.warn("Firestore deleteNotification error:", err);
    }

    try {
      const key = `${LOCAL_STORAGE_KEY}${userId}`;
      const existing = this.getLocalNotifications(userId);
      const updated = existing.filter((n) => n.id !== notificationId);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error("Local deleteNotification error:", e);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notificationsUpdated"));
    }
  }

  /**
   * Clear all notifications for user
   */
  async clearAllNotifications(userId = "guest") {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (err) {
      console.warn("Firestore clearAll error:", err);
    }

    try {
      const key = `${LOCAL_STORAGE_KEY}${userId}`;
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Local clearAll error:", e);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notificationsUpdated"));
    }
  }

  /**
   * Save device FCM token
   */
  async saveDeviceToken(token, platform = "web") {
    const user = auth.currentUser;
    if (!user || !token) return;

    try {
      const tokenDocRef = doc(db, "users", user.uid, "devices", token);
      await setDoc(tokenDocRef, {
        token,
        platform,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("Error saving device token:", err);
    }
  }

  // ============================================================
  // BUSINESS EVENT TRIGGERS (Automated & Backend-driven)
  // ============================================================

  /**
   * Trigger Order Placed Notification
   */
  async triggerOrderPlaced(order, user) {
    const orderId = order.id || order.orderId;
    const amount = order.totalAmount || order.finalAmount || "0";
    const isCod = (order.paymentMethod || "").toLowerCase().includes("cash");

    // 1. Order Placed Notification
    await this.createNotification({
      userId: user?.uid,
      title: "🎉 Order Successfully Placed!",
      message: `Your order #${orderId} for ₹${amount} has been received and is being processed with fresh farm stock.`,
      category: NOTIFICATION_CATEGORIES.ORDERS,
      type: "order_placed",
      orderId,
      deepLink: `/orders?id=${orderId}`,
      imageUrl: order.product?.image || order.items?.[0]?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      priority: "high",
      metadata: { orderId, amount }
    });

    // 2. Payment confirmation or COD notification
    if (isCod) {
      await this.createNotification({
        userId: user?.uid,
        title: "💵 Cash on Delivery Confirmed",
        message: `Order #${orderId} is confirmed for Cash on Delivery. Please keep ₹${amount} ready at the time of delivery.`,
        category: NOTIFICATION_CATEGORIES.PAYMENTS,
        type: "payment_cod_confirmed",
        orderId,
        deepLink: `/orders?id=${orderId}`,
        priority: "normal",
        metadata: { orderId, amount }
      });
    } else {
      await this.createNotification({
        userId: user?.uid,
        title: "✅ Payment Successful",
        message: `Payment of ₹${amount} for order #${orderId} was processed securely.`,
        category: NOTIFICATION_CATEGORIES.PAYMENTS,
        type: "payment_success",
        orderId,
        deepLink: `/orders?id=${orderId}`,
        priority: "high",
        metadata: { orderId, amount }
      });
    }
  }

  /**
   * Trigger Order Status Update Notification
   */
  async triggerOrderStatusUpdate(orderId, newStatus, extra = {}) {
    const user = auth.currentUser;
    const targetUserId = extra.userId || user?.uid;
    const statusLower = (newStatus || "").toLowerCase();

    let title = `📦 Order #${orderId} Update`;
    let message = `Your order status changed to ${newStatus}.`;
    let category = NOTIFICATION_CATEGORIES.ORDERS;
    let type = `order_${statusLower}`;
    let priority = "normal";

    switch (statusLower) {
      case "processing":
        title = "⏳ Order Processing Started";
        message = `Your order #${orderId} is currently being prepared and quality-checked at our farm facility.`;
        break;

      case "packed":
        title = "📦 Order Packed & Sealed";
        message = `Good news! Order #${orderId} has been safely packed with temperature-controlled protection.`;
        break;

      case "shipped":
        category = NOTIFICATION_CATEGORIES.DELIVERY;
        title = "🚚 Order Shipped!";
        message = `Order #${orderId} is on the way! Dispatched via ${extra.courier || "Express Courier"} (AWB: ${extra.trackingNumber || "TRK" + Date.now().toString().slice(-6)}).`;
        priority = "high";
        break;

      case "out_for_delivery":
      case "out for delivery":
        category = NOTIFICATION_CATEGORIES.DELIVERY;
        title = "🛵 Out for Delivery Today!";
        message = `Your package for order #${orderId} is out for delivery with our delivery partner. Expected delivery today by 8 PM.`;
        priority = "high";
        break;

      case "delivered":
        category = NOTIFICATION_CATEGORIES.DELIVERY;
        title = "🎉 Order Delivered Successfully!";
        message = `Your order #${orderId} has been delivered. Thank you for choosing Shusila Upvan! We would love your feedback.`;
        priority = "high";
        break;

      case "cancelled":
        title = "❌ Order Cancelled";
        message = `Your order #${orderId} has been cancelled. If any payment was deducted, refund will be initiated promptly.`;
        priority = "high";
        break;

      case "return_requested":
        title = "🔄 Return Requested";
        message = `We have received your return request for order #${orderId}. Our verification team will review it within 24 hours.`;
        break;

      case "return_approved":
        title = "✅ Return Request Approved";
        message = `Your return request for order #${orderId} has been approved. Our pickup partner will collect the item soon.`;
        break;

      case "return_rejected":
        title = "⚠️ Return Request Update";
        message = `Your return request for order #${orderId} could not be approved: ${extra.reason || "Policy inspection guidelines not met"}.`;
        break;

      case "refund_initiated":
        category = NOTIFICATION_CATEGORIES.PAYMENTS;
        title = "💳 Refund Initiated";
        message = `Refund of ₹${extra.amount || "amount"} for order #${orderId} has been initiated to your original payment method.`;
        priority = "high";
        break;

      case "refunded":
      case "refund_completed":
        category = NOTIFICATION_CATEGORIES.PAYMENTS;
        title = "💰 Refund Successfully Completed";
        message = `Refund of ₹${extra.amount || "amount"} for order #${orderId} has been credited to your account. Reference: ${extra.refId || "REF" + Date.now().toString().slice(-6)}.`;
        priority = "high";
        break;

      case "delayed":
      case "rescheduled":
        category = NOTIFICATION_CATEGORIES.DELIVERY;
        title = "⏰ Delivery Schedule Update";
        message = `Delivery for order #${orderId} has been rescheduled to ${extra.newDate || "tomorrow"} due to transit conditions. We apologize for the delay.`;
        break;

      default:
        title = `Order #${orderId} Status: ${newStatus}`;
        message = `The status of your order #${orderId} is now ${newStatus}.`;
        break;
    }

    return await this.createNotification({
      userId: targetUserId,
      title,
      message,
      category,
      type,
      orderId,
      deepLink: `/orders?id=${orderId}`,
      imageUrl: extra.imageUrl || null,
      priority,
      metadata: { orderId, status: newStatus, ...extra }
    });
  }

  /**
   * Trigger Payment Failure or Pending
   */
  async triggerPaymentEvent(orderId, status, details = {}) {
    const user = auth.currentUser;
    const amount = details.amount || "0";

    if (status === "failed") {
      return await this.createNotification({
        userId: user?.uid,
        title: "⚠️ Payment Failed",
        message: `Your payment of ₹${amount} for order #${orderId} could not be completed. Tap to retry securely.`,
        category: NOTIFICATION_CATEGORIES.PAYMENTS,
        type: "payment_failed",
        orderId,
        deepLink: `/cart`,
        priority: "high",
        metadata: { orderId, amount, reason: details.reason }
      });
    }

    if (status === "pending") {
      return await this.createNotification({
        userId: user?.uid,
        title: "⏳ Payment Awaiting Confirmation",
        message: `We are confirming your payment for order #${orderId}. We will update you as soon as the bank approves.`,
        category: NOTIFICATION_CATEGORIES.PAYMENTS,
        type: "payment_pending",
        orderId,
        deepLink: `/orders?id=${orderId}`,
        priority: "normal",
        metadata: { orderId, amount }
      });
    }
  }

  /**
   * Trigger Offer / Promotional Notification
   */
  async triggerPromotion({
    title,
    message,
    discountCode,
    imageUrl,
    deepLink = "/mushrooms",
    targetUserIds = ["all"]
  }) {
    const promises = targetUserIds.map((uId) =>
      this.createNotification({
        userId: uId,
        title,
        message,
        category: NOTIFICATION_CATEGORIES.OFFERS,
        type: "promotional_offer",
        imageUrl,
        deepLink,
        priority: "normal",
        metadata: { discountCode }
      })
    );
    return await Promise.all(promises);
  }

  /**
   * Trigger Abandoned Cart Reminder
   */
  async triggerCartReminder(itemCount = 1, user = null) {
    const targetUserId = user?.uid || auth.currentUser?.uid || "guest";
    return await this.createNotification({
      userId: targetUserId,
      title: "🛒 Items waiting in your cart!",
      message: `You left ${itemCount} fresh farm product${itemCount > 1 ? "s" : ""} in your cart. Complete your purchase now while stocks last!`,
      category: NOTIFICATION_CATEGORIES.OTHER,
      type: "cart_reminder",
      deepLink: "/cart",
      priority: "normal",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
      metadata: { itemCount }
    });
  }

  /**
   * Trigger Price Drop Alert
   */
  async triggerPriceDropAlert(product, oldPrice, newPrice, user = null) {
    const targetUserId = user?.uid || auth.currentUser?.uid || "guest";
    const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

    return await this.createNotification({
      userId: targetUserId,
      title: `📉 Price Drop: ${discount}% OFF on ${product.name}!`,
      message: `Great news! ${product.name} is now available at ₹${newPrice} (was ₹${oldPrice}). Tap to view and grab this deal!`,
      category: NOTIFICATION_CATEGORIES.OFFERS,
      type: "price_drop",
      productId: product.id || product.slug,
      imageUrl: product.image,
      deepLink: product.slug ? `/product/${product.slug}` : "/mushrooms",
      priority: "high",
      metadata: { oldPrice, newPrice, discount }
    });
  }

  /**
   * Trigger Account Security Alert
   */
  async triggerSecurityAlert(alertType, details = {}) {
    const user = auth.currentUser;
    if (!user) return;

    let title = "🛡️ Account Security Alert";
    let message = "A recent update was made to your account.";

    if (alertType === "new_login") {
      title = "🔐 New Login Detected";
      message = `Your account was logged in from a new session (${details.device || "Android Device"}). If this wasn't you, review your security settings immediately.`;
    } else if (alertType === "profile_updated") {
      title = "👤 Profile Information Updated";
      message = "Your profile details and delivery address preferences have been saved successfully.";
    } else if (alertType === "policy_update") {
      title = "📋 Terms & Policy Update";
      message = "We have updated our customer privacy and shipping policies for better service quality.";
    }

    return await this.createNotification({
      userId: user.uid,
      title,
      message,
      category: NOTIFICATION_CATEGORIES.UPDATES,
      type: `security_${alertType}`,
      deepLink: "/profile",
      priority: "high",
      metadata: details
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;

