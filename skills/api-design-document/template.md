---
title: API Design Document
skill: api-design-document
status: draft
owner_reviewed: false
last_updated: 2026-07-17
depends_on: []
supersedes: ""
---

# API Design Document

**API Name:** [Service / API Name]
**Document ID:** API-[IDENTIFIER]-[VERSION]
**Status:** `Draft` | `In Review` | `Approved` | `Deprecated`
**Version:** v1.0.0
**Base URL:** `https://[domain]/v1`
**Date:** YYYY-MM-DD
**Author(s):** [Name, Role]
**Reviewers:** [Name, Role]

---

## 1. Overview

### 1.1 Purpose

[2-3 sentences: what does this API do, who consumes it, and what problem does it solve for consumers?]

### 1.2 Consumers

| Consumer | Use Case | Auth Method |
| :--- | :--- | :--- |
| [Consumer A - e.g., Merchant Web App] | [Use case] | Bearer token |
| [Consumer B - e.g., Partner Integration] | [Use case] | API Key |

### 1.3 Design Principles

- **REST Level 2**: Standard HTTP methods and status codes. Resources are nouns.
- **Consistent errors**: RFC 7807 Problem Details format for all error responses.
- **Stable contracts**: Once published, breaking changes require a new major version.
- **Security by default**: Every endpoint requires authentication. No exceptions.
- **Pagination mandatory**: Every list endpoint is paginated. No unbounded results.

---

## 2. Resource Model

> Identify all domain entities exposed by the API and their relationships.

```mermaid
erDiagram
  MERCHANT {
    string id PK
    string name
    string status
  }
  PAYMENT_LINK {
    string id PK
    string merchant_id FK
    decimal amount
    string currency
    string status
    datetime expires_at
  }
  PAYMENT {
    string id PK
    string payment_link_id FK
    decimal amount
    string status
    datetime paid_at
  }
  MERCHANT ||--o{ PAYMENT_LINK : "owns"
  PAYMENT_LINK ||--o{ PAYMENT : "receives"
```

### Resource Ownership Map

| Resource | Owner | Parent Resource | Read Access | Write Access |
| :--- | :--- | :--- | :--- | :--- |
| `/merchants` | Platform | - | Admin only | Admin only |
| `/merchants/{id}/payment-links` | Merchant | Merchant | Own only | Own only |
| `/payments` | Platform | Payment Link | Admin + Merchant | System only |

---

## 3. Authentication and Authorization

### 3.1 Authentication Mechanism

**Method:** `Bearer Token (JWT)` | `API Key` | `OAuth 2.0 Client Credentials`

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Validation:**
- Algorithm: `HS256` / `RS256`
- Claims required: `sub` (user/merchant ID), `iss`, `iat`, `exp`
- Expiry: [N minutes]

### 3.2 Authorization Model

| Role | Can Do |
| :--- | :--- |
| `platform_admin` | All operations on all resources |
| `merchant` | CRUD on own resources only; cannot access other merchants |
| `read_only` | GET operations on own resources only |

**Enforcement Rule:** Every endpoint enforces authorization at the service layer, not just the route layer. A merchant cannot access another merchant's resources even with a valid token.

---

## 4. API Versioning

**Strategy:** URI Versioning - `/v1/`, `/v2/`

**Versioning Policy:**
- Additive changes (new fields, new optional params) are backward-compatible. No version bump.
- Breaking changes (removed fields, changed semantics, renamed params) require a new major version.
- A deprecated version is supported for minimum [N months] after the successor is GA.

**Deprecation Header:**
```
Deprecation: Sat, 01 Jan 2027 00:00:00 GMT
Sunset: Sat, 01 Jul 2027 00:00:00 GMT
Link: <https://api.example.com/v2>; rel="successor-version"
```

---

## 5. Endpoint Specifications

> For each endpoint: method + path, description, request schema, response schema, status codes, and security.

---

### 5.1 [Resource Collection - e.g., Payment Links]

#### `GET /v1/merchants/{merchantId}/payment-links`

**Description:** List all payment links for a merchant. Paginated.

**Authorization:** `merchant` (own links only), `platform_admin` (any merchant)

**Path Parameters:**
| Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `merchantId` | string | Yes | Merchant's unique identifier |

