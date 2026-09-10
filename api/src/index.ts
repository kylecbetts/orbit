import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { sql } from './db/index.js'

const app = new Hono()

app.get('/health', async (c) => {
  await sql`select 1`
  return c.json({ ok: true, db: 'up' })
})

const port = Number(process.env.PORT ?? 3000)
serve({ fetch: app.fetch, port })
console.log(`orbit api listening on :${port}`)
