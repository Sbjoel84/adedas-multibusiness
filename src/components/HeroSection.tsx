import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => (
  <section className="relative overflow-hidden min-h-[70vh] flex items-center">
    {/* Background image */}
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/hero-bg.jpeg')" }}
    />
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
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
