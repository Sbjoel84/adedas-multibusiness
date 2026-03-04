import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (data: Omit<Product, "id">) => void;
}

const emptyForm = {
  name: "",
  brand: "ADEDAS MULTIBUSINESS",
  category: "",
  price: "",
  volume: "",
  image: "",
  description: "",
  tags: "",
};

export default function ProductFormDialog({ open, onOpenChange, product, onSave }: ProductFormDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: String(product.price),
        volume: product.volume,
        image: product.image,
        description: product.description,
        tags: product.tags.join(", "),
      });
      setImagePreview(product.image);
    } else {
      setForm(emptyForm);
      setImagePreview(null);
    }
  }, [product, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setForm((f) => ({ ...f, image: dataUrl }));
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(form.price, 10);
    if (!form.name || !form.category || isNaN(price) || price <= 0) return;

    onSave({
      name: form.name.trim(),
      brand: form.brand.trim() || "ADEDAS MULTIBUSINESS",
      category: form.category.trim(),
      price,
      volume: form.volume.trim(),
      image: form.image || "/placeholder.svg",
      description: form.description.trim(),
      rating: product ? (product as Product).rating : 4.5,
      reviews: product ? (product as Product).reviews : 0,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      inStock: true,
    });
    onOpenChange(false);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" value={form.name} onChange={set("name")} placeholder="e.g. Shea Butter Cream" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={form.brand} onChange={set("brand")} placeholder="Brand name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input id="category" value={form.category} onChange={set("category")} placeholder="e.g. Body Cream" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₦) *</Label>
              <Input id="price" type="number" min="1" value={form.price} onChange={set("price")} placeholder="8500" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Volume / Size</Label>
              <Input id="volume" value={form.volume} onChange={set("volume")} placeholder="e.g. 200 ml" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover border border-border mt-2" />
            )}
            {!imagePreview && form.image && (
              <p className="text-xs text-muted-foreground">Current: {form.image}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={set("description")} placeholder="Describe the product..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={form.tags} onChange={set("tags")} placeholder="e.g. Natural, Organic, Skincare" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{product ? "Save Changes" : "Add Product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
