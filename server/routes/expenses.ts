// server/routes/expenses.ts
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { db, schema } from '../db/client'
import { eq } from 'drizzle-orm'
import { expenses } from '../db/schema'
// Example helpers (optional) — place at top of server/routes/expenses.ts
const ok = <T>(c: any, data: T, status = 200) => c.json({ data }, status)
const err = (c: any, message: string, status = 400) => c.json({ error: { message } }, status)

// Zod schemas
const expenseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(3).max(100),
  amount: z.number().int().positive(),
})

// Allow updating title and/or amount, but not id
const updateExpenseSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  amount: z.number().int().positive().optional(),
})


const createExpenseSchema = expenseSchema.omit({ id: true })

export type Expense = z.infer<typeof expenseSchema>

// Router
export const expensesRoute = new Hono()
  // GET /api/expenses → list
  .get('/', async (c) => {
    const rows = await db.select().from(expenses)
    return c.json({ expenses: rows })
  })
  // GET /api/expenses/:id → single item
  // Enforce numeric id with a param regex (\\d+)
  .get('/:id{\\d+}', async (c) => {
    const id = Number(c.req.param('id'))
    const [row] = await 
    db.select()
    .from(expenses)
    .where(eq(expenses.id, id))
    .limit(1)
    if (!row) return c.json({ error: 'Not found' }, 404)
    return c.json({ expense: row })
  })

  // POST /api/expenses → create (validated)
  .post('/', zValidator('json', createExpenseSchema), async (c) => {
    const data = c.req.valid('json')
    const [created] = await db.insert(expenses).values(data).returning()
    return c.json({ expense: created }, 201)
  })

  // DELETE /api/expenses/:id → remove
  .delete('/:id{\\d+}', async (c) => {
    const id = Number(c.req.param('id'))
    const [deletedRow] = await db.delete(expenses).where(eq(expenses.id, id)).returning()
    if (!deletedRow) return c.json({ error: 'Not found' }, 404)
    return c.json({ deleted: deletedRow })
  })
  // PUT /api/expenses/:id → full replace
  .put('/:id{\\d+}', zValidator('json', createExpenseSchema), async (c) => {
    const id = Number(c.req.param('id'))
    const [updated] = await db.update(expenses).set({ ...c.req.valid('json') }).where(eq(expenses.id, id)).returning()
    if (!updated) return c.json({ error: 'Not found' }, 404)
    return c.json({ expense: updated })
  })
  // PATCH /api/expenses/:id → partial update
  .patch('/:id{\\d+}', zValidator('json', updateExpenseSchema), async (c) => {
    const id = Number(c.req.param('id'))
    const patch = c.req.valid('json')
    if (Object.keys(patch).length === 0) return c.json({ error: 'Empty patch' }, 400)
    const [updated] = await db.update(expenses).set(patch).where(eq(expenses.id, id)).returning()
    if (!updated) return c.json({ error: 'Not found' }, 404)
    return c.json({ expense: updated })
  })
