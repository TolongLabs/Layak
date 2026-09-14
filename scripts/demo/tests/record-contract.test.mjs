import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../record.mjs', import.meta.url), 'utf8')
const contract = await import('../contract.mjs').catch(() => null)

test('a failed or incomplete walk exits non-zero after preserving diagnostics', () => {
  assert.match(source, /walkError/)
  assert.match(source, /process\.exitCode = 1/)
  assert.match(source, /if \(!warmed\).*throw/s)
})

test('capture contract requires every narrated beat exactly once and in order', () => {
  assert.ok(contract, 'contract.mjs must expose the required capture sequence')
  const expected = [
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
  assert.deepEqual(contract.REQUIRED_BEATS, expected)
  const filmed = Object.fromEntries(expected.map((name) => [name, 1]))
  assert.equal(
    contract.auditCapture(
      expected.map((name, index) => ({ name, ms: index * 1000 })),
      filmed
    ).complete,
    true
  )
  assert.equal(contract.auditCapture([{ name: 'landing', ms: 0 }], { landing: 1 }).complete, false)
  assert.equal(
    contract.auditCapture(expected.map((name, index) => ({ name, ms: index * 1000 })).reverse(), filmed).complete,
    false
  )
})
