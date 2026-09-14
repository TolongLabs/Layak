import assert from 'node:assert/strict'
import test from 'node:test'

const warmup = await import('../warmup.mjs').catch(() => null)

test('warmProduction primes guest dashboard and saved results outside a recording context', async () => {
  assert.ok(warmup?.warmProduction, 'warmup.mjs must expose production warm-up')
  const visits = []
  const contextOptions = []
  let closed = false
  const guest = {
    waitFor: async () => {},
    click: async () => visits.push('guest-click')
  }
  const startEvaluation = {
    first() {
      return this
    },
    waitFor: async () => visits.push('dashboard-ready')
  }
  const overview = {
    waitFor: async () => visits.push('result-ready'),
    getByText: () => ({ waitFor: async () => {} })
  }
  const draftToggle = {
    first() {
      return this
    },
    waitFor: async () => visits.push('draft-ready'),
    click: async () => visits.push('draft-click')
  }
  const packetFrame = {
    first() {
      return this
    },
    waitFor: async () => visits.push('packet-ready')
  }
  const resultResponse = {
    json: async () => ({ profile: { name: 'AISYAH BINTI AHMAD' } }),
    request: () => ({ method: () => 'GET' }),
    status: () => 200,
    url: () => 'https://api.example/api/evaluations/demo'
  }
  const page = {
    setDefaultTimeout() {},
    goto: async (url) => visits.push(url),
    getByRole: () => guest,
    waitForResponse: () => resultResponse,
    locator: (selector) => {
      if (selector === '#overview') return overview
      if (selector === '#preview button[aria-expanded]') return draftToggle
      if (selector === '#preview iframe') return packetFrame
      return startEvaluation
    }
  }
  const context = {
    newPage: async () => page,
    close: async () => {
      closed = true
    }
  }
  const browser = {
    newContext: async (options) => {
      contextOptions.push(options)
      return context
    }
  }

  const result = await warmup.warmProduction({
    browser,
    web: 'https://layak.example',
    resultUrl: 'https://layak.example/results/demo',
    log: () => {}
  })

  assert.equal(result, true)
  assert.equal('recordVideo' in contextOptions[0], false)
  assert.deepEqual(visits, [
    'https://layak.example/sign-in',
    'guest-click',
    'dashboard-ready',
    'https://layak.example/results/demo',
    'result-ready',
    'draft-ready',
    'draft-click',
    'packet-ready'
  ])
  assert.equal(closed, true)
})

test('warmProduction retries a transient cold-start failure', async () => {
  let attempts = 0
  let closes = 0
  const ready = {
    first() {
      return this
    },
    waitFor: async () => {},
    getByText: () => ({ waitFor: async () => {} })
  }
  const first = {
    first() {
      return this
    },
    waitFor: async () => {},
    click: async () => {}
  }
  const resultResponse = {
    json: async () => ({ profile: { name: 'Aisyah binti Ahmad' } }),
    request: () => ({ method: () => 'GET' }),
    status: () => 200,
    url: () => 'https://api.example/api/evaluations/demo'
  }
  const page = {
    setDefaultTimeout() {},
    goto: async () => {
      if (attempts === 1) throw new Error('Render is waking up')
    },
    getByRole: () => first,
    waitForResponse: () => resultResponse,
    locator: (selector) => {
      if (selector.includes('button')) return first
      if (selector.includes('iframe')) return first
      return ready
    }
  }
  const browser = {
    newContext: async () => {
      attempts += 1
      return {
        newPage: async () => page,
        close: async () => {
          closes += 1
        }
      }
    }
  }

  const result = await warmup.warmProduction({
    browser,
    web: 'https://layak.example',
    resultUrl: 'https://layak.example/results/demo',
    log: () => {}
  })

  assert.equal(result, true)
  assert.equal(attempts, 2)
  assert.equal(closes, 2)
})
