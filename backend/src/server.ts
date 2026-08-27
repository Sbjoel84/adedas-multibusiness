import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

// Built-in production origins — always allowed even if FRONTEND_URL is unset/stale.
const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.adedas.com.ng',
  'https://adedas.com.ng',
]

const allowedOrigins = [
  ...DEFAULT_ALLOWED_ORIGINS,
  ...(process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
]

function isAllowedOrigin(origin: string): boolean {
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return true
  // Any Vercel deployment (production, preview, or branch URL) for this project
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true
  return allowedOrigins.some((o) => origin === o || origin.startsWith(o))
}

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return cb(null, true)
      // Never throw — a disallowed origin simply gets no CORS headers.
      if (isAllowedOrigin(origin)) return cb(null, true)
      console.warn(`[CORS] blocked origin: ${origin}`)
      return cb(null, false)
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))

import productRoutes from './routes/products'
import orderRoutes from './routes/orders'
import bookingRoutes from './routes/bookings'
import visitRoutes from './routes/visits'
import paymentRoutes from './routes/payments'
import paypalRoutes from './routes/paypal'

app.use('/api', productRoutes)
app.use('/api', orderRoutes)
app.use('/api', bookingRoutes)
app.use('/api', visitRoutes)
app.use('/api', paymentRoutes)
app.use('/api/paypal', paypalRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.get('/', (_req, res) => res.send('ADEDAS API running...'))

// Global JSON error handler — prevents Express from returning HTML error pages
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[unhandled error]', err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app
