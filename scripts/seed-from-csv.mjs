#!/usr/bin/env node
/**
 * seed-from-csv.mjs
 * Reads the CRM CSV, parses it with corrected field logic, and seeds Convex directly.
 * Run: node scripts/seed-from-csv.mjs
 */

import { createReadStream } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse'
import { ConvexHttpClient } from 'convex/browser'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_PATH = resolve(__dirname, '../docs/csv/crm - intimacy adventure.xlsx - spring 2026.csv')
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL

if (!CONVEX_URL) {
  console.error('❌ Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL env var')
  process.exit(1)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractPriorityWeights(text) {
  if (!text) return null
  const result = { pedigree: 0, looks: 0, personality: 0 }
  let found = false

  const patterns = [
    [/(\d+)%\s*(?:personality|perso)/i, 'personality'],
    [/(?:personality|perso)[:\s]+(\d+)%/i, 'personality'],
    [/(\d+)%\s*(?:looks?|look)/i, 'looks'],
    [/(?:looks?)[:\s]+(\d+)%/i, 'looks'],
    [/(\d+)%\s*(?:pedigree|pedi)/i, 'pedigree'],
    [/(?:pedigree|pedi)[:\s]+(\d+)%/i, 'pedigree'],
  ]

  for (const [regex, key] of patterns) {
    const m = text.match(regex)
    if (m) { result[key] = parseInt(m[1], 10); found = true }
  }

  if (!found) return null

  // Fill missing weight so total = 100
  const keys = ['pedigree', 'looks', 'personality']
  const total = keys.reduce((s, k) => s + result[k], 0)
  if (total > 0 && total !== 100) {
    const zeros = keys.filter(k => result[k] === 0)
    if (zeros.length === 1) result[zeros[0]] = 100 - total
  }

  const finalTotal = keys.reduce((s, k) => s + result[k], 0)
  if (finalTotal !== 100) return null // can't make it sum to 100, skip
  return result
}

function extractDealbreaker(text) {
  if (!text) return undefined
  const lines = text.split('\n')
  const db = lines.filter(l =>
    /deal.?breaker|non.?negotiable|red flag/i.test(l)
  )
  return db.length ? db.map(l => l.replace(/^[-•*]\s*/, '').trim()).join('; ') : undefined
}

function extractCleanConnectionAnswer(text) {
  if (!text) return undefined
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const clean = lines.filter(l =>
    !/\d+%|deal.?breaker|red flag|non.?negotiable|pedigree|looks|personality|perso/i.test(l)
  )
  return clean.join(' ').trim() || undefined
}

function mapAttendanceStatus(status) {
  if (!status) return 'invited'
  const s = status.toLowerCase()
  if (s.includes('interview complete')) return 'confirmed'
  if (s.includes('need to interview') || s.includes('waiting for interview')) return 'invited'
  if (s.includes('not available') || s.includes('not single')) return 'cancelled'
  if (s.includes('potential')) return 'waitlisted'
  return 'invited'
}

function parseAge(raw) {
  if (!raw) return undefined
  const m = String(raw).match(/\d+/)
  return m ? parseInt(m[0], 10) : undefined
}

function parseBirthday(raw) {
  if (!raw) return undefined
  const s = String(raw).trim()
  if (!s || s.length < 3) return undefined
  // Exclude things like zodiac signs alone
  if (/^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)$/i.test(s)) return undefined
  return s
}

function parseGender(raw) {
  if (!raw) return undefined
  const s = String(raw).trim().toLowerCase()
  if (['male', 'm', 'man'].includes(s)) return 'man'
  if (['female', 'woman', 'f', 'women'].includes(s)) return 'woman'
  return undefined
}

function parsePaid(raw) {
  if (!raw) return undefined
  return /yes|y|oui/i.test(String(raw)) ? 50 : undefined
}

// ── CSV Parser ───────────────────────────────────────────────────────────────

