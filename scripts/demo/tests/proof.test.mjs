import assert from 'node:assert/strict'
import test from 'node:test'

const proof = await import('../proof.mjs').catch(() => null)

test('saved Aisyah proof verifies identity, pinned claims, and a Malaysian government source', async () => {
  assert.ok(proof, 'proof.mjs must expose persisted-result checks')
  const checked = []
  const waiter = { waitFor: async () => {} }
  const overview = {
    waitFor: async () => checked.push('#overview'),
    getByText: (text, options) => {
      checked.push([text, options])
      return waiter
    }
  }
  let responsePredicate
  let responseOptions
  const response = {
    json: async () => ({ profile: { name: 'AISYAH BINTI AHMAD' } }),
    request: () => ({ method: () => 'GET' }),
    status: () => 200,
    url: () => 'https://api.example/api/evaluations/demo-result'
  }
  const page = {
    locator: (selector) => (selector === '#overview' ? overview : null),
    waitForResponse: (predicate, options) => {
      responsePredicate = predicate
      responseOptions = options
      return response
    }
  }
  const schemes = {
    locator: (selector) => {
      checked.push(selector)
      return { first: () => waiter }
    }
  }

  assert.equal(
    proof.watchAisyahResult(page, 'https://layak.example/dashboard/evaluation/results/demo-result'),
    response
  )
  assert.equal(responsePredicate(response), true)
  assert.deepEqual(responseOptions, { timeout: 90_000 })
  assert.equal(await proof.verifyAisyahResult(page, response), overview)
  await proof.verifyGovernmentSource(schemes)
  assert.deepEqual(checked, [
    '#overview',
    ['13,808', { exact: true }],
    ['Matched across 12 scheme(s).', { exact: true }],
    'a[href^="https://"][href*=".gov.my/"]'
  ])
})

test('saved result proof rejects a different citizen', async () => {
  const page = {
    locator: () => ({
      waitFor: async () => {},
      getByText: () => ({ waitFor: async () => {} })
    })
  }
  const response = { json: async () => ({ profile: { name: 'Farhan bin Ismail' } }) }

  await assert.rejects(() => proof.verifyAisyahResult(page, response), /expected Aisyah binti Ahmad/i)
})
