// server/notificationController.js
import fcmDispatcher from "./firebaseAdmin.js";

// In-memory state for idempotency & device tokens
export const idempotencyStore = new Set();
export const deviceTokensStore = new Map(); // userId -> Set of tokens
export const deliveryLogs = [];

export async function registerDeviceToken({ userId, token, platform = "android" }) {
  if (!token) {
    throw new Error("Device token is required");
  }
  const userTokens = deviceTokensStore.get(userId || "guest") || new Set();
  userTokens.add(token);
  deviceTokensStore.set(userId || "guest", userTokens);

  return {
    success: true,
    message: "Device token registered successfully",
    userId: userId || "guest",
    platform
  };
}

export async function sendNotification({
  userId,
  title,
  message,
  category = "orders",
  deepLink = "/orders",
  imageUrl = null,
  orderId = null,
  priority = "high",
  idempotencyKey = null
}) {
  if (!title || !message) {
    throw new Error("Title and message are required");
  }

  // Deduplication check
  if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
    return {
      success: true,
      duplicateIgnored: true,
      message: "Duplicate notification event ignored (idempotent)"
    };
  }

  if (idempotencyKey) {
    idempotencyStore.add(idempotencyKey);
  }

  const userTokens = Array.from(deviceTokensStore.get(userId) || []);
  const pushResult = await fcmDispatcher.sendMulticast(userTokens, {
    title,
    body: message,
    data: {
      category,
      deepLink,
      orderId: orderId || "",
      id: `srv_${Date.now()}`
    },
    imageUrl,
    priority
  });

  const logEntry = {
    id: `log_${Date.now()}`,
    userId,
    title,
    category,
    orderId,
    sentAt: new Date().toISOString(),
    delivered: true,
    tokensCount: userTokens.length
  };
  deliveryLogs.unshift(logEntry);

  return {
    success: true,
    notificationId: logEntry.id,
    pushResult
  };
}

export async function broadcastNotification({
  title,
  message,
  category = "offers",
  targetSegment = "all",
  deepLink = "/mushrooms",
  imageUrl = null
}) {
  if (!title || !message) {
    throw new Error("Title and message are required");
  }

  const allTokens = [];
  deviceTokensStore.forEach((tokenSet) => {
    tokenSet.forEach((t) => allTokens.push(t));
  });

  const pushResult = await fcmDispatcher.sendMulticast(allTokens, {
    title,
    body: message,
    data: {
      category,
      deepLink,
      targetSegment
    },
    imageUrl,
    priority: "normal"
  });

  deliveryLogs.unshift({
    id: `broadcast_${Date.now()}`,
    target: targetSegment,
    title,
    category,
    sentAt: new Date().toISOString(),
    tokensCount: allTokens.length
  });

  return {
    success: true,
    broadcastId: `bc_${Date.now()}`,
    recipientsCount: allTokens.length,
    pushResult
  };
}

export async function handleOrderEvent({
  orderId,
  status,
  userId,
  courier,
  trackingNumber,
  amount
}) {
  if (!orderId || !status) {
    throw new Error("orderId and status are required");
  }

  let title = `Order #${orderId} Update`;
  let message = `Your order status changed to ${status}.`;

  const statusLower = status.toLowerCase();
  if (statusLower === "processing") {
    title = "⏳ Order Processing";
    message = `Order #${orderId} is being prepared at our organic farm.`;
  } else if (statusLower === "packed") {
    title = "📦 Order Packed";
    message = `Order #${orderId} has been safely packed with freshness seal.`;
  } else if (statusLower === "shipped") {
    title = "🚚 Order Shipped";
    message = `Order #${orderId} has been dispatched via ${courier || "Courier"} (AWB: ${trackingNumber || "TRK" + Date.now().toString().slice(-6)}).`;
  } else if (statusLower.includes("out")) {
    title = "🛵 Out for Delivery";
    message = `Your package for order #${orderId} is out for delivery today!`;
  } else if (statusLower === "delivered") {
    title = "🎉 Order Delivered";
    message = `Your order #${orderId} was delivered. Enjoy your fresh harvest!`;
  } else if (statusLower === "cancelled") {
    title = "❌ Order Cancelled";
    message = `Order #${orderId} has been cancelled.`;
  }

  const userTokens = Array.from(deviceTokensStore.get(userId || "guest") || []);
  const pushResult = await fcmDispatcher.sendMulticast(userTokens, {
    title,
    body: message,
    data: {
      category: "orders",
      orderId,
      deepLink: `/orders?id=${orderId}`
    },
    priority: "high"
  });

  deliveryLogs.unshift({
    id: `order_evt_${Date.now()}`,
    userId: userId || "guest",
    orderId,
    status,
    title,
    category: "orders",
    sentAt: new Date().toISOString(),
    delivered: true,
    tokensCount: userTokens.length
  });

  return {
    success: true,
    orderId,
    status,
    title,
    message,
    pushResult
  };
}

export function getStats() {
  return {
    totalDispatched: deliveryLogs.length,
    registeredDevices: Array.from(deviceTokensStore.keys()).length,
    recentLogs: deliveryLogs.slice(0, 20)
  };
}
