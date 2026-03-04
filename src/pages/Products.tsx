import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const Products = () => {
  const { products, categories } = useProducts();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <main className="container py-10 md:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-2">Browse</p>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Our Products</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-20">No products in this category yet.</p>
      )}
    </main>
  );
};

export default Products;
