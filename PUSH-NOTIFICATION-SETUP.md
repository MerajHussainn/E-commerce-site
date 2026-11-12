# Complete E-Commerce Push Notification System Documentation

This document describes the complete real-time push notification and notification centre implementation for the **Shusila Upvan (Mushroom Mart & Organic Dairy)** application, inspired by Flipkart, Amazon, and Meesho.

---

## 1. System Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PUSH NOTIFICATION SYSTEM                        │
├────────────────────────────────┬───────────────────────────────────────┤
│         FRONTEND & UI          │            BACKEND & CLOUD            │
├────────────────────────────────┼───────────────────────────────────────┤
│ • Notification Centre (/notifications)│ • Notification Backend (server/index.js)│
│ • Notification Settings (/notification-settings)│ • Firebase Firestore Persistence     │
│ • Bell Icon with Unread Badge  │ • Firebase Cloud Messaging (FCM)     │
│ • In-App Notification Toasts   │ • Idempotency Deduplication Engine    │
│ • Service Worker (Web Push)    │ • Automated Cron Worker (Cart, Price) │
│ • Flutter Bridge (Native App)  │ • Admin Notification Console          │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. Notification Categories Implemented

| Category | Event Triggers | Visual Badges / Channels |
| :--- | :--- | :--- |
| **A. Orders** | Order Placed, Confirmation, Processing, Packed, Shipped, Out for Delivery, Delivered, Cancelled, Return Requested, Return Approved/Rejected, Refund Initiated, Refund Completed, Rescheduled. | Emerald Badge (`orders_channel`), High Priority |
| **B. Payments** | Payment Successful, Payment Failed, Payment Pending, Refund Processed, Cash on Delivery (COD) Confirmation, Payment Reminders. | Blue Badge (`payments_channel`), High Priority |
| **C. Offers & Promotions** | Flash Sales, Festive Deals, Coupon Drops, Personalized Discounts, Price Drop Alerts, Back-in-Stock Alerts, Wishlist Discounts. | Gold/Amber Badge (`offers_channel`), Normal Priority |
| **D. Delivery & Shipping** | Dispatch notices, Courier Partner assignment, Live Tracking, Out for Delivery Today, Rescheduling updates. | Purple Badge (`delivery_channel`), High Priority |
| **E. Updates & Security** | New App Features, Security Login Alerts, Profile & Address updates, Policy updates. | Cyan Badge (`updates_channel`), Normal/High Priority |
| **F. Other Alerts** | Cart Abandonment reminders, Wishlist reminders, Product Recommendations, Customer support replies. | Zinc/Neutral Badge (`other_channel`), Normal Priority |

---

## 3. Dedicated Notification Centre (`/notifications`)

Inspired by **Flipkart, Amazon, and Meesho**:

1. **Chronological & Date-Grouped View**:
   - Notifications automatically grouped into **Today**, **Yesterday**, and **Earlier**.
2. **Category Tabs & Filters**:
   - `All`, `Orders`, `Offers`, `Payments`, `Delivery`, `Updates` with dynamic unread badges on each tab.
3. **Search & Filter**:
   - Instant search input filtering by order ID, title, keyword, or product name.
4. **Visual Read/Unread Distinction**:
   - Unread cards feature bold titles, emerald ambient glow borders, and active pulse dots.
   - Read cards adopt an understated appearance.
5. **Bulk & Individual Actions**:
   - One-click **"Mark all read"**.
   - Individual **"Mark as read"** and **"Delete"** buttons on each card.
   - **"Clear All"** with a confirmation safeguard modal.
6. **Actionable Deep-Link Navigation**:
   - Tapping an order card opens the exact order in `/orders?id=ORD...`
   - Tapping an offer opens `/mushrooms` or the targeted product page.
   - Tapping cart reminders opens `/cart`.
7. **Pagination**:
   - Smooth "Load Older Notifications" pagination for historical logs.

---

