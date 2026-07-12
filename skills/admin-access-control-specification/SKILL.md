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
estimated_time: "1-2 hours"
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

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any access control specification, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Existing or anticipated roles**: What distinct privilege levels exist or are expected, even informally?
2. **Sensitive actions**: What actions, if misused, would cause the most damage (data export, refunds, impersonation, deletion, permission changes themselves)?
3. **Multi-tenancy**: Does this system serve multiple separate organizations/customers who must never see each other's data, even to admins of the underlying platform?
4. **Compliance drivers**: Are there specific standards (SOC 2, PCI-DSS, HIPAA, GDPR) mandating audit logging or access review cadence?
*Wait for the user's response to these questions before drafting the final specification.*

### Phase 2: Role Inventory (20 min)
Enumerate every role, including any implicit ones (system/service accounts, support staff, platform-level super-admins).

### Phase 3: Resource and Action Inventory (30 min)
List every protected resource and action in the system that access control must govern.

### Phase 4: Permission Matrix (45-60 min)
Build the complete role x action matrix. Leave no cell undecided. Apply least privilege - justify any broad grant.

### Phase 5: Separation of Duties and Sensitive Actions (20 min)
Identify actions requiring dual approval or additional verification, and specify the approval flow.

### Phase 6: Audit Logging Specification (20 min)
Define exactly what gets logged for privileged actions, retention period, and who can read the log (and who explicitly cannot, to prevent tampering by the actor themselves).

### Phase 7: Break-Glass Procedure (15-20 min)
Define the emergency access process: who can invoke it, what triggers automatic alerting when it's used, and the mandatory post-use review.
