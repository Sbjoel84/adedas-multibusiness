import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import { Product, formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-lg bg-secondary aspect-[3/4]">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <button
            onClick={handleAdd}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm shadow-md text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {product.brand}
          </p>
          <h3 className="font-display text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star size={12} className="fill-accent text-accent" />
              <span className="text-xs text-muted-foreground">{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>
          <div className="flex items-center gap-1.5">
            {product.promoPrice ? (
              <>
                <p className="font-body text-sm font-bold text-primary">{formatPrice(product.promoPrice)}</p>
                <p className="font-body text-xs text-muted-foreground line-through">{formatPrice(product.price)}</p>
              </>
            ) : (
              <p className="font-body text-sm font-bold text-foreground">{formatPrice(product.price)}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
