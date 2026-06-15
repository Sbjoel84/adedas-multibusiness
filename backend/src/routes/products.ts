import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

const DEFAULT_PRODUCTS = [
  { id: 'sugar-scrub', name: 'Smoothing Sugar Scrub', brand: 'ADEDAS MULTIBUSINESS', category: 'Exfoliating', price: 8500, promoPrice: null, volume: '200 ml', image: '/images/sugar-scrub.jpeg', description: 'Indulge in the luxurious Smoothing Sugar Scrub. Enriched with natural sugar crystals, organic honey, and milk proteins, this premium scrub gently buffs away dead skin cells to reveal silky-smooth, radiant skin.', tags: ['Sugar Scrub', 'Exfoliating', 'Body Care'], inStock: true },
  { id: 'body-cream', name: 'Nourishing Hand & Body Cream', brand: 'ADEDAS MULTIBUSINESS', category: 'Body Cream', price: 9200, promoPrice: null, volume: '250 ml', image: '/images/body-cream.jpeg', description: 'Wrap your skin in a veil of luxury with this Nourishing Hand & Body Cream. This rich, velvety cream deeply hydrates and softens skin with a blend of organic milk and honey extracts.', tags: ['Body Cream', 'Moisturising', 'Hand Care'], inStock: true },
  { id: 'hand-cream', name: 'Moisturising Hand Cream', brand: 'ADEDAS MULTIBUSINESS', category: 'Hand Care', price: 4800, promoPrice: null, volume: '75 ml', image: '/images/hand-cream.jpeg', description: 'Keep your hands soft and beautifully scented throughout the day with this compact Moisturising Hand Cream. This premium formula delivers intense hydration in a travel-friendly tube.', tags: ['Hand Cream', 'Moisturising', 'Travel Size'], inStock: true },
  { id: 'cleansing-cream', name: 'Moisturising Intimate Cleansing Cream', brand: 'FEMINELLE', category: 'Intimate Care', price: 6500, promoPrice: null, volume: '300 ml', image: '/images/cleansing-cream.jpeg', description: 'Gentle, pH-balanced intimate cleansing cream with Hyaluronic Acid and Peach Extract. Soap-free and dermatologically tested.', tags: ['Intimate Care', 'Aloe Vera', 'Cotton Extract'], inStock: true },
  { id: 'intimate-wash', name: 'Soothing Intimate Wash with Aloe Vera', brand: 'FEMINELLE', category: 'Intimate Care', price: 6500, promoPrice: null, volume: '300 ml', image: '/images/intimate-wash.jpeg', description: 'A soothing intimate wash enriched with Aloe Vera for gentle, everyday cleansing. pH balanced and soap-free.', tags: ['Intimate Care', 'Aloe Vera', 'Soothing'], inStock: true },
  { id: 'meal-replacement', name: 'Meal Replacement for Weight Control — Vanilla', brand: 'WELLOSOPHY', category: 'Weight Management', price: 15500, promoPrice: null, volume: '525 g', image: '/images/meal-replacement.jpeg', description: 'High protein meal replacement shake with 23 vitamins and minerals, designed for effective weight management. Non-GMO, gluten-free, and vegan.', tags: ['Chocolate', 'Vanilla'], inStock: true },
  { id: 'shea-butter-skincare', name: 'Early Age Skin Care Shea Butter', brand: 'JIMPO-ORI', category: 'Shea Butter', price: 4500, promoPrice: null, volume: '280 g', image: '/images/shea-butter-skincare.jpeg', description: 'Jimpo-Ori Early Age Skin Care Shea Butter naturally purifies and nourishes delicate skin. NAFDAC approved and dermatologically tested.', tags: ['Shea Butter', 'Baby Care', 'Natural'], inStock: true },
  { id: 'shea-butter-family', name: 'Head-to-Toe Family Shea Butter', brand: 'JIMPO-ORI', category: 'Shea Butter', price: 4500, promoPrice: null, volume: '280 g', image: '/images/shea-butter-family.jpeg', description: 'Jimpo-Ori Head-to-Toe Family Shea Butter is perfect for the whole family. It helps with burns, aches, and dry skin.', tags: ['Shea Butter', 'Family', 'Moisturising'], inStock: true },
  { id: 'shea-butter-gift-set', name: 'Premium Shea Butter Gift Set', brand: 'JIMPO-ORI', category: 'Gift Sets', price: 12000, promoPrice: null, volume: 'Combo Pack', image: '/images/shea-butter-gift-set.jpeg', description: 'A beautifully packaged high-quality gift set featuring Jimpo-Ori Shea Butter, ointment, and a baby towel. NAFDAC approved.', tags: ['Gift Set', 'Baby Care', 'Premium'], inStock: true },
  { id: 'essential-oils', name: 'GO Essential Oils', brand: 'JIMPO-ORI', category: 'Oils', price: 3500, promoPrice: null, volume: '100 ml', image: '/images/essential-oils.jpeg', description: 'Jimpo-Ori GO Essential Oils — a herbal-based, natural, and medicinal blend of coconut oil and aloe vera extracts.', tags: ['Essential Oils', 'Herbal', 'Natural'], inStock: true },
  { id: 'black-soap', name: 'My Skin Lightening Black Soap', brand: 'JIMPO-ORI', category: 'Soaps', price: 5500, promoPrice: null, volume: '350 g', image: '/images/black-soap.jpeg', description: 'Jimpo-Ori My Skin Lightening Black Soap fades spots, fights bacteria, and gives you a brighter glow. Made with 100% natural ingredients.', tags: ['Black Soap', 'Antibacterial', 'Skin Lightening'], inStock: true },
  { id: 'full-collection', name: 'Complete Jimpo-Ori Collection', brand: 'JIMPO-ORI', category: 'Gift Sets', price: 35000, promoPrice: null, volume: 'Full Set', image: '/images/full-collection.jpeg', description: 'Get the complete Jimpo-Ori experience with this full collection featuring all Shea Butter variants, GO Essential Oils, and more.', tags: ['Collection', 'Full Set', 'Premium'], inStock: true },
]

