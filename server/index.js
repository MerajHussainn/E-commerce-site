// server/index.js
/**
 * Shusila Upvan E-Commerce Push Notification Backend Service
 * Handles business event triggers, admin broadcasts, device token registration,
 * idempotency deduplication, and push dispatch.
 */

import http from "http";
import { URL } from "url";
import {
  registerDeviceToken,
  sendNotification,
  broadcastNotification,
  handleOrderEvent,
  getStats,
  deviceTokensStore,
  deliveryLogs
} from "./notificationController.js";

const PORT = process.env.PORT || 5001;

// Helper to send JSON responses
const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Idempotency-Key"
  });
  res.end(JSON.stringify(data));
};

// Helper to parse JSON body
const parseJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", (err) => reject(err));
  });
};

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = reqUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Idempotency-Key"
    });
    return res.end();
  }

  try {
    // 1. Health check
    if (pathname === "/api/health" && method === "GET") {
      return sendJson(res, 200, {
        status: "healthy",
        service: "push-notification-server",
        timestamp: new Date().toISOString(),
        registeredDevices: Array.from(deviceTokensStore.keys()).length,
        totalDispatched: deliveryLogs.length
      });
    }

    // 2. Register Device Token
    if (pathname === "/api/notifications/register-token" && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await registerDeviceToken(body);
      return sendJson(res, 200, result);
    }

    // 3. Send Single Notification (with Idempotency)
    if (pathname === "/api/notifications/send" && method === "POST") {
      const body = await parseJsonBody(req);
      const idempotencyKey = req.headers["x-idempotency-key"] || body.idempotencyKey;
      const result = await sendNotification({ ...body, idempotencyKey });
      return sendJson(res, 200, result);
    }

    // 4. Admin Broadcast Notifications
    if (pathname === "/api/notifications/broadcast" && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await broadcastNotification(body);
      return sendJson(res, 200, result);
    }

    // 5. Order Business Event Trigger
    if (pathname === "/api/notifications/order-event" && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await handleOrderEvent(body);
      return sendJson(res, 200, result);
    }

    // 6. Analytics & Statistics
    if (pathname === "/api/notifications/stats" && method === "GET") {
      return sendJson(res, 200, getStats());
    }

    // 404 Fallback
    return sendJson(res, 404, { error: "API Route not found" });
  } catch (err) {
    console.error("[Server Error]", err);
    return sendJson(res, 500, { error: "Internal server error: " + err.message });
  }
});

export { server };

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`=======================================================`);
    console.log(`🚀 Shusila Upvan Notification Backend running on :${PORT}`);
    console.log(`📍 Health Check: http://127.0.0.1:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}
