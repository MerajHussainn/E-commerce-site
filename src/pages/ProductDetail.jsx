import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Zap,
  Star,
  MapPin,
  Clock,
  Shield,
  Truck,
  Package,
  Heart,
  Leaf,
  Milk,
  CheckCircle2,
  ArrowRight,
  X,
  Share2,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getProductBySlug, getSimilarProducts } from "../data/allProducts";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import DeliveryForm from "./DeliveryForm";

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const { addOrder } = useOrders();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Scroll to top and load product on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const foundProduct = getProductBySlug(slug);
    if (foundProduct) {
      setProduct(foundProduct);
      setQuantity(1);
      const similar = getSimilarProducts(foundProduct, 4);
      setSimilarProducts(similar);
    } else {
      setProduct(null);
      setSimilarProducts([]);
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 py-24">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Package size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-400 mb-6">
            The product you are looking for doesn't exist or may have been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-xl border border-white/20 text-sm font-medium hover:bg-white/5 transition"
            >
              Go Back
            </button>
            <Link
              to="/mushrooms"
              className="px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
            >
              Browse Mushrooms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isDairy = product.type === "dairy";
  const currencySymbol = isDairy ? "₹" : "$";

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (product.stock && next > product.stock) {
        toast.error(`Only ${product.stock} items left in stock`);
        return product.stock;
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("This product is currently out of stock");
      return;
    }
    try {
      addToCart(
        {
          id: product.numericId || product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          stock: product.stock,
          type: product.type,
        },
        quantity
      );
      toast.success(`${quantity} × ${product.name} added to cart!`);
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      toast.error("This product is currently out of stock");
      return;
    }
    if (!user) {
      toast("Please login to proceed with instant checkout", { icon: "🔒" });
      openAuthModal("login");
      return;
    }
    setShowDeliveryModal(true);
  };

  const handleOrderSubmit = (orderData) => {
    addOrder(orderData);
    toast.success(`Order placed successfully! Order ID: ${orderData.orderId || "OK"}`);
    setShowDeliveryModal(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Shusila Upvan!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm">
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>
            <span>/</span>
            <Link
              to={isDairy ? "/dairy/milkdiary" : "/mushrooms"}
              className="hover:text-white transition flex items-center gap-1"
            >
              {isDairy ? (
                <>
                  <Milk size={13} className="text-yellow-400" /> Dairy
                </>
              ) : (
                <>
                  <Leaf size={13} className="text-green-400" /> Mushrooms
                </>
              )}
            </Link>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-[110px] sm:max-w-[180px] md:max-w-[240px]">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition text-xs"
            >
              <Share2 size={14} /> Share
            </button>
            <button
              onClick={() => navigate(isDairy ? "/dairy/milkdiary" : "/mushrooms")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition text-xs"
            >
              <ChevronLeft size={14} /> Back to {isDairy ? "Dairy" : "Mushrooms"}
            </button>
          </div>
        </div>

        {/* Main Product Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start mb-16 sm:mb-24">
          {/* Left: Product Image Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl group">
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${
                  isDairy
                    ? "from-amber-500/10 via-transparent to-yellow-500/10"
                    : "from-green-500/10 via-transparent to-emerald-500/10"
                } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 sm:h-80 md:h-[400px] lg:h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg ${
                    isDairy
                      ? "bg-amber-500/80 text-black"
                      : "bg-green-500/80 text-white"
                  }`}
                >
                  {product.category}
                </span>
                {product.origin && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-gray-200 border border-white/10 flex items-center gap-1">
                    <MapPin size={12} className={isDairy ? "text-yellow-400" : "text-green-400"} />
                    {product.origin}
                  </span>
                )}
              </div>

              {/* Stock Status Pill */}
              <div className="absolute top-4 right-4">
                {product.stock > 10 ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-black backdrop-blur-md">
                    In Stock ({product.stock})
                  </span>
                ) : product.stock > 0 ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-black backdrop-blur-md">
                    Only {product.stock} Left!
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/90 text-white backdrop-blur-md">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Quick Guarantees Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <Truck size={18} className={`mx-auto mb-1 ${isDairy ? "text-yellow-400" : "text-green-400"}`} />
                <p className="text-xs text-gray-400">Delivery</p>
                <p className="text-xs font-semibold text-white truncate">{product.deliveryTime}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <Shield size={18} className={`mx-auto mb-1 ${isDairy ? "text-yellow-400" : "text-green-400"}`} />
                <p className="text-xs text-gray-400">Quality</p>
                <p className="text-xs font-semibold text-white">100% Pure Organic</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <CheckCircle2 size={18} className={`mx-auto mb-1 ${isDairy ? "text-yellow-400" : "text-green-400"}`} />
                <p className="text-xs text-gray-400">Farm Sourced</p>
                <p className="text-xs font-semibold text-white">Direct Harvest</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Product Details & Purchase Actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Title & Rating */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isDairy ? "bg-amber-500/20 text-yellow-400 border border-amber-500/30" : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}>
                  <Sparkles size={12} />
                  Premium {isDairy ? "Dairy Product" : "Mushroom"}
                </span>
                {product.size && (
                  <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                    {product.size}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20">
                  <Star size={15} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs sm:text-sm font-bold text-yellow-400">{product.rating}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-400">Verified Customer Reviews</span>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm text-green-400 font-medium">In High Demand</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-white/5 border border-white/10 flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1">
                  Price per unit
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl sm:text-3xl md:text-4xl font-black ${
                      isDairy ? "text-yellow-400" : "text-green-400"
                    }`}
                  >
                    {currencySymbol}
                    {Number(product.price).toFixed(2)}
                  </span>
                  {product.size && (
                    <span className="text-gray-400 text-xs sm:text-sm">/ {product.size}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Total</span>
                <span className="text-lg sm:text-xl font-bold text-white">
                  {currencySymbol}
                  {(Number(product.price) * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Full Description */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                About this item
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {product.fullDescription}
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-sm">
              {product.taste && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-gray-400 text-xs block">Taste Profile</span>
                  <span className="text-white font-medium">{product.taste}</span>
                </div>
              )}
              {product.uses && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-gray-400 text-xs block">Recommended Uses</span>
                  <span className="text-white font-medium truncate block">{product.uses}</span>
                </div>
              )}
              {product.fat && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-gray-400 text-xs block">Milk Fat</span>
                  <span className="text-white font-medium">{product.fat}</span>
                </div>
              )}
              {product.snf && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-gray-400 text-xs block">Milk SNF</span>
                  <span className="text-white font-medium">{product.snf}</span>
                </div>
              )}
            </div>

            {/* Health Benefits */}
            {product.healthBenefits && product.healthBenefits.length > 0 && (
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Heart size={16} className="text-red-400" /> Key Health Benefits
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.healthBenefits.map((b, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        isDairy
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : "bg-green-500/10 text-green-300 border-green-500/20"
                      }`}
                    >
                      <CheckCircle2 size={12} className={isDairy ? "text-yellow-400" : "text-green-400"} />
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Storage Tips */}
            {product.storageTips && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <Clock size={20} className={`shrink-0 mt-0.5 ${isDairy ? "text-yellow-400" : "text-green-400"}`} />
                <div>
                  <h5 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    Storage & Freshness Tips
                  </h5>
                  <p className="text-sm text-gray-400 mt-0.5">{product.storageTips}</p>
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="text-sm font-medium text-gray-300">Quantity:</span>
                <div className="flex items-center border border-white/20 rounded-xl bg-white/5 overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-white text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={product.stock && quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {product.stock > 0 ? `(${product.stock} units available)` : "(Out of stock)"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2.5 transition shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 ${
                    isDairy
                      ? "bg-amber-500 hover:bg-amber-600 text-black"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2.5 bg-yellow-500 hover:bg-yellow-600 text-black transition shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50"
                >
                  <Zap size={18} />
                  Buy Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Similar / Recommended Products Section */}
        {similarProducts.length > 0 && (
          <div className="pt-12 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span
                  className={`text-xs font-semibold uppercase tracking-widest ${
                    isDairy ? "text-yellow-400" : "text-green-400"
                  }`}
                >
                  Recommendations
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Similar Products You Might Like
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Curated farm-fresh recommendations based on {product.name}
                </p>
              </div>

              <Link
                to={isDairy ? "/dairy/milkdiary" : "/mushrooms"}
                className={`flex items-center gap-1.5 text-sm font-semibold transition ${
                  isDairy
                    ? "text-yellow-400 hover:text-yellow-300"
                    : "text-green-400 hover:text-green-300"
                }`}
              >
                View All {isDairy ? "Dairy" : "Mushrooms"} <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -6 }}
                  className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/product/${item.slug}`)}
                >
                  <div>
                    <div className="relative overflow-hidden rounded-xl mb-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                        {item.category}
                      </span>
                      <div className="absolute top-2 right-2 bg-yellow-500/90 text-black px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star size={11} fill="black" /> {item.rating}
                      </div>
                    </div>

                    <h4 className="font-bold text-white text-base group-hover:text-green-400 transition truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 mb-3">
                      {item.fullDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 block">Price</span>
                      <span className="text-lg font-bold text-white">
                        {item.type === "dairy" ? "₹" : "$"}
                        {Number(item.price).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${item.slug}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        item.type === "dairy"
                          ? "bg-amber-500/20 text-yellow-400 hover:bg-amber-500 hover:text-black"
                          : "bg-green-500/20 text-green-400 hover:bg-green-600 hover:text-white"
                      }`}
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Buy Delivery Form Modal */}
      <AnimatePresence>
        {showDeliveryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#141414] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
              <div className="sticky top-0 z-10 bg-[#141414] border-b border-white/10 p-5 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">Instant Checkout</h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {product.name} • {quantity} unit(s) • Total: {currencySymbol}
                    {(Number(product.price) * quantity).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-90px)]">
                <DeliveryForm
                  product={{
                    ...product,
                    selectedQuantity: quantity,
                  }}
                  quantity={quantity}
                  onSubmit={handleOrderSubmit}
                  onCancel={() => setShowDeliveryModal(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductDetail;