**Query Parameters:**
| Param | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `status` | enum | No | `all` | Filter by status: `active`, `expired`, `paid` |
| `page` | integer | No | `1` | Page number (1-indexed) |
| `per_page` | integer | No | `20` | Records per page. Max: `100` |
| `sort` | string | No | `created_at:desc` | Sort field and direction |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "pl_01HXYZ123",
      "merchant_id": "m_01HABC456",
      "amount": "99.99",
      "currency": "USD",
      "description": "Invoice #1234",
      "status": "active",
      "url": "https://pay.example.com/l/01HXYZ123",
      "expires_at": "2026-12-31T23:59:59Z",
      "created_at": "2026-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 142,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

**Error Responses:**
| Status | Problem Type | Condition |
| :--- | :--- | :--- |
| 401 | `unauthorized` | Missing or invalid token |
| 403 | `forbidden` | Token is valid but has no access to this merchant |
| 404 | `not-found` | Merchant ID does not exist |

---

#### `POST /v1/merchants/{merchantId}/payment-links`

**Description:** Create a new payment link.

**Authorization:** `merchant` (own account only), `platform_admin`

**Request Body (`application/json`):**
```json
{
  "amount": "99.99",
  "currency": "USD",
  "description": "Invoice #1234",
  "expires_at": "2026-12-31T23:59:59Z",
  "metadata": {
    "invoice_id": "INV-001"
  }
}
```

**Field Rules:**
| Field | Type | Required | Validation |
| :--- | :--- | :--- | :--- |
| `amount` | string (decimal) | Yes | Must be > 0. Max 2 decimal places. Max 9999999.99. |
| `currency` | string | Yes | ISO 4217 3-letter code. Supported: [list] |
| `description` | string | No | Max 255 characters |
| `expires_at` | ISO 8601 datetime | No | Must be in the future. Max 1 year from now. |
| `metadata` | object | No | Max 10 keys. Keys max 40 chars. Values max 500 chars. |

**Response `201 Created`:**
```json
{
  "id": "pl_01HXYZ123",
  "merchant_id": "m_01HABC456",
  "amount": "99.99",
  "currency": "USD",
  "description": "Invoice #1234",
  "status": "active",
  "url": "https://pay.example.com/l/01HXYZ123",
  "expires_at": "2026-12-31T23:59:59Z",
  "created_at": "2026-01-01T10:00:00Z",
  "metadata": { "invoice_id": "INV-001" }
}
```

**Error Responses:**
| Status | Problem Type | Condition |
| :--- | :--- | :--- |
| 400 | `bad-request` | Malformed JSON body |
| 401 | `unauthorized` | Missing or invalid token |
| 422 | `validation-error` | Field validation failed (details in `errors` array) |

---

#### `GET /v1/merchants/{merchantId}/payment-links/{id}`

**Description:** Retrieve a single payment link by ID.

**Response `200 OK`:** Same shape as a single object from the list response.

**Error Responses:**
| Status | Condition |
| :--- | :--- |
| 404 | Payment link ID does not exist or does not belong to the merchant |

---

#### `DELETE /v1/merchants/{merchantId}/payment-links/{id}`

**Description:** Deactivate a payment link. Links with received payments cannot be deleted; they are archived instead.

**Response `204 No Content`:** Empty body on success.

**Error Responses:**
| Status | Condition |
| :--- | :--- |
| 404 | Payment link not found |
| 409 | Payment link has received payments and cannot be deleted (use deactivate) |

---

### 5.2 [Add next resource group here]

[Follow the same pattern above]

---

## 6. Error Handling

### Standard Error Response (RFC 7807 Problem Details)

All errors follow this schema:

```json
{
  "type": "https://errors.[domain].com/[error-slug]",
  "title": "[Human-readable short description]",
  "status": 422,
  "detail": "[Longer description of what went wrong and how to fix it]",
  "instance": "/v1/merchants/m_123/payment-links",
  "request_id": "req_01HXYZ",
  "errors": [
    {
      "field": "amount",
      "code": "invalid_range",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

### Standard Error Catalog

| HTTP Status | Problem Type | Meaning | Consumer Action |
| :--- | :--- | :--- | :--- |
| 400 | `bad-request` | Malformed request (invalid JSON, wrong content-type) | Fix the request format |
| 401 | `unauthorized` | Token missing, expired, or invalid | Re-authenticate |
| 403 | `forbidden` | Valid token but insufficient permissions | Request elevated access |
| 404 | `not-found` | Resource does not exist or inaccessible | Check the resource ID |
| 409 | `conflict` | State conflict (duplicate, already deleted) | Check current state first |
| 422 | `validation-error` | Valid JSON but fails business rules | Fix field values per `errors` |
| 429 | `rate-limited` | Too many requests | Respect `Retry-After` header |
| 500 | `internal-error` | Server fault | Retry with exponential backoff; report if persists |
| 503 | `service-unavailable` | Temporary outage | Retry after `Retry-After` header |

---

## 7. Rate Limiting

| Consumer Type | Limit | Window | Scope |
| :--- | :--- | :--- | :--- |
| Authenticated merchant | [N] requests | Per minute | Per merchant token |
| Admin | [N] requests | Per minute | Per token |
| Unauthenticated | 0 (blocked) | - | - |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1751234567
Retry-After: 30
```

