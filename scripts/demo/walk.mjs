// Layak's investor walk: a deliberately paced tour of the live application.
// It uses the bundled synthetic Aisyah documents for the intake shot and a
// completed guest evaluation for the results tour. The four-minute evaluation
// itself is intentionally not started inside a 60–75 second recording.

const RESULT_FALLBACK =
  process.env.DEMO_RESULT_URL || 'https://layak.vercel.app/dashboard/evaluation/results/O1X98dEZYnePTUAG8nfz'

async function visible(locator, timeout = 15_000) {
  return locator
    .waitFor({ state: 'visible', timeout })
    .then(() => true)
    .catch(() => false)
}

async function film({ name, locator, hold, page, mark, beat, filmed }) {
  filmed[name] = 0
  if (!(await visible(locator))) {
    console.log(`  ! ${name} did not render -- that beat did not film`)
    return false
  }
  await locator.scrollIntoViewIfNeeded().catch(() => {})
  await beat(800)
  mark(name)
  filmed[name] = 1
  await beat(hold)
  return true
}

export async function walk({ page, mark, beat, filmed, WEB }) {
  // 1. Establish the problem and Layak's guided pipeline on the public site.
  await page.goto(WEB, { waitUntil: 'domcontentloaded' })
  await film({
    name: 'landing',
    locator: page.locator('main').first(),
    hold: 4_600,
    page,
    mark,
    beat,
    filmed
  })

  await film({
    name: 'processing',
    locator: page.locator('.snap-start').nth(1),
    hold: 4_600,
    page,
    mark,
    beat,
    filmed
  })

  // 2. Enter as a guest and show the real dashboard. Warm starts are quick;
  // cold backend starts can take longer, so wait on the dashboard CTA itself.
  await page.goto(`${WEB}/sign-in`, { waitUntil: 'domcontentloaded' })
  const guest = page.getByRole('button', { name: 'Continue as guest' })
  await guest.waitFor({ state: 'visible' })
  await beat(700)
  await guest.click()

  const startEvaluation = page.locator('a[href="/dashboard/evaluation/upload"]').first()
  await startEvaluation.waitFor({ state: 'visible', timeout: 60_000 })
  await film({
    name: 'dashboard',
    locator: page.locator('main').first(),
    hold: 3_500,
    page,
    mark,
    beat,
    filmed
  })

  // 3. Show that intake can be document-led and entirely synthetic for demos.
  await startEvaluation.click()
  const sampleTrigger = page.getByRole('button', { name: 'Try sample data' })
  await sampleTrigger.waitFor({ state: 'visible' })
  await sampleTrigger.click()
  await page.getByRole('menuitem').filter({ hasText: 'Aisyah' }).click()
  const intake = page.locator('#tour-upload-form')
  await visible(page.locator('#tour-upload-submit:not([disabled])'), 20_000)
  await film({
    name: 'intake',
    locator: intake,
    hold: 5_000,
    page,
    mark,
    beat,
    filmed
  })

  // 4. A persisted completed evaluation keeps this short walkthrough
  // deterministic while still showing the actual authenticated product.
  await page.goto(`${WEB}/dashboard`, { waitUntil: 'domcontentloaded' })
  const savedResult = page.locator('a[href^="/dashboard/evaluation/results/"]').first()
  if (await visible(savedResult, 15_000)) {
    await savedResult.click()
  } else {
    console.log('  ! no saved dashboard result found; using the verified guest result URL')
    await page.goto(RESULT_FALLBACK, { waitUntil: 'domcontentloaded' })
  }

  const overview = page.locator('#overview')
  await overview.waitFor({ state: 'visible', timeout: 45_000 })
  await film({ name: 'results', locator: overview, hold: 4_800, page, mark, beat, filmed })

  const sourceButton = page.locator('#schemes button').filter({ hasText: 'Sources' }).first()
  if (await visible(sourceButton, 1_000)) await sourceButton.click()
  await film({
    name: 'evidence',
    locator: page.locator('#schemes'),
    hold: 4_300,
    page,
    mark,
    beat,
    filmed
  })

  await film({
    name: 'strategy',
    locator: page.locator('#strategy'),
    hold: 4_500,
    page,
    mark,
    beat,
    filmed
  })

  const ask = page.getByRole('button', { name: 'Ask Cik Lay About This' }).first()
  if (await visible(ask)) await ask.click()
  const chat = page.getByRole('dialog', { name: 'Ask about this evaluation' })
  await film({ name: 'chat', locator: chat, hold: 4_100, page, mark, beat, filmed })
  const closeChat = page.getByRole('button', { name: 'Close chat' })
  if (await visible(closeChat, 3_000)) await closeChat.click()

  // 5. Recalculate one scenario, then close on the concrete application packet.
  const whatIf = page.locator('#whatIfs')
  if (await visible(whatIf)) {
    await whatIf.scrollIntoViewIfNeeded()
    const income = page.getByRole('slider', { name: 'Monthly income (RM)' })
    if (await visible(income, 5_000)) {
      await income.fill('2500')
      await beat(1_500)
    }
  }
  await film({ name: 'whatif', locator: whatIf, hold: 5_000, page, mark, beat, filmed })

  await film({
    name: 'packets',
    locator: page.locator('#preview'),
    hold: 4_800,
    page,
    mark,
    beat,
    filmed
  })

  await page.locator('#overview').scrollIntoViewIfNeeded()
  await beat(700)
  mark('end')
  filmed.end = 1
  await beat(3_500)
}