async function parseCsv() {
  const rows = []
  const PREAMBLE_LINES = 1 // the multi-line preamble cell is ONE parsed CSV row

  return new Promise((resolve, reject) => {
    let lineCount = 0
    let headers = null
    const stream = createReadStream(CSV_PATH, 'utf-8')

    const parser = parse({ relaxQuotes: true, relaxColumnCount: true, skipEmptyLines: false })

    parser.on('data', (row) => {
      lineCount++
      if (lineCount <= PREAMBLE_LINES) return // skip preamble

      if (!headers) {
        headers = row.map((h, i) => h.trim() || `_${i}`)
        return
      }

      // Skip duplicate gender-lookup block (rows starting at ~242 in original)
      // These have a name in col 0 and a gender in col 1, and nothing else meaningful
      const name = String(row[0] || '').trim()
      const col1 = String(row[1] || '').trim().toLowerCase()
      const restEmpty = row.slice(2).every(c => !String(c).trim())
      if (restEmpty && (col1 === 'male' || col1 === 'woman' || col1 === 'female')) return
      if (!name) return // blank row

      const record = {}
      headers.forEach((h, i) => { record[h] = (row[i] || '').trim() })
      rows.push(record)
    })

    parser.on('end', () => resolve(rows))
    parser.on('error', reject)
    stream.pipe(parser)
  })
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📖 Parsing CSV...')
  const rows = await parseCsv()
  console.log(`   Found ${rows.length} data rows`)

  const { api } = await import('../convex/_generated/api.js')
  const convex = new ConvexHttpClient(CONVEX_URL)

  // 1. Clear existing data
  console.log('\n🗑️  Clearing existing participant data...')
  const cleared = await convex.mutation(api.clearData.clearAll, {})
  console.log(`   Deleted: ${JSON.stringify(cleared.deleted)}`)

  // 2. Find the event
  console.log('\n🎪 Looking for Spring 2026 event...')
  let eventId = undefined
  try {
    const allEvents = await convex.query(api.clearData.listEvents, {})
    const event = allEvents.find(e =>
      /spring 2026|intimacy adventure|group date.*2|night 2/i.test(e.title)
    ) || allEvents[0]
    eventId = event?._id
    console.log(`   Using event: "${event?.title}" (${eventId})`)
  } catch (e) {
    console.warn('   ⚠️  Could not fetch events:', e.message)
  }

  // 3. Insert participants
  console.log('\n👥 Inserting participants...')
  let inserted = 0

  for (const row of rows) {
    const name = row['NAME']
    if (!name) continue

    const connectionRaw = row['What makes you feel connected to someone?'] || ''
    const priorityWeights = extractPriorityWeights(connectionRaw)
    const dealbreaker = extractDealbreaker(connectionRaw) ||
                        extractDealbreaker(row['1 thing you are fearful of for the night?'])
    const connectionAnswer = extractCleanConnectionAnswer(connectionRaw)

    const dynamic_answers = {}
    if (connectionAnswer) dynamic_answers['What makes you feel connected to someone?'] = connectionAnswer
    if (row['Ideal first date?']) dynamic_answers['Ideal first date?'] = row['Ideal first date?']
    if (row['Tell me a cool/funny/interesting story about you?']) dynamic_answers['Tell me a cool/funny/interesting story about you?'] = row['Tell me a cool/funny/interesting story about you?']
    if (row['1 thing you are excited about for the night']) dynamic_answers['1 thing you are excited about for the night'] = row['1 thing you are excited about for the night']
    if (row['1 thing you are fearful of for the night?']) dynamic_answers['1 thing you are fearful of for the night?'] = row['1 thing you are fearful of for the night?']

    const attendanceStatus = mapAttendanceStatus(row['Priority / status'])
    if (attendanceStatus === 'cancelled' || attendanceStatus === 'waitlisted') {
      continue
    }

    const paymentAmount = parsePaid(row['PAID for snacks and drinks'])

    const participant = {
      full_name: name,
      contact_info: row['EMAIL'] && !['reminded', "sent paul's email", 'sent pauls email'].includes(row['EMAIL'].toLowerCase())
        ? row['EMAIL']
        : row['PHONE NUMBER']
          ? `phone:${row['PHONE NUMBER']}`
          : `imported-${name.toLowerCase().replace(/\s+/g, '-')}`,
      gender: parseGender(row['GENDER']),
      age: parseAge(row['AGE']),
      birthday: parseBirthday(row['BIRTHDAY']),
      work: row['CAREER'] || undefined,
      referral_notes: row['who else should we invite'] || undefined,
      dealbreaker: dealbreaker || undefined,
      priority_weights: priorityWeights || undefined,
      dynamic_answers: Object.keys(dynamic_answers).length > 0 ? dynamic_answers : undefined,
    }

    const interviewNotes = connectionRaw || undefined

    try {
      await convex.mutation(api.import.executeCsvImport, {
        eventId,
        rows: [{
          ...participant,
          specialData: {
            attendance_status: row['Priority / status'],
            payment_amount: paymentAmount ? String(paymentAmount) : undefined,
            interview_notes: interviewNotes,
          }
        }]
      })
      inserted++
      process.stdout.write(`   ✓ ${name}\n`)
    } catch (err) {
      console.error(`   ✗ ${name}: ${err.message}`)
    }
  }

  console.log(`\n✅ Done! Inserted ${inserted} of ${rows.length} participants.`)
}

main().catch(e => { console.error(e); process.exit(1) })

