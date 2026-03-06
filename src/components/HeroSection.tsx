import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const heroImages = [
  "/images/hero-1.jpeg",
  "/images/hero-2.jpeg",
  "/images/hero-3.jpeg",
  "/images/hero-4.jpeg",
  "/images/hero-5.jpeg",
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Sliding background images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroImages[current]}')` }}
        />
      </AnimatePresence>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

      <div className="container relative z-10 py-16 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl space-y-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
            100% Natural & Organic
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.1] text-white md:text-5xl lg:text-6xl">
            Premium Skincare <br />
            <span className="text-amber-300">For Radiant Glow</span>
          </h1>
          <p className="max-w-md text-base text-white/80 leading-relaxed">
            Discover our curated collection of Jimpo-Ori & premium skincare products — crafted with shea butter, organic honey, and natural botanicals for beautiful, nourished skin.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 gap-2 rounded-full px-8">
              <Link to="/products">
                Shop Now <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-white/30 text-white hover:bg-white/10">
              <Link to="/about">Our Story</Link>
            </Button>
          </div>
          {/* Dots indicator */}
          <div className="flex gap-2 pt-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-amber-300" : "w-2 bg-white/50"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
