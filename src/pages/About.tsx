import { motion } from "framer-motion";
import { Sparkles, Leaf, Star, Award, Heart, Shield, TrendingUp, Quote } from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  { icon: Sparkles, title: "Quality", desc: "We are committed to delivering high-quality products that combine purity, nourishment, and luxury." },
  { icon: Heart, title: "Customer satisfaction", desc: "We prioritize customer satisfaction and strive to provide reliable service, fast delivery, and products our customers can trust." },
  { icon: Shield, title: "Integrity", desc: "Honest business practices and transparent relationships built on integrity and trust." },
  { icon: TrendingUp, title: "Innovation", desc: "Continuous improvement and innovation to bring you the best skincare solutions." },
  { icon: Leaf, title: "Natural ingredients", desc: "Premium ingredients that combine purity, nourishment, and luxury in every product." },
];

const testimonials = [
  {
    name: "Sarah M.",
    location: "Lagos",
    text: "I've been using ADEDAS products for months now, and my skin has never looked better. The shea butter collection is absolutely divine!",
    rating: 5,
  },
  {
    name: "Chioma O.",
    location: "Abuja",
    text: "The best skincare brand I've ever tried. Natural ingredients that really work. My skin feels so nourished and hydrated.",
    rating: 5,
  },
  {
    name: "Grace A.",
    location: "Port Harcourt",
    text: "Love their customer service and the quality of products. The honey glow set gave me the most beautiful radiance!",
    rating: 5,
  },
  {
    name: " Fatima K.",
    location: "Ibadan",
    text: "Finally found a brand that understands African skin. The products are gentle yet effective. Highly recommended!",
    rating: 5,
  },
];

const About = () => {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-20 md:py-32 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpeg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative container text-center text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-3xl mx-auto"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300 mb-4">About Us</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              ADEDAS MULTIBUSINESS LTD
            </h1>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
              A beauty, wellness and lifestyle brand dedicated to providing high-quality products 
              designed to nourish, protect, and enhance natural beauty and wellness.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-primary mb-4">Company Story</h2>
            <div className="w-20 h-1 bg-amber-400 mx-auto rounded-full" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="prose prose-lg mx-auto text-center"
          >
            <p className="text-muted-foreground leading-relaxed">
              ADEDAS MULTIBUSINESS was founded from a passion for skincare and healthy lifestyle and the desire to provide nourishing products made with carefully selected ingredients. What began as a small idea quickly grew into a trusted brand serving customers who value quality and luxury skincare.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gradient-to-br from-amber-50 to-amber-100/50 py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-amber-400"
            >
              <h3 className="font-display text-2xl font-bold text-primary mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to provide premium skincare products that combine natural ingredients 
                with modern formulations to deliver nourishing and luxurious skincare experiences.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-amber-500"
            >
              <h3 className="font-display text-2xl font-bold text-primary mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become a trusted skincare brand recognized for quality, innovation, and customer 
                satisfaction across Nigeria and beyond.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet the Founder */}
      <section className="container py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-bold text-primary mb-4">Founder / MD / CEO Profile</h2>
          <div className="w-20 h-1 bg-amber-400 mx-auto rounded-full" />
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full p-3 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <img 
                    src="/images/Adedas CEO.png" 
                    alt="Mrs. Adedamola Daramola - Founder & CEO"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <h3 className="font-display text-2xl font-bold text-primary mb-1">Mrs. Adedamola Daramola</h3>
              <p className="text-amber-600 font-medium mb-6">Entrepreneur</p>
              <p className="text-amber-600 font-medium mb-2">Founder & CEO</p>
              <p className="text-muted-foreground leading-relaxed">
                She is married with lovely children, a seasoned banker and marketer, holds Masters degree from Akinola Ladoke University, Bsc and HND in Accounting
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Mrs. Adedamola is the founder of ADEDAS MULTIBUSINESS. With a passion for skincare, wellness Beauty and entrepreneurship, she established the company to provide high-quality skincare solutions that promote healthy and glowing skin and healthy lifestyle. Her vision is to build a brand that combines natural ingredients with luxury lifestyle experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-16 md:py-24">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-primary mb-4">Core Values</h2>
            <div className="w-20 h-1 bg-amber-400 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 mb-4 mx-auto md:mx-0">
                  <v.icon size={22} className="text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-primary mb-2 text-center md:text-left">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-center md:text-left">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-bold text-primary mb-4">Why Choose Us</h2>
          <div className="w-20 h-1 bg-amber-400 mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Quality products", desc: "Carefully formulated with premium ingredients" },
            { title: "Customer trust", desc: "Dermatologically tested and pH balanced" },
            { title: "Customer Commitment", desc: "We prioritize customer satisfaction and strive to provide reliable service, fast delivery, and products our customers can trust." },
            { title: "Brand Promise", desc: "At ADEDAS MULTIBUSINESS, we are committed to delivering high-quality products that combine purity, nourishment, and luxury." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-4"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                <Star size={16} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-primary">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Product Philosophy */}
      <section className="bg-gradient-to-br from-primary to-primary/80 py-16 md:py-24 text-white">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl font-bold mb-6">Product Philosophy</h2>
            <p className="text-lg text-white/90 leading-relaxed mb-8">
              Our products are carefully formulated to deliver nourishment, hydration, and luxury 
              skincare experiences using premium ingredients. At ADEDAS MULTIBUSINESS, we are 
              committed to delivering high-quality skincare products that combine purity, nourishment, and luxury.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What Clients Are Saying */}
      <section className="bg-gradient-to-br from-amber-50 to-amber-100/50 py-16 md:py-24">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-primary mb-4">What Our Clients Say</h2>
            <div className="w-20 h-1 bg-amber-400 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <Quote size={32} className="text-amber-300 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-4 text-sm">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-primary">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container py-16 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl font-bold text-primary mb-6">
            Ready to Experience Luxury Skincare?
          </h2>
          <p className="text-muted-foreground mb-8">
            Discover our collection of premium skincare products designed to give you 
            healthy, glowing skin.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Sparkles className="mr-2" size={20} />
            Shop Our Products
          </Link>
        </motion.div>
      </section>
    </main>
  );
};

export default About;
