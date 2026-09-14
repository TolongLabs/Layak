// Layak's investor walk follows one synthetic citizen from first visit to a
// concrete draft. Production is pre-warmed by record.mjs before this recorded
// page exists, keeping Render cold starts out of the footage.

import { smoothScrollTo } from './motion.mjs'
import { verifyAisyahResult, verifyGovernmentSource, watchAisyahResult } from './proof.mjs'

const RESULT_FALLBACK =
  process.env.DEMO_RESULT_URL || 'https://layak.vercel.app/dashboard/evaluation/results/O1X98dEZYnePTUAG8nfz'

// Measured against both supported default voices. The next narration starts at
// the same +100ms offset, so each interval includes the scheduler's 260ms gap.
// Slow navigation naturally contributes to the interval; fast navigation waits
// only for the remainder, keeping the cut clear without accumulating padding.
export const MIN_BEAT_INTERVAL_MS = Object.freeze({
  landing: 4_847,
  guest: 5_103,
  dashboard: 5_039,
  intake: 7_300,
  processing: 6_511,
  transition: 5_679,
  results: 6_233,
  evidence: 5_764,
  whatif: 5_273,
  scenario: 6_191,
  packets: 6_060
})

export function remainingBeatDelay(previousBeat, elapsedMs) {
  return Math.max(0, Math.ceil((MIN_BEAT_INTERVAL_MS[previousBeat] ?? 0) - elapsedMs))
}

async function visible(locator, timeout = 15_000) {
  return locator
    .waitFor({ state: 'visible', timeout })
    .then(() => true)
    .catch(() => false)
}

async function film({ name, locator, hold, page, mark, beat, filmed, scroll = {} }) {
  filmed[name] = 0
  if (!(await visible(locator))) {
    console.log(`  ! ${name} did not render -- that beat did not film`)
    return false
  }
  await smoothScrollTo(page, locator, scroll)
  await beat(300)
  await mark(name)
  filmed[name] = 1
  await beat(hold)
  return true
}

