export const REQUIRED_BEATS = [
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

export function auditCapture(beats, filmed) {
  const observed = beats.map(({ name }) => name)
  const missing = REQUIRED_BEATS.filter((name) => filmed[name] !== 1 || !observed.includes(name))
  const ordered =
    observed.length === REQUIRED_BEATS.length && observed.every((name, index) => name === REQUIRED_BEATS[index])
  return { complete: missing.length === 0 && ordered, missing, observed, ordered }
}
