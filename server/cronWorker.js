// server/cronWorker.js
/**
 * Automated Background Jobs & Event Triggers
 * Runs periodic checks for:
 * 1. Abandoned cart reminders
 * 2. Price drop alerts
 * 3. Daily morning harvest specials
 */

import { broadcastNotification, sendNotification } from "./notificationController.js";

export async function runAbandonedCartReminderJob() {
  console.log("[CronWorker] Running Abandoned Cart Reminder check...");
  return await broadcastNotification({
    title: "🛒 Fresh items waiting in your cart!",
    message: "Your selected farm-fresh mushrooms & organic dairy are waiting. Complete your order before today's batch sells out!",
    category: "other",
    targetSegment: "cart_abandoners",
    deepLink: "/cart",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
  });
}

export async function runPriceDropAlertJob() {
  console.log("[CronWorker] Running Price Drop & Back-in-Stock alerts...");
  return await broadcastNotification({
    title: "📉 Price Drop Alert: 15% OFF Portobello Mushrooms!",
    message: "Freshly picked Portobello mushrooms now starting at just ₹160/pack. Tap to grab yours now!",
    category: "offers",
    targetSegment: "mushroom_buyers",
    deepLink: "/product/portobello",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
  });
}

export async function runMorningHarvestBroadcast() {
  console.log("[CronWorker] Running Morning Farm Harvest broadcast...");
  return await broadcastNotification({
    title: "🌅 Today's Fresh Farm Harvest is Ready!",
    message: "Pure A2 Gir Cow Milk, fresh curd, and organic Oyster mushrooms have been harvested and are ready for prompt dispatch.",
    category: "updates",
    targetSegment: "all",
    deepLink: "/dairy/milkdiary"
  });
}

// If executed directly:
if (process.argv[1]?.endsWith("cronWorker.js")) {
  const job = process.argv[2] || "all";
  console.log(`[CronWorker] Executing job '${job}'...`);

  if (job === "cart" || job === "all") runAbandonedCartReminderJob();
  if (job === "price" || job === "all") runPriceDropAlertJob();
  if (job === "morning" || job === "all") runMorningHarvestBroadcast();
}