---

## 8. Pagination

**Method:** Offset pagination (page + per_page). Suitable for admin UIs.
**Alternative for high-volume cursors:** Cursor-based pagination (if needed for event streaming).

**Standard pagination response wrapper:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 142,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 9. Idempotency

> POST operations are not naturally idempotent. For endpoints that create resources or trigger side effects, require an `Idempotency-Key` header.

**Endpoints requiring idempotency keys:**
| Endpoint | Key Storage Duration | Behavior on Duplicate |
| :--- | :--- | :--- |
| `POST /v1/[resource]` | 24 hours | Return cached response (no re-execution) |
| `POST /v1/[resource]/[id]/[action]` | 24 hours | Return cached response |

**Header:** `Idempotency-Key: <client-generated-UUID>`

**Error on mismatch:** HTTP 422 `idempotency-key-mismatch` if same key used with different request body.

---

## 10. Webhook Specification

> Outbound callbacks to consumer-registered endpoints.

### 10.1 Event Catalog

| Event | Trigger | Payload Summary |
| :--- | :--- | :--- |
| `[resource].created` | New resource created | Full resource object |
| `[resource].updated` | Resource modified | Changed fields only |
| `[resource].deleted` | Resource removed | Resource ID + deletion timestamp |

### 10.2 Delivery Configuration

| Aspect | Specification |
| :--- | :--- |
| Signature scheme | HMAC-SHA256 with per-consumer secret |
| Signature header | `X-Webhook-Signature` |
| Timestamp header | `X-Webhook-Timestamp` (unix epoch, reject if > 5 min old) |
| Max retries | [N] attempts |
| Backoff | Exponential with jitter |
| Timeout per attempt | [N] seconds |
| Dead-letter | After max retries, event stored in DLQ for manual inspection |
| Delivery guarantee | At-least-once (consumers must handle duplicates) |

### 10.3 Endpoint Registration

**`POST /v1/webhooks`** — Register a new webhook endpoint.

Request:
```json
{
  "url": "https://consumer.example.com/webhooks",
  "events": ["payment.completed", "payment.failed"],
  "secret": "whsec_auto_generated"
}
```

**Verification:** Consumer must respond to a `POST` with a challenge token within 10 seconds to prove endpoint ownership.

---

## 11. File Upload/Download

### 11.1 File Upload

**Content-Type:** `multipart/form-data`

| Constraint | Value |
| :--- | :--- |
| Max file size | [N MB] |
| Allowed MIME types | [e.g., image/jpeg, image/png, application/pdf] |
| MIME validation | By content inspection (magic bytes), not file extension |
| Storage | [e.g., S3 / local filesystem outside webroot] |

**Endpoint:** `POST /v1/[resource]/[id]/files`

### 11.2 File Download

**Endpoint:** `GET /v1/[resource]/[id]/files/{fileId}`

| Aspect | Specification |
| :--- | :--- |
| Response | Streaming with `Content-Disposition: attachment` |
| Large files | Signed URL redirect (pre-signed S3 URL, valid for N minutes) |
| Range requests | Supported (`Accept-Ranges: bytes`) |

---

## 12. CORS Configuration

| Directive | Value |
| :--- | :--- |
| `Access-Control-Allow-Origin` | [Whitelist: `https://app.example.com`, `https://admin.example.com`] |
| `Access-Control-Allow-Methods` | `GET, POST, PUT, PATCH, DELETE, OPTIONS` |
| `Access-Control-Allow-Headers` | `Authorization, Content-Type, Idempotency-Key, X-Request-ID` |
| `Access-Control-Expose-Headers` | `X-RateLimit-Limit, X-RateLimit-Remaining, X-Request-ID` |
| `Access-Control-Allow-Credentials` | `true` (if cookies/auth required) |
| `Access-Control-Max-Age` | `86400` (24 hours) |