export async function walk({ page, mark: captureMark, beat, filmed, WEB }) {
  let previousBeat = null
  let previousBeatAt = 0
  const mark = async (name) => {
    if (previousBeat) {
      const delay = remainingBeatDelay(previousBeat, Date.now() - previousBeatAt)
      if (delay > 0) await beat(delay)
    }
    captureMark(name)
    previousBeat = name
    previousBeatAt = Date.now()
  }

  // 1. Enter through the same public path a first-time citizen would use.
  await page.goto(WEB, { waitUntil: 'domcontentloaded' })
  await film({
    name: 'landing',
    locator: page.locator('main section').first(),
    hold: 4_000,
    page,
    mark,
    beat,
    filmed
  })

  // The design-system Button preserves button semantics even when it renders
  // an anchor, so the route is the stable locator here (not role="link").
  const getStarted = page.locator('a[href="/sign-in"]').first()
  await getStarted.waitFor({ state: 'visible' })
  await getStarted.click()
  const guest = page.getByRole('button', { name: 'Continue as guest' })
  await guest.waitFor({ state: 'visible' })
  await film({
    name: 'guest',
    locator: page.locator('main').first(),
    hold: 2_800,
    page,
    mark,
    beat,
    filmed
  })

  await guest.click()
  const startEvaluation = page.locator('a[href="/dashboard/evaluation/upload"]').first()
  await startEvaluation.waitFor({ state: 'visible', timeout: 60_000 })
  await film({
    name: 'dashboard',
    locator: page.locator('main').first(),
    hold: 3_000,
    page,
    mark,
    beat,
    filmed
  })

  // 2. Use the shipped synthetic Aisyah documents and visibly start the real
  // pipeline. The completed page that follows is an edited time jump to the
  // pre-existing Aisyah result; the recording never implies instant analysis.
  await startEvaluation.click()
  const sampleTrigger = page.getByRole('button', { name: 'Try sample data' })
  await sampleTrigger.waitFor({ state: 'visible' })
  await sampleTrigger.click()
  await page.getByRole('menuitem').filter({ hasText: 'Aisyah' }).click()
  const submit = page.locator('#tour-upload-submit:not([disabled])')
  await submit.waitFor({ state: 'visible', timeout: 20_000 })
  await film({
    name: 'intake',
    locator: page.locator('#tour-upload-form'),
    hold: 6_300,
    page,
    mark,
    beat,
    filmed
  })

  // Keep the camera deterministic and the shared free-tier quota untouched.
  // The click and streaming UI are real; only this long-running sample request
  // is held at its first SSE step before the explicit four-minute time jump.
  // Set DEMO_LIVE_PIPELINE=1 when deliberately recording the full live run.
  if (process.env.DEMO_LIVE_PIPELINE !== '1') {
    await page.route('**/api/agent/intake', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"type":"step_started","step":"extract"}\n\n'
      })
    )
  }
  await smoothScrollTo(page, submit, { viewportRatio: 0.58 })
  await beat(350)
  await submit.click()
  const extractStep = page.getByText('Extract profile', { exact: true }).first()
  await extractStep.waitFor({ state: 'visible', timeout: 30_000 })
  await film({
    name: 'processing',
    locator: extractStep.locator('xpath=ancestor::section[1]'),
    hold: 6_000,
    page,
    mark,
    beat,
    filmed
  })

  // Make the edit explicit. This is part of the recorded page, so narration
  // about the time jump has a matching visual instead of playing over a result.
  await page.evaluate(() => {
    const overlay = document.createElement('div')
    overlay.id = 'demo-time-jump'
    overlay.setAttribute('role', 'status')
    overlay.innerHTML = `
      <div style="max-width:760px;padding:64px;text-align:center">
        <p style="margin:0 0 18px;font:600 13px/1.3 Quicksand,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#b83d5a">
          Real analysis in progress
        </p>
        <h2 style="margin:0;font:600 54px/1.08 Georgia,serif;letter-spacing:-.025em;color:#183d30">
          About four minutes later
        </h2>
        <p style="margin:22px 0 0;font:500 20px/1.6 Quicksand,system-ui,sans-serif;color:#45645a">
          Rejoining Aisyah's completed evaluation
        </p>
      </div>`
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      display: 'grid',
      placeItems: 'center',
      background: '#f4f7f4'
    })
    document.body.appendChild(overlay)
  })
  await page.locator('#demo-time-jump').waitFor({ state: 'visible' })
  await beat(250)
  await mark('transition')
  filmed.transition = 1
  await beat(3_300)

  // 3. Resume after the real processing interval at a verified persisted result.
  const aisyahResponse = watchAisyahResult(page, RESULT_FALLBACK)
  await page.goto(RESULT_FALLBACK, { waitUntil: 'domcontentloaded' })
  const overview = await verifyAisyahResult(page, await aisyahResponse)
  await film({ name: 'results', locator: overview, hold: 5_000, page, mark, beat, filmed })

  const schemes = page.locator('#schemes')
  const sourceButton = schemes.locator('summary').filter({ hasText: 'Sources' }).first()
  await sourceButton.waitFor({ state: 'visible' })
  await smoothScrollTo(page, schemes)
  await beat(250)
  await sourceButton.click()
  await verifyGovernmentSource(schemes)
  await film({ name: 'evidence', locator: schemes, hold: 3_600, page, mark, beat, filmed })

  // 4. Change one assumption and wait for the exact recalculated figure before
  // narrating it. Both slider motion and page motion stay linear on camera.
  const whatIf = page.locator('#whatIfs')
  filmed.whatif = 0
  if (await visible(whatIf)) {
    await smoothScrollTo(page, whatIf)
    await beat(300)
    await mark('whatif')
    filmed.whatif = 1
    await beat(900)
    const income = page.getByRole('slider', { name: 'Monthly income (RM)' })
    await income.fill('2500')
    const scenarioAmount = whatIf.getByText('RM 14,558', { exact: true })
    await scenarioAmount.waitFor({ state: 'visible', timeout: 15_000 })
    await beat(2_800)
    await mark('scenario')
    filmed.scenario = 1
    await beat(4_500)
  } else {
    filmed.scenario = 0
  }

  // 5. Finish on the generated artifact itself, not on another feature list.
  const preview = page.locator('#preview')
  await preview.waitFor({ state: 'visible' })
  await smoothScrollTo(page, preview)
  await beat(300)
  const draftToggle = preview.locator('button[aria-expanded]').first()
  await draftToggle.waitFor({ state: 'visible' })
  await draftToggle.click()
  const packetFrame = preview.locator('iframe').first()
  await packetFrame.waitFor({ state: 'visible', timeout: 25_000 })
  await film({
    name: 'packets',
    locator: packetFrame,
    hold: 6_000,
    page,
    mark,
    beat,
    filmed,
    scroll: { viewportRatio: 0.08 }
  })

  await mark('end')
  filmed.end = 1
  await beat(6_000)
}