function toApiProduct(p: { id: string; name: string; brand: string; category: string; price: number; promoPrice: number | null; volume: string; image: string; description: string; tags: string[]; inStock: boolean }) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: Number(p.price),
    promoPrice: p.promoPrice != null ? Number(p.promoPrice) : null,
    volume: p.volume,
    image: p.image,
    description: p.description,
    tags: p.tags,
    inStock: p.inStock,
  }
}

// GET /api/products
router.get('/products', async (_req: Request, res: Response) => {
  try {
    let products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } })

    if (products.length === 0) {
      await prisma.product.createMany({ data: DEFAULT_PRODUCTS, skipDuplicates: true })
      products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } })
    }

    res.json(products.map(toApiProduct))
  } catch (err) {
    console.error('[products GET]', err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// POST /api/products
router.post('/products', async (req: Request, res: Response) => {
  try {
    const { name, brand, category, price, promoPrice, volume, image, description, tags, inStock } = req.body
    if (!name || !category || price == null) {
      return res.status(400).json({ error: 'name, category, and price are required' })
    }
    const product = await prisma.product.create({
      data: {
        id: crypto.randomUUID(),
        name,
        brand: brand ?? 'ADEDAS MULTIBUSINESS',
        category,
        price: Number(price),
        promoPrice: promoPrice != null ? Number(promoPrice) : null,
        volume: volume ?? '',
        image: image ?? '/placeholder.svg',
        description: description ?? '',
        tags: tags ?? [],
        inStock: inStock ?? true,
      },
    })
    res.status(201).json(toApiProduct(product))
  } catch (err) {
    console.error('[products POST]', err)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// PUT /api/products/:id
router.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, brand, category, price, promoPrice, volume, image, description, tags, inStock } = req.body

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (brand !== undefined) data.brand = brand
    if (category !== undefined) data.category = category
    if (price !== undefined) data.price = Number(price)
    if ('promoPrice' in req.body) data.promoPrice = promoPrice != null ? Number(promoPrice) : null
    if (volume !== undefined) data.volume = volume
    if (image !== undefined) data.image = image
    if (description !== undefined) data.description = description
    if (tags !== undefined) data.tags = tags
    if (inStock !== undefined) data.inStock = inStock

    const product = await prisma.product.update({ where: { id }, data })
    res.json(toApiProduct(product))
  } catch (err) {
    console.error('[products PUT]', err)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE /api/products/:id
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.product.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) {
    console.error('[products DELETE]', err)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router
