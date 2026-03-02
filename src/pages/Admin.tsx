import { useState } from "react";
import { Link } from "react-router-dom";
import { products, formatPrice, Product } from "@/data/products";
import {
  Package, ShoppingCart, DollarSign, TrendingUp,
  Edit, Trash2, Plus, Eye, Download, ArrowLeft,
  Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock orders
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
  const [searchProduct, setSearchProduct] = useState("");
  const [searchOrder, setSearchOrder] = useState("");
  const [orders, setOrders] = useState(mockOrders);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
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
    a.href = url;
    a.download = "orders-report.csv";
    a.click();
    toast({ title: "Report exported", description: "CSV file downloaded successfully." });
  };

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign, accent: "text-green-600" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, accent: "text-blue-600" },
    { label: "Products", value: totalProducts, icon: Package, accent: "text-primary" },
    { label: "Pending Orders", value: pendingOrders, icon: TrendingUp, accent: "text-yellow-600" },
  ];

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
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
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-lg bg-muted p-3 ${s.accent}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button className="gap-2" onClick={() => toast({ title: "Coming soon", description: "Product creation will be available with Cloud backend." })}>
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
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                        </TableCell>
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
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: "Coming soon", description: "Edit will be available with Cloud backend." })}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => toast({ title: "Coming soon", description: "Delete will be available with Cloud backend." })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value)}
                className="pl-9"
              />
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
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[o.status]}`}>
                            {o.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
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
        </Tabs>
      </div>
    </main>
  );
};

export default Admin;
