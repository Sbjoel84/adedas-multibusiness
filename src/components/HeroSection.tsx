import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => (
  <section className="relative overflow-hidden bg-gradient-cream">
    <div className="container relative z-10 py-16 md:py-28">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            100% Natural & Organic
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.1] md:text-5xl lg:text-6xl">
            Premium Skincare <br />
            <span className="text-gradient-gold">For Radiant Glow</span>
          </h1>
          <p className="max-w-md text-base text-muted-foreground leading-relaxed">
            Discover our curated collection of Jimpo-Ori & Milk & Honey Gold products — crafted with shea butter, organic honey, and natural botanicals for beautiful, nourished skin.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 gap-2 rounded-full px-8">
              <Link to="/products">
                Shop Now <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link to="/about">Our Story</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <div className="relative w-72 md:w-96">
            <img
              src="/images/shea-butter-family.jpeg"
              alt="Jimpo-Ori Shea Butter Collection"
              className="w-full rounded-3xl shadow-[var(--shadow-elevated)] border-4 border-background"
            />
            <div className="absolute -bottom-5 -left-5 h-28 w-28 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] border-3 border-background">
              <img src="/images/black-soap.jpeg" alt="Black Soap" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -top-5 -right-5 h-24 w-24 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] border-3 border-background">
              <img src="/images/essential-oils.jpeg" alt="Essential Oils" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-8 -right-8 h-20 w-20 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] border-3 border-background hidden md:block">
              <img src="/images/body-cream.jpeg" alt="Body Cream" className="h-full w-full object-cover" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>

    {/* Decorative circle */}
    <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gold-light/30 blur-3xl pointer-events-none" />
  </section>
);

export default HeroSection;
