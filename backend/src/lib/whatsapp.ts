import axios from 'axios'

export interface WhatsAppResult {
  ok: boolean
  provider: 'callmebot' | 'meta' | 'none'
  detail?: string
}

/**
 * Sends a WhatsApp notification to the admin number.
 *
 * Provider is chosen automatically from whichever env vars are set:
 *
 *  1. CallMeBot  — set CALLMEBOT_API_KEY + WHATSAPP_ADMIN_PHONE.
 *     Simplest and most reliable for alerting a personal number.
 *     One-time setup: from the admin phone, send "I allow callmebot to send me messages"
 *     to +34 644 51 95 23, then use the API key it replies with.
 *
 *  2. Meta WhatsApp Cloud API — set WHATSAPP_ACCESS_TOKEN and
 *     WHATSAPP_PHONE_NUMBER_ID (or legacy WHATSAPP_BUSINESS_ID) + WHATSAPP_ADMIN_PHONE.
 *     Free-form text only delivers inside the 24h customer-service window; for
 *     business-initiated alerts set WHATSAPP_TEMPLATE_NAME (and optionally
 *     WHATSAPP_TEMPLATE_LANG, default en_US) pointing at an approved template
 *     whose body has a single {{1}} parameter.
 */
export async function sendWhatsAppNotification(message: string): Promise<WhatsAppResult> {
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE?.replace(/\D/g, '')

  if (!adminPhone) {
    console.warn('[WhatsApp] WHATSAPP_ADMIN_PHONE not set — notification skipped.')
    return { ok: false, provider: 'none', detail: 'WHATSAPP_ADMIN_PHONE not set' }
  }

  // ---- Provider 1: CallMeBot ------------------------------------------------
  const callMeBotKey = process.env.CALLMEBOT_API_KEY
  if (callMeBotKey) {
    try {
      const res = await axios.get('https://api.callmebot.com/whatsapp.php', {
        params: { phone: `+${adminPhone}`, text: message, apikey: callMeBotKey },
        timeout: 15000,
      })
      console.log('[WhatsApp] CallMeBot sent:', String(res.data).slice(0, 120))
      return { ok: true, provider: 'callmebot' }
    } catch (err) {
      const detail = axios.isAxiosError(err) ? JSON.stringify(err.response?.data ?? err.message) : String(err)
      console.error('[WhatsApp] CallMeBot failed:', detail)
      return { ok: false, provider: 'callmebot', detail }
    }
  }

  // ---- Provider 2: Meta WhatsApp Cloud API --------------------------------
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_BUSINESS_ID
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || 'en_US'

  if (accessToken && phoneNumberId) {
    const payload = templateName
      ? {
          messaging_product: 'whatsapp',
          to: adminPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: templateLang },
            components: [{ type: 'body', parameters: [{ type: 'text', text: message }] }],
          },
        }
      : {
          messaging_product: 'whatsapp',
          to: adminPhone,
          type: 'text',
          text: { body: message },
        }

    try {
      const res = await axios.post(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          timeout: 15000,
        }
      )
      console.log('[WhatsApp] Meta sent:', JSON.stringify(res.data))
      return { ok: true, provider: 'meta' }
    } catch (err) {
      const detail = axios.isAxiosError(err) ? JSON.stringify(err.response?.data ?? err.message) : String(err)
      console.error('[WhatsApp] Meta Cloud API failed:', detail)
      return { ok: false, provider: 'meta', detail }
    }
  }

  console.warn('[WhatsApp] No provider configured (set CALLMEBOT_API_KEY, or WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID) — notification skipped.')
  return { ok: false, provider: 'none', detail: 'no provider configured' }
}
