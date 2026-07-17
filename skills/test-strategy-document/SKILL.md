---
name: test-strategy-document
argument-hint: "[Product or service name]"
description: Create a production-ready Testing Strategy and QA Execution Plan. Covers testing levels (unit, integration, E2E, performance), mocking boundaries, test environment matrix, code coverage thresholds, and automated CI pipeline runsheets. Use when establishing a QA framework for a new system or feature set.
intent: >-
  Produce a rigorous testing strategy specification that defines the testing architecture and QA gates of a project before development or refactoring begins. A well-designed test strategy prevents integration regressions, establishes clean mocking contracts, and ensures high test coverage in CI/CD build environments. This skill applies Mike Cohn's Testing Pyramid, Gherkin BDD testing conventions, and industry-standard mocking patterns to make sure code is stable and deployable.
type: workflow
theme: engineering-docs
best_for:
  - "Establishing a comprehensive testing framework for a new codebase or service"
  - "Writing a QA plan for a critical feature release"
  - "Defining mocking scopes and test double rules for third-party APIs"
  - "Configuring test run steps and gates in a CI/CD build pipeline"
scenarios:
  - "Create a testing strategy for our new subscription billing module"
  - "Write a QA execution plan for the merchant API gateway integration"
  - "Define the E2E and integration test specifications for our checkout process"
estimated_time: "2-4 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a testing strategy document (`test-strategy.md`) that details the quality assurance processes, testing layers, test environments, and automated pipeline rules of a software project. This ensures development and QA teams test systematically and maintain high software reliability.

## Input

**Works best with:** The name or description of the product/service, along with target quality goals.
**Also valuable:** Codebase tech stack, critical integrations (e.g. payment processors, external APIs), test runners in use (e.g. PHPUnit, Vitest, Playwright), CI/CD runner environments.

**Example invocation:** `Create a testing strategy for our ledger-based payment processing module. It is built in PHP 8.3 with PHPUnit. It connects to the bank gateway via API and updates database tables. Needs unit tests with database mocks, integration tests with Docker DB fixtures, and E2E checkout runs using Playwright. Target coverage is 80% on the core domain.`

## Key Concepts

### 1. The Agile Testing Pyramid
Distribute tests to optimize run speed and coverage:
- **Unit Tests (Base, ~70%)**: Test isolated components, helper classes, and domain logic. Run in milliseconds. External calls are mocked out.
- **Integration Tests (Middle, ~20%)**: Test the interaction between components, repositories, and database schemas. Connect to a local test database or simulated service.
- **End-to-End (E2E) Tests (Top, ~10%)**: Test the entire application flow through the user interface (e.g. browser automation) from start to finish. Connect to a staging environment.

### 2. Mocking Boundaries (Test Doubles)
- **Mocks**: Verify behavior by asserting specific calls are made to external interfaces.
- **Stubs**: Provide hardcoded values for queries to isolate components.
- **Fakes**: Simplified working implementations (e.g. SQLite in-memory database for testing repository interfaces).
- **Never mock what you do not own**: Only mock interfaces within your boundary; use mock servers (e.g. WireMock) or official sandbox endpoints for third-party vendor APIs.

### 3. Behavior-Driven Development (BDD / Gherkin)
Write user acceptance criteria in a structured, human-readable format that maps directly to automation scripts:
```gherkin
Scenario: Successful manual payment verification
  Given a merchant is logged into the admin dashboard
  And has a pending manual transaction "TXN_772"
  When they click the "Approve" button
  Then the transaction status changes to "Completed"
  And the ledger receives matching debit/credit posts
```

### 4. Performance and Load Testing
Performance testing is a distinct layer, not an afterthought. Define:
- **Tool selection:** Choose based on protocol support and team familiarity:
  - **k6:** JavaScript-based, excellent for HTTP/gRPC, developer-friendly, CI-integrated
  - **Locust:** Python-based, good for complex user behavior scripting
  - **JMeter:** Java-based, GUI + CLI, broadest protocol support, heavier resource usage
- **Test types:**
  - **Load test:** Expected concurrent users and requests — does the system handle normal load?
  - **Stress test:** Beyond expected load — where does the system break?
  - **Soak test:** Sustained load over hours — are there memory leaks or connection pool exhaustion?
  - **Spike test:** Sudden burst — how does the system handle traffic surges?
- **Thresholds:** Define pass/fail criteria: p95 latency < 200ms, error rate < 0.1%, throughput >= 1000 req/s
- **Frequency:** Load tests run nightly or on release candidates, not on every PR

