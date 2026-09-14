import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const walkSource = await readFile(new URL('../walk.mjs', import.meta.url), 'utf8')
const warmupSource = await readFile(new URL('../warmup.mjs', import.meta.url), 'utf8')
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
    'qualification',
    'evidence',
    'strategy',
    'ciklay_compact',
    'ciklay_expanded',
    'ciklay_answer',
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
  assert.match(
    walkSource,
    /const topScheme = schemes\.locator\('li\[id\^="scheme-"\]'\)\.first\(\)[\s\S]*const whyQualify = topScheme\.getByRole\('button', \{ name: 'Tap to reveal' \}\)/
  )
  assert.ok(walkSource.includes("topScheme.locator('button[aria-expanded=\"true\"] p[aria-hidden=\"false\"]')"))
  assert.ok(walkSource.includes("topScheme.locator('summary')"))
  assert.ok(walkSource.includes("page.locator('#strategy')"))
  assert.ok(walkSource.includes("getByRole('button', { name: 'Ask Cik Lay About This' })"))
  assert.ok(walkSource.includes("getByRole('button', { name: 'Expand to centre modal' })"))
  assert.ok(walkSource.includes("getByRole('button', { name: 'Collapse to side panel' })"))
  assert.ok(walkSource.includes("getByRole('button', { name: 'Send' })"))
  assert.ok(walkSource.includes("getByText('Follow-up questions'"))
  assert.ok(walkSource.includes('const stagedQuestion = await chatInput.inputValue()'))
  assert.ok(walkSource.includes("const chatQuestion = 'How do I apply for JKM Warga Emas, and what documents should I prepare?'"))
  assert.ok(walkSource.includes('chatInput.pressSequentially(chatQuestion'))
  assert.ok(walkSource.includes("const assistantAnswers = chatDialog.locator('.rounded-bl-sm')"))
  assert.ok(walkSource.includes('const answerCountBefore = await assistantAnswers.count()'))
  assert.ok(walkSource.includes('verifyGroundedChatAnswer(chatDialog, answerCountBefore)'))
  assert.doesNotMatch(walkSource, /scrollIntoViewIfNeeded/)
  assert.match(walkSource, /About one minute later/)
  assert.doesNotMatch(walkSource, /About four minutes later/)
  assert.match(narration, /takes about one minute/i)
  assert.match(narration, /\bStrategy\b/)
  assert.match(narration, /\bCik Lay\b/)
  assert.ok(warmupSource.includes("getByRole('button', { name: 'Ask Cik Lay About This' })"))
  assert.ok(warmupSource.includes("getByText('Follow-up questions'"))
  assert.ok(warmupSource.includes("chatInput.fill('How do I apply for JKM Warga Emas, and what documents should I prepare?')"))
  assert.ok(warmupSource.includes('verifyGroundedChatAnswer(chatDialog, answerCountBefore)'))
})

test('camera pacing clears every measured default-Kokoro line before the next beat', () => {
  const kokoroDurationMs = {
    landing: 4587,
    guest: 4843,
    dashboard: 4779,
    intake: 6805,
    processing: 6251,
    transition: 5589,
    results: 5973,
    qualification: 4480,
    evidence: 4437,
    strategy: 4907,
    ciklay_compact: 6443,
    ciklay_expanded: 4821,
    ciklay_answer: 4373,
    whatif: 5013,
    scenario: 5824,
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
    qualification: 4240,
    evidence: 3600,
    strategy: 4160,
    ciklay_compact: 6680,
    ciklay_expanded: 4120,
    ciklay_answer: 3880,
    whatif: 3600,
    scenario: 4840,
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
