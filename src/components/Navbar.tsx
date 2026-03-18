import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X, Sun, Moon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLoginDialog from "@/components/AdminLoginDialog";
import { useTheme } from "next-themes";

const Navbar = () => {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border" 
          : "bg-background border-b border-border"
      }`}
    >
      <div className="container flex h-16 items-center justify-between md:h-20">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/images/adedas-logo.png"
            alt="ADEDAS MULTIBUSINESS"
            className="h-10 w-10 rounded-full border-2 border-primary object-cover md:h-12 md:w-12"
          />
          <span className="flex flex-col leading-tight" style={{ fontFamily: 'Tahoma, sans-serif' }}>
            <span className="text-sm font-bold tracking-widest md:text-base text-gradient-gold">ADEDAS</span>
            <span className="text-[10px] font-semibold tracking-wide md:text-xs text-gradient-gold">Multibusiness Ltd.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium tracking-wide text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/products" className="text-sm font-medium tracking-wide text-foreground hover:text-primary transition-colors">
            Shop
          </Link>
          <Link to="/about" className="text-sm font-medium tracking-wide text-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-sm font-medium tracking-wide text-foreground hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <Link to="/cart" className="relative text-foreground hover:text-primary transition-colors p-2">
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Link>
          <AdminLoginDialog />
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden bg-background"
          >
            <div className="container flex flex-col gap-4 py-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-foreground">Home</Link>
              <Link to="/products" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-foreground">Shop</Link>
              <Link to="/about" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-foreground">About</Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-foreground">Contact</Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
