// server/test-notifications.js
/**
 * Automated Test Suite for Push Notification System
 * Validates backend controllers, order lifecycle triggers, idempotency,
 * multicast dispatch, and segment broadcasts.
 */

import {
  registerDeviceToken,
  sendNotification,
  broadcastNotification,
  handleOrderEvent,
  getStats,
  deviceTokensStore,
  idempotencyStore
} from "./notificationController.js";

async function runTests() {
  console.log("=================================================");
  console.log("🧪 STARTING NOTIFICATION SYSTEM AUTOMATED TESTS");
  console.log("=================================================");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: Register Device Token
  console.log("\n[Test 1] Device Token Registration");
  const regRes = await registerDeviceToken({
    userId: "cust_101",
    token: "fcm_token_cust_101_android",
    platform: "android"
  });
  assert(regRes.success === true, "Device token registered successfully");
  assert(deviceTokensStore.get("cust_101").has("fcm_token_cust_101_android"), "Token exists in customer store");

  // TEST 2: Register Multiple Devices for Same User
  console.log("\n[Test 2] Multi-device Registration for Same User");
  await registerDeviceToken({
    userId: "cust_101",
    token: "fcm_token_cust_101_web",
    platform: "web"
  });
  assert(deviceTokensStore.get("cust_101").size === 2, "User has multiple registered devices");

  // TEST 3: User Isolation - Another User
  console.log("\n[Test 3] User Isolation (User B cannot receive User A tokens)");
  await registerDeviceToken({
    userId: "cust_202",
    token: "fcm_token_cust_202_android",
    platform: "android"
  });
  assert(deviceTokensStore.get("cust_202").size === 1, "User B has only their own token");
  assert(!deviceTokensStore.get("cust_202").has("fcm_token_cust_101_android"), "User B does not have User A token");

  // TEST 4: Order Lifecycle Event Trigger - SHIPPED
  console.log("\n[Test 4] Order Event Trigger (SHIPPED)");
  const shipEvt = await handleOrderEvent({
    orderId: "ORD-990011",
    status: "shipped",
    userId: "cust_101",
    courier: "BlueDart",
    trackingNumber: "BD992831",
    amount: "1250"
  });
  assert(shipEvt.success === true, "Order shipped event generated successfully");
  assert(shipEvt.title.includes("Shipped"), "Title contains 'Shipped'");
  assert(shipEvt.pushResult.success === true, "FCM push dispatched");

  // TEST 5: Order Lifecycle Event Trigger - OUT FOR DELIVERY
  console.log("\n[Test 5] Order Event Trigger (OUT FOR DELIVERY)");
  const outEvt = await handleOrderEvent({
    orderId: "ORD-990011",
    status: "out_for_delivery",
    userId: "cust_101",
    amount: "1250"
  });
  assert(outEvt.title.includes("Out for Delivery"), "Out for delivery alert generated");

  // TEST 6: Order Lifecycle Event Trigger - DELIVERED
  console.log("\n[Test 6] Order Event Trigger (DELIVERED)");
  const delEvt = await handleOrderEvent({
    orderId: "ORD-990011",
    status: "delivered",
    userId: "cust_101",
    amount: "1250"
  });
  assert(delEvt.title.includes("Delivered"), "Order delivered alert generated");

  // TEST 7: Idempotency & Deduplication
  console.log("\n[Test 7] Idempotency & Deduplication Protection");
  const idempotencyKey = "event_order_placed_ord990011_attempt_1";
  const notif1 = await sendNotification({
    userId: "cust_101",
    title: "Order Placed",
    message: "Thank you for your order",
    idempotencyKey
  });
  assert(notif1.success === true && !notif1.duplicateIgnored, "First send succeeds normally");

  const notif2 = await sendNotification({
    userId: "cust_101",
    title: "Order Placed",
    message: "Thank you for your order",
    idempotencyKey
  });
  assert(notif2.duplicateIgnored === true, "Duplicate event safely ignored by idempotency key");

  // TEST 8: Admin Segment Broadcast
  console.log("\n[Test 8] Admin Segment Broadcast");
  const broadRes = await broadcastNotification({
    title: "🌾 Harvest Festival 30% OFF",
    message: "Flash sale on all organic dairy and fresh mushrooms today!",
    category: "offers",
    targetSegment: "mushroom_buyers",
    deepLink: "/mushrooms"
  });
  assert(broadRes.success === true, "Broadcast executed");
  assert(broadRes.recipientsCount >= 3, "Broadcast reached all active registered device tokens");

  // TEST 9: Analytics & Stats
  console.log("\n[Test 9] Analytics & History Reporting");
  const stats = getStats();
  assert(stats.totalDispatched >= 4, "Logs tracked correctly");
  assert(stats.registeredDevices >= 2, "Registered user devices tracked");

  console.log("\n=================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error("Test runner error:", e);
  process.exit(1);
});

