export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  volume: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  tags: string[];
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: "sugar-scrub",
    name: "Smoothing Sugar Scrub",
    brand: "MILK & HONEY GOLD",
    category: "Exfoliating",
    price: 8500,
    volume: "200 ml",
    image: "/images/sugar-scrub.jpeg",
    description: "Indulge in the luxurious Milk & Honey Gold Smoothing Sugar Scrub. Enriched with natural sugar crystals, organic honey, and milk proteins, this premium scrub gently buffs away dead skin cells to reveal silky-smooth, radiant skin. The golden formula nourishes while exfoliating, leaving your skin feeling pampered and deeply moisturised.",
    rating: 4.5,
    reviews: 127,
    tags: ["Sugar Scrub", "Exfoliating", "Body Care"],
    inStock: true,
  },
  {
    id: "body-cream",
    name: "Nourishing Hand & Body Cream",
    brand: "MILK & HONEY GOLD",
    category: "Body Cream",
    price: 9200,
    volume: "250 ml",
    image: "/images/body-cream.jpeg",
    description: "Wrap your skin in a veil of luxury with Milk & Honey Gold Nourishing Hand & Body Cream. This rich, velvety cream deeply hydrates and softens skin with a blend of organic milk and honey extracts. The elegant golden jar houses a formula that absorbs quickly, leaving no greasy residue — just beautifully nourished, glowing skin.",
    rating: 4.7,
    reviews: 198,
    tags: ["Body Cream", "Moisturising", "Hand Care"],
    inStock: true,
  },
  {
    id: "hand-cream",
    name: "Moisturising Hand Cream",
    brand: "MILK & HONEY GOLD",
    category: "Hand Care",
    price: 4800,
    volume: "75 ml",
    image: "/images/hand-cream.jpeg",
    description: "Keep your hands soft and beautifully scented throughout the day with this compact Moisturising Hand Cream. The Milk & Honey Gold formula delivers intense hydration in a travel-friendly tube. Perfect for on-the-go nourishment, it absorbs instantly and leaves hands feeling silky, smooth, and delicately fragranced.",
    rating: 4.6,
    reviews: 89,
    tags: ["Hand Cream", "Moisturising", "Travel Size"],
    inStock: true,
  },
  {
    id: "cleansing-cream",
    name: "Moisturising Intimate Cleansing Cream",
    brand: "FEMINELLE",
    category: "Intimate Care",
    price: 6500,
    volume: "300 ml",
    image: "/images/cleansing-cream.jpeg",
    description: "Gentle, pH-balanced intimate cleansing cream with Hyaluronic Acid and Peach Extract. The Feminelle Moisturising formula contains prebiotics and lactic acid for optimal care. Soap-free and dermatologically tested, it cleanses while maintaining your skin's natural moisture balance.",
    rating: 4.8,
    reviews: 1455,
    tags: ["Intimate Care", "Aloe Vera", "Cotton Extract"],
    inStock: true,
  },
  {
    id: "intimate-wash",
    name: "Soothing Intimate Wash with Aloe Vera",
    brand: "FEMINELLE",
    category: "Intimate Care",
    price: 6500,
    volume: "300 ml",
    image: "/images/intimate-wash.jpeg",
    description: "A soothing intimate wash enriched with Aloe Vera for gentle, everyday cleansing. Feminelle's prebiotic formula with lactic acid is pH balanced and soap-free, designed to cleanse delicately while soothing and protecting sensitive skin. Created in Sweden with care.",
    rating: 4.6,
    reviews: 342,
    tags: ["Intimate Care", "Aloe Vera", "Soothing"],
    inStock: true,
  },
  {
    id: "meal-replacement",
    name: "Meal Replacement for Weight Control — Vanilla",
    brand: "WELLOSOPHY",
    category: "Weight Management",
    price: 15500,
    volume: "525 g",
    image: "/images/meal-replacement.jpeg",
    description: "High protein meal replacement shake with 23 vitamins and minerals, designed for effective weight management. Non-GMO, gluten-free, and vegan. Each container provides 21 servings of delicious vanilla flavour. Created in Sweden with premium ingredients for a balanced approach to weight control.",
    rating: 4.4,
    reviews: 804,
    tags: ["Chocolate", "Vanilla"],
    inStock: true,
  },
];

export const categories = [
  "All",
  "Body Cream",
  "Exfoliating",
  "Hand Care",
  "Intimate Care",
  "Weight Management",
];

export function formatPrice(price: number): string {
  return `₦${price.toLocaleString()}`;
}
