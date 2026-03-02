import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Sparkles, title: "Premium Quality", desc: "Crafted with organic, natural ingredients" },
  { icon: Truck, title: "Nationwide Delivery", desc: "Fast & reliable doorstep delivery" },
  { icon: Shield, title: "Secure Payments", desc: "Encrypted transactions, always safe" },
];

const Index = () => {
  const featured = products.slice(0, 4);

  return (
    <main>
      <HeroSection />

      {/* Features strip */}
      <section className="border-b border-border bg-background">
        <div className="container grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0 divide-border">
          {features.map((f) => (
            <div key={f.title} className="flex items-center gap-4 py-6 px-4 md:justify-center">
              <f.icon size={20} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-2">Curated Selection</p>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Featured Products</h2>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View All Products <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Brand story teaser */}
      <section className="bg-gradient-cream">
        <div className="container py-16 md:py-24 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Our Promise</p>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Beauty Rooted in Nature</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every product in our collection is thoughtfully formulated with the finest natural ingredients — 
              from organic honey and milk proteins to soothing aloe vera. We believe luxury should be 
              accessible, effective, and kind to your skin.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Index;
