import { useParams, Link } from "react-router-dom";
import { formatPrice } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Star, ArrowLeft, Minus, Plus, Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(24);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([
    { name: "Sarah M.", text: "This product is amazing! Highly recommend.", date: "2 days ago" },
    { name: "Chioma O.", text: "Great quality, worth the price!", date: "1 week ago" },
  ]);
  const [newComment, setNewComment] = useState("");

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/products" className="text-primary underline mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`${qty}x ${product.name} added to cart`);
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setComments([...comments, { name: "You", text: newComment, date: "Just now" }]);
    setNewComment("");
    toast.success("Comment added!");
  };

  return (
    <main className="container py-8 md:py-16">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-hidden rounded-xl bg-secondary aspect-[3/4]"
        >
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col justify-center space-y-5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{product.brand}</p>
          <h1 className="font-display text-2xl font-bold md:text-3xl">{product.name}</h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
          </div>

          <div className="flex items-center gap-3">
            {product.promoPrice ? (
              <>
                <p className="text-2xl font-bold text-primary">{formatPrice(product.promoPrice)}</p>
                <p className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</p>
                <span className="rounded-md bg-destructive/10 text-destructive text-xs font-semibold px-2 py-1">
                  -{Math.round(((product.price - product.promoPrice) / product.price) * 100)}%
                </span>
              </>
            ) : (
              <p className="text-2xl font-bold">{formatPrice(product.price)}</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{product.volume}</p>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center rounded-lg border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-muted transition-colors" aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <span className="px-4 text-sm font-medium min-w-[2rem] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-muted transition-colors" aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>
            <Button onClick={handleAddToCart} size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 gap-2 flex-1">
              <ShoppingBag size={16} /> Add to Cart
            </Button>
          </div>

          {/* Like and Comment Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                liked ? "bg-red-100 text-red-500" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart size={18} className={liked ? "fill-current" : ""} />
              <span className="text-sm font-medium">{likes}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              aria-label="View comments"
            >
              <MessageCircle size={18} />
              <span className="text-sm font-medium">{comments.length}</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
              <div className="space-y-4 mb-6">
                {comments.map((comment, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{comment.name}</span>
                      <span className="text-xs text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  aria-label="Send comment"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetail;
