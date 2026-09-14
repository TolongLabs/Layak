# Layak Product Thesis

## Executive Summary

Layak is an agentic AI concierge for Malaysia's fragmented social-assistance landscape. A citizen uploads three common
documents or enters their details manually; Layak extracts a household profile, evaluates scheme rules, ranks likely
benefits by estimated annual value, explains each result with source-linked evidence, and prepares draft application
packets for manual submission.

The product turns a portal-search problem into one guided decision flow while keeping deterministic eligibility logic,
human review, and source provenance at its core.

## Problem

Malaysia's social-assistance estate spans 167 schemes across 17 ministries and agencies. The resulting fragmentation
creates discovery costs, duplicated submissions, and exclusion risk for people who may already qualify for support.
The
[product research brief](https://github.com/TolongLabs/Layak-Pitch/blob/main/docs/research/market/project-research-brief.md)
documents the policy landscape, source evidence, and corrections that shaped Layak's initial scope.

Citizens face three practical barriers:

- they do not know which schemes apply to their household;
- eligibility rules and required documents are distributed across agency sites and PDFs; and
- comparing benefits, deadlines, and application effort requires domain knowledge and time.

## Primary User

The reference persona is Aisyah, a 34-year-old gig worker in Kuantan supporting two children and an older parent. Her
documents contain enough information to begin an assessment, but household composition and ambiguous income fields
still require explicit confirmation. Layak therefore combines extraction with user review instead of treating OCR as
truth.

Synthetic fixtures for Aisyah and four additional personas are retained in the pitch repository's
[`demo/fixtures/`](https://github.com/TolongLabs/Layak-Pitch/tree/main/docs/demo/fixtures).

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

The hackathon prototype demonstrates a citizen-facing discovery and preparation layer. A production path can serve
financial-wellness platforms, employers, community organizations, and public-sector delivery partners through
consented eligibility screening, maintained policy data, analytics, and workflow integrations.

Near-term diligence should validate:

- willingness to pay and the appropriate buyer among citizens, employers, NGOs, and agencies;
- the operating cost of maintaining current scheme rules and official evidence;
- conversion from discovered eligibility to completed application; and
- governance requirements for handling identity, income, and household data.

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
