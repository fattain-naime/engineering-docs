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
estimated_time: "1-2 hours"
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

---

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any strategy, you MUST interrogate the user's initial input and ask **3-5 clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Testing Infrastructure**: What test runner frameworks (e.g., PHPUnit, Jest, Cypress, Playwright) are currently installed or preferred?
2. **Integration Boundaries**: Which external APIs or systems (e.g., Stripe, Twilio SMS, external ledgers) must be mocked vs. run against sandboxes?
3. **Database Setup**: How are database states managed during testing (e.g. transactional rollbacks, clean SQLite in-memory seeds, or spin-up Docker DB instances)?
4. **CI/CD Integration**: What platform runs the automated tests (e.g. GitHub Actions, GitLab CI), and does the strategy need to define step-by-step pipeline runsheets?
*Wait for the user's response to these questions before drafting the final strategy.*

### Phase 2: Testing Pyramid Architecture
Outline the testing levels, count ratio distribution, toolchains, execution speeds, and target coverage percentages.

### Phase 3: Mocking & Environment Strategy
Detail mock contracts, sandbox integrations, database rollback rules, and environment variables.

### Phase 4: Test Case Specifications & CI Runsheet
Provide specific Gherkin test scenarios for core paths, along with a YAML/Shell scripts pipeline runsheet.
