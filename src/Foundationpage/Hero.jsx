import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";

/* ================= DATA ================= */
const stats = [
  { icon: "👨‍🌾", number: "50K+", label: "Farmers Empowered" },
  { icon: "🥛", number: "1M+", label: "Litres Milk / Day" },
  { icon: "🍄", number: "500+", label: "Mushroom Units" },
  { icon: "🌍", number: "20+", label: "States Covered" },
];

/* ================= COMPONENT ================= */
function Hero() {
  const { scrollY } = useScroll();

  const heroY = useTransform(scrollY, [0, 300], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.85]);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24 overflow-hidden bg-black text-white">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[350px] sm:w-[500px] md:w-[600px] h-[350px] sm:h-[500px] md:h-[600px] bg-green-500/15 rounded-full blur-[100px] sm:blur-[140px] -top-20 sm:-top-40 -left-10 sm:-left-20"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-[300px] sm:w-[450px] md:w-[500px] h-[300px] sm:h-[450px] md:h-[500px] bg-emerald-500/15 rounded-full blur-[100px] sm:blur-[120px] bottom-0 right-0"
          animate={{ scale: [1.15, 1, 1.15] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 text-center max-w-6xl w-full mx-auto"
      >
        <span className="inline-block mb-4 sm:mb-6 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-gray-300">
          🌱 Transforming Agriculture Since 2020
        </span>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-4 sm:mb-6">
          Cultivate Your <br />
          <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Sustainable Future
          </span>
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 text-base sm:text-lg px-2">
          India's most trusted foundation empowering farmers with modern dairy &
          mushroom farming.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
          <Link to="/dairy" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              Start Your Journey{" "}
              <ArrowRight size={18} />
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 border border-white/20 hover:bg-white/5 rounded-full flex items-center justify-center gap-2 text-white font-medium transition"
          >
            <Play size={16} /> Watch Stories
          </motion.button>
        </div>

        {/* Stats */}
        <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center"
            >
              <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{s.icon}</div>
              <div className="text-xl sm:text-2xl font-bold text-white">{s.number}</div>
              <div className="text-gray-400 text-xs sm:text-sm mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default Hero;
