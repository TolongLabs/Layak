# Coding Guidelines (Andrej Karpathy)

Standing reference, moved out of `AGENTS.md` so it is not reloaded into every session. **`AGENTS.md` outranks this file
wherever they disagree**, and the callout below is where they actually do.

Behavioural guidelines that reduce common LLM coding mistakes, from
[Karpathy's observations](https://x.com/karpathy/status/2015883857489522876).

> **Where this conflicts with [How To Work](working-agreement.md#how-to-work), that section wins.** Guideline 1 says to
> stop when something is unclear. In this repository, make a reversible, in-scope assumption and continue unless one of
> the six explicit stop conditions applies. Surface the assumption and relevant tradeoff without creating an avoidable
> wait.

## 1. Think Before Coding

- State assumptions explicitly.
- If multiple interpretations exist, say so, then pick one and proceed.
- If a simpler approach exists, say so. Push back when warranted.

## 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: would a senior engineer call this overcomplicated? If yes, simplify.

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

- Do not improve adjacent code, comments, or formatting.
- Do not refactor what is not broken.
- Match existing style even if you would do it differently.
- Notice unrelated dead code? Mention it, do not delete it.
- Remove imports and variables that **your** change orphaned. Leave pre-existing dead code alone unless asked.

The test: every changed line traces directly to what was asked.

## 4. Goal-Driven Execution

Turn tasks into verifiable goals, then loop until verified.

- "Add validation" becomes "write tests for invalid inputs, then make them pass"
- "Fix the bug" becomes "write a test that reproduces it, then make it pass"
- "Refactor X" becomes "ensure tests pass before and after"

Strong success criteria let you loop on your own. Weak criteria force check-ins, which is exactly the cost the
project's proceed-with-sensible-defaults rule exists to avoid.
