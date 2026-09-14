# Layak Product Thesis

## Executive Summary

Layak is an agentic AI concierge for Malaysia's fragmented social-assistance landscape. A citizen uploads three common
documents or enters their details manually; Layak extracts a household profile, evaluates scheme rules, ranks likely
benefits by estimated annual value, explains each result with source-linked evidence, and prepares draft application
packets for manual submission.

The product turns a portal-search problem into one guided decision flow while keeping deterministic eligibility logic,
human review, and source provenance at its core.

## Problem

The historical research brief describes 167 schemes across 17 ministries and agencies. This is landscape context,
not Layak's implemented or independently verified coverage. The resulting fragmentation
creates discovery costs, duplicated submissions, and exclusion risk for people who may already qualify for support.
The [product research brief](research/market/project-research-brief.md) documents the policy landscape, source evidence,
and corrections that shaped Layak's initial scope.

Citizens face three practical barriers:

- they do not know which schemes apply to their household;
- eligibility rules and required documents are distributed across agency sites and PDFs; and
- comparing benefits, deadlines, and application effort requires domain knowledge and time.

## Primary User

The reference persona is Aisyah, a 34-year-old gig worker in Kuantan supporting two children and an older parent. Her
documents contain enough information to begin an assessment, but household composition and ambiguous income fields
still require explicit confirmation. Layak therefore combines extraction with user review instead of treating OCR as
truth.

Synthetic fixtures for Aisyah and four additional personas are retained under [`demo/fixtures/`](demo/fixtures/).

## Product Promise

Layak provides one place to:

1. upload documents or choose a privacy-first manual-entry path;
2. review extracted household facts before evaluation;
3. see a visible, streamed agent workflow;
4. receive ranked scheme matches and plain-language explanations;
5. inspect citations supporting rule-backed claims;
6. compare estimated annual upside without hiding required contributions; and
7. download clearly watermarked draft packets for manual submission.

Layak does not submit applications, guarantee eligibility, replace an agency decision, or conceal uncertainty.

## Differentiation

| Capability                 | Product Value                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Deterministic Rule Modules | Eligibility and amount calculations are testable rather than narrated by a model                               |
| Grounded Evidence          | Rule-backed claims retain links to official source material                                                    |
| Visible Agent Pipeline     | Citizens and reviewers can see extraction, classification, matching, optimization, computation, and generation |
| Dual Intake                | Document upload and manual entry serve different privacy and accessibility needs                               |
| Draft-Only Packets         | Automation reduces preparation effort without impersonating the applicant or agency                            |
| Multilingual Guidance      | English, Bahasa Malaysia, and Mandarin support broaden practical access                                        |
| Synthetic Demo Personas    | Stable fixtures make the product inspectable without exposing real citizen data                                |

## Business Direction

For the 15 September 2026 VC discussion, start with Malaysian assistance discovery for individuals, demonstrate the
working prototype, then introduce the proposed B2B eligibility infrastructure business. Keep end users free where
possible; charge organisations that can demonstrate value from better engagement, lower support effort, or more useful
application handoffs.

The proposed first buyer is a digital-bank or e-wallet product or financial-wellness lead. Touch 'n Go eWallet and
Ryt Bank are introduction targets, not customers or confirmed partners. Government and NGOs remain possible customers
or distribution partners; universities, employers, scholarships, and other markets are later hypotheses.

The commercial hypothesis is a paid scoped pilot followed by an annual platform fee with included assessments and
usage overages. Pricing, cost per completed assessment, willingness to pay, and partner return are unvalidated. The
meeting establishes no measured external user study or paying pilot. The team reports winning MyAIFutureHackathon
Grand Champion; this is evidence of prototype execution, not market adoption.

The immediate ask is two or three relevant introductions and guidance on validating the buyer, pricing, and pilot.
Funding follows a scoped plan and agreed milestones. Illustrative pricing and funding sensitivities in the
[VC rehearsal script](demo/scripts/vc-1337-2026-09-15.md) are discussion aids, not approved budgets or forecasts.

Near-term diligence should validate:

- one partner's priority schemes and measurable workflow problem;
- source freshness, independent rule review, and missing-income or household-data edge cases;
- cost per completed assessment, including failures, retries, and human policy maintenance; and
- discovery, completion, support effort, and official-portal handoffs against a baseline.

The proposed 90-day plan targets ten buyer interviews, one design partner, five to ten reviewed priority schemes,
100 synthetic boundary cases, and 20 consented user sessions before a bounded pilot decision. These are proposed
targets, not achieved results or externally agreed commitments.

## Investment Narrative

Layak addresses a large, recurring coordination failure: support exists, but discovery and application remain costly.
The prototype shows a technically credible wedge—one household profile, deterministic scheme reasoning, auditable
evidence, and a completed draft workflow—while leaving room for a maintained benefits infrastructure layer.

The investor case depends less on adding more agent choreography and more on proving three outcomes: current policy
coverage, citizen trust, and completed applications. The existing [PRD](PRD.md) and [TRD](TRD.md) preserve the detailed
product and technical contracts behind that thesis.

## Scope Boundaries

| In Scope                                   | Out Of Scope                                                       |
| ------------------------------------------ | ------------------------------------------------------------------ |
| Scheme discovery and ranking               | Guaranteed agency approval                                         |
| Household fact extraction and confirmation | Autonomous submission or legal representation                      |
| Source-linked explanations                 | Unsupported policy claims                                          |
| Estimated annual value                     | Financial, tax, or legal advice                                    |
| Draft application packets                  | Production access to real citizen data without governance controls |
| Multilingual assistance                    | Replacing official agency channels                                 |
