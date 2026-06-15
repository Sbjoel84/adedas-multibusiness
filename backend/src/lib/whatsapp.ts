import axios from 'axios'

export async function sendWhatsAppNotification(message: string): Promise<void> {
  const businessId = process.env.WHATSAPP_BUSINESS_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE?.replace(/\D/g, '')

  if (!businessId || !accessToken || !adminPhone) {
    console.warn('[WhatsApp] Credentials not configured — notification skipped.')
    return
  }

  await axios.post(
    `https://graph.facebook.com/v18.0/${businessId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: adminPhone,
      type: 'text',
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )
}
