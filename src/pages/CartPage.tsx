import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, Lock, Check, X, Building2, Wallet, Banknote, User, Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PaystackPop from "@paystack/inline-js";
import { createOrder, type OrderRecord, type PaymentMethod, updateOrderPayment } from "@/lib/orders";

interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

const BANK_DETAILS = {
  bankName: "First Bank",
  accountName: "Adedamola Olayemi Daramola",
  accountNumber: "3046110946",
};

const emptyCustomerDetails: CustomerDetails = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [currentOrder, setCurrentOrder] = useState<OrderRecord | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(emptyCustomerDetails);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  const handleCustomerInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === "cardNumber") {
      value = value.replace(/\D/g, "").slice(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    } else if (name === "expiryDate") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2);
      }
    } else if (name === "cvv") {
      value = value.replace(/\D/g, "").slice(0, 3);
    } else if (name === "cardHolder") {
      value = value.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
    }

    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  const validateCustomerDetails = () => {
    if (!customerDetails.fullName.trim()) {
      toast.error("Enter your full name");
      return false;
    }
    if (!customerDetails.email.trim() || !/^\S+@\S+\.\S+$/.test(customerDetails.email)) {
      toast.error("Enter a valid email address");
      return false;
    }
    if (!customerDetails.phone.trim()) {
      toast.error("Enter your phone number");
      return false;
    }
    if (!customerDetails.address.trim()) {
      toast.error("Enter your delivery address");
      return false;
    }
    return true;
  };

  const createPendingOrder = async () => {
    const reference = `ADE_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const order = await createOrder({
      customerName: customerDetails.fullName,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      deliveryAddress: customerDetails.address,
      paymentMethod,
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        quantity: item.quantity,
        unitPrice: item.product.price,
        promoPrice: item.product.promoPrice,
        image: item.product.image,
      })),
      deliveryFee: 0,
      notes: customerDetails.notes,
      paymentReference: reference,
    });
    setCurrentOrder(order);
    return order;
  };

  const handleCardPayment = async () => {
    if (!validateCustomerDetails()) return;
    if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv) {
      toast.error("Please fill in all card details");
      return;
    }

    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!key) {
      const order = await createPendingOrder();
      toast.error("Paystack public key is not configured. Order created for manual confirmation.");
      setPaymentSuccess(true);
      clearCart();
      return;
    }

    setIsProcessing(true);
    const reference = `ADE_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    try {
      const order = await createPendingOrder();
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key,
        amount: Math.round(totalPrice * 100),
        email: customerDetails.email,
        currency: "NGN",
        channels: ["card"],
        ref: reference,
        onSuccess: async (transaction: { reference?: string; status?: string }) => {
          try {
            const updated = await updateOrderPayment(order.id, {
              paymentStatus: transaction.status === "success" ? "paid" : "failed",
              paymentReference: transaction.reference ?? reference,
            });
            setCurrentOrder(updated);
            setPaymentSuccess(true);
            clearCart();
            toast.success(`Payment successful. Order ${updated.order_number} created.`);
          } catch {
            toast.error(`Payment completed, but order update failed. Reference: ${transaction.reference ?? reference}`);
          } finally {
            setIsProcessing(false);
          }
        },
        onCancel: async () => {
          try {
            await updateOrderPayment(order.id, { paymentStatus: "failed", paymentReference: reference });
          } catch {}
          setIsProcessing(false);
          toast.error("Payment cancelled. Order marked as failed.");
        },
      });
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      toast.error("Unable to start payment. Please try again.");
    }
  };

  const handlePaystackPayment = async () => {
    if (!validateCustomerDetails()) return;

    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!key) {
      const order = await createPendingOrder();
      toast.error("Paystack public key is not configured. Order created for manual confirmation.");
      setPaymentSuccess(true);
      clearCart();
      return;
    }

    setIsProcessing(true);
    const reference = `ADE_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    try {
      const order = await createPendingOrder();
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key,
        amount: Math.round(totalPrice * 100),
        email: customerDetails.email,
        currency: "NGN",
        channels: ["bank", "card", "ussd", "transfer"],
        ref: reference,
        onSuccess: async (transaction: { reference?: string; status?: string }) => {
          try {
            const updated = await updateOrderPayment(order.id, {
              paymentStatus: transaction.status === "success" ? "paid" : "failed",
              paymentReference: transaction.reference ?? reference,
            });
            setCurrentOrder(updated);
            setPaymentSuccess(true);
            clearCart();
            toast.success(`Payment successful. Order ${updated.order_number} created.`);
          } catch {
            toast.error(`Payment completed, but order update failed. Reference: ${transaction.reference ?? reference}`);
          } finally {
            setIsProcessing(false);
          }
        },
        onCancel: async () => {
          try {
            await updateOrderPayment(order.id, { paymentStatus: "failed", paymentReference: reference });
          } catch {}
          setIsProcessing(false);
          toast.error("Payment cancelled. Order marked as failed.");
        },
      });
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      toast.error("Unable to start Paystack payment. Please try again.");
    }
  };

  const closeCheckout = () => {
    setShowCheckout(false);
    setPaymentSuccess(false);
    setCurrentOrder(null);
    setCardDetails({ cardNumber: "", cardHolder: "", expiryDate: "", cvv: "" });
    setPaymentMethod("card");
  };

  const handleAlternativePayment = async () => {
    if (!validateCustomerDetails()) return;
    setIsProcessing(true);

    try {
      const order = await createPendingOrder();
      clearCart();
      setCurrentOrder(order);
      setPaymentSuccess(true);
      toast.success(`Order ${order.order_number} created. ${paymentMethod === "bank_transfer" ? "Confirm payment with the bank details." : "You will be contacted before delivery."}`);
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Order failed: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
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
                  <p className="text-sm font-bold mt-1">{formatPrice(item.product.promoPrice ?? item.product.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button type="button" onClick={() => { removeFromCart(item.product.id); toast("Removed from cart"); }} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove item from cart">
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center rounded border border-border">
                    <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1 hover:bg-muted transition-colors" aria-label="Decrease quantity">
                      <Minus size={12} />
                    </button>
                    <span className="px-2 text-xs font-medium">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1 hover:bg-muted transition-colors" aria-label="Increase quantity">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

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

      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Complete Your Order</h2>
              <button type="button" onClick={closeCheckout} className="p-1 hover:bg-gray-100 rounded" aria-label="Close checkout">
                <X size={20} />
              </button>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Order Total</span>
                <span className="font-bold text-lg text-amber-900">{formatPrice(totalPrice)}</span>
              </div>
              <p className="text-xs text-amber-700">{items.length} item(s) in cart</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-1 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="fullName"
                    value={customerDetails.fullName}
                    onChange={handleCustomerInput}
                    placeholder="Full name"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="email"
                    type="email"
                    value={customerDetails.email}
                    onChange={handleCustomerInput}
                    placeholder="Email address"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="phone"
                    value={customerDetails.phone}
                    onChange={handleCustomerInput}
                    placeholder="Phone number"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 -translate-y-1/2 text-gray-400" size={16} />
                  <textarea
                    name="address"
                    value={customerDetails.address}
                    onChange={handleCustomerInput}
                    placeholder="Delivery address"
                    rows={3}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                  />
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 -translate-y-1/2 text-gray-400" size={16} />
                  <textarea
                    name="notes"
                    value={customerDetails.notes}
                    onChange={handleCustomerInput}
                    placeholder="Order notes, optional"
                    rows={2}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium">Select Payment Method</label>

              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "card" ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-gray-300"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="sr-only"
                />
                <CreditCard size={20} className={paymentMethod === "card" ? "text-amber-600" : "text-gray-400"} />
                <div className="flex-1">
                  <span className="text-sm font-medium">Card via Paystack</span>
                  <p className="text-xs text-gray-500">Secure card payment</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "card" ? "border-amber-500 bg-amber-500" : "border-gray-300"}`}>
                  {paymentMethod === "card" && <Check size={12} className="text-white" />}
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "paystack" ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-gray-300"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paystack"
                  checked={paymentMethod === "paystack"}
                  onChange={() => setPaymentMethod("paystack")}
                  className="sr-only"
                />
                <svg viewBox="0 0 24 24" className={`w-5 h-5 ${paymentMethod === "paystack" ? "text-amber-600" : "text-gray-400"}`} fill="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                <div className="flex-1">
                  <span className="text-sm font-medium">Paystack</span>
                  <p className="text-xs text-gray-500">Bank transfer, card, USSD, or transfer</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "paystack" ? "border-amber-500 bg-amber-500" : "border-gray-300"}`}>
                  {paymentMethod === "paystack" && <Check size={12} className="text-white" />}
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "bank_transfer" ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-gray-300"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={() => setPaymentMethod("bank_transfer")}
                  className="sr-only"
                />
                <Building2 size={20} className={paymentMethod === "bank_transfer" ? "text-amber-600" : "text-gray-400"} />
                <div className="flex-1">
                  <span className="text-sm font-medium">Bank Transfer</span>
                  <p className="text-xs text-gray-500">Manual bank transfer</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "bank_transfer" ? "border-amber-500 bg-amber-500" : "border-gray-300"}`}>
                  {paymentMethod === "bank_transfer" && <Check size={12} className="text-white" />}
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === "pay_on_delivery" ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-gray-300"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="pay_on_delivery"
                  checked={paymentMethod === "pay_on_delivery"}
                  onChange={() => setPaymentMethod("pay_on_delivery")}
                  className="sr-only"
                />
                <Wallet size={20} className={paymentMethod === "pay_on_delivery" ? "text-amber-600" : "text-gray-400"} />
                <div className="flex-1">
                  <span className="text-sm font-medium">Pay on Delivery</span>
                  <p className="text-xs text-gray-500">Pay when delivered</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "pay_on_delivery" ? "border-amber-500 bg-amber-500" : "border-gray-300"}`}>
                  {paymentMethod === "pay_on_delivery" && <Check size={12} className="text-white" />}
                </div>
              </label>
            </div>

            {paymentMethod === "card" && (
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={handleCardInput}
                        placeholder="1234 5678 9012 3456"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Card Holder Name</label>
                    <input
                      type="text"
                      name="cardHolder"
                      value={cardDetails.cardHolder}
                      onChange={handleCardInput}
                      placeholder="JOHN DOE"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardInput}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardInput}
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                  <Lock size={14} />
                  <span>Card details are processed by Paystack and are not stored here.</span>
                </div>

                <Button
                  type="button"
                  onClick={handleCardPayment}
                  disabled={isProcessing}
                  className="w-full mt-4 bg-gradient-gold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  size="lg"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Processing Payment...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard size={18} />
                      Pay {formatPrice(totalPrice)}
                    </span>
                  )}
                </Button>
              </div>
            )}

            {paymentMethod === "paystack" && (
              <div>
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-600" fill="currentColor">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    <span className="text-sm font-medium text-green-800">Paystack Payment</span>
                  </div>
                  <p className="text-xs text-green-700 mb-4">
                    Complete payment securely through Paystack. Your order is created immediately and updates in real time.
                  </p>
                  <div className="border-t border-green-200 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-green-600 font-medium">Amount:</span>
                      <span className="font-bold text-lg">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePaystackPayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  size="lg"
                >
                  {isProcessing ? "Processing..." : `Pay ${formatPrice(totalPrice)}`}
                </Button>
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <div>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Banknote size={20} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Bank Transfer Instructions</span>
                  </div>
                  <p className="text-xs text-blue-700 mb-4">
                    Transfer the exact amount to the account below. Your order will be processed once payment is confirmed.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-600">Bank Name:</span>
                      <span className="font-medium">{BANK_DETAILS.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Account Name:</span>
                      <span className="font-medium">{BANK_DETAILS.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Account Number:</span>
                      <span className="font-medium font-mono">{BANK_DETAILS.accountNumber}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-blue-600">Amount to Pay:</span>
                        <span className="font-bold text-lg">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleAlternativePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  size="lg"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Creating Order...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Building2 size={18} />
                      Create Order
                    </span>
                  )}
                </Button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  You will receive payment details and confirmation after the order is created.
                </p>
              </div>
            )}

            {paymentMethod === "pay_on_delivery" && (
              <div>
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet size={20} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">Pay on Delivery</span>
                  </div>
                  <p className="text-xs text-green-700 mb-4">
                    Pay for your order when it is delivered to your doorstep.
                  </p>
                  <div className="border-t border-green-200 pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-green-600" />
                      <span className="text-green-700">Pay only when you receive your order</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-green-600" />
                      <span className="text-green-700">Pay with cash or card on delivery</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-green-600" />
                      <span className="text-green-700">Inspect items before payment</span>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <span className="text-sm text-gray-500">Amount to Pay on Delivery:</span>
                  <p className="text-2xl font-bold text-amber-700">{formatPrice(totalPrice)}</p>
                </div>

                <Button
                  onClick={handleAlternativePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  size="lg"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Creating Order...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Wallet size={18} />
                      Create Order
                    </span>
                  )}
                </Button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  You will receive a call before delivery. Have the exact amount ready.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {paymentSuccess && currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Order Created</h2>
            <p className="text-muted-foreground mb-2">
              Order {currentOrder.order_number} has been saved to live transactions.
            </p>
            <p className="text-sm text-gray-500 mb-6 capitalize">
              Payment status: {currentOrder.payment_status.replace("_", " ")}
            </p>
            <Button
              onClick={() => {
                setPaymentSuccess(false);
                setShowCheckout(false);
                setCurrentOrder(null);
              }}
              className="w-full bg-gradient-gold text-primary-foreground"
              size="lg"
            >
              Continue Shopping
            </Button>
          </motion.div>
        </div>
      )}
    </main>
  );
};

export default CartPage;
