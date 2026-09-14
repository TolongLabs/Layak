// Prime Render-backed product reads before Playwright creates a recorded page.
// The warm-up performs no evaluation; it opens the guest dashboard and a known
// completed result so cold-start latency stays off-camera without implying that
// a fresh analysis completed instantly.

import { verifyAisyahResult, verifyGroundedChatAnswer, watchAisyahResult } from './proof.mjs'

export async function warmProduction({ browser, web, resultUrl, log = console.log, attempts = 2 }) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let context
    try {
      context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
      const page = await context.newPage()
      page.setDefaultTimeout(90_000)
      await page.goto(`${web}/sign-in`, { waitUntil: 'domcontentloaded' })
      const guest = page.getByRole('button', { name: 'Continue as guest' })
      await guest.waitFor({ state: 'visible' })
      await guest.click()
      await page.locator('a[href="/dashboard/evaluation/upload"]').first().waitFor({ state: 'visible' })
      const aisyahResponse = watchAisyahResult(page, resultUrl)
      await page.goto(resultUrl, { waitUntil: 'domcontentloaded' })
      await verifyAisyahResult(page, await aisyahResponse, 90_000)

      // Prime the separate chat route and model connection before recording.
      // Waiting for follow-up suggestions proves the streamed answer completed,
      // rather than merely proving that the panel opened.
      const strategy = page.locator('#strategy')
      const askCikLay = strategy.getByRole('button', { name: 'Ask Cik Lay About This' }).first()
      await askCikLay.waitFor({ state: 'visible' })
      await askCikLay.click()
      const chatDialog = page.getByRole('dialog', { name: 'Ask about this evaluation' })
      const chatInput = chatDialog.getByPlaceholder('Ask about your results…')
      await chatInput.waitFor({ state: 'visible' })
      const stagedQuestion = await chatInput.inputValue()
      if (!stagedQuestion.trim()) throw new Error('Strategy did not stage a Cik Lay question')
      await chatInput.fill('How do I apply for JKM Warga Emas, and what documents should I prepare?')
      const assistantAnswers = chatDialog.locator('.rounded-bl-sm')
      const answerCountBefore = await assistantAnswers.count()
      await chatDialog.getByRole('button', { name: 'Send' }).click()
      await chatDialog.getByText('Follow-up questions', { exact: true }).waitFor({ state: 'visible', timeout: 90_000 })
      await verifyGroundedChatAnswer(chatDialog, answerCountBefore)
      await chatDialog.getByRole('button', { name: 'Close chat' }).click()

      const draftToggle = page.locator('#preview button[aria-expanded]').first()
      await draftToggle.waitFor({ state: 'visible' })
      await draftToggle.click()
      await page.locator('#preview iframe').first().waitFor({ state: 'visible', timeout: 45_000 })
      log('production warm-up complete (guest dashboard + saved result + Cik Lay + draft packet)')
      return true
    } catch (error) {
      const state = attempt < attempts ? `retrying (${attempt}/${attempts})` : 'aborting capture'
      log(`production warm-up incomplete; ${state}: ${String(error).slice(0, 180)}`)
    } finally {
      if (context) await context.close()
    }
  }
  return false
}
