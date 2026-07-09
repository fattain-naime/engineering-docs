# Test Strategy & QA Plan

**Product Name:** [Product / Service Name]
**Document ID:** TEST-[IDENTIFIER]-[VERSION]
**Status:** `Draft` | `In Review` | `Approved`
**Version:** v1.0.0
**Date:** YYYY-MM-DD
**Author(s):** [Name, QA Engineer / Lead Developer]
**Reviewers:** [Name, Role]

---

## 1. Overview & Quality Objectives

### 1.1 Purpose
[Describe the purpose of this test strategy in 2-3 sentences. What application or component is being tested, and what are the specific stability goals?]

### 1.2 Quality Gates & Target Metrics
Define the quantitative thresholds that must be met before code can be merged to main or deployed:

| Metric | Target | Enforced By |
| :--- | :--- | :--- |
| **Unit Test Coverage** | [e.g., 80% on core logic] | PHPUnit / Jest coverage report gate |
| **Mutation Testing (MSI)** | [e.g., 65% Mutation Score] | Infection PHP / Stryker gate |
| **Static Analysis** | Zero issues at Level [e.g., 9] | PHPStan / ESLint CI check |
| **API Compliance** | 100% endpoint pass | Dredd / Schemathesis contracts check |
| **E2E Success Rate** | 100% critical user paths | Playwright / Cypress execution |

---

## 2. Testing Levels & Toolchain

```mermaid
graph TD
    UI[End-to-End Tests - UI/Playwright] -->|10% UI Flow| INT
    INT[Integration Tests - API/Database/Docker] -->|20% Boundaries| UNIT
    UNIT[Unit Tests - PHPUnit/Jest] -->|70% Pure Logic| CODE[Source Code]
```

### 2.1 Unit Testing Layer
- **Focus**: Pure functions, entity business rules, helper utilities, state machine changes.
- **Execution Speed**: < 10ms per test.
- **Mocking Policy**: 100% isolated. No database connections, no HTTP calls. All external services are mocked using native test double frameworks.
- **Run Trigger**: Local save / pre-commit hook.

### 2.2 Integration Testing Layer
- **Focus**: Database repositories, database migrations, controllers, request middlewares, file storage boundaries.
- **Execution Speed**: < 200ms per test.
- **Data Isolation**: Uses a clean, isolated test database wrapper. Database transactions are started before each test and **rolled back** immediately after execution (no persistent DB contamination).
- **Run Trigger**: Pull request updates / CI build.

### 2.3 End-to-End (E2E) Testing Layer
- **Focus**: Page navigation, javascript states, checkout flows, authentication redirects, cross-browser compatibility.
- **Execution Speed**: 2s to 10s per test run.
- **Environment**: Executed against a dedicated, fresh Staging/Local-Docker environment.
- **Run Trigger**: Nightly cron / Release candidate deploy.

---

## 3. Mocking & Staging Integrations

### 3.1 Mocking Matrix (Internal vs. External)

| Integration / API | Mocking Strategy | Tooling / Sandbox Endpoint |
| :--- | :--- | :--- |
| [e.g. Bank Payment API] | Contract Mocking in local tests; Sandbox API in Staging | [e.g. WireMock / sandbox.bank.com] |
| [e.g. SMS Gateway] | Stub outbound response in unit tests; Fake SMS provider | [e.g. Twilio Mock Interface / Local Log] |
| [e.g. SMTP Server] | Mock Mailer wrapper in unit; Catch-all server in Staging | [e.g. Mailhog / Mailpit container] |

### 3.2 Database Setup & Rollbacks
- **Local Dev Database**: Developers run an isolated database instance.
- **Testing Database**: CI spins up a lightweight MariaDB/PostgreSQL container.
- **Rollback Process**:
```php
// Example database transaction rollback per test
public function setUp(): void {
    parent::setUp();
    $this->db->beginTransaction();
}

public function tearDown(): void {
    $this->db->rollBack();
    parent::tearDown();
}
```

---

## 4. Acceptance Test Scenarios (Gherkin BDD)

> Define the critical user pathways using Given-When-Then criteria. These scenarios guide manual verification and E2E script development.

### 4.1 Scenario 1: [Name of Core Path - e.g. Customer Checkout]
* **Given** [the starting environment state]
* **And** [additional preconditions]
* **When** [the user executes the target action]
* **Then** [the expected UI state occurs]
* **And** [the database ledger entries balance]

### 4.2 Scenario 2: [Name of Edge Case - e.g. Payment Timeout]
* **Given** [state of system]
* **When** [network disconnects or action fails]
* **Then** [system handles error gracefully and prompts retry]

---

## 5. CI/CD Test Runner Runsheet

This runsheet specifies the exact commands run by the CI system on every Pull Request to enforce code quality gates.

```yaml
# GitHub Actions / GitLab CI Job configuration snippet
name: Quality Verification

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v6

      - name: Setup PHP Environment
        uses: actions/setup-node@v6 # Or setup-php / setup-python depending on stack
        with:
          node-version: '24'

      - name: Validate Dependencies
        run: [e.g. npm ci / composer validate]

      - name: Static Analysis
        run: [e.g. npm run lint / phpstan analyse]

      - name: Run Unit Tests
        run: [e.g. npm run test:unit / phpunit --testsuite=Unit]

      - name: Run Integration Tests
        run: [e.g. npm run test:integration / phpunit --testsuite=Integration]
```