---

## 13. Batch Operations

### 13.1 Batch Create

**Endpoint:** `POST /v1/[resource]/batch`

Request:
```json
{
  "items": [
    { "field_a": "value1", "field_b": 100 },
    { "field_a": "value2", "field_b": 200 }
  ]
}
```

| Constraint | Value |
| :--- | :--- |
| Max items per batch | [N] |
| Behavior | `all-or-nothing` (transactional) / `partial-success` (per-item status) |
| Rate limit impact | Each item counts as 1 request toward rate limits |

### 13.2 Batch Response (Partial Success)

```json
{
  "results": [
    { "index": 0, "status": "created", "id": "res_001" },
    { "index": 1, "status": "error", "error": { "code": "validation_error", "detail": "..." } }
  ],
  "summary": { "total": 2, "succeeded": 1, "failed": 1 }
}
```

---

## 14. Caching Strategy

| Response Type | Cacheable? | Cache-Control Header | Vary |
| :--- | :--- | :--- | :--- |
| `GET /v1/[resource]/{id}` | Yes (public) | `max-age=60` | - |
| `GET /v1/[resource]/{id}` (user-specific) | Yes (private) | `private, max-age=30` | `Authorization` |
| `GET /v1/[resource]` (list) | No | `no-store` | - |
| `POST / PUT / PATCH / DELETE` | No | `no-store` | - |

**ETag support:** Every GET response includes an `ETag` header. Clients may send `If-None-Match` to receive 304 Not Modified.

**CDN caching:** [Applicable? Which responses? Cache key?]

---

## 15. Health Check Endpoints

| Endpoint | Purpose | Success Response | Failure Response |
| :--- | :--- | :--- | :--- |
| `GET /health` | Liveness - is the process running? | `200 OK` | N/A (process is dead if no response) |
| `GET /health/ready` | Readiness - can the service handle requests? | `200 OK` | `503 Service Unavailable` |
| `GET /health/detailed` | Dependency status (internal only) | `200` with per-dependency status | `503` if any critical dependency is down |

**Readiness checks:**
- [ ] Database connection pool has available connections
- [ ] Cache (Redis) is reachable
- [ ] Queue (if applicable) is reachable
- [ ] Critical external dependencies are healthy

---

## 16. Soft-Delete vs Hard-Delete

| Resource | Deletion Strategy | Rationale | Restore Supported? |
| :--- | :--- | :--- | :--- |
| [e.g., Payment Link] | Soft-delete | Audit trail, merchant may need to reference historical links | Yes - `PATCH` to set `status=active` |
| [e.g., File Upload] | Hard-delete | Storage cost, no audit need | No |
| [e.g., User Account] | Soft-delete + GDPR hard-delete | Soft-delete for business logic; hard-delete on GDPR erasure request | Soft: Yes / Hard: No |

**Default behavior:** `GET` endpoints exclude soft-deleted resources. Add `?include_deleted=true` for admin access.

---

## 17. OpenAPI 3.1 Snippet

> Expand this snippet to cover all CRUD operations for the primary resource.

