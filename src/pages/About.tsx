import { motion } from "framer-motion";
import { Sparkles, Leaf, Heart } from "lucide-react";

const values = [
  { icon: Sparkles, title: "Premium Ingredients", desc: "We source only the finest organic honey, milk proteins, and botanical extracts." },
  { icon: Leaf, title: "Natural & Safe", desc: "Our products are dermatologically tested, pH balanced, and free from harmful chemicals." },
  { icon: Heart, title: "Made with Love", desc: "Every formula is crafted in Sweden with care, precision, and a passion for beauty." },
];

const About = () => (
  <main>
    <section className="bg-gradient-cream">
      <div className="container py-16 md:py-24 text-center max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Our Story</p>
          <h1 className="font-display text-3xl font-bold md:text-4xl">About Milk & Honey Gold</h1>
          <p className="text-muted-foreground leading-relaxed">
            Born from a desire to bring luxury skincare to everyone, Milk & Honey Gold combines 
            centuries-old beauty secrets with modern science. Our gold-infused formulas harness the 
            nourishing power of organic honey and milk proteins to deliver transformative results.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="container py-16 md:py-24">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="text-center space-y-3 p-6"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <v.icon size={20} className="text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold">{v.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  </main>
);

export default About;
