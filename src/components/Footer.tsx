import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

// TikTok Icon Component
const TikTokIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  { 
    icon: Facebook, 
    href: "https://www.facebook.com/share/p/1AnGz8ms3J/", 
    label: "Facebook" 
  },
  { 
    icon: Instagram, 
    href: "https://instagram.com/iyalaje_worldwide", 
    label: "Instagram" 
  },
  { 
    icon: TikTokIcon, 
    href: "https://tiktok.com/@iyalaje.worldwide", 
    label: "TikTok" 
  },
];

const Footer = () => (
  <footer className="border-t border-border bg-lime-50 mt-20">
    <div className="container py-12 md:py-16">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        {/* Brand Info */}
        <div>
          <h3 className="font-display text-lg font-semibold mb-3 text-lime-800">ADEDAS MULTIBUSINESS</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Premium skincare and wellness products crafted with natural ingredients. Your trusted source for quality beauty care.
          </p>
          
          {/* Social Media Links */}
          <div className="mt-6">
            <h4 className="font-display text-sm font-semibold mb-3 uppercase tracking-wider text-lime-700">Follow Us</h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-200 text-lime-700 hover:bg-lime-300 hover:text-lime-800 transition-colors"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display text-sm font-semibold mb-3 uppercase tracking-wider text-lime-700">Quick Links</h4>
          <div className="flex flex-col gap-2">
            <Link to="/products" className="text-sm text-muted-foreground hover:text-lime-700 transition-colors">Shop All</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-lime-700 transition-colors">About Us</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-lime-700 transition-colors">Contact</Link>
            <Link to="/cart" className="text-sm text-muted-foreground hover:text-lime-700 transition-colors">Cart</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display text-sm font-semibold mb-3 uppercase tracking-wider text-lime-700">Contact</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Mail size={14} className="text-lime-600" />
              info@milkandhoneygold.com
            </span>
            <span className="flex items-center gap-2">
              <Phone size={14} className="text-lime-600" />
              +234 803 626 2488
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-lime-600" />
              Abuja, Nigeria
            </span>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-lime-200 pt-6 text-center text-xs text-muted-foreground">
        © 2026 ADEDAS MULTIBUSINESS. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
