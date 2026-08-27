import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice, Product } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import ProductFormDialog from "@/components/ProductFormDialog";
import { VisitorsDashboard } from "@/components/VisitorsDashboard";
import {
  Package, ShoppingCart, DollarSign, TrendingUp,
  Edit, Trash2, Plus, Eye, Download, ArrowLeft, Search, Lock, BarChart2,
  CheckCircle2, XCircle, Paperclip, X
} from "lucide-react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  listOrders,
  subscribeOrders,
  updateOrderStatus as updateOrderFulfillment,
  updateOrderPayment,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/orders";
import { subscribeBookings, listBookings, updateBookingStatus, type BookingRecord } from "@/lib/bookings";

const fulfillmentColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const paymentColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200",
};

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function orderItemCount(order: OrderRecord) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

function csvEscape(value: string | number) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

const Admin = () => {
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchProduct, setSearchProduct] = useState("");
  const [searchOrder, setSearchOrder] = useState("");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [searchBooking, setSearchBooking] = useState("");
  const [proofOrder, setProofOrder] = useState<OrderRecord | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const adminToken = localStorage.getItem('adminToken');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  // Short audio ping for new orders/bookings (best-effort; browsers may block autoplay).
  const playPing = useCallback(() => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1175, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.42);
      osc.onended = () => ctx.close();
    } catch {
      /* ignore */
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const liveOrders = await listOrders();
      setOrders(liveOrders);
    } catch (error: any) {
      console.error(error);
      setOrdersError(error?.message ?? "Unable to load live orders. Check Supabase configuration and RLS policies.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError("");
    try {
      const rows = await listBookings();
      setBookings(rows);
    } catch (err: any) {
      console.error(err);
      setBookingsError(err?.message ?? "Unable to load bookings. Check Supabase configuration and RLS policies.");
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const granted = Notification.permission === 'granted';
    setNotificationsEnabled(granted);
    if (granted) localStorage.setItem('adminNotifications', 'granted');
  }, []);

  async function requestNotificationsPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast({ title: 'Not supported', description: 'Your browser does not support desktop notifications.', variant: 'destructive' });
      return;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: 'Notifications are blocked',
        description: 'Click the lock icon (🔒) in your browser address bar → Site settings → Allow Notifications.',
        variant: 'destructive',
      });
      return;
    }

    if (Notification.permission === 'granted') {
      localStorage.setItem('adminNotifications', 'granted');
      setNotificationsEnabled(true);
      toast({ title: 'Notifications are already enabled' });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('adminNotifications', 'granted');
        setNotificationsEnabled(true);
        toast({ title: 'Notifications enabled', description: 'You will be alerted for new orders and bookings.' });
      } else {
        localStorage.removeItem('adminNotifications');
        setNotificationsEnabled(false);
        toast({ title: 'Notifications denied', description: 'You can allow them later via browser site settings.', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Unable to request notification permission.', variant: 'destructive' });
    }
  }

  function sendBrowserNotification(title: string, body: string) {
    if (!notificationsEnabled) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const n = new Notification(title, { body, tag: 'adedas-admin', renotify: true } as NotificationOptions);
      n.onclick = () => { try { window.focus(); } catch (e) {} };
    } catch (err) {
      console.error('Notification error', err);
    }
  }

  useEffect(() => {
    loadOrders();
    const unsubscribe = subscribeOrders((event) => {
      if (event.type === "DELETE") {
        setOrders((prev) => prev.filter((order) => order.id !== event.order.id));
        return;
      }

        setOrders((prev) => {
          const exists = prev.some((order) => order.id === event.order.id);
          if (exists) {
            return prev.map((order) => order.id === event.order.id ? event.order : order);
          }
          // new order inserted -> show admin toast notification
          if (event.type === "INSERT") {
            try {
              const title = "New order received";
              const desc = `${event.order.order_number} — ${event.order.customer_name}`;
              toast({ title, description: desc });
              sendBrowserNotification(title, desc);
              playPing();
            } catch (err) {
              // ignore toast errors
            }
          }
          return [event.order, ...prev];
        });
    });

    return unsubscribe;
  }, [loadOrders]);

  useEffect(() => {
    loadBookings();
    const unsubscribeBookings = subscribeBookings((event) => {
      if (event.type === 'DELETE') {
        setBookings((prev) => prev.filter((b) => b.id !== event.booking.id));
        return;
      }

      setBookings((prev) => {
        const exists = prev.some((b) => b.id === event.booking.id);
        if (exists) return prev.map((b) => b.id === event.booking.id ? event.booking : b);

        // show toast and desktop notification for new booking
        if (event.type === 'INSERT') {
          try {
            const title = 'New booking received';
            const desc = `${event.booking.booking_number} — ${event.booking.customer_name}`;
            try { toast({ title, description: desc }); } catch(e){}
            sendBrowserNotification(title, desc);
            playPing();
          } catch (e) {}
        }

        return [event.booking, ...prev];
      });
    });

    return unsubscribeBookings;
  }, [loadBookings]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.fulfillment_status === "pending").length;

  // Transactions that still need the admin's attention.
  const ordersNeedingAttention = orders.filter(
    (o) => o.payment_status === "pending" || o.fulfillment_status === "pending"
  ).length;
  const bookingsNeedingAttention = bookings.filter((b) => b.status === "pending").length;
  const attentionCount = ordersNeedingAttention + bookingsNeedingAttention;

  // Reflect the pending count in the browser tab title so it's visible even when
  // the dashboard is in a background tab.
  useEffect(() => {
    const base = "Admin Dashboard — ADEDAS";
    document.title = attentionCount > 0 ? `(${attentionCount}) ${base}` : base;
    return () => { document.title = base; };
  }, [attentionCount]);

  const filteredProducts = useMemo(() => products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchProduct.toLowerCase())
  ), [products, searchProduct]);

  const filteredOrders = useMemo(() => orders.filter(o => {
    const searchable = [
      o.order_number,
      o.customer_name,
      o.customer_email,
      o.customer_phone,
    ].join(" ").toLowerCase();
    return searchable.includes(searchOrder.toLowerCase());
  }), [orders, searchOrder]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const previousOrders = orders;
    const status = newStatus as OrderStatus;

    setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, fulfillment_status: status } : order));

    try {
      const updated = await updateOrderFulfillment(orderId, status);
      setOrders((prev) => prev.map((order) => order.id === updated.id ? updated : order));
      toast({ title: "Order updated", description: `${updated.order_number} status changed to ${status}` });
    } catch (error) {
      console.error(error);
      setOrders(previousOrders);
      toast({ title: "Update failed", description: "Unable to update live order status.", variant: "destructive" });
    }
  };

  const handlePaymentDecision = async (status: "paid" | "failed") => {
    if (!proofOrder) return;
    setConfirmingPayment(true);
    try {
      const updated = await updateOrderPayment(proofOrder.id, { paymentStatus: status });
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
      setProofOrder(updated);
      toast({
        title: status === "paid" ? "Payment confirmed" : "Payment rejected",
        description: `${updated.order_number} marked as ${status}.`,
      });
      if (status === "paid") setProofOrder(null);
    } catch (err) {
      console.error(err);
      toast({ title: "Update failed", description: "Could not update payment status.", variant: "destructive" });
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleExport = () => {
    const csv = [
      "Order ID,Customer,Email,Phone,Items,Total,Payment,Fulfillment,Date,Reference",
      ...filteredOrders.map(o => [
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        orderItemCount(o),
        o.total,
        o.payment_status,
        o.fulfillment_status,
        o.created_at,
        o.payment_reference ?? "",
      ].map(csvEscape).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "orders-report.csv"; a.click();
    toast({ title: "Report exported", description: "Live CSV file downloaded successfully." });
  };

  const handleSave = async (data: Omit<Product, "id">) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast({ title: "Product updated", description: `${data.name} has been updated.` });
      } else {
        await addProduct(data);
        toast({ title: "Product added", description: `${data.name} has been added to the catalogue.` });
      }
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save product. Check your connection.", variant: "destructive" });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      toast({ title: "Product deleted", description: `${product.name} has been removed.` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "Success", description: "Password changed successfully" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSettingsOpen(false);
      } else {
        toast({ title: "Error", description: data.error || "Failed to change password", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to change password", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign, accent: "text-green-600" },
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, accent: "text-blue-600" },
    { label: "Products", value: products.length, icon: Package, accent: "text-primary" },
    { label: "Pending Orders", value: pendingOrders, icon: TrendingUp, accent: "text-yellow-600" },
    { label: "Bookings", value: bookings.length, icon: BarChart2, accent: "text-amber-600" },
  ];

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-background">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div>
              <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage products and live transactions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab(bookingsNeedingAttention > ordersNeedingAttention ? "bookings" : "orders")}
              title={
                attentionCount > 0
                  ? `${attentionCount} transaction(s) awaiting attention`
                  : "No transactions awaiting attention"
              }
              aria-label={`${attentionCount} transactions awaiting attention`}
              className={`relative rounded-full p-2 transition-colors ${
                attentionCount > 0
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Bell className={`h-5 w-5 ${attentionCount > 0 ? "animate-pulse" : ""}`} />
              {attentionCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                  {attentionCount > 99 ? "99+" : attentionCount}
                </span>
              )}
            </button>
            <Button
              onClick={requestNotificationsPermission}
              variant={notificationsEnabled ? 'default' : 'outline'}
              className="gap-2"
              title={
                typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied'
                  ? 'Notifications blocked — click for instructions'
                  : notificationsEnabled ? 'Desktop notifications are active' : 'Enable desktop notifications'
              }
            >
              <Bell className="h-4 w-4" />
              {notificationsEnabled
                ? 'Notifications On'
                : typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied'
                ? 'Notifications Blocked'
                : 'Enable Notifications'}
            </Button>
            <Button onClick={handleExport} variant="outline" className="gap-2" disabled={ordersLoading || filteredOrders.length === 0}>
              <Download className="h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-lg bg-muted p-3 ${s.accent}`}><s.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              Orders
              {ordersNeedingAttention > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                  {ordersNeedingAttention}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1.5">
              Bookings
              {bookingsNeedingAttention > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                  {bookingsNeedingAttention}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="visitors" className="gap-1.5">
              <BarChart2 className="h-3.5 w-3.5" />Visitors
            </TabsTrigger>
            <TabsTrigger value="settings" onClick={() => setSettingsOpen(true)}>Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search products..." value={searchProduct} onChange={(e) => setSearchProduct(e.target.value)} className="pl-9" />
              </div>
              <Button className="gap-2" onClick={() => { setEditingProduct(null); setFormOpen(true); }}>
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                            <span className="font-medium text-sm line-clamp-1">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.brand}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{p.category}</Badge></TableCell>
                        <TableCell className="font-medium">{formatPrice(p.promoPrice ?? p.price)}</TableCell>
                        <TableCell>
                          <Badge variant={p.inStock ? "default" : "destructive"} className="text-xs">
                            {p.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={`/product/${p.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(p)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone. The product will be permanently removed.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(p)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search live orders..." value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} className="pl-9" />
            </div>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Proof</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersLoading && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading live orders...</TableCell>
                      </TableRow>
                    )}
                    {!ordersLoading && ordersError && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-destructive">{ordersError}</TableCell>
                      </TableRow>
                    )}
                    {!ordersLoading && !ordersError && filteredOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No live orders yet.</TableCell>
                      </TableRow>
                    )}
                    {!ordersLoading && !ordersError && filteredOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{o.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                            <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{orderItemCount(o)}</TableCell>
                        <TableCell className="font-medium">{formatPrice(o.total)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatOrderDate(o.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize ${paymentColors[o.payment_status]}`}>{o.payment_status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize ${fulfillmentColors[o.fulfillment_status]}`}>{o.fulfillment_status}</Badge>
                        </TableCell>
                        <TableCell>
                          {o.payment_proof_url ? (
                            <button
                              type="button"
                              onClick={() => setProofOrder(o)}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                            >
                              <Paperclip size={12} />
                              {o.payment_status === "pending" ? "Review" : "View proof"}
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <select
                            value={o.fulfillment_status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            title={`Update status for ${o.order_number}`}
                            aria-label={`Update status for ${o.order_number}`}
                            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search live bookings..." value={searchBooking} onChange={(e) => setSearchBooking(e.target.value)} className="pl-9" />
            </div>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsLoading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading bookings...</TableCell>
                      </TableRow>
                    )}
                    {!bookingsLoading && bookingsError && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-destructive">{bookingsError}</TableCell>
                      </TableRow>
                    )}
                    {!bookingsLoading && !bookingsError && bookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No bookings yet.</TableCell>
                      </TableRow>
                    )}
                    {!bookingsLoading && !bookingsError && bookings.filter(b => {
                      const searchable = [b.booking_number, b.customer_name, b.customer_email, b.customer_phone, b.product_name].join(" ").toLowerCase();
                      return searchable.includes(searchBooking.toLowerCase());
                    }).map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-sm">{b.booking_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{b.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{b.customer_email}</p>
                            <p className="text-xs text-muted-foreground">{b.customer_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{b.product_name}</TableCell>
                        <TableCell>{b.quantity}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatOrderDate(b.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : b.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-red-100 text-red-800 border-red-200'}`}>{b.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <select
                            value={b.status}
                            onChange={async (e) => {
                              const prev = bookings;
                              const newStatus = e.target.value as any;
                              setBookings((prevB) => prevB.map(x => x.id === b.id ? { ...x, status: newStatus } : x));
                              try {
                                const updated = await updateBookingStatus(b.id, newStatus);
                                setBookings((prevB) => prevB.map(x => x.id === updated.id ? updated : x));
                                toast({ title: 'Booking updated', description: `${updated.booking_number} status changed to ${updated.status}` });
                              } catch (err) {
                                console.error(err);
                                setBookings(prev);
                                toast({ title: 'Update failed', description: 'Unable to update booking status.', variant: 'destructive' });
                              }
                            }}
                            title={`Update status for ${b.booking_number}`}
                            aria-label={`Update status for ${b.booking_number}`}
                            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="visitors" className="space-y-4">
            <VisitorsDashboard />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Change Password</h3>
                </div>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Current Password</label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="w-full"
                  >
                    {changingPassword ? "Changing Password..." : "Change Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSave={handleSave}
      />

      {/* Proof of Payment Dialog */}
      {proofOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setProofOrder(null)}>
          <div
            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="font-semibold text-base">Payment Proof</h2>
                <p className="text-xs text-muted-foreground font-mono">{proofOrder.order_number}</p>
              </div>
              <button type="button" onClick={() => setProofOrder(null)} className="p-1.5 rounded hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {/* Order summary */}
            <div className="px-5 pt-4 pb-3 space-y-1 border-b bg-gray-50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{proofOrder.customer_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span>{proofOrder.customer_phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-base">{formatPrice(proofOrder.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment status</span>
                <Badge variant="outline" className={`capitalize text-xs ${paymentColors[proofOrder.payment_status]}`}>
                  {proofOrder.payment_status}
                </Badge>
              </div>
            </div>

            {/* Proof image */}
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Attached receipt</p>
              <img
                src={proofOrder.payment_proof_url!}
                alt="Proof of payment"
                className="w-full rounded-lg border object-contain max-h-80"
              />
            </div>

            {/* Actions */}
            {proofOrder.payment_status === "pending" && (
              <div className="px-5 pb-5 flex gap-3">
                <button
                  type="button"
                  disabled={confirmingPayment}
                  onClick={() => handlePaymentDecision("paid")}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  <CheckCircle2 size={16} />
                  {confirmingPayment ? "Confirming…" : "Confirm Payment"}
                </button>
                <button
                  type="button"
                  disabled={confirmingPayment}
                  onClick={() => handlePaymentDecision("failed")}
                  className="flex-1 flex items-center justify-center gap-2 border border-red-300 hover:bg-red-50 disabled:opacity-50 text-red-600 text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            )}

            {proofOrder.payment_status !== "pending" && (
              <div className="px-5 pb-5">
                <p className="text-center text-sm text-muted-foreground capitalize">
                  Payment already marked as <span className="font-medium">{proofOrder.payment_status}</span>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Admin;
