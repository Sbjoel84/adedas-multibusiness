import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => (
  <section className="relative overflow-hidden bg-gradient-cream">
    <div className="container relative z-10 py-20 md:py-32">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Premium Beauty & Wellness
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Indulge in <br />
            <span className="text-gradient-gold">Golden Luxury</span>
          </h1>
          <p className="max-w-md text-base text-muted-foreground leading-relaxed">
            Discover our curated collection of Milk & Honey Gold skincare — crafted with organic honey, milk proteins, and natural ingredients for radiant, nourished skin.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 gap-2">
              <Link to="/products">
                Shop Now <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Our Story</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <div className="relative w-64 md:w-80">
            <img
              src="/images/body-cream.jpeg"
              alt="Milk & Honey Gold Nourishing Cream"
              className="w-full rounded-2xl shadow-[var(--shadow-elevated)]"
            />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-xl overflow-hidden shadow-[var(--shadow-card)] border-2 border-background">
              <img src="/images/sugar-scrub.jpeg" alt="Sugar Scrub" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-xl overflow-hidden shadow-[var(--shadow-card)] border-2 border-background">
              <img src="/images/hand-cream.jpeg" alt="Hand Cream" className="h-full w-full object-cover" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>

    {/* Decorative gold circle */}
    <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gold-light/30 blur-3xl pointer-events-none" />
  </section>
);

export default HeroSection;
