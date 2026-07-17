---
name: admin-access-control-specification
argument-hint: "[system name]"
description: Specify admin roles, permissions, and every admin-facing control in a system - a full role-permission matrix (RBAC), the principle of least privilege applied concretely, admin action audit logging, and emergency/break-glass access procedures. Use whenever a system has more than one privilege level, before building the admin panel or access-control logic.
intent: >-
  Produce the specification that defines who inside an organization can do what, and how that is enforced, logged, and recoverable if abused or mistaken. Nearly every real system ends up with more than one privilege level - a regular user and at least one kind of admin - and nearly every serious security incident involving insiders traces back to a permission that was never explicitly decided, just implemented ad hoc as "if user.is_admin". This skill applies role-based access control (RBAC) design, the principle of least privilege, and separation-of-duties thinking to define the complete admin surface of a system before it's built, including what happens when admin access itself needs emergency override.
type: workflow
theme: engineering-docs
best_for:
  - "Designing the admin panel and permission system for any multi-role application"
  - "Formalizing who can do what before building authorization logic, rather than deciding it ad hoc in code"
  - "Satisfying compliance requirements for access control and audit logging (SOC 2, PCI-DSS, ISO 27001)"
  - "Defining emergency access procedures for when normal access is unavailable or compromised"
scenarios:
  - "Define the admin roles and permission matrix for our multi-tenant SaaS product - owner, admin, member, and support staff"
  - "Design the access control specification for our internal tool, including a super-admin break-glass procedure"
  - "What should be logged every time an admin acts on a user's behalf, and what should require a second approver?"
estimated_time: "2-4 hrs"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce an access control specification that defines every privilege level in a system, exactly what each one can and cannot do, how admin actions are logged, and what happens when access is needed outside the normal process.

**"If user.is_admin" is not an access control design - it's the absence of one.** This document forces every permission to be a deliberate decision, written down once, instead of discovered by testing what an admin account happens to be able to click.

## Input

**Works best with:** The name of the system and the roles that already exist or are anticipated (even informally - "there's regular users and then there's us").
**Also valuable:** Any compliance requirements (SOC 2, PCI-DSS, GDPR), known sensitive actions (refunds, data export, user impersonation), and whether multiple organizations/tenants share the system.

**Example invocation:** `Define the access control specification for our project-management SaaS. Roles so far: workspace owner, admin, regular member, and a guest role with view-only access. We also have an internal support team that needs to see customer data to help with tickets.`

## Key Concepts

### Role-Based Access Control (RBAC)
Define roles as named bundles of permissions, and assign roles to users - never assign individual permissions directly to a user. This keeps the system auditable: "what can an Admin do" has one answer, not one answer per admin.

### Principle of Least Privilege
Every role gets the minimum permissions required for its purpose, not the maximum that seems convenient. A support role that needs to view account data to help with tickets does not also need permission to change billing - even if the same person happens to also hold a role that can.

### Permission Matrix
The core artifact: a table of every role against every protected action/resource, with an explicit `Allow`/`Deny` for each cell. No cell should be left undecided - an undecided permission becomes a bug (either a silent block or a silent hole) the first time someone hits it.

### Separation of Duties
For sufficiently sensitive actions (e.g., approving a large refund, deleting an organization), require two different people - one to propose, one to approve - so a single compromised or malicious account cannot act alone.

### Admin Action Audit Logging
Every privileged action must be logged with: who performed it, what it was, what/who it affected, and when - immutable and readable by someone other than the actor. This is what turns "we think an admin did X" into "we can prove admin Y did X at this timestamp."

### Break-Glass / Emergency Access
Define a documented, logged, alerting procedure for emergency access outside the normal flow (e.g., the on-call engineer needs temporary elevated access at 3 AM to fix a production issue). Undocumented emergency access is indistinguishable from a compromise after the fact.

