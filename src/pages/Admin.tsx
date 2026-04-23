import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice, Product } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import ProductFormDialog from "@/components/ProductFormDialog";
import { VisitorsDashboard } from "@/components/VisitorsDashboard";
import {
  Package, ShoppingCart, DollarSign, TrendingUp,
  Edit, Trash2, Plus, Eye, Download, ArrowLeft, Search, Lock, BarChart2
} from "lucide-react";
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

const mockOrders = [
  { id: "ORD-001", customer: "Adaeze Obi", email: "adaeze@email.com", items: 3, total: 23200, status: "delivered", date: "2026-02-28" },
  { id: "ORD-002", customer: "Chukwuma Eze", email: "chukwuma@email.com", items: 1, total: 8500, status: "shipped", date: "2026-03-01" },
  { id: "ORD-003", customer: "Fatima Bello", email: "fatima@email.com", items: 2, total: 13000, status: "confirmed", date: "2026-03-01" },
  { id: "ORD-004", customer: "Grace Adeyemi", email: "grace@email.com", items: 4, total: 37500, status: "pending", date: "2026-03-02" },
  { id: "ORD-005", customer: "Ibrahim Musa", email: "ibrahim@email.com", items: 1, total: 15500, status: "pending", date: "2026-03-02" },
  { id: "ORD-006", customer: "Ngozi Aniemeka", email: "ngozi@email.com", items: 2, total: 14000, status: "delivered", date: "2026-02-27" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
};

const Admin = () => {
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchProduct, setSearchProduct] = useState("");
  const [searchOrder, setSearchOrder] = useState("");
  const [orders, setOrders] = useState(mockOrders);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Get admin token from localStorage
  const adminToken = localStorage.getItem('adminToken');

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.customer.toLowerCase().includes(searchOrder.toLowerCase()) ||
    o.id.toLowerCase().includes(searchOrder.toLowerCase())
  );

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast({ title: "Order updated", description: `${orderId} status changed to ${newStatus}` });
  };

  const handleExport = () => {
    const csv = [
      "Order ID,Customer,Email,Items,Total,Status,Date",
      ...orders.map(o => `${o.id},${o.customer},${o.email},${o.items},${o.total},${o.status},${o.date}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "orders-report.csv"; a.click();
    toast({ title: "Report exported", description: "CSV file downloaded successfully." });
  };

  const handleSave = (data: Omit<Product, "id">) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      toast({ title: "Product updated", description: `${data.name} has been updated.` });
    } else {
      addProduct(data);
      toast({ title: "Product added", description: `${data.name} has been added to the catalogue.` });
    }
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    deleteProduct(product.id);
    toast({ title: "Product deleted", description: `${product.name} has been removed.` });
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
  ];

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-background">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div>
              <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your store</p>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
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

        <Tabs defaultValue="products">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
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
                        <TableCell className="font-medium">{formatPrice(p.price)}</TableCell>
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
              <Input placeholder="Search orders..." value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} className="pl-9" />
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-sm">{o.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{o.customer}</p>
                            <p className="text-xs text-muted-foreground">{o.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{o.items}</TableCell>
                        <TableCell className="font-medium">{formatPrice(o.total)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{o.date}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[o.status]}`}>{o.status}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            title={`Update status for ${o.id}`}
                            aria-label={`Update status for ${o.id}`}
                            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
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
    </main>
  );
};

export default Admin;
