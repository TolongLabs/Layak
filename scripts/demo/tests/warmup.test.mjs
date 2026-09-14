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
  const first = {
    first() {
      return this
    },
    waitFor: async () => visits.push('chat-ready'),
    click: async () => visits.push('chat-open')
  }
  const chatInput = {
    waitFor: async () => visits.push('chat-input-ready'),
    inputValue: async () =>
      'Who in my family should claim the dependent-parent relief, and how do we coordinate it on the LHDN portal?',
    fill: async () => visits.push('chat-question-set')
  }
  const chatDialog = {
    getByPlaceholder: () => chatInput,
    getByRole: (_role, { name }) => ({
      click: async () => visits.push(name === 'Send' ? 'chat-send' : 'chat-close')
    }),
    getByText: () => ({ waitFor: async () => visits.push('chat-finished') }),
    locator: () => ({
      last: () => ({
        innerText: async () =>
          'For JKM Warga Emas, prepare the application documents listed in the official guidance, including identity and income records.'
      })
    })
  }
  const strategy = {
    getByRole: () => first
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
    getByRole: (role) => (role === 'dialog' ? chatDialog : guest),
    waitForResponse: () => resultResponse,
    locator: (selector) => {
      if (selector === '#overview') return overview
      if (selector === '#strategy') return strategy
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
    'chat-ready',
    'chat-open',
    'chat-input-ready',
    'chat-question-set',
    'chat-send',
    'chat-finished',
    'chat-close',
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
  const chatInput = {
    waitFor: async () => {},
    inputValue: async () =>
      'Who in my family should claim the dependent-parent relief, and how do we coordinate it on the LHDN portal?',
    fill: async () => {}
  }
  const chatDialog = {
    getByPlaceholder: () => chatInput,
    getByRole: () => first,
    getByText: () => ({ waitFor: async () => {} }),
    locator: () => ({
      last: () => ({
        innerText: async () =>
          'For JKM Warga Emas, prepare the application documents listed in the official guidance, including identity and income records.'
      })
    })
  }
  const strategy = {
    getByRole: () => first
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
    getByRole: (role) => (role === 'dialog' ? chatDialog : first),
    waitForResponse: () => resultResponse,
    locator: (selector) => {
      if (selector === '#strategy') return strategy
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