### 5. Contract Testing
When services communicate via APIs, contract testing ensures both sides honor the agreement:
- **Consumer-driven contracts (Pact):** The consumer defines what it expects from the provider. The contract is verified against the provider in CI.
- **API specification testing (Dredd, Schemathesis):** Validates that the actual API behavior matches the OpenAPI/Swagger specification.
- **When to use:** Any system with internal or external API boundaries. Especially critical for microservices and third-party integrations.
- **Breaking change detection:** Contract tests catch breaking changes before they reach production — if the provider changes a response shape, the consumer's contract test fails.

### 6. Test Data Management
Tests are only as good as their data. Define how test data is created, managed, and isolated:
- **Fixtures:** Static, pre-defined data sets loaded before tests. Good for deterministic unit tests.
- **Factories:** Programmatic data generators (e.g., factory_boy, Faker). Create fresh, randomized data per test. Good for integration tests.
- **Seeding:** Scripts that populate the database with realistic data for manual testing and demos.
- **Isolation:** Each test must start with a known state. Use transactional rollbacks, fresh containers, or truncated tables.
- **Sensitive data:** Never use real PII, credentials, or payment data in tests. Use synthetic data generators or anonymized production snapshots.

### 7. Accessibility Testing
Accessibility is a quality gate, not a nice-to-have:
- **Automated tools:**
  - **axe-core:** Integrates with Playwright, Cypress, Jest. Catches ~30-40% of accessibility issues (missing alt text, color contrast, ARIA errors).
  - **Lighthouse:** Performance and accessibility scoring. Good for CI gates.
  - **pa11y:** CLI-based, good for batch testing multiple pages.
- **Manual testing:** Automated tools catch structural issues but not usability ones. Include keyboard navigation testing, screen reader testing (VoiceOver, NVDA), and cognitive flow review.
- **CI integration:** Run axe or Lighthouse in CI with a minimum score threshold (e.g., Lighthouse accessibility score >= 90).

### 8. Security Testing in CI
Shift security left by integrating automated security scanning into the CI pipeline:
- **SAST (Static Application Security Testing):** Analyzes source code for vulnerabilities without running it. Tools: Semgrep, SonarQube, Bandit (Python), ESLint security plugins.
- **DAST (Dynamic Application Security Testing):** Tests the running application for vulnerabilities. Tools: OWASP ZAP, Burp Suite (automated scan).
- **Dependency scanning:** Checks for known vulnerabilities in third-party dependencies. Tools: Snyk, Dependabot, npm audit, composer audit.
- **Secrets detection:** Prevents credentials from being committed. Tools: TruffleHog, git-secrets, GitHub secret scanning.
- **CI gate policy:** Define which findings block the build (critical/high severity) and which are warnings (medium/low).

### 9. Flaky Test Policy
Flaky tests erode trust in the test suite. Define a policy for handling them:
- **Definition:** A test is flaky if it passes and fails on the same code without any changes.
- **Quarantine:** After 3 consecutive flaky failures, move the test to a quarantine suite. It no longer blocks the main pipeline.
- **Retry limits:** Allow up to 2 retries per test in CI. If it passes on retry, flag it for investigation but do not block.
- **Resolution SLA:** Quarantined tests must be fixed within 2 weeks or deleted. A test that cannot be made reliable is worse than no test.
- **Reporting:** Track flaky test count as a quality metric. An increasing trend signals infrastructure or test design problems.

### 10. Test Environment Provisioning
Define how test environments are created and managed:
- **Docker-based:** Every integration test environment runs in Docker containers. Reproducible, disposable, consistent across local and CI.
- **Ephemeral environments:** For E2E tests, spin up a complete environment per test run (or per PR). Destroy after tests complete.
- **Shared staging:** A persistent staging environment for manual QA and demos. Updated on merge to main.
- **Infrastructure as Code:** Test environments are defined in code (Docker Compose, Terraform, Helm charts). No manual setup.
- **Data seeding:** Each environment is seeded with the same test data set. State is predictable.

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

### Document Length

Target length: **5-10 pages** (excluding appendices).

Shorter is better than longer. If the document exceeds the target, check for:
- Redundant content that can be cut
- Overly verbose explanations
- Content that belongs in a separate reference document
- Material the agent already knows (don't explain what HTTP is)

If the document is significantly shorter than the target, check for:
- Missing sections
- Insufficient detail in critical areas
- Unaddressed edge cases

---

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)

