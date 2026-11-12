import { Routes, Route, Outlet, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

/* ================= CONTEXT ================= */
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { NotificationProvider } from "./context/NotificationContext";
import ChatWidget from "./components/ChatWidget";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthModal from "./components/AuthModal";
import NavbarMain from "./components/NavbarMain";
import Footer from "./components/Footer";
import DiaryNavbar from "./Diarycomponents/DiaryNavbar";
import Diaryfooter from "./Diarycomponents/Diaryfooter";
import ScrollToTop from "./components/ScrollToTop";

/* ================= MAIN PAGES ================= */
import Home from "./pages/Home";
import Mushrooms from "./pages/Mushrooms";
import Events from "./pages/Events";
import FarmerSupport from "./pages/FarmerSupport";
import Contact from "./pages/Contact";
import Knowledge from "./pages/Knowledge";
import FarmerCommunity from "./pages/FarmerCommunity";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import MyProfile from "./pages/myprofile";
import MyOrders from "./pages/myorders";
import ProductDetail from "./pages/ProductDetail";
import NotificationCentre from "./pages/NotificationCentre";
import NotificationSettings from "./pages/NotificationSettings";
import AdminNotifications from "./pages/AdminNotifications";

/* ================= DIARY PAGES ================= */
import DiaryHome from "./Diarypages/DiaryHome";
import DiaryContacts from "./Diarypages/DiaryContacts";
import MilkDiary from "./Diarypages/MilkDiary";
import Diaryknowledge from "./Diarypages/Diaryknowledge";
import DiarySupport from "./Diarypages/DiarySupport";
import DiaryEvents from "./Diarypages/DiaryEvents";
import DiaryCommunity from "./Diarypages/DiaryCommunity";

/* ================= FOUNDATION PAGES (FIXED) ================= */
import F_Home from "./Foundationpage/F_Home";
import About from "./Foundationpage/About";
import CTA from "./Foundationpage/CTA";
import Features from "./Foundationpage/Features";
import Testomonials from "./Foundationpage/Testomonials";

/* ================= LAYOUTS ================= */

const MainLayout = () => (
  <>
    <NavbarMain />
    <main className="flex-1 font-serif">
      <Outlet />
    </main>
    <Footer />
  </>
);

const DiaryLayout = () => (
  <>
    <DiaryNavbar />
    <main className="flex-1 font-serif">
      <Outlet />
    </main>
    <Diaryfooter />
  </>
);

const FoundationLayout = () => (
  <>
    <NavbarMain />
    <main className="flex-1 font-serif">
      <Outlet />
    </main>
    <Footer />
  </>
);

/* ================= APP ================= */

function App() {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    const handleShowAuthModal = (event) => {
      const { mode, action, product, quantity } = event.detail || {};

      if (action && product) {
        localStorage.setItem(
          "pendingAction",
          JSON.stringify({
            action,
            product,
            quantity,
            timestamp: Date.now(),
          })
        );
      }

      window.dispatchEvent(
        new CustomEvent("triggerAuthModal", {
          detail: { mode: mode || "login" },
        })
      );
    };

    const handleShowCheckoutModal = (event) => {
      const { product, quantity } = event.detail || {};
      setCheckoutData({ product, quantity });
      setShowCheckoutModal(true);
    };

    window.addEventListener("showAuthModal", handleShowAuthModal);
    window.addEventListener("showCheckoutModal", handleShowCheckoutModal);

    return () => {
      window.removeEventListener("showAuthModal", handleShowAuthModal);
      window.removeEventListener("showCheckoutModal", handleShowCheckoutModal);
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <NotificationProvider>
            <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col font-inter relative overflow-x-hidden universal-bg">
            <ScrollToTop />
            <Toaster position="top-center" />
            <AuthModal />

            {/* Universal Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
              <div className="absolute w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-green-500/5 rounded-full blur-[140px] -top-32 -left-20" />
              <div className="absolute w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-yellow-500/5 rounded-full blur-[120px] bottom-10 right-0" />
            </div>

            {/* ================= CHECKOUT MODAL ================= */}
            {showCheckoutModal && checkoutData && (
              <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Checkout</h2>
                    <button onClick={() => setShowCheckoutModal(false)}>
                      ✕
                    </button>
                  </div>
                  <p className="mb-4">
                    Please complete checkout from the cart page.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-4 py-2 border rounded"
                    >
                      Close
                    </button>
                    <Link
                      to="/cart"
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                      onClick={() => setShowCheckoutModal(false)}
                    >
                      Go to Cart
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ================= ROUTES ================= */}
            <Routes>
              {/* FOUNDATION ( / ) */}
              <Route element={<FoundationLayout />}>
                <Route index element={<F_Home />} />
                <Route path="about" element={<About />} />
                <Route path="programs" element={<Features />} />
                <Route
                  path="impact"
                  element={<Testomonials />}
                />
                <Route path="cta" element={<CTA />} />
              </Route>

              {/* MAIN APP */}
              <Route element={<MainLayout />}>
                <Route path="home" element={<Home />} />
                <Route path="mushrooms" element={<Mushrooms />} />
                <Route path="events" element={<Events />} />
                <Route path="farmer-support" element={<FarmerSupport />} />
                <Route path="contact" element={<Contact />} />
                <Route path="knowledge" element={<Knowledge />} />
                <Route path="community" element={<FarmerCommunity />} />
                <Route path="cart" element={<Cart />} />
                <Route path="product/:slug" element={<ProductDetail />} />
                <Route path="mushrooms/:slug" element={<ProductDetail />} />

                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <MyProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route path="notifications" element={<NotificationCentre />} />
                <Route path="notification-settings" element={<NotificationSettings />} />
                <Route path="admin/notifications" element={<AdminNotifications />} />
              </Route>

              {/* DAIRY */}
              <Route path="dairy" element={<DiaryLayout />}>
                <Route index element={<DiaryHome />} />
                <Route path="diarycontacts" element={<DiaryContacts />} />
                <Route path="milkdiary" element={<MilkDiary />} />
                <Route path="diaryknowledge" element={<Diaryknowledge />} />
                <Route path="diarysupport" element={<DiarySupport />} />
                <Route path="diaryevents" element={<DiaryEvents />} />
                <Route path="dairycommunity" element={<DiaryCommunity />} />
                <Route path="product/:slug" element={<ProductDetail />} />
              </Route>

              {/* DIARY */}
              <Route path="diary" element={<DiaryLayout />}>
                <Route index element={<DiaryHome />} />
                <Route path="diarycontacts" element={<DiaryContacts />} />
                <Route path="milkdiary" element={<MilkDiary />} />
                <Route path="diaryknowledge" element={<Diaryknowledge />} />
                <Route path="diarysupport" element={<DiarySupport />} />
                <Route path="diaryevents" element={<DiaryEvents />} />
                <Route path="dairycommunity" element={<DiaryCommunity />} />
                <Route path="product/:slug" element={<ProductDetail />} />
              </Route>

              {/* FALLBACK */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ChatWidget />
          </div>
        </NotificationProvider>
      </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
