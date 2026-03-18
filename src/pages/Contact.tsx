import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Send, User, FileText } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    const whatsappMessage = `Hello ADEDAS,%0A%0AName: ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0ASubject: ${formData.subject}%0AMessage: ${formData.message}`;
    
    window.open(`https://wa.me/2348036262488?text=${whatsappMessage}`, "_blank");
    
    toast.success("Message sent via WhatsApp!");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-16 md:py-24 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpeg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative container text-center text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-3xl mx-auto"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300 mb-4">Get In Touch</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-gray-200">
              Have a question, feedback, or enquiry? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
          >
            <h2 className="font-display text-2xl font-bold text-primary mb-6">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234 ..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Product enquiry"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MessageCircle size={14} />
                Your message will be sent via WhatsApp for a quick response.
              </p>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Send Message
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold text-primary mb-6">Reach Us Directly</h2>
              
              <div className="space-y-6">
                <a 
                  href="tel:+2348036262488"
                  className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Phone / WhatsApp</p>
                    <p className="text-amber-700 font-semibold">+234 803 626 2488</p>
                  </div>
                </a>

                <a 
                  href="mailto:info@milkandhoneygold.com"
                  className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center">
                    <Mail size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Email</p>
                    <p className="text-amber-700">info@milkandhoneygold.com</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Location</p>
                    <p className="text-amber-700">Abuja, Nigeria</p>
                  </div>
                </div>

                <a
                  href="https://wa.me/2348036262488"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
                >
                  <MessageCircle size={20} />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Company Info Card */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg p-6 md:p-8 text-white">
              <h3 className="font-display text-xl font-bold mb-3">ADEDAS MULTIBUSINESS LTD</h3>
              <p className="text-white/80 leading-relaxed">
                Premium skincare and wellness products crafted with natural ingredients. 
                Your trusted source for quality beauty care.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
