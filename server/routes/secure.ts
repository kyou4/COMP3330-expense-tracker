// server/routes/secure.ts
import { Hono } from 'hono'
import type { Context } from 'hono'
import { requireAuth } from '../auth/requireAuth'

export const secureRoute = new Hono()
  .get('/profile', async (c:Context) => {
    const err = await requireAuth(c)
    if (err) return err 
    const user = c.get('user') 
    return c.json({ user })
  })