### Attribute-Based Access Control (ABAC)
RBAC covers most cases, but some permissions depend on context, not just role. ABAC evaluates attributes such as:
- **Resource attributes:** "Users can edit only their own posts" (ownership)
- **Environmental attributes:** "Admin panel access is restricted to office IP ranges" (context)
- **Temporal attributes:** "Finance team can approve invoices only during business hours" (time)
- **User attributes:** "Users with verified email can access premium features" (user state)

When specifying ABAC rules, define: the attribute, the condition, and the resource/action it gates. ABAC complements RBAC — use RBAC for coarse-grained role assignments and ABAC for fine-grained, context-dependent rules.

### API vs UI Enforcement
Access control must be enforced at BOTH the API layer and the UI layer — never assume that hiding a button means the action is protected:
- **API enforcement (mandatory):** Every API endpoint must validate the caller's permissions before executing. This is the true security boundary.
- **UI enforcement (usability):** Hide or disable UI elements the user cannot access. This prevents confusion and accidental permission-denied errors, but is NOT a security measure.
- **Consistency rule:** If the API allows an action, the UI must present it. If the API denies an action, the UI must not offer it. Mismatches create either security holes or user frustration.

### Role Inheritance
When roles form a hierarchy, define inheritance explicitly:
- **Inheritance model:** Does a higher role inherit all permissions of lower roles? (e.g., Admin inherits all Member permissions, plus additional admin-only permissions)
- **Override rules:** Can a higher role's inherited permission be restricted? (e.g., an Admin cannot do something a Member can, in rare cases)
- **Depth limit:** How deep can inheritance go? Deep hierarchies (5+ levels) become unmanageable — recommend flattening to 2-3 levels maximum.
- **Conflict resolution:** When inherited permissions conflict with explicit deny, explicit deny wins (deny-overrides).

### Permission Caching and Invalidation
Caching permissions improves performance but creates staleness risk:
- **Cache strategy:** Where are permissions cached? (in-memory per request, Redis, JWT claims)
- **TTL:** How long is a cached permission valid? (e.g., 5 minutes, until next request, until session end)
- **Invalidation triggers:** What events force cache refresh? (role change, permission update, organization membership change)
- **Propagation delay:** What is the maximum time a permission change takes to take effect? Document this — it is a known security window.
- **Revocation urgency:** For high-security actions (e.g., revoking a compromised admin), define an emergency cache-bypass mechanism.

### Multi-Tenant Isolation
When multiple organizations share a system, enforce strict data isolation:
- **Tenant boundary:** Every data query must be scoped to the tenant. No query should return data across tenant boundaries.
- **Admin isolation:** A tenant admin can only see and manage their own tenant's users and data — never another tenant's.
- **Platform admin:** The platform-level super-admin can see across tenants but every cross-tenant action is logged and requires justification.
- **Shared resources:** If any resource is shared across tenants (e.g., a template library), explicitly define what is shared and what is isolated.
- **Testing requirement:** Include a test case that attempts cross-tenant data access and verifies it is blocked.

### Service-to-Service Auth (Machine Identities)
Not all access is by humans. Define how services authenticate to each other:
- **Machine identity model:** How are services identified? (mTLS certificates, API keys, OAuth2 client credentials, service mesh identity)
- **Permission scope:** What can each service do? Define a permission matrix for services, same as for human roles.
- **Rotation policy:** How often are service credentials rotated? What is the process?
- **Audit logging:** Service-to-service calls must be logged with the same rigor as human actions — who (service ID), what (action), when, and what it affected.

### Permission Testing Strategy
Access control is only as good as its verification:
- **Positive tests:** For each role, verify every allowed action succeeds.
- **Negative tests:** For each role, verify every denied action returns the correct error (403 Forbidden, not 404 or 500).
- **Privilege escalation tests:** Attempt to perform actions above the current role. Verify denial.
- **Boundary tests:** Test at the edges — what happens when a role is changed while a user is mid-action? What happens when a permission is revoked during an active session?
- **Matrix completeness test:** Automatically verify that every cell in the permission matrix has a corresponding test case.

