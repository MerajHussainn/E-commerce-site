import { motion } from "framer-motion";
import {
  Target,
  Users,
  Shield,
  Heart,
  Award,
  TrendingUp,
  Leaf,
  Tractor,
} from "lucide-react";

/* ---------------- COMPONENT ---------------- */

function About() {
  return (
    <>
      {/* ================= ABOUT SECTION ================= */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs sm:text-sm font-medium">
                Our Mission
              </span>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white leading-tight">
                Empowering Farmers, <br />
                <span className="text-green-400">Transforming Lives</span>
              </h2>

              <p className="text-gray-300 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed">
                Founded in 2020, our foundation is dedicated to revolutionizing
                Indian agriculture through sustainable farming practices,
                modern technology, and comprehensive farmer education.
              </p>

              <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                We believe in creating a future where every farmer has access to
                the knowledge, tools, and market connections needed to thrive in
                the modern agricultural landscape.
              </p>

              <div className="space-y-3 sm:space-y-4">
                {[
                  { icon: Target, text: "Sustainable Farming Practices" },
                  { icon: Users, text: "Community-Centric Approach" },
                  { icon: Shield, text: "Quality & Safety Standards" },
                  { icon: Heart, text: "Farmer Welfare First" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <item.icon className="text-green-400" size={18} />
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-3 sm:gap-6 mt-6 md:mt-0"
            >
              {[
                { icon: Award, value: "10+", label: "National Awards" },
                {
                  icon: TrendingUp,
                  value: "300%",
                  label: "Avg. Income Growth",
                },
                { icon: Leaf, value: "100%", label: "Organic Certified" },
                {
                  icon: Tractor,
                  value: "5000+",
                  label: "Modern Tools Provided",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:border-green-500/30 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/10 mb-3 sm:mb-4">
                    <stat.icon className="text-green-400" size={20} />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
