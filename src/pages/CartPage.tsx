import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, Building2, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Payment account details
const PAYMENT_ACCOUNT = {
  accountNumber: "3046110946",
  bankName: "First Bank",
  accountName: "Adedamola Olayemi Daramola",
};

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Account number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (items.length === 0) {
    return (
      <main className="container py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-muted-foreground/40 mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Discover our premium beauty products</p>
        <Button asChild className="bg-gradient-gold text-primary-foreground">
          <Link to="/products">Browse Products</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="container py-10 md:py-16">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft size={16} /> Continue Shopping
      </Link>

      <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 rounded-lg border border-border p-4 bg-card"
              >
                <Link to={`/product/${item.product.id}`} className="w-20 h-24 rounded-md overflow-hidden shrink-0 bg-secondary">
                  <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.product.brand}</p>
                  <h3 className="text-sm font-medium truncate">{item.product.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.product.volume}</p>
                  <p className="text-sm font-bold mt-1">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => { removeFromCart(item.product.id); toast("Removed from cart"); }} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center rounded border border-border">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1 hover:bg-muted transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="px-2 text-xs font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1 hover:bg-muted transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="rounded-lg border border-border bg-card p-6 h-fit sticky top-24">
          <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-primary text-xs font-medium">Calculated at checkout</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
          <Button
            className="w-full mt-6 bg-gradient-gold text-primary-foreground hover:opacity-90"
            size="lg"
            onClick={() => setShowCheckout(true)}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>

      {/* Checkout Modal with Payment Details */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6"
          >
            <h2 className="font-display text-xl font-bold mb-4">Complete Your Order</h2>
            
            <div className="bg-amber-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800 mb-3 font-medium">Make payment to this account:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-900">{PAYMENT_ACCOUNT.accountNumber}</span>
                    <button 
                      onClick={() => copyToClipboard(PAYMENT_ACCOUNT.accountNumber)}
                      className="p-1 hover:bg-amber-100 rounded"
                      title="Copy account number"
                    >
                      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-amber-700" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-medium text-amber-900">{PAYMENT_ACCOUNT.bankName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="font-medium text-amber-900">{PAYMENT_ACCOUNT.accountName}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              After making payment, send your payment confirmation to our WhatsApp for order processing.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCheckout(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  window.open("https://wa.me/2348036262488?text=I've+made+payment+for+my+order", "_blank");
                  setShowCheckout(false);
                }}
              >
                Contact on WhatsApp
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
};

export default CartPage;