### Document Length

Target length: **5-8 pages** (excluding appendices).

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
1. **Sensitive actions**: What actions, if misused, would cause the most damage (data export, refunds, impersonation, deletion, permission changes themselves)?
2. **Multi-tenancy**: Does this system serve multiple separate organizations/customers who must never see each other's data, even to admins of the underlying platform?

*Wait for the user's response to these questions before drafting the final specification.*

### Phase 2: Role Inventory (40-60 min)
Enumerate every role, including any implicit ones (system/service accounts, support staff, platform-level super-admins).

### Phase 3: Resource and Action Inventory (60-90 min)
List every protected resource and action in the system that access control must govern.

### Phase 4: Permission Matrix (1.5-2 hrs)
Build the complete role x action matrix. Leave no cell undecided. Apply least privilege - justify any broad grant.

### Phase 5: Separation of Duties and Sensitive Actions (40-60 min)
Identify actions requiring dual approval or additional verification, and specify the approval flow.

### Phase 6: Audit Logging Specification (40-60 min)
Define exactly what gets logged for privileged actions, retention period, and who can read the log (and who explicitly cannot, to prevent tampering by the actor themselves).

### Phase 7: Break-Glass Procedure (30-45 min)
Define the emergency access process: who can invoke it, what triggers automatic alerting when it's used, and the mandatory post-use review.

### Phase 8: Revision (After User Review)

If the user requests changes after reviewing the specification:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change violate least privilege, create permission gaps, or break separation of duties?
3. **Apply changes** — update the document, cascading changes through the permission matrix, audit logging, and break-glass procedure
4. **Re-run consistency check** — verify zero blank cells in the permission matrix and all sensitive actions still have dual-approval requirements
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Leaving permission matrix cells blank or implicit.** An undecided permission is not "deny by default" - it is a bug that will surface as either a silent block or a silent security hole. Every cell must be explicitly `Allow` or `Deny`.
- **Granting permissions directly to users instead of roles.** This defeats the purpose of RBAC and makes the system unauditable. Always assign permissions to roles, then assign roles to users.
- **Skipping audit logging for "read-only" actions.** Accessing sensitive data (viewing PII, exporting records, impersonating users) is a privileged action even if it does not mutate data. Log it.
- **Defining break-glass access without automatic alerting or expiry.** Emergency access that does not auto-revoke and does not alert is just a backdoor. Every break-glass grant must have a time limit and a notification.
- **Ignoring separation of duties for destructive actions.** Letting a single admin delete an organization or issue large refunds without a second approver creates a single point of compromise. Require dual approval for irreversible, high-impact actions.

## Handoff

**Reads from:**
- `4-technical-specification.md` — functional requirements, user roles
- `7-system-architecture.md` — system components, services, trust zones
- `8-database-design-document.md` — data entities that permissions govern
- `9-api-design-document.md` — API actions that require access control

**Feeds into:**
- `12-security-threat-model.md` — privilege model and trust boundaries for threat analysis
- `14-technical-blueprint.md` — access control requirements for feature designs
- `15-implementation-plan.md` — auth/permissions as foundation phase

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every role in the inventory has a clear description and defined assignment criteria
- [ ] The permission matrix has zero blank cells - every role/action intersection is explicitly `Allow` or `Deny`
- [ ] Every sensitive action (data export, impersonation, deletion, financial operations) is listed in the Separation of Duties table
- [ ] Audit logging specification covers who, what, when, and target for every privileged action, and specifies who cannot alter logs
- [ ] Break-glass procedure includes trigger conditions, invocation authority, auto-expiry, alerting, and mandatory post-use review

## Next Steps

After this document is complete, proceed to:
- **`security-threat-model`** — threat-model the access control surface and privilege escalation paths
- **`technical-blueprint`** — design the implementation of the permission system
- Or invoke `using-engineering-docs` to continue the pipeline
