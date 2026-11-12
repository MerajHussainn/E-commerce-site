import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import {
  Sprout,
  ShoppingBasket,
  Calendar,
  BookOpen,
  Users,
  Phone,
  LogOut,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  User,
  Package,
  ShoppingBag,
  Key,
  Home,
  Trees,
  Headphones,
  Leaf,
  Milk,
  Bell,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNotifications } from "../context/NotificationContext";

const mushroomServices = [
  { to: "/farmer-support", icon: Sprout, label: "Cultivation Support", desc: "Expert mushroom growing support" },
  { to: "/mushrooms", icon: ShoppingBasket, label: "Buy Fresh Mushrooms", desc: "Fresh organic mushrooms" },
  { to: "/events", icon: Calendar, label: "Community Events", desc: "Workshops and grower meetups" },
  { to: "/knowledge", icon: BookOpen, label: "Knowledge Hub", desc: "Cultivation guides and recipes" },
  { to: "/community", icon: Users, label: "Farmer Community", desc: "Connect with mushroom farmers" },
  { to: "/contact", icon: Phone, label: "Contact Us", desc: "Get in touch with support" },
];

const dairyServices = [
  { to: "/dairy/diarysupport", icon: Headphones, label: "Dairy Support", desc: "Cattle care & farm assistance" },
  { to: "/dairy/milkdiary", icon: ShoppingBasket, label: "Buy Fresh Dairy", desc: "Farm-fresh milk, ghee & paneer" },
  { to: "/dairy/diaryevents", icon: Calendar, label: "Community Events", desc: "Dairy expos and workshops" },
  { to: "/dairy/diaryknowledge", icon: BookOpen, label: "Knowledge Hub", desc: "Dairy farming guides & tips" },
  { to: "/dairy/dairycommunity", icon: Users, label: "Dairy Community", desc: "Vibrant dairy farmer network" },
  { to: "/dairy/diarycontacts", icon: Phone, label: "Contact Us", desc: "Dairy support & bulk orders" },
];

const MushroomNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState("mushroom");
  const [mobileMushroomOpen, setMobileMushroomOpen] = useState(false);
  const [mobileDairyOpen, setMobileDairyOpen] = useState(false);

  const servicesDropdownRef = useRef(null);
  const location = useLocation();

  const {
    user,
    logout,
    sendPasswordUpdateLink,
    openAuthModal,
  } = useAuth();

  const { cartCount } = useCart();
  const { unreadCount } = useNotifications();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => {
    setMenuOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
    setMobileMushroomOpen(false);
    setMobileDairyOpen(false);
    setProfileOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target)
      ) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLoginClick = () => {
    openAuthModal("login");
    closeMenu();
  };

  const handleSignupClick = () => {
    openAuthModal("signup");
    closeMenu();
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      closeMenu();
    }
  };

  const handleUpdatePassword = () => {
    sendPasswordUpdateLink();
    closeMenu();
  };

  const isDairyActive =
    location.pathname.startsWith("/dairy") ||
    location.pathname.startsWith("/diary");

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Shusila <span className="text-green-400">Upvan</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? "text-green-400" : "text-gray-400 hover:text-white"
                }`
              }
            >
              <Home size={16} /> Home
            </NavLink>

            <NavLink
              to="/mushrooms"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? "text-green-400" : "text-gray-400 hover:text-white"
                }`
              }
            >
              <Trees size={16} /> Mushrooms
            </NavLink>

            {/* Dairy Button in Navbar */}
            <NavLink
              to="/dairy"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive || isDairyActive
                    ? "text-yellow-400 font-semibold"
                    : "text-gray-400 hover:text-white"
                }`
              }
            >
              <Milk size={16} className={isDairyActive ? "text-yellow-400" : ""} /> Dairy
            </NavLink>

            {/* Services Dropdown */}
            <div className="relative" ref={servicesDropdownRef}>
              <button
                type="button"
                onClick={() => setServicesOpen((prev) => !prev)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  servicesOpen ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Users size={16} /> Services
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    servicesOpen ? "rotate-180 text-green-400" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu with Mushroom and Dairy buttons & Hover services */}
              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-3 flex gap-3 w-[520px] max-w-[calc(100vw-32px)] z-50 backdrop-blur-2xl">
                  {/* Category Selection Buttons */}
                  <div className="w-48 flex flex-col gap-2 border-r border-white/10 pr-3">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-2 pt-1">
                      Categories
                    </span>

                    {/* Mushroom Button */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveServiceTab("mushroom")}
                      onClick={() => setActiveServiceTab("mushroom")}
                      className={`flex items-center justify-between w-full px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                        activeServiceTab === "mushroom"
                          ? "bg-green-500/20 text-green-400 border border-green-500/40 shadow-sm"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            activeServiceTab === "mushroom"
                              ? "bg-green-500 text-black"
                              : "bg-white/10 text-gray-400"
                          }`}
                        >
                          <Trees size={15} />
                        </div>
                        Mushroom
                      </span>
                      <ChevronRight
                        size={15}
                        className={
                          activeServiceTab === "mushroom"
                            ? "text-green-400"
                            : "text-gray-500"
                        }
                      />
                    </button>

                    {/* Dairy Button */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveServiceTab("dairy")}
                      onClick={() => setActiveServiceTab("dairy")}
                      className={`flex items-center justify-between w-full px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                        activeServiceTab === "dairy"
                          ? "bg-amber-500/20 text-yellow-400 border border-amber-500/40 shadow-sm"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            activeServiceTab === "dairy"
                              ? "bg-yellow-400 text-black"
                              : "bg-white/10 text-gray-400"
                          }`}
                        >
                          <Milk size={15} />
                        </div>
                        Dairy
                      </span>
                      <ChevronRight
                        size={15}
                        className={
                          activeServiceTab === "dairy"
                            ? "text-yellow-400"
                            : "text-gray-500"
                        }
                      />
                    </button>

                    <div className="mt-auto pt-2 border-t border-white/5 text-[11px] text-gray-400 px-2">
                      Hover on Mushroom or Dairy to view services
                    </div>
                  </div>

                  {/* Services List Display */}
                  <div className="flex-1 pl-1">
                    <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-white/5 mb-1.5">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        {activeServiceTab === "mushroom" ? (
                          <>
                            <Trees size={12} className="text-green-400" />
                            Mushroom Services
                          </>
                        ) : (
                          <>
                            <Milk size={12} className="text-yellow-400" />
                            Dairy Services
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {activeServiceTab === "mushroom"
                          ? `${mushroomServices.length} options`
                          : `${dairyServices.length} options`}
                      </span>
                    </div>

                    <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
                      {activeServiceTab === "mushroom"
                        ? mushroomServices.map((item, idx) => (
                            <Link
                              key={idx}
                              to={item.to}
                              onClick={closeMenu}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-green-500/10 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors shrink-0">
                                <item.icon size={15} />
                              </div>
                              <div className="truncate">
                                <p className="font-medium text-gray-200 group-hover:text-green-300 transition-colors truncate">
                                  {item.label}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          ))
                        : dairyServices.map((item, idx) => (
                            <Link
                              key={idx}
                              to={item.to}
                              onClick={closeMenu}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-amber-500/10 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:text-yellow-400 transition-colors shrink-0">
                                <item.icon size={15} />
                              </div>
                              <div className="truncate">
                                <p className="font-medium text-gray-200 group-hover:text-yellow-300 transition-colors truncate">
                                  {item.label}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/farmer-support"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? "text-green-400" : "text-gray-400 hover:text-white"
                }`
              }
            >
              <Headphones size={16} /> Support
            </NavLink>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Notifications Bell */}
            <NavLink
              to="/notifications"
              className="relative text-gray-400 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-md shadow-emerald-950/60">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </NavLink>

            {/* Cart */}
            <NavLink
              to="/cart"
              className="relative text-gray-400 hover:text-white transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </NavLink>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center font-bold text-black hover:opacity-90 transition"
                  >
                    {user.displayName?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase() ||
                      "U"}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-[#1a1a1a] border border-white/10 rounded-xl py-2 shadow-xl z-50">
                      <Link
                        to="/profile"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User size={16} /> My Profile
                      </Link>
                      <Link
                        to="/notifications"
                        onClick={closeMenu}
                        className="flex items-center justify-between px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <Bell size={16} /> Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/orders"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Package size={16} /> My Orders
                      </Link>
                      <Link
                        to="/cart"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <ShoppingBag size={16} /> My Cart
                      </Link>
                      <Link
                        to="/admin/notifications"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-white/5 transition-colors"
                      >
                        <Shield size={16} /> Notification Manager
                      </Link>
                      <button
                        onClick={handleUpdatePassword}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-left"
                      >
                        <Key size={16} /> Update Password
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors text-left"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLoginClick}
                    className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleSignupClick}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={toggleMenu} className="md:hidden text-white">
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-[72px] bg-[#0a0a0a]/95 backdrop-blur-xl z-40 md:hidden overflow-y-auto">
          <nav className="flex flex-col p-6 gap-3 pb-24">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 text-lg font-medium border-b border-white/5 ${
                  isActive ? "text-green-400" : "text-gray-400"
                }`
              }
            >
              <Home size={20} /> Home
            </NavLink>

            <NavLink
              to="/mushrooms"
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 text-lg font-medium border-b border-white/5 ${
                  isActive ? "text-green-400" : "text-gray-400"
                }`
              }
            >
              <Trees size={20} /> Mushrooms
            </NavLink>

            <NavLink
              to="/dairy"
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 text-lg font-medium border-b border-white/5 ${
                  isActive || isDairyActive ? "text-yellow-400" : "text-gray-400"
                }`
              }
            >
              <Milk size={20} /> Dairy
            </NavLink>

            {/* Mobile Services Accordion */}
            <div className="border-b border-white/5 pb-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileServicesOpen((prev) => !prev);
                }}
                className="flex items-center justify-between py-3 text-lg font-medium text-gray-400 hover:text-white w-full transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Users size={20} className="text-green-400" /> Services
                </span>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    mobileServicesOpen ? "rotate-180 text-green-400" : ""
                  }`}
                />
              </button>

              {mobileServicesOpen && (
                <div className="pl-2 sm:pl-4 space-y-2.5 mt-2">
                  {/* Mushroom Button & Sub-services */}
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileMushroomOpen((prev) => !prev);
                      }}
                      className={`flex items-center justify-between w-full py-2.5 px-3 text-sm font-semibold rounded-lg transition-all ${
                        mobileMushroomOpen
                          ? "text-white bg-green-500/20 border border-green-500/30"
                          : "text-green-400 bg-green-500/10 hover:bg-green-500/15"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Trees size={16} className="text-green-400" /> Mushroom Services
                      </span>
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 text-green-400 ${
                          mobileMushroomOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {mobileMushroomOpen && (
                      <div className="p-2 space-y-1 bg-black/20">
                        {mushroomServices.map((item, idx) => (
                          <Link
                            key={idx}
                            to={item.to}
                            onClick={closeMenu}
                            className="flex items-center gap-2.5 py-2 px-3 text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-green-500/10 rounded-lg transition-colors"
                          >
                            <item.icon size={15} className="text-green-400 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dairy Button & Sub-services */}
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileDairyOpen((prev) => !prev);
                      }}
                      className={`flex items-center justify-between w-full py-2.5 px-3 text-sm font-semibold rounded-lg transition-all ${
                        mobileDairyOpen
                          ? "text-white bg-amber-500/20 border border-yellow-500/30"
                          : "text-yellow-400 bg-amber-500/10 hover:bg-amber-500/15"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Milk size={16} className="text-yellow-400" /> Dairy Services
                      </span>
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 text-yellow-400 ${
                          mobileDairyOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {mobileDairyOpen && (
                      <div className="p-2 space-y-1 bg-black/20">
                        {dairyServices.map((item, idx) => (
                          <Link
                            key={idx}
                            to={item.to}
                            onClick={closeMenu}
                            className="flex items-center gap-2.5 py-2 px-3 text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-yellow-500/10 rounded-lg transition-colors"
                          >
                            <item.icon size={15} className="text-yellow-400 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/farmer-support"
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 text-lg font-medium border-b border-white/5 ${
                  isActive ? "text-green-400" : "text-gray-400"
                }`
              }
            >
              <Headphones size={20} /> Support
            </NavLink>

            <NavLink
              to="/cart"
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 text-lg font-medium border-b border-white/5 ${
                  isActive ? "text-green-400" : "text-gray-400"
                }`
              }
            >
              <ShoppingCart size={20} /> Cart ({cartCount})
            </NavLink>

            <NavLink
              to="/notifications"
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center justify-between py-3 text-lg font-medium border-b border-white/5 ${
                  isActive ? "text-emerald-400" : "text-gray-400"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Bell size={20} /> Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </NavLink>

            <NavLink
              to="/admin/notifications"
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 text-base font-medium border-b border-white/5 ${
                  isActive ? "text-emerald-400" : "text-emerald-400/80"
                }`
              }
            >
              <Shield size={18} /> Admin Notifications
            </NavLink>

            {/* Mobile Auth */}
            <div className="pt-4 mt-2">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center font-bold text-black">
                      {user.displayName?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                    <span className="font-medium">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 py-2.5 text-gray-400 hover:text-white"
                  >
                    <User size={18} /> My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={closeMenu}
                    className="flex items-center gap-3 py-2.5 text-gray-400 hover:text-white"
                  >
                    <Package size={18} /> My Orders
                  </Link>
                  <button
                    onClick={handleUpdatePassword}
                    className="flex items-center gap-3 py-2.5 text-gray-400 hover:text-white w-full text-left"
                  >
                    <Key size={18} /> Update Password
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-2.5 text-red-400 w-full text-left"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleLoginClick}
                    className="w-full py-3 border border-white/20 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleSignupClick}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default MushroomNavbar;
