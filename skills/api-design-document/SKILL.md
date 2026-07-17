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
estimated_time: "3-6 hrs"
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

### Idempotency Keys

POST operations are not naturally idempotent. For any POST endpoint that creates a resource or triggers a side effect, require an `Idempotency-Key` header:
- Client sends a unique, client-generated UUID in the `Idempotency-Key` header.
- Server stores the key + response for 24 hours (or a configurable window).
- If a duplicate key is received with the same request body, return the cached response without re-executing.
- If a duplicate key is received with a different request body, return HTTP 422 `idempotency-key-mismatch`.
- Document which endpoints require idempotency keys and which are exempt.

### Webhook Specification

When the API sends outbound callbacks (webhooks):
- **Event catalog:** Every event type the system can emit (e.g., `payment.completed`, `payment.failed`, `merchant.suspended`).
- **Payload schema:** The JSON structure of each event type.
- **Signature scheme:** HMAC-SHA256 (recommended) with per-consumer secret. Document the signature header name and verification algorithm.
- **Retry policy:** Retry count, backoff strategy, timeout per attempt, dead-letter behavior after exhaustion.
- **Delivery guarantee:** At-least-once (consumers must handle duplicates) vs exactly-once.
- **Endpoint registration:** How consumers register webhook URLs and verify ownership (e.g., challenge-response).

### File Upload/Download

When the API handles binary data:
- **Upload:** Use `multipart/form-data` for file uploads. Document max file size, allowed MIME types (validated by content, not extension), and storage location.
- **Download:** Use streaming responses for large files. Document the `Content-Disposition` header behavior and whether signed URLs are used.
- **Progress/resume:** For large uploads, document whether chunked upload or resumable upload (tus protocol) is supported.

### CORS Configuration