## 4. Notification Preferences (`/notification-settings`)

Users retain complete control over alerts:
- **Transactional Alerts**: Order status, Payments & refunds, Delivery tracking (Recommended).
- **Marketing & Offers**: Flash sales, Festive deals, Coupons.
- **Shopping Reminders**: Abandoned cart reminders, Price drop alerts, Back-in-stock.
- **Channels**: System Push notifications vs In-App banners.
- Preferences persist directly to Firestore (`users/{uid}.notificationPreferences`) and sync with local storage.

---

## 5. Admin Notification Console (`/admin/notifications`)

Accessible to administrators via desktop profile dropdown, mobile drawer, or `/admin/notifications`:

1. **Broadcast Composer**:
   - Target **All Users**, **Selected User**, or **Audience Segments** (`Cart Abandoners`, `Mushroom Shoppers`, `Dairy Subscribers`).
   - Add custom Title, Message, Category, Priority, Banner Image URL, Discount Code, and Deep-Link.
   - Send immediately or schedule for future delivery.
   - Built-in confirmation safeguard dialog before dispatching bulk pushes.
2. **Live Android Lock-Screen Preview**:
   - Real-time mobile shade preview displaying the exact notification card, status bar, and actions.
3. **Order Lifecycle Simulator**:
   - 1-click trigger to simulate any order event (`Processing`, `Packed`, `Shipped`, `Out for Delivery`, `Delivered`, `Cancelled`, `Return`, `Refund`) and verify end-to-end delivery in real time!
4. **Sent History & Delivery Analytics**:
   - Delivery rate, open & read rate, registered device counts, and category breakdown.

---

## 6. Backend Service (`server/`)

### Starting the Backend Server
```bash
# In the project root:
npm run server
```
Server runs on `http://127.0.0.1:5001`.

### Key API Endpoints
- `GET  /api/health` — Service health & device counts
- `POST /api/notifications/register-token` — Registers FCM tokens for Android/iOS/Web
- `POST /api/notifications/send` — Sends targeted push with idempotency protection
- `POST /api/notifications/broadcast` — Broadcasts to all users or segments
- `POST /api/notifications/order-event` — Generates order lifecycle notification
- `GET  /api/notifications/stats` — Admin delivery stats

### Running the Test Suite
```bash
node server/test-notifications.js
```
Runs 16 automated tests covering registration, isolation, order triggers, idempotency, and analytics.

### Running Background Cron Jobs
```bash
node server/cronWorker.js all
```
Executes automated abandoned cart checks, price drop alerts, and harvest specials.

---

## 7. Firebase Cloud Messaging (FCM) & Device Setup

### Android Setup
1. Open the [Firebase Console](https://console.firebase.google.com/) for project `susheela-upvan`.
2. Navigate to **Project Settings** -> **Your apps** -> **Android app** (`com.shusilaupvan.mushroom_mart`).
3. Download the official `google-services.json` and place it in:
   `mobile_app/android/app/google-services.json`
4. The application includes native Android 13+ `POST_NOTIFICATIONS` runtime permission delegation and notification channels:
   - `ecommerce_orders_channel` (High Importance, Sound & Vibration)
   - `ecommerce_delivery_channel` (High Importance)
   - `ecommerce_payments_channel` (High Importance)
   - `ecommerce_offers_channel` (Normal Importance)

### Web Push Setup
1. In Firebase Console -> **Project Settings** -> **Cloud Messaging** -> **Web Push certificates**.
2. Generate a key pair (VAPID Key).
3. The browser automatically registers `public/firebase-messaging-sw.js` on launch.

### Backend Server Credentials
1. In Firebase Console -> **Project Settings** -> **Service accounts**.
2. Click **Generate new private key**.
3. Save the downloaded JSON as `server/firebase-service-account.json`.
4. While in development/test without the key, the backend automatically operates in **Standby Simulation Mode**, recording delivery logs and preventing crashes.

