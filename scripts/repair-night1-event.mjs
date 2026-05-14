#!/usr/bin/env node
/**
 * repair-night1-event.mjs
 * Finds all participants not assigned to any event and links them
 * to the "Group Date night 1" event.
 *
 * Run: CONVEX_URL=https://moonlit-mallard-172.convex.cloud node scripts/repair-night1-event.mjs
 */

import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL
if (!CONVEX_URL) { console.error('❌ Set CONVEX_URL'); process.exit(1) }

async function main() {
  const { api } = await import('../convex/_generated/api.js')
  const convex = new ConvexHttpClient(CONVEX_URL)

  // 1. Find the Night 1 event
  const allEvents = await convex.query(api.clearData.listEvents, {})
  const night1 = allEvents.find(e => /night 1/i.test(e.title))
  if (!night1) { console.error('❌ Could not find "Group Date night 1" event'); process.exit(1) }
  console.log(`✓ Night 1 event: "${night1.title}" (${night1._id})`)

  // 2. Get all participants and all eventParticipant links
  const [allParticipants, allEPs] = await Promise.all([
    convex.query(api.participants.list, {}),
    convex.query(api.clearData.listAllEventParticipants, {}),
  ])

  const assignedParticipantIds = new Set(allEPs.map(ep => ep.participant_id))
  console.log(`📋 Total participants: ${allParticipants.length}`)
  console.log(`📌 Already assigned to an event: ${assignedParticipantIds.size}`)

  const unassigned = allParticipants.filter(p => !assignedParticipantIds.has(p._id))
  console.log(`\n🔗 Unassigned (Night 1 orphans): ${unassigned.length}`)

  if (unassigned.length === 0) {
    console.log('✅ Nothing to fix — all participants are already assigned to an event!')
    return
  }

  // 3. Assign each unlinked participant to Night 1
  let linked = 0
  for (const p of unassigned) {
    try {
      await convex.mutation(api.clearData.assignParticipantToEvent, {
        participant_id: p._id,
        event_id: night1._id,
        attendance_status: 'attended',
      })
      console.log(`   ✓ Linked: ${p.full_name}`)
      linked++
    } catch (err) {
      console.error(`   ✗ ${p.full_name}: ${err.message}`)
    }
  }

  console.log(`\n✅ Done! Linked ${linked} participants to "${night1.title}".`)
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