When the API is consumed by browser-based clients:
- **Allowed origins:** Whitelist specific origins (never use `*` with credentials).
- **Allowed methods:** `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- **Allowed headers:** `Authorization, Content-Type, Idempotency-Key, X-Request-ID`.
- **Exposed headers:** `X-RateLimit-Limit, X-RateLimit-Remaining, X-Request-ID`.
- **Max age:** How long preflight responses are cached (e.g., 86400 seconds).
- **Credentials:** Whether cookies/credentials are included (`Access-Control-Allow-Credentials: true`).

### Batch Operations

When consumers need to operate on multiple resources in a single request:
- **Batch create:** `POST /v1/[resource]/batch` accepting an array of items (max N items per batch).
- **Batch update:** `PATCH /v1/[resource]/batch` with an array of partial updates.
- **Partial failure:** Document whether batch operations are all-or-nothing (transactional) or allow partial success. For partial success, return per-item status in the response.
- **Rate limiting:** Batch operations count as N requests toward rate limits, not 1.

### Conditional Requests

Support conditional requests to reduce bandwidth and prevent lost updates:
- **ETags:** Return an `ETag` header on every GET response (hash of the resource representation).
- **If-None-Match:** On GET, if the client sends `If-None-Match` matching the current ETag, return 304 Not Modified.
- **If-Match:** On PUT/PATCH/DELETE, if the client sends `If-Match` that does not match the current ETag, return 412 Precondition Failed (prevents lost updates from concurrent edits).

### Caching Strategy

Document what is cacheable and how:
- **Cacheable responses:** GET requests for resources that change infrequently. Set `Cache-Control: max-age=N` or `Cache-Control: private, max-age=N` for user-specific data.
- **Non-cacheable responses:** POST, PUT, PATCH, DELETE. Set `Cache-Control: no-store`.
- **CDN caching:** If applicable, document which responses are CDN-cacheable and the cache key.
- **Vary header:** Use `Vary: Authorization` to prevent cross-user cache poisoning.

### Health Check Endpoints

Every API must expose health check endpoints:
- **`GET /health`** — Liveness check. Returns 200 if the process is running. Used by load balancers and orchestrators.
- **`GET /health/ready`** — Readiness check. Returns 200 only if the service can handle requests (database connected, dependencies available). Returns 503 if not ready.
- **`GET /health/detailed`** — (Optional, internal only) Returns status of each dependency (database, cache, queue, external services). Should not be publicly accessible.

### Soft-Delete vs Hard-Delete

Document the deletion strategy for each resource:
- **Soft-delete:** Resource is marked as deleted (`deleted_at` timestamp set) but remains in the database. `GET` endpoints exclude soft-deleted resources by default. Include a `?include_deleted=true` query parameter for admin access. Soft-deleted resources can be restored.
- **Hard-delete:** Resource is permanently removed from the database. Use for GDPR erasure requests, data retention policy enforcement, or ephemeral data (sessions, temp files).
- **Document per resource:** Which resources use soft-delete vs hard-delete, and the rationale.

### Document Length

Target length: **10-15 pages** (excluding appendices).

Shorter is better than longer. If the document exceeds the target, check for:
- Redundant content that can be cut
- Overly verbose explanations
- Content that belongs in a separate reference document
- Material the agent already knows (don't explain what HTTP is)

If the document is significantly shorter than the target, check for:
- Missing sections
- Insufficient detail in critical areas
- Unaddressed edge cases

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

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
1. **Protocol & Encoding**: Is this REST (JSON over HTTP), GraphQL, or an event-driven system?
2. **Volume & Limits**: Are there expected rate limit parameters, data payload sizing constraints, or pagination needs?

*Wait for the user's response to these questions before drafting the final API design document.*

### Phase 2: Resource Model (40-60 min)
Identify all resources, their relationships, and the operations each supports.

### Phase 3: Endpoint Design (1-2 hrs)
Define each endpoint: method, path, request schema, response schema, status codes.

### Phase 4: Cross-Cutting Concerns (40-60 min)
Authentication, versioning, rate limiting, pagination, error handling.

### Phase 5: OpenAPI 3.1 Snippet (60-90 min)
Produce an OpenAPI-compatible YAML snippet for the core endpoints.

### Phase 6: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change affect the resource model, existing endpoint contracts, or the OpenAPI snippet?
3. **Apply changes** — update the document, cascading changes through endpoint definitions, request/response schemas, and the OpenAPI YAML
4. **Re-run consistency check** — verify all endpoints reference valid resources, error formats match RFC 7807, and pagination is defined on every list endpoint
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Using verbs in URL paths instead of nouns.** Paths like `/createPayment` or `/getUser` are RPC-style, not RESTful. Use resource nouns: `POST /payments`, `GET /users/{id}`. HTTP methods are your verbs.
- **Omitting pagination on list endpoints.** An unbounded `GET /payments` will eventually time out or OOM as data grows. Every list endpoint must be paginated with a default page size and a maximum cap.
- **Returning different error formats across endpoints.** If one endpoint returns `{ "error": "msg" }` and another returns RFC 7807 Problem Details, consumers cannot build reliable error handling. Standardize on one format (RFC 7807) and enforce it everywhere.
- **Designing authentication at the route layer only.** A valid token does not mean the user owns the resource. Authorization must be enforced at the service layer so a merchant cannot access another merchant's data even with a valid JWT.
- **Treating additive changes as breaking changes (or vice versa).** Adding an optional response field is backward-compatible; removing or renaming one is not. Document the distinction clearly so version bumping decisions are consistent.

## Handoff

**Reads from:**
- `4-technical-specification.md` — functional requirements, use cases
- `7-system-architecture.md` — technology stack, architectural patterns
- `8-database-design-document.md` — data model, entities, relationships

**Feeds into:**
- `11-admin-access-control-specification.md` — API actions that require permission definitions
- `12-security-threat-model.md` — API surface that must be threat-modeled
- `14-technical-blueprint.md` — API contracts referenced in feature designs
- `15-implementation-plan.md` — API endpoints sequenced in build phases

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every endpoint specifies method, path, request schema, response schema, status codes, and authorization requirements
- [ ] All error responses follow the RFC 7807 Problem Details format consistently
- [ ] Every list endpoint has pagination defined with default and maximum page sizes
- [ ] The security checklist has all items checked or explicitly waived with justification
- [ ] The OpenAPI 3.1 snippet is syntactically valid and covers the core endpoints

## Next Steps

After this document is complete, proceed to:
- **`admin-access-control-specification`** — define who can invoke each API action
- **`security-threat-model`** — threat-model the API surface and trust boundaries
- **`technical-blueprint`** — design specific feature implementations against this API contract
- Or invoke `using-engineering-docs` to continue the pipeline
