import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/data/products";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, Sparkles, Leaf, Droplets, CheckCircle, Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const trustBadges = [
  { icon: Leaf, title: "Natural Ingredients", desc: "Organic shea butter, honey & botanical extracts" },
  { icon: Droplets, title: "Fragrance Free Options", desc: "Gentle formulas for sensitive skin" },
  { icon: CheckCircle, title: "Dermatologically Tested", desc: "NAFDAC approved & safe for all skin types" },
  { icon: Shield, title: "Paraben Free", desc: "No harmful chemicals, just pure goodness" },
];

const features = [
  { icon: Sparkles, title: "Premium Quality", desc: "Crafted with organic, natural ingredients" },
  { icon: Truck, title: "Nationwide Delivery", desc: "Fast & reliable doorstep delivery" },
  { icon: Shield, title: "Secure Payments", desc: "Encrypted transactions, always safe" },
];

const testimonials = [
  { name: "Amina O.", location: "Lagos", rating: 5, text: "The Jimpo-Ori Shea Butter transformed my baby's skin. So smooth and gentle — I use it every day!" },
  { name: "Blessing A.", location: "Abuja", rating: 5, text: "The Black Soap is incredible! My dark spots have faded significantly in just 3 weeks. Highly recommend." },
  { name: "Chioma E.", location: "Port Harcourt", rating: 4, text: "I bought the full collection as a gift and the packaging was beautiful. Premium quality at a great price." },
];

const filterCategories = ["All", "Shea Butter", "Body Cream", "Soaps", "Gift Sets"];

const Index = () => {
  const { products } = useProducts();
  const [activeCategory, setActiveCategory] = useState("All");
  const featured = products.slice(0, 4);

  const categoryProducts = activeCategory === "All"
    ? products.slice(0, 8)
    : products.filter((p) => p.category === activeCategory).slice(0, 8);

  return (
    <main>
      <HeroSection />

      {/* Trust Badges */}
      <section className="border-b border-border bg-background py-12 md:py-16">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {trustBadges.map((badge, i) => (
            <motion.div key={badge.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                <badge.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-display text-sm font-semibold">{badge.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Collection Showcase */}
      <section className="container py-16 md:py-24">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
            <img src="/images/shea-butter-skincare.jpeg" alt="Shea Butter Skincare" className="rounded-2xl shadow-[var(--shadow-card)] w-full aspect-square object-cover" />
            <img src="/images/product-pyramid.jpeg" alt="Product Pyramid" className="rounded-2xl shadow-[var(--shadow-card)] w-full aspect-square object-cover mt-8" />
            <img src="/images/shea-butter-gift-set.jpeg" alt="Gift Set" className="rounded-2xl shadow-[var(--shadow-card)] w-full aspect-square object-cover -mt-4" />
            <img src="/images/full-collection.jpeg" alt="Full Collection" className="rounded-2xl shadow-[var(--shadow-card)] w-full aspect-square object-cover mt-4" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Full Catalogue</p>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Our Complete <br /><span className="text-gradient-gold">Collection</span></h2>
            <p className="text-muted-foreground leading-relaxed">From nourishing shea butters to premium black soaps and essential oils — our collection covers every step of your beauty routine. All products are NAFDAC approved and made with 100% natural ingredients.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">Shop Now <ArrowRight size={14} /></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-2">Latest Products</p>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Featured Products</h2>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">View All <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {featured.map((product, i) => (<ProductCard key={product.id} product={product} index={i} />))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">View All Products <ArrowRight size={14} /></Link>
        </div>
      </section>

      {/* Highlight Section */}
      <section className="bg-secondary/60">
        <div className="container py-16 md:py-24">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5 order-2 md:order-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Pure & Simple</p>
              <h2 className="font-display text-2xl font-bold md:text-3xl">Deeply Nourishing Care <br /><span className="text-gradient-gold">For Glowing Skin</span></h2>
              <p className="text-muted-foreground leading-relaxed">Our formulas harness the power of organic shea butter, essential oils, and African black soap to deliver transformative results — naturally.</p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {["Strong & Smooth", "Paraben-Free", "Sulphate-Free", "100% Natural"].map((t) => (
                  <div key={t} className="flex items-center gap-2"><CheckCircle size={16} className="text-primary shrink-0" /><span className="text-sm font-medium">{t}</span></div>
                ))}
              </div>
              <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity mt-4">Shop Now <ArrowRight size={14} /></Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2">
              <img src="/images/black-soap.jpeg" alt="Premium Black Soap" className="rounded-3xl shadow-[var(--shadow-elevated)] w-full max-w-md mx-auto" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-2">Popular Products</p>
          <h2 className="font-display text-2xl font-bold md:text-3xl">Beauty Care Products</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filterCategories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`rounded-full px-5 py-2 text-xs font-medium transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{cat}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categoryProducts.map((product, i) => (<ProductCard key={product.id} product={product} index={i} />))}
        </div>
        {categoryProducts.length === 0 && <p className="text-center text-muted-foreground py-12">No products in this category.</p>}
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-cream">
        <div className="container py-16 md:py-24">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-2">Customer Love</p>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Testimonials</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="rounded-2xl bg-background p-6 shadow-[var(--shadow-card)] space-y-4">
                <div className="flex items-center gap-1">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={14} className="fill-accent text-accent" />))}</div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"><Quote size={16} className="text-primary" /></div>
                  <div><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-muted-foreground">{t.location}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Promise */}
      <section className="container py-16 md:py-24 text-center max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Our Promise</p>
          <h2 className="font-display text-2xl font-bold md:text-3xl">Beauty Rooted in Nature</h2>
          <p className="text-muted-foreground leading-relaxed">Every product is thoughtfully formulated with the finest natural ingredients — from organic shea butter and essential oils to African black soap. We believe luxury should be accessible, effective, and kind to your skin.</p>
          <Link to="/about" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">Learn More About Us <ArrowRight size={14} /></Link>
        </motion.div>
      </section>

      {/* Features strip */}
      <section className="border-t border-border bg-background">
        <div className="container grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0 divide-border">
          {features.map((f) => (
            <div key={f.title} className="flex items-center gap-4 py-6 px-4 md:justify-center">
              <f.icon size={20} className="text-primary shrink-0" />
              <div><p className="text-sm font-semibold">{f.title}</p><p className="text-xs text-muted-foreground">{f.desc}</p></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Index;
