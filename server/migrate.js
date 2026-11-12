/**
 * Crea tablas en Neon a partir de schema.sql
 * Uso: npm run db:setup
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en .env')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8')
const statements = schema
  .split(';')
  .map((s) => s.replace(/--[^\n]*/g, '').trim())
  .filter(Boolean)

async function main() {
  for (const stmt of statements) {
    const preview = stmt.split('\n')[0].slice(0, 72)
    process.stdout.write(`→ ${preview}… `)
    await sql.query(stmt)
    console.log('ok')
  }
  console.log('\n✓ Esquema aplicado en Neon.')
}

main().catch((err) => {
  console.error('\n✗ Error:', err.message)
  process.exit(1)
})
