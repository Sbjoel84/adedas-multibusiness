import { Router, Request, Response } from 'express'
import axios from 'axios'
import { sendWhatsAppNotification } from '../lib/whatsapp'

const router = Router()

// GET /api/verify-payment/:reference — verify Paystack payment
router.get('/verify-payment/:reference', async (req: Request, res: Response) => {
  const { reference } = req.params

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    )

    const data = response.data

    if (data.data.status === 'success') {
      return res.json({ success: true, message: 'Payment verified', data: data.data })
    } else {
      return res.json({ success: false, message: 'Payment not successful' })
    }
  } catch (error: any) {
    console.error('[verify-payment]', error.response?.data || error.message)
    res.status(500).json({ error: 'Verification failed' })
  }
})

// POST /api/notify-order — send WhatsApp notification for new order
router.post('/notify-order', async (req: Request, res: Response) => {
  const { orderNumber, customerName, customerPhone, total, itemCount, paymentMethod, deliveryAddress } = req.body

  if (!orderNumber || !customerName || typeof total !== 'number' || !itemCount) {
    return res.status(400).json({ error: 'Missing required order notification payload.' })
  }

  const message = [
    '🛒 New order received!',
    `Order: ${orderNumber}`,
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Items: ${itemCount}`,
    `Total: ₦${(total as number).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
    `Payment: ${paymentMethod}`,
    `Delivery: ${deliveryAddress}`,
  ].join('\n')

  const result = await sendWhatsAppNotification(message)
  if (result.ok) return res.json({ success: true, provider: result.provider })
  return res.status(502).json({ error: 'Failed to send WhatsApp notification.', detail: result.detail })
})

export default router
