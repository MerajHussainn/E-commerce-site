import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function CTA() {
  return (
    <>
      {/* ================= FINAL CTA ================= */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600" />
        <div className="relative z-10 text-center max-w-4xl mx-auto text-white">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 sm:mb-8 leading-tight">
            Ready to Transform Your Farm?
          </h2>

          <Link to="/contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 sm:px-12 py-3.5 sm:py-5 bg-white text-green-700 font-bold rounded-full shadow-2xl text-base sm:text-lg inline-flex items-center gap-2"
            >
              Get Started <ChevronRight size={20} />
            </motion.button>
          </Link>
        </div>
      </section>
    </>
  );
}

export default CTA;
