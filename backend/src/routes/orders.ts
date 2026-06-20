import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendWhatsAppNotification } from '../lib/whatsapp'

const router = Router()

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `ADE-${ts}-${rnd}`
}

function toApiOrder(o: {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string | null
  customerPhone: string
  deliveryAddress: string
  paymentMethod: string
  paymentStatus: string
  fulfillmentStatus: string
  subtotal: { toNumber(): number }
  deliveryFee: { toNumber(): number }
  total: { toNumber(): number }
  items: unknown
  paymentReference: string | null
  paystackAuthorizationUrl: string | null
  paymentProofUrl?: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: o.id,
    order_number: o.orderNumber,
    customer_name: o.customerName,
    customer_email: o.customerEmail ?? '',
    customer_phone: o.customerPhone,
    delivery_address: o.deliveryAddress,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    fulfillment_status: o.fulfillmentStatus,
    subtotal: o.subtotal.toNumber(),
    delivery_fee: o.deliveryFee.toNumber(),
    total: o.total.toNumber(),
    items: Array.isArray(o.items) ? o.items : [],
    payment_reference: o.paymentReference ?? null,
    paystack_authorization_url: o.paystackAuthorizationUrl ?? null,
    payment_proof_url: o.paymentProofUrl ?? null,
    notes: o.notes ?? null,
    created_at: o.createdAt.toISOString(),
    updated_at: o.updatedAt.toISOString(),
  }
}

// GET /api/orders
router.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(orders.map(toApiOrder))
  } catch (err) {
    console.error('[orders GET]', err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// POST /api/orders
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const {
      customerName, customerEmail, customerPhone, deliveryAddress,
      paymentMethod, items, deliveryFee, notes, paymentReference, paystackAuthorizationUrl, paymentProofUrl,
    } = req.body

    if (!customerName || !customerPhone || !deliveryAddress || !paymentMethod || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const subtotal: number = items.reduce((sum: number, line: { promoPrice?: number | null; unitPrice: number; quantity: number }) =>
      sum + (line.promoPrice ?? line.unitPrice) * line.quantity, 0)
    const fee = Number(deliveryFee ?? 0)

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: String(customerName).trim(),
        customerEmail: customerEmail ? String(customerEmail).trim() : null,
        customerPhone: String(customerPhone).trim(),
        deliveryAddress: String(deliveryAddress).trim(),
        paymentMethod,
        paymentStatus: 'pending',
        fulfillmentStatus: 'pending',
        subtotal,
        deliveryFee: fee,
        total: subtotal + fee,
        items: items as object[],
        paymentReference: paymentReference ?? null,
        paystackAuthorizationUrl: paystackAuthorizationUrl ?? null,
        paymentProofUrl: paymentProofUrl ?? null,
        notes: notes ? String(notes).trim() : null,
      },
    })

    const msg = [
      `🛒 *New Order — ${order.orderNumber}*`,
      `Customer: ${order.customerName}`,
      `Phone: ${order.customerPhone}`,
      `Items: ${(items as unknown[]).length}`,
      `Total: ₦${(subtotal + fee).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      `Payment: ${paymentMethod.replace(/_/g, ' ')}`,
      `Delivery: ${order.deliveryAddress}`,
    ].join('\n')

    sendWhatsAppNotification(msg).catch((err) =>
      console.warn('[orders POST] WhatsApp notify failed:', err)
    )

    res.status(201).json(toApiOrder(order))
  } catch (err) {
    console.error('[orders POST]', err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// PATCH /api/orders/:id/payment
router.patch('/orders/:id/payment', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { paymentStatus, paymentReference, paystackAuthorizationUrl } = req.body

    const order = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
        paymentReference: paymentReference ?? undefined,
        paystackAuthorizationUrl: paystackAuthorizationUrl ?? undefined,
      },
    })

    res.json(toApiOrder(order))
  } catch (err) {
    console.error('[orders PATCH payment]', err)
    res.status(500).json({ error: 'Failed to update order payment' })
  }
})

// PATCH /api/orders/:id/status
router.patch('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { fulfillmentStatus } = req.body

    const order = await prisma.order.update({
      where: { id },
      data: { fulfillmentStatus },
    })

    res.json(toApiOrder(order))
  } catch (err) {
    console.error('[orders PATCH status]', err)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

export default router
