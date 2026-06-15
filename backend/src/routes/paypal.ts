import { Router, Request, Response } from 'express'
import axios from 'axios'

const router = Router()

function getPayPalBaseUrl(): string {
  return process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com'
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET

  if (!clientId || !secret) throw new Error('PayPal credentials not configured')

  const response = await axios.post(
    `${getPayPalBaseUrl()}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: { username: clientId, password: secret },
    }
  )

  return response.data.access_token as string
}

// POST /api/paypal/create-order
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'USD' } = req.body

    if (!amount) return res.status(400).json({ error: 'amount is required' })

    const token = await getAccessToken()
    const response = await axios.post(
      `${getPayPalBaseUrl()}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: String(amount) } }],
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    )

    res.json({ id: response.data.id, status: response.data.status })
  } catch (err: any) {
    console.error('[paypal create-order]', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to create PayPal order' })
  }
})

// POST /api/paypal/capture-order
router.post('/capture-order', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body

    if (!orderId) return res.status(400).json({ error: 'orderId is required' })

    const token = await getAccessToken()
    const response = await axios.post(
      `${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    )

    res.json(response.data)
  } catch (err: any) {
    console.error('[paypal capture-order]', err.response?.data || err.message)
    res.status(500).json({ error: 'Failed to capture PayPal order' })
  }
})

export default router
