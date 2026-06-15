import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// POST /api/visits — record a page visit
router.post('/visits', async (req: Request, res: Response) => {
  try {
    const { page, user_agent, referrer, session_id } = req.body
    if (!page || !session_id) {
      return res.status(400).json({ error: 'page and session_id are required' })
    }

    await prisma.visit.create({
      data: {
        page: String(page),
        userAgent: user_agent ? String(user_agent) : null,
        referrer: referrer ? String(referrer) : null,
        sessionId: String(session_id),
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.socket.remoteAddress ?? null,
      },
    })

    res.status(201).json({ success: true })
  } catch (err) {
    console.error('[visits POST]', err)
    res.status(500).json({ error: 'Failed to record visit' })
  }
})

// GET /api/visits/stats?filter=today|7days — analytics data for VisitorsDashboard
router.get('/visits/stats', async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter === 'today' ? 'today' : '7days'
    const now = new Date()

    let rangeStart: Date
    if (filter === 'today') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else {
      rangeStart = new Date(now)
      rangeStart.setDate(rangeStart.getDate() - 6)
      rangeStart.setHours(0, 0, 0, 0)
    }

    const [visits, totalCount, activeCount] = await Promise.all([
      prisma.visit.findMany({
        where: { timestamp: { gte: rangeStart } },
        orderBy: { timestamp: 'desc' },
        select: { id: true, page: true, timestamp: true, userAgent: true, sessionId: true, referrer: true },
      }),
      prisma.visit.count(),
      prisma.activeUser.count({
        where: { lastSeen: { gte: new Date(Date.now() - 2 * 60_000) } },
      }),
    ])

    res.json({
      visits: visits.map((v) => ({
        id: v.id,
        page: v.page,
        timestamp: v.timestamp.toISOString(),
        user_agent: v.userAgent ?? null,
        session_id: v.sessionId,
        referrer: v.referrer ?? null,
      })),
      totalCount,
      activeCount,
    })
  } catch (err) {
    console.error('[visits/stats GET]', err)
    res.status(500).json({ error: 'Failed to fetch visit stats' })
  }
})

// POST /api/active-users/heartbeat — upsert active user presence
router.post('/active-users/heartbeat', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body
    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' })
    }

    await prisma.activeUser.upsert({
      where: { sessionId: String(session_id) },
      update: { lastSeen: new Date() },
      create: { sessionId: String(session_id), lastSeen: new Date() },
    })

    res.json({ success: true })
  } catch (err) {
    console.error('[active-users heartbeat]', err)
    res.status(500).json({ error: 'Failed to update active user' })
  }
})

export default router
