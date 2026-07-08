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

## 9. OpenAPI 3.1 Snippet

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

## 10. Breaking vs Non-Breaking Changes

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

## 11. Security Checklist

- [ ] Every endpoint requires authentication (no anonymous endpoints)
- [ ] Authorization checked at service layer, not just routing layer
- [ ] All inputs validated before processing
- [ ] No sensitive data (tokens, secrets, PII) in response bodies beyond what is strictly necessary
- [ ] No sensitive data in URL query parameters (use request body)
- [ ] Rate limiting applied to all write operations
- [ ] `request_id` on every response for traceability
- [ ] No internal error details exposed in 500 responses
