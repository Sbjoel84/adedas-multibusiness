import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendWhatsAppNotification } from '../lib/whatsapp'

const router = Router()

function generateBookingNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `BK-${ts}-${rnd}`
}

function toApiBooking(b: {
  id: string
  bookingNumber: string
  customerName: string
  customerEmail: string | null
  customerPhone: string
  productId: string
  productName: string
  quantity: number
  bookingTime: Date
  status: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: b.id,
    booking_number: b.bookingNumber,
    customer_name: b.customerName,
    customer_email: b.customerEmail ?? null,
    customer_phone: b.customerPhone,
    product_id: b.productId,
    product_name: b.productName,
    quantity: b.quantity,
    booking_time: b.bookingTime.toISOString(),
    status: b.status,
    notes: b.notes ?? null,
    created_at: b.createdAt.toISOString(),
    updated_at: b.updatedAt.toISOString(),
  }
}

// GET /api/bookings
router.get('/bookings', async (_req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(bookings.map(toApiBooking))
  } catch (err) {
    console.error('[bookings GET]', err)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// POST /api/bookings
router.post('/bookings', async (req: Request, res: Response) => {
  try {
    const { customer_name, customer_email, customer_phone, product_id, product_name, quantity, notes } = req.body

    if (!customer_name || !customer_phone || !product_id || !product_name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        customerName: String(customer_name).trim(),
        customerEmail: customer_email ? String(customer_email).trim() : null,
        customerPhone: String(customer_phone).trim(),
        productId: String(product_id),
        productName: String(product_name),
        quantity: Number(quantity ?? 1),
        status: 'pending',
        notes: notes ? String(notes).trim() : null,
      },
    })

    const msg = [
      `📅 *New Booking — ${booking.bookingNumber}*`,
      `Customer: ${booking.customerName}`,
      `Phone: ${booking.customerPhone}`,
      `Product: ${booking.productName} x${booking.quantity}`,
      booking.notes ? `Notes: ${booking.notes}` : null,
    ].filter(Boolean).join('\n')

    sendWhatsAppNotification(msg).catch((err) =>
      console.warn('[bookings POST] WhatsApp notify failed:', err)
    )

    res.status(201).json(toApiBooking(booking))
  } catch (err) {
    console.error('[bookings POST]', err)
    res.status(500).json({ error: 'Failed to create booking' })
  }
})

// PATCH /api/bookings/:id/status
router.patch('/bookings/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    })

    res.json(toApiBooking(booking))
  } catch (err) {
    console.error('[bookings PATCH status]', err)
    res.status(500).json({ error: 'Failed to update booking status' })
  }
})

export default router
