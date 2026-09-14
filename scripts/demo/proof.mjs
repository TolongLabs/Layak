const AISYAH_NAME = 'aisyah binti ahmad'
const MIN_CHAT_ANSWER_CHARS = 80

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
  const { minChars = MIN_CHAT_ANSWER_CHARS, keywords = [] } = options
  const normalized = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('en')
  return normalized.length >= minChars && keywords.every((keyword) => normalized.includes(keyword.toLocaleLowerCase('en')))
}