```yaml
openapi: "3.1.0"
info:
  title: "[API Name]"
  version: "1.0.0"
  description: "[API description]"

servers:
  - url: "https://api.[domain].com/v1"
    description: Production
  - url: "https://staging-api.[domain].com/v1"
    description: Staging

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    PaymentLink:
      type: object
      properties:
        id:
          type: string
          example: "pl_01HXYZ123"
        amount:
          type: string
          format: decimal
          example: "99.99"
        currency:
          type: string
          example: "USD"
        status:
          type: string
          enum: [active, expired, paid, cancelled]
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    PaymentLinkCreate:
      type: object
      required: [amount, currency]
      properties:
        amount:
          type: string
          format: decimal
        currency:
          type: string
        description:
          type: string
          maxLength: 255
        expires_at:
          type: string
          format: date-time
        metadata:
          type: object

    ErrorResponse:
      type: object
      required: [type, title, status]
      properties:
        type:
          type: string
          format: uri
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
        instance:
          type: string
        request_id:
          type: string
        errors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              code:
                type: string
              message:
                type: string

    PaginatedResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/PaymentLink"
        pagination:
          type: object
          properties:
            page:
              type: integer
            per_page:
              type: integer
            total:
              type: integer
            total_pages:
              type: integer
            has_next:
              type: boolean
            has_prev:
              type: boolean

  parameters:
    IdempotencyKey:
      name: Idempotency-Key
      in: header
      required: false
      schema:
        type: string
        format: uuid
      description: Client-generated UUID for idempotent POST requests

paths:
  /merchants/{merchantId}/payment-links:
    get:
      summary: List payment links (paginated)
      parameters:
        - name: merchantId
          in: path
          required: true
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [active, expired, paid, all]
            default: all
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: per_page
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        "200":
          description: Success
          headers:
            ETag:
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaginatedResponse"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"

    post:
      summary: Create a payment link
      parameters:
        - name: merchantId
          in: path
          required: true
          schema:
            type: string
        - $ref: "#/components/parameters/IdempotencyKey"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/PaymentLinkCreate"
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentLink"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "422":
          description: Validation error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

  /merchants/{merchantId}/payment-links/{id}:
    get:
      summary: Get a single payment link
      parameters:
        - name: merchantId
          in: path
          required: true
          schema:
            type: string
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Success
          headers:
            ETag:
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaymentLink"
        "404":
          description: Not found

    patch:
      summary: Update a payment link
      parameters:
        - name: merchantId
          in: path
          required: true
          schema:
            type: string
        - name: id
          in: path
          required: true
          schema:
            type: string
        - name: If-Match
          in: header
          required: false
          schema:
            type: string
          description: ETag for conditional update (prevents lost updates)
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                description:
                  type: string
                expires_at:
                  type: string
                  format: date-time
                metadata:
                  type: object
      responses:
        "200":
          description: Updated
        "404":
          description: Not found
        "412":
          description: Precondition failed (ETag mismatch)

    delete:
      summary: Delete a payment link (soft-delete)
      parameters:
        - name: merchantId
          in: path
          required: true
          schema:
            type: string
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "204":
          description: Deleted
        "404":
          description: Not found
        "409":
          description: Conflict (has payments, cannot delete)
```

```yaml
openapi: "3.1.0"
info:
  title: "[API Name]"
  version: "1.0.0"
  description: "[API description]"

servers:
  - url: "https://api.[domain].com/v1"
    description: Production
  - url: "https://staging-api.[domain].com/v1"
    description: Staging

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    PaymentLink:
      type: object
      properties:
        id:
          type: string
          example: "pl_01HXYZ123"
        amount:
          type: string
          format: decimal
          example: "99.99"
        currency:
          type: string
          example: "USD"
        status:
          type: string
          enum: [active, expired, paid, cancelled]

    ErrorResponse:
      type: object
      required: [type, title, status]
      properties:
        type:
          type: string
          format: uri
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
        instance:
          type: string
        request_id:
          type: string
        errors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              code:
                type: string
              message:
                type: string

paths:
  /merchants/{merchantId}/payment-links:
    get:
      summary: List payment links
      parameters:
        - name: merchantId
          in: path
          required: true
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: per_page
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/PaymentLink"
        "401":
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
```

---

## 18. Breaking vs Non-Breaking Changes

### Non-Breaking (Backward-Compatible) - No version bump required
- Adding new optional request fields
- Adding new response fields
- Adding new endpoint
- Adding new enum values to existing fields (if consumer uses unknown-safe parsing)

### Breaking - Requires major version bump
- Removing or renaming any field
- Changing a field's type
- Changing HTTP method of an existing endpoint
- Changing URL path structure
- Changing error format
- Adding required request fields

---

## 19. Security Checklist

- [ ] Every endpoint requires authentication (no anonymous endpoints)
- [ ] Authorization checked at service layer, not just routing layer
- [ ] All inputs validated before processing
- [ ] No sensitive data (tokens, secrets, PII) in response bodies beyond what is strictly necessary
- [ ] No sensitive data in URL query parameters (use request body)
- [ ] Rate limiting applied to all write operations
- [ ] `request_id` on every response for traceability
- [ ] No internal error details exposed in 500 responses

---

## 20. Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
|:---|:---|:---|:---|
| [e.g., GraphQL instead of REST] | [Flexible querying, single endpoint, no over-fetching] | [Harder to cache, more complex auth, steeper learning curve for consumers] | [REST is the team's strength; consumer base expects REST; caching is critical for performance] |
| [e.g., Header-based versioning instead of URI versioning] | [Cleaner URLs, more "pure" REST] | [Harder to test in browser, invisible to casual inspection, breaks simple curl workflows] | [URI versioning is explicit, cacheable, and easier for API consumers to adopt incrementally] |
