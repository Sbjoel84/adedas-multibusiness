import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-secondary/50 mt-20">
    <div className="container py-12 md:py-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg font-semibold mb-3">Milk & Honey Gold</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Premium skincare and wellness products crafted with natural ingredients. Experience the luxury of gold-infused beauty.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3 uppercase tracking-wider">Quick Links</h4>
          <div className="flex flex-col gap-2">
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shop All</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
            <Link to="/cart" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cart</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3 uppercase tracking-wider">Contact</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>info@milkandhoneygold.com</span>
            <span>+234 800 000 0000</span>
            <span>Lagos, Nigeria</span>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © 2026 Milk & Honey Gold. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
