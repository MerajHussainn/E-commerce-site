import { motion } from "framer-motion";
import { Star } from "lucide-react";

/* ---------------- DATA ---------------- */

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Dairy Farmer, UP",
    text: "My income doubled within 8 months. Training was practical and real.",
  },
  {
    name: "Anita Verma",
    role: "Organic Farmer, MP",
    text: "Best guidance I ever received. Complete hand-holding support.",
  },
  {
    name: "Sunil Yadav",
    role: "Goat Farmer, Bihar",
    text: "Market linkage helped me sell directly without middlemen.",
  },
  {
    name: "Pooja Singh",
    role: "Agri Entrepreneur, RJ",
    text: "From zero to business owner. Truly life-changing.",
  },
];

function Testimonials() {
  return (
    <>
      {/* ================= TIMELINE ================= */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 md:mb-20">
            Our Impact Journey
          </h2>

          <div className="border-l border-white/20 pl-6 sm:pl-10 space-y-10 sm:space-y-16">
            {[
              "2020 – Started",
              "2021 – 10 Districts",
              "2023 – 50K Farmers",
              "2025 – Pan India",
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-400 rounded-full -ml-[18px] sm:-ml-[18px] mb-2" />
                <p className="text-gray-300 text-sm sm:text-base">{t}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-16">
          Success Stories
        </h2>

        <motion.div
          className="flex gap-4 sm:gap-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        >
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={i}
              className="min-w-[260px] sm:min-w-[300px] md:min-w-[320px] bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-black">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.role}</div>
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">"{t.text}"</p>

              <div className="flex gap-1 mt-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </section>
    </>
  );
}

export default Testimonials;
