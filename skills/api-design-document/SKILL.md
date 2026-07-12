---
name: api-design-document
argument-hint: "[API or service name]"
description: Design a production-ready API specification aligned with OpenAPI 3.1 standards. Covers resource modeling, endpoint design, request/response contracts, authentication, versioning strategy, error handling, rate limiting, and pagination. Use when designing a new REST, GraphQL, or event-driven API.
intent: >-
  Produce a rigorous API design document that defines the complete contract between an API provider and its consumers before implementation begins. A well-designed API is one of the highest-leverage engineering investments: a poor API design is permanent - every consumer becomes dependent on it the moment it ships. This skill applies Richardson Maturity Model principles (Level 2+), RESTful resource modeling, consistent error semantics (RFC 9110 / RFC 7807 Problem Details), versioning discipline, and security-first design. The output drives the OpenAPI 3.1 spec, the implementation, and the developer documentation simultaneously.
type: workflow
theme: engineering-docs
best_for:
  - "Designing a new REST API or API endpoint set from scratch"
  - "Defining the API contract for a microservice before implementation"
  - "Reviewing and improving an existing API design before it goes public"
  - "Standardizing API conventions across a team or organization"
scenarios:
  - "Design the REST API for our payment links microservice"
  - "Write an API design document for our merchant webhook management endpoints"
  - "Design the API contract for a new B2B partner integration"
estimated_time: "1-3 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce an API design document that defines the complete interface contract for a new or revised API. This document is the authoritative specification that drives implementation, consumer integration, testing, and documentation simultaneously.

**The cost of a bad API design is permanent.** Once consumers depend on it, changes are breaking changes. Getting the design right before the first line of implementation code is written is the highest-ROI investment in an API's lifetime.

## Input

**Works best with:** The name of the API or service being designed.
**Also valuable:** The domain entities and operations, consumer use cases, authentication context, existing API conventions in the codebase, performance requirements.

**Example invocation:** `Design the API for a payment links system. Merchants create payment links with a custom amount, expiry, and description. Customers use the link to pay. Merchants can list, deactivate, and delete their links. Needs HMAC webhook notification on payment. Auth via Bearer token.`

## Key Concepts

### Richardson Maturity Model
Target Level 2 or Level 3 (HATEOAS for discovery-driven APIs):
- **Level 0:** Single endpoint, single verb - not REST
- **Level 1:** Resources with unique URIs
- **Level 2:** HTTP verbs and status codes used correctly - this is the minimum standard
- **Level 3:** Hypermedia controls (HATEOAS) - optional, for discovery-driven APIs

### Resource Modeling
- Resources are nouns, not verbs: `/payments` not `/createPayment`
- Resources map to domain entities: `/merchants/{id}/payment-links`
- Use plural nouns for collections: `/users`, not `/user`
- Nested resources imply ownership: `GET /merchants/{id}/transactions`

### HTTP Semantics
| Method | Idempotent? | Safe? | Use For |
| :--- | :--- | :--- | :--- |
| GET | Yes | Yes | Read resource(s) |
| POST | No | No | Create resource, non-idempotent action |
| PUT | Yes | No | Replace resource entirely |
| PATCH | No | No | Partial update |
| DELETE | Yes | No | Remove resource |

### Error Format (RFC 7807 Problem Details)
```json
{
  "type": "https://errors.example.com/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "The amount field must be greater than 0.",
  "instance": "/v1/payment-links/abc123",
  "errors": [{ "field": "amount", "message": "Must be > 0" }]
}
```

### Versioning Strategy
- URI versioning (`/v1/`, `/v2/`) - simple, explicit, cacheable. Recommended for public APIs.
- Header versioning (`Accept: application/vnd.api+json;version=2`) - cleaner URLs but harder to test.
- Choose one and apply consistently across the entire API.

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any API design document, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Core Resources**: What are the main nouns/resources and their relationships?
2. **Protocol & Encoding**: Is this REST (JSON over HTTP), GraphQL, or an event-driven system?
3. **Authentication & Security**: How are users/clients authenticated (Bearer tokens, API keys, basic auth) and authorized?
4. **Volume & Limits**: Are there expected rate limit parameters, data payload sizing constraints, or pagination needs?
*Wait for the user's response to these questions before drafting the final API design document.*

### Phase 2: Resource Model (20 min)
Identify all resources, their relationships, and the operations each supports.

### Phase 3: Endpoint Design (30-60 min)
Define each endpoint: method, path, request schema, response schema, status codes.

### Phase 4: Cross-Cutting Concerns (20 min)
Authentication, versioning, rate limiting, pagination, error handling.

### Phase 5: OpenAPI 3.1 Snippet (30 min)
Produce an OpenAPI-compatible YAML snippet for the core endpoints.
