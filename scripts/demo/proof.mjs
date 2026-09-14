const AISYAH_NAME = 'aisyah binti ahmad'
const MIN_CHAT_ANSWER_CHARS = 80
const CHAT_REFUSAL =
  /\b(?:(?:i(?:'|’)m|i am)\s+unable to|(?:cannot|can't|can not|could not|couldn't|do not|don't|does not|doesn't|did not|didn't)\b.{0,60}\b(?:have|verify|provide|find|confirm|access|answer|contain))\b/i

function normaliseName(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en')
}

export function watchAisyahResult(page, resultUrl, timeout = 90_000) {
  const evalId = new URL(resultUrl).pathname.split('/').filter(Boolean).at(-1)
  if (!evalId) throw new Error(`cannot identify evaluation id from ${resultUrl}`)

  return page.waitForResponse(
    (response) => {
      try {
        const path = new URL(response.url()).pathname
        return (
          response.request().method() === 'GET' &&
          response.status() === 200 &&
          path.endsWith(`/api/evaluations/${evalId}`)
        )
      } catch {
        return false
      }
    },
    { timeout }
  )
}

export async function verifyAisyahResult(page, response, timeout = 45_000) {
  const payload = await response.json()
  if (normaliseName(payload?.profile?.name) !== AISYAH_NAME) {
    throw new Error(`saved result expected Aisyah binti Ahmad; received ${payload?.profile?.name ?? 'no profile name'}`)
  }

  const overview = page.locator('#overview')
  await overview.waitFor({ state: 'visible', timeout })
  await overview.getByText('13,808', { exact: true }).waitFor({ state: 'visible', timeout })
  await overview.getByText('Matched across 12 scheme(s).', { exact: true }).waitFor({ state: 'visible', timeout })
  return overview
}

export async function verifyGovernmentSource(schemes, timeout = 15_000) {
  await schemes.locator('a[href^="https://"][href*=".gov.my/"]').first().waitFor({ state: 'visible', timeout })
}

export function isSubstantiveChatAnswer(value, options = {}) {
  const { minChars = MIN_CHAT_ANSWER_CHARS, keywords = [], requiredPatterns = [] } = options
  const normalized = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('en')
  return (
    normalized.length >= minChars &&
    !CHAT_REFUSAL.test(normalized) &&
    keywords.every((keyword) => normalized.includes(keyword.toLocaleLowerCase('en'))) &&
    requiredPatterns.every((pattern) => pattern.test(normalized))
  )
}

export async function verifyGroundedChatAnswer(chatDialog, previousAnswerCount, timeout = 15_000) {
  const answers = chatDialog.locator('.rounded-bl-sm')
  const answer = answers.nth(previousAnswerCount)
  await answer.waitFor({ state: 'visible', timeout })

  const observedCount = await answers.count()
  if (observedCount !== previousAnswerCount + 1) {
    throw new Error(`Cik Lay expected one new answer; observed ${observedCount - previousAnswerCount}`)
  }

  const answerText = await answer.locator('.break-words').first().innerText()
  if (
    !isSubstantiveChatAnswer(answerText, {
      keywords: ['jkm'],
      requiredPatterns: [
        /\b(?:prepare|obtain|complete|fill|submit|bring|download|collect|provide)\b/i,
        /\b(?:form|mykad|identity|income|residence|medical|birth certificate)\b/i
      ]
    })
  ) {
    throw new Error(`Cik Lay returned an incomplete or irrelevant answer: ${answerText.slice(0, 160)}`)
  }
  if ((await answer.locator('li').count()) < 2) {
    throw new Error('Cik Lay answer did not include concrete application or document steps')
  }
  if ((await answer.locator('p.italic').count()) > 0) {
    throw new Error('Cik Lay completed without live PDF grounding')
  }

  await answer.locator('.citation-chip').filter({ hasText: /jkm/i }).first().waitFor({ state: 'visible', timeout })
  return answer
}
