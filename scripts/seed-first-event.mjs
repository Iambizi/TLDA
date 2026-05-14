#!/usr/bin/env node
/**
 * seed-first-event.mjs
 * Imports participants from the "1st event" CSV (personal - meet-cute question log - personal.xlsx - pre.csv)
 * into Convex, creating a new "Group Date night 1" event and linking all attendees.
 *
 * Run locally:  node scripts/seed-first-event.mjs
 * Run on prod:  CONVEX_URL=https://moonlit-mallard-172.convex.cloud node scripts/seed-first-event.mjs
 */

import { createReadStream } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse'
import { ConvexHttpClient } from 'convex/browser'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_PATH = resolve(__dirname, '../docs/csv/personal - meet-cute question log - personal.xlsx - pre.csv')
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
    [/(\d+)%?\s*(?:personality|perso)/i, 'personality'],
    [/(?:personality|perso)[:\s]+(\d+)%?/i, 'personality'],
    [/(\d+)%?\s*(?:looks?|look|physical)/i, 'looks'],
    [/(?:looks?|physical)[:\s]+(\d+)%?/i, 'looks'],
    [/(\d+)%?\s*(?:pedigree|pedi|career)/i, 'pedigree'],
    [/(?:pedigree|pedi|career)[:\s]+(\d+)%?/i, 'pedigree'],
  ]

  for (const [regex, key] of patterns) {
    const m = text.match(regex)
    if (m) { result[key] = parseInt(m[1], 10); found = true }
  }

  if (!found) return null

  const keys = ['pedigree', 'looks', 'personality']
  const total = keys.reduce((s, k) => s + result[k], 0)
  if (total > 0 && total !== 100) {
    const zeros = keys.filter(k => result[k] === 0)
    if (zeros.length === 1) result[zeros[0]] = 100 - total
  }

  const finalTotal = keys.reduce((s, k) => s + result[k], 0)
  if (finalTotal !== 100) return null
  return result
}

function parseContact(raw) {
  if (!raw) return { email: null, phone: null }
  const emailMatch = raw.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)
  const phoneMatch = raw.replace(/\s/g, '').match(/[\d\-+()]{7,}/)
  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].replace(/\D/g, '') : null,
  }
}

function buildContactInfo(name, rawContact) {
  const { email, phone } = parseContact(rawContact)
  if (email) return email
  if (phone) return `phone:${phone}`
  return `imported-${name.toLowerCase().replace(/[\s()'/,]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`
}

function parseGender(raw) {
  if (!raw) return undefined
  const s = String(raw).trim().toLowerCase()
  if (['male', 'm', 'man'].includes(s)) return 'man'
  if (['female', 'f', 'woman', 'women'].includes(s)) return 'woman'
  return undefined
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
  if (/^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)$/i.test(s)) return undefined
  return s
}

function parseContribution(raw) {
  if (!raw) return undefined
  const s = String(raw).trim()
  const m = s.replace(/[$,\s]/g, '').match(/\d+(\.\d+)?/)
  if (!m) return undefined
  const val = parseFloat(m[0])
  return val > 0 ? val : undefined
}

function cleanName(raw) {
  if (!raw) return null
  return raw
    .replace(/\n.*/s, '') // take only first line
    .replace(/\bcancelled\b/gi, '')
    .replace(/\bplans\b/gi, '')
    .trim()
    .replace(/\s+/g, ' ')
}

// ── CSV Parser ───────────────────────────────────────────────────────────────

async function parseCsv() {
  const rows = []

  return new Promise((resolve, reject) => {
    const stream = createReadStream(CSV_PATH, 'utf-8')
    const parser = parse({ relaxQuotes: true, relaxColumnCount: true, skipEmptyLines: false })

    let lineCount = 0
    let headers = null

    parser.on('data', (row) => {
      lineCount++

      // First row is the header (multi-line cells = 1 parsed row)
      if (!headers) {
        headers = row.map((h, i) => `col_${i}`)
        return
      }

      const record = {}
      headers.forEach((h, i) => { record[h] = (row[i] || '').trim() })
      rows.push(record)
    })

    parser.on('end', () => resolve(rows))
    parser.on('error', reject)
    stream.pipe(parser)
  })
}

// Column indices based on CSV structure:
// 0: status letter (O, B, A, K, etc.)
// 1: x or empty (gender match indicator)
// 2: NAME
// 3: contacts (email / phone)
// 4: amt given
// 5: degree of sep
// 6: GENDER
// 7: AGE
// 8: BIRTHDAY
// 9: WORK
// 10: ready for love / grand amour
// 11: Venn / priority weights
// 12: lifestyle preferences
// 13: age range
// 14: prochoice/prolife
// 15: dream city
// 16: ask out preference
// 17: comfortable with alcohol
// 18: life in 5 years
// 19: last thing that made you laugh
// 20: dream date
// 21: family notes
// 22: vice / red flag
// 23: dealbreaker
// 24: random curiosities
// 25: referral notes

