import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const walkSource = await readFile(new URL('../walk.mjs', import.meta.url), 'utf8')
const narration = await readFile(new URL('../narration.txt', import.meta.url), 'utf8')
const walk = await import('../walk.mjs')

test('the VC walk uses the streamlined citizen journey', () => {
  const requiredBeats = [
    'landing',
    'guest',
    'dashboard',
    'intake',
    'processing',
    'transition',
    'results',
    'evidence',
    'whatif',
    'scenario',
    'packets',
    'end'
  ]
  const narratedBeats = narration
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split('|', 1)[0].trim())

  assert.deepEqual(narratedBeats, requiredBeats)
  assert.ok(walkSource.includes(`page.locator('a[href="/sign-in"]')`))
  assert.ok(walkSource.includes("page.route('**/api/agent/intake'"))
  assert.ok(walkSource.includes("schemes.locator('summary')"))
  assert.doesNotMatch(walkSource, /scrollIntoViewIfNeeded/)
  assert.doesNotMatch(narration, /\b(?:strategy|chat|Cik Lay)\b/i)
})

test('camera pacing clears every measured default-Kokoro line before the next beat', () => {
  const kokoroDurationMs = {
    landing: 4587,
    guest: 4843,
    dashboard: 4779,
    intake: 6805,
    processing: 6251,
    transition: 5419,
    results: 5973,
    evidence: 5504,
    whatif: 5013,
    scenario: 5931,
    packets: 5696
  }
  const chatterboxDurationMs = {
    landing: 3840,
    guest: 4280,
    dashboard: 3840,
    intake: 7040,
    processing: 5240,
    transition: 4960,
    results: 5600,
    evidence: 4760,
    whatif: 3600,
    scenario: 4400,
    packets: 5800
  }

  for (const [beat, duration] of Object.entries(kokoroDurationMs)) {
    assert.ok(
      walk.MIN_BEAT_INTERVAL_MS[beat] >= Math.max(duration, chatterboxDurationMs[beat]) + 260,
      `${beat} needs enough time for either supported voice before the next narration starts`
    )
  }
  assert.equal(walk.remainingBeatDelay('evidence', 5300), 464)
  assert.equal(walk.remainingBeatDelay('evidence', 6000), 0)
})
