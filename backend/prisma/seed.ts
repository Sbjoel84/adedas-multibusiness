import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
  { id: 'sugar-scrub', name: 'Smoothing Sugar Scrub', brand: 'ADEDAS MULTIBUSINESS', category: 'Exfoliating', price: 8500, promoPrice: null, volume: '200 ml', image: '/images/sugar-scrub.jpeg', description: 'Indulge in the luxurious Smoothing Sugar Scrub. Enriched with natural sugar crystals, organic honey, and milk proteins, this premium scrub gently buffs away dead skin cells to reveal silky-smooth, radiant skin. The golden formula nourishes while exfoliating, leaving your skin feeling pampered and deeply moisturised.', tags: ['Sugar Scrub', 'Exfoliating', 'Body Care'], inStock: true },
  { id: 'body-cream', name: 'Nourishing Hand & Body Cream', brand: 'ADEDAS MULTIBUSINESS', category: 'Body Cream', price: 9200, promoPrice: null, volume: '250 ml', image: '/images/body-cream.jpeg', description: 'Wrap your skin in a veil of luxury with this Nourishing Hand & Body Cream. This rich, velvety cream deeply hydrates and softens skin with a blend of organic milk and honey extracts. The elegant golden jar houses a formula that absorbs quickly, leaving no greasy residue — just beautifully nourished, glowing skin.', tags: ['Body Cream', 'Moisturising', 'Hand Care'], inStock: true },
  { id: 'hand-cream', name: 'Moisturising Hand Cream', brand: 'ADEDAS MULTIBUSINESS', category: 'Hand Care', price: 4800, promoPrice: null, volume: '75 ml', image: '/images/hand-cream.jpeg', description: 'Keep your hands soft and beautifully scented throughout the day with this compact Moisturising Hand Cream. This premium formula delivers intense hydration in a travel-friendly tube. Perfect for on-the-go nourishment, it absorbs instantly and leaves hands feeling silky, smooth, and delicately fragranced.', tags: ['Hand Cream', 'Moisturising', 'Travel Size'], inStock: true },
  { id: 'cleansing-cream', name: 'Moisturising Intimate Cleansing Cream', brand: 'FEMINELLE', category: 'Intimate Care', price: 6500, promoPrice: null, volume: '300 ml', image: '/images/cleansing-cream.jpeg', description: 'Gentle, pH-balanced intimate cleansing cream with Hyaluronic Acid and Peach Extract. The Feminelle Moisturising formula contains prebiotics and lactic acid for optimal care. Soap-free and dermatologically tested, it cleanses while maintaining your skin\'s natural moisture balance.', tags: ['Intimate Care', 'pH Balanced', 'Cotton Extract'], inStock: true },
  { id: 'intimate-wash', name: 'Soothing Intimate Wash with Aloe Vera', brand: 'FEMINELLE', category: 'Intimate Care', price: 6500, promoPrice: null, volume: '300 ml', image: '/images/intimate-wash.jpeg', description: 'A soothing intimate wash enriched with Aloe Vera for gentle, everyday cleansing. Feminelle\'s prebiotic formula with lactic acid is pH balanced and soap-free, designed to cleanse delicately while soothing and protecting sensitive skin. Created in Sweden with care.', tags: ['Intimate Care', 'Aloe Vera', 'Soothing'], inStock: true },
  { id: 'meal-replacement', name: 'Meal Replacement for Weight Control — Vanilla', brand: 'WELLOSOPHY', category: 'Weight Management', price: 15500, promoPrice: null, volume: '525 g', image: '/images/meal-replacement.jpeg', description: 'High protein meal replacement shake with 23 vitamins and minerals, designed for effective weight management. Non-GMO, gluten-free, and vegan. Each container provides 21 servings of delicious vanilla flavour. Created in Sweden with premium ingredients for a balanced approach to weight control.', tags: ['Meal Replacement', 'Vanilla', 'Weight Management'], inStock: true },
  { id: 'shea-butter-skincare', name: 'Early Age Skin Care Shea Butter', brand: 'JIMPO-ORI', category: 'Shea Butter', price: 4500, promoPrice: null, volume: '280 g', image: '/images/shea-butter-skincare.jpeg', description: 'Jimpo-Ori Early Age Skin Care Shea Butter naturally purifies and nourishes delicate skin. Formulated with organic shea butter, it provides deep moisturisation and protection for baby and sensitive skin. NAFDAC approved and dermatologically tested.', tags: ['Shea Butter', 'Baby Care', 'Natural'], inStock: true },
  { id: 'shea-butter-family', name: 'Head-to-Toe Family Shea Butter', brand: 'JIMPO-ORI', category: 'Shea Butter', price: 4500, promoPrice: null, volume: '280 g', image: '/images/shea-butter-family.jpeg', description: 'Jimpo-Ori Head-to-Toe Family Shea Butter is perfect for the whole family. It helps with burns, aches, and dry skin. Naturally purifies and nourishes from head to toe with organic shea butter for soft, healthy skin.', tags: ['Shea Butter', 'Family', 'Moisturising'], inStock: true },
  { id: 'shea-butter-gift-set', name: 'Premium Shea Butter Gift Set', brand: 'JIMPO-ORI', category: 'Gift Sets', price: 12000, promoPrice: null, volume: 'Combo Pack', image: '/images/shea-butter-gift-set.jpeg', description: 'A beautifully packaged high-quality gift set featuring Jimpo-Ori Shea Butter, ointment, and a baby towel. Perfect for gifting to new mothers or anyone who appreciates natural skincare. NAFDAC approved.', tags: ['Gift Set', 'Baby Care', 'Premium'], inStock: true },
  { id: 'essential-oils', name: 'GO Essential Oils', brand: 'JIMPO-ORI', category: 'Oils', price: 3500, promoPrice: null, volume: '100 ml', image: '/images/essential-oils.jpeg', description: 'Jimpo-Ori GO Essential Oils — a herbal-based, natural, and medicinal blend of coconut oil and aloe vera extracts. Ideal for hair and skin nourishment, it promotes healthy growth and a natural glow. Go Essential!', tags: ['Essential Oils', 'Herbal', 'Natural'], inStock: true },
  { id: 'black-soap', name: 'My Skin Lightening Black Soap', brand: 'JIMPO-ORI', category: 'Soaps', price: 5500, promoPrice: null, volume: '350 g', image: '/images/black-soap.jpeg', description: 'Jimpo-Ori My Skin Lightening Black Soap fades spots, fights bacteria, and gives you a brighter glow. Made with 100% natural ingredients, this premium African black soap cleanses deeply while nourishing your skin.', tags: ['Black Soap', 'Antibacterial', 'Skin Lightening'], inStock: true },
  { id: 'full-collection', name: 'Complete Jimpo-Ori Collection', brand: 'JIMPO-ORI', category: 'Gift Sets', price: 35000, promoPrice: null, volume: 'Full Set', image: '/images/full-collection.jpeg', description: 'Get the complete Jimpo-Ori experience with this full collection featuring Shea Butter variants, GO Essential Oils, Clear-n-Glow Skin Oil, Tear-Free Baby Black Soap, Lagent Skin Glowing Lotion, and Black Soap Shower Gel. Everything you need for natural beauty care.', tags: ['Collection', 'Full Set', 'Premium'], inStock: true },
]

async function main() {
  console.log('Seeding products into Neon...')

  let created = 0
  let skipped = 0

  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { id: product.id } })
    if (existing) {
      // Update with latest data
      await prisma.product.update({ where: { id: product.id }, data: product })
      skipped++
    } else {
      await prisma.product.create({ data: product })
      created++
    }
  }

  console.log(`Done. Created: ${created}, Updated: ${skipped}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