**Interview Mechanism:** Use tool calls (e.g., `AskUserQuestion`) to present questions — do NOT ask inline in the conversation. The user selects from options rather than typing responses. One question per tool call, multiple-choice options preferred, with "I don't know, you decide" as an escape hatch.

**Context Loading:** Before asking ANY questions, read ALL prior documents in `.engineering-docs/` to extract already-known information. Look for:
- Team size, budget, timeline (from business-plan)
- Tech stack, hosting (from system-architecture)
- Target users, JTBD (from user-personas)
- Constraints, regulatory requirements (from business-plan)
- Scope, features (from technical-specification)

**If information exists in a prior document, USE IT — do not re-ask.**

**Maximum 2-3 questions per skill.** Only ask about:
- Skill-specific details not covered in prior documents
- Technical decisions that affect this specific document
- Clarifications on ambiguous requirements

Ask questions to resolve:
1. **Testing Infrastructure**: What test runner frameworks (e.g., PHPUnit, Jest, Cypress, Playwright) are currently installed or preferred?
2. **Integration Boundaries**: Which external APIs or systems (e.g., Stripe, Twilio SMS, external ledgers) must be mocked vs. run against sandboxes?

*Wait for the user's response to these questions before drafting the final strategy.*

### Phase 2: Testing Pyramid Architecture
Outline the testing levels, count ratio distribution, toolchains, execution speeds, and target coverage percentages.

### Phase 3: Mocking & Environment Strategy
Detail mock contracts, sandbox integrations, database rollback rules, and environment variables.

### Phase 4: Test Case Specifications & CI Runsheet
Provide specific Gherkin test scenarios for core paths, along with a YAML/Shell scripts pipeline runsheet.

### Phase 5: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents (e.g., technical specification, system architecture)?
3. **Apply changes** — update the test strategy document
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency (e.g., coverage targets still align with quality goals in the technical spec)
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Ignoring the testing pyramid distribution.** Writing 80% E2E tests and almost no unit tests produces a slow, brittle test suite that developers stop running. Follow the ~70/20/10 pyramid: most tests should be fast unit tests at the base, with integration and E2E layers progressively smaller.
- **Mocking things you do not own without a contract.** Mocking a third-party API's internal implementation details creates false confidence - the mock passes but the real API changed. Use official sandboxes, contract-testing tools like WireMock, or stub at the HTTP boundary with recorded responses.
- **Not defining database isolation strategy.** Tests that share a database and do not clean up after themselves create order-dependent, flaky test runs. Every integration test must specify whether it uses transactional rollbacks, fresh containers, or seeded snapshots - and this must be consistent across local and CI environments.
- **Writing Gherkin scenarios that test implementation, not behavior.** "Given I call the POST /api/endpoint with body {x:1}" is an implementation test, not a behavior test. Gherkin should describe user-visible behavior ("Given a merchant has a pending transaction"), not API mechanics.
- **Missing mutation testing or static analysis gates.** Code coverage alone measures which lines ran, not whether the tests actually assert correctly. Include mutation testing (e.g., Infection, Stryker) and static analysis (e.g., PHPStan, ESLint) as separate quality gates in the CI runsheet.

## Handoff

**Reads from:**
- `1-business-plan.md` — problem, users, constraints
- `5-technical-specification.md` — functional and non-functional requirements
- `7-system-architecture.md` — tech stack, integration points, infrastructure
- `14-implementation-plan.md` — build sequence, feature scope

**Feeds into:**
- `16-deployment-plan.md` — test gates that must pass before deployment
- `17-technical-runbook.md` — test procedures and diagnostic commands
- `adr/` — testing architecture decisions

---

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Testing pyramid distribution is defined with specific percentage targets for unit, integration, and E2E layers
- [ ] Every external integration has a documented mocking strategy with the specific tool or sandbox endpoint named
- [ ] Database isolation strategy is explicitly stated and consistent for both local development and CI environments
- [ ] The CI/CD runsheet includes static analysis, unit tests, integration tests, and at least one higher-level gate (mutation testing or E2E)
- [ ] Code coverage thresholds and other quality metrics have specific numeric targets and are enforced by CI checks, not just documented as goals

## Next Steps

After this document is complete, proceed to:
- **`deployment-plan`** — define how the tested code gets deployed to production with rollback procedures
- **`technical-runbook`** — document operational procedures for monitoring and responding to alerts
- Or invoke `using-engineering-docs` to continue the pipeline
