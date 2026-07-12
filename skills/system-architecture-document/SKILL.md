---
name: system-architecture-document
argument-hint: "[system name]"
description: Create a System Architecture Document (SAD) with C4 model diagrams, 4+1 view decomposition, integration maps, NFR constraints, and an Architecture Decision Record log. Use when documenting how an entire system or major subsystem is structured.
intent: >-
  Produce a comprehensive, stakeholder-appropriate System Architecture Document that maps the full structural picture of a software system across four levels of abstraction (C4 Model), five architectural views (4+1 View Model), and captures the architectural decisions that shaped it (ADR log). The SAD is the definitive reference for understanding how the system is organized, why key architectural choices were made, and how the system connects to the world around it. It serves onboarding engineers, architects reviewing change impact, security auditors, and operators planning infrastructure changes.
type: workflow
theme: engineering-docs
best_for:
  - "Documenting the architecture of a new system before implementation begins"
  - "Producing architectural documentation for an existing system that lacks it"
  - "Preparing architecture documentation for a security or compliance review"
  - "Onboarding senior engineers or architects to an unfamiliar system"
scenarios:
  - "Document the system architecture for our payment gateway platform"
  - "Create a SAD for our new microservices-based notification system"
  - "I need a C4 diagram and architecture overview for our SaaS billing platform"
estimated_time: "4-8 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a System Architecture Document (SAD) that gives every stakeholder - from non-technical product leadership to infrastructure engineers - the right level of detail about the system's structure. This document answers:

- **What** components make up the system?
- **How** do they communicate?
- **Why** was the architecture designed this way?
- **Where** does data flow and where are the trust boundaries?
- **What** are the non-functional constraints the architecture must satisfy?

## Input

**Works best with:** The name of the system or subsystem being documented.
**Also valuable:** Existing diagrams, technology stack decisions, known integration points, existing ADRs, NFR targets.

**Example invocation:** `Create a system architecture document for OwnPay, a multi-brand payment gateway with a PHP 8.3 backend, MySQL database, custom plugin system, and white-label domain routing.`

## Key Concepts

### C4 Model (Simon Brown)
The C4 Model provides a hierarchical, developer-friendly approach to architecture documentation - like a "Google Maps" with multiple zoom levels:

- **Level 1: System Context** - The system's place in the world. Users and external systems. Intended for all stakeholders.
- **Level 2: Container** - The major deployable units (web apps, APIs, databases, queues). Intended for technical leads and architects.
- **Level 3: Component** - The internal structure of a container (controllers, services, repositories). Intended for developers.
- **Level 4: Code** - Class/function level. Usually omitted as IDEs serve this better.

Always use Mermaid for diagrams to keep them version-controllable.

### 4+1 View Model (Kruchten)
Five complementary views of the same architecture:
- **Logical View** - Functional decomposition (classes, modules, layers)
- **Process View** - Runtime behavior, concurrency, synchronization
- **Development View** - Code organization, modules, packages
- **Deployment / Physical View** - Infrastructure, nodes, network topology
- **Scenarios (+1)** - Key use cases that validate the other four views

### Architecture Decision Records (ADRs)
Every significant architectural decision must be recorded as an immutable ADR. Use `adr-template.md` for individual decisions. The SAD contains an ADR log that summarizes and links to each one.

ADR states: `Proposed` → `Accepted` → `Deprecated` → `Superseded by ADR-XXX`

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any architecture document, you MUST interrogate the user's initial input, identify design ambiguities, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **User load & performance targets**: What are the estimated concurrent users, transaction throughput (TPS), or data storage scale targets?
2. **Infrastructure/Hosting constraints**: What cloud environment (AWS, GCP, bare metal, etc.) or deployment setup (Docker/K8s, serverless) is planned?
3. **Third-party integrations**: What external databases, API services, or legacy backend components must this system interact with?
4. **Resiliency/Availability goals**: What are the target uptime SLAs, disaster recovery goals (RPO/RTO), or multi-region requirements?
*Wait for the user's response to these questions before drafting the final architecture document.*

### Phase 2: System Context (30 min)
Define system boundaries, actors, and external system dependencies. Produce Level 1 C4 diagram.

### Phase 3: Container Architecture (60 min)
Decompose into deployable units. Produce Level 2 C4 diagram with technology choices.

### Phase 4: Component Architecture (60-120 min)
Decompose key containers into major internal components. Produce Level 3 C4 diagrams for critical containers only.

### Phase 5: Deployment View (45 min)
Map containers to infrastructure. Document network topology, regions, and external services.

### Phase 6: Integration and Data Flow (30 min)
Map all integration points. Document data flow, trust boundaries, and API contracts.

### Phase 7: Non-Functional Requirements and Quality Attributes (30 min)
Document architectural decisions driven by performance, scalability, security, and reliability NFRs.

### Phase 8: ADR Log (30 min per ADR)
Document each significant architectural decision.