function rowToParticipant(row) {
  const nameRaw = row['col_2']
  const name = cleanName(nameRaw)
  if (!name) return null

  // Skip rows with no meaningful data (trailer section)
  const gender = parseGender(row['col_6'])
  const ageRaw = row['col_7']
  const skipFlags = ['ghosted', 'not single', 'out of town', 'might not be free', 'moving', 'too young', 'might be out of the city', 'smokes']
  if (skipFlags.some(flag => ageRaw.toLowerCase().includes(flag))) return null
  if (!ageRaw && !row['col_3'] && !row['col_6']) return null

  // Skip cancelled attendees
  if (nameRaw.toLowerCase().includes('cancelled')) return null

  const contactInfo = buildContactInfo(name, row['col_3'])
  const contribution = parseContribution(row['col_4'])
  const priorityWeights = extractPriorityWeights(row['col_11'])
  const age = parseAge(ageRaw)
  const birthday = parseBirthday(row['col_8'])

  // Dynamic answers from open-ended fields
  const dynamic_answers = {}
  const readyForLove = row['col_10']?.trim()
  const ageRange = row['col_13']?.trim()
  const lifestyle = row['col_12']?.trim()
  const prochoice = row['col_14']?.trim()
  const lastLaugh = row['col_19']?.trim()
  const randomQ = row['col_24']?.trim()
  const referral = row['col_25']?.trim()

  if (readyForLove) dynamic_answers['Ready for love / grand amour?'] = readyForLove
  if (ageRange) dynamic_answers['Ideal partner age range'] = ageRange
  if (lifestyle) dynamic_answers['Lifestyle preferences (ranked)'] = lifestyle
  if (prochoice) dynamic_answers['Values: Pro-life / Pro-choice'] = prochoice
  if (lastLaugh) dynamic_answers['Last thing that made you laugh?'] = lastLaugh
  if (randomQ) dynamic_answers['Random curiosities / notes'] = randomQ
  if (referral) dynamic_answers['Referrals'] = referral

  return {
    name,
    contactInfo,
    gender,
    age,
    birthday,
    work: row['col_9']?.trim().replace(/\n/g, ', ') || undefined,
    dreamCity: row['col_15']?.trim() || undefined,
    askOutPreference: row['col_16']?.trim() || undefined,
    alcoholOk: row['col_17']?.trim() || undefined,
    lifeIn5Years: row['col_18']?.trim() || undefined,
    dreamDate: row['col_20']?.trim() || undefined,
    familyNotes: row['col_21']?.trim() || undefined,
    viceOrRedFlag: row['col_22']?.trim() || undefined,
    dealbreaker: row['col_23']?.trim() || undefined,
    priorityWeights,
    dynamic_answers: Object.keys(dynamic_answers).length > 0 ? dynamic_answers : undefined,
    contribution,
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📖 Parsing CSV...')
  const rawRows = await parseCsv()
  console.log(`   Found ${rawRows.length} raw rows`)

  const participants = rawRows.map(rowToParticipant).filter(Boolean)
  // Deduplicate by name (keep first occurrence)
  const seen = new Set()
  const deduped = participants.filter(p => {
    if (seen.has(p.name)) return false
    seen.add(p.name)
    return true
  })

  console.log(`   Parsed ${deduped.length} valid participants`)

  const { api } = await import('../convex/_generated/api.js')
  const convex = new ConvexHttpClient(CONVEX_URL)

  // 1. Find the "Group Date night 1" event (already created in production)
  console.log('\n🎪 Looking for Group Date night 1 event...')
  let eventId = undefined
  try {
    const allEvents = await convex.query(api.clearData.listEvents, {})
    const event = allEvents.find(e =>
      /night 1|group date.*1|meet.?cute|pre|first/i.test(e.title)
    )
    if (event) {
      eventId = event._id
      console.log(`   ✓ Using event: "${event.title}" (${eventId})`)
    } else {
      console.log(`   Available events: ${allEvents.map(e => `"${e.title}"`).join(', ')}`)
      console.log('   ⚠️  No matching event found — participants will be inserted without event assignment')
    }
  } catch (e) {
    console.warn('   ⚠️  Could not fetch events:', e.message)
  }

  // 2. Insert participants
  console.log('\n👥 Inserting participants...')
  let inserted = 0
  let skipped = 0

  for (const p of deduped) {
    const participant = {
      full_name: p.name,
      contact_info: p.contactInfo,
      gender: p.gender,
      age: p.age,
      birthday: p.birthday,
      work: p.work,
      dream_city: p.dreamCity,
      ask_out_preference: p.askOutPreference,
      comfortable_with_alcohol_meetcute: p.alcoholOk
        ? ['yes', 'oui', 'tes', 'y'].some(v => p.alcoholOk.toLowerCase().startsWith(v))
        : undefined,
      life_in_5_years: p.lifeIn5Years,
      dream_date: p.dreamDate,
      family_notes: p.familyNotes,
      vice_or_red_flag: p.viceOrRedFlag,
      dealbreaker: p.dealbreaker,
      priority_weights: p.priorityWeights,
      dynamic_answers: p.dynamic_answers,
    }

    // Clean undefined fields
    for (const key of Object.keys(participant)) {
      if (participant[key] === undefined || participant[key] === null || participant[key] === '') {
        delete participant[key]
      }
    }

    try {
      await convex.mutation(api.import.executeCsvImport, {
        eventId,
        rows: [{
          ...participant,
          specialData: {
            payment_amount: p.contribution ? String(p.contribution) : undefined,
            attendance_status: 'attended',
          },
        }],
      })
      console.log(`   ✓ ${p.name}${p.contribution ? ` ($${p.contribution})` : ''}`)
      inserted++
    } catch (err) {
      console.error(`   ✗ ${p.name}: ${err.message}`)
      skipped++
    }
  }

  console.log(`\n✅ Done! Inserted ${inserted} participants${skipped > 0 ? `, ${skipped} failed` : ''}.`)
}

main().catch(e => {
  console.error('Fatal:', e)
  process.exit(1)
})
