import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

const allowedOrigins = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return cb(null, true)
      // Always allow any localhost port in development
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return cb(null, true)
      // Allow configured production origins
      if (allowedOrigins.some((o) => origin.startsWith(o))) return cb(null, true)
      cb(new Error(`CORS: ${origin} not allowed`))
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
