<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Initial template principle slot 1 -> I. Single Deployable First
- Initial template principle slot 2 -> II. Design for Deletion
- Initial template principle slot 3 -> III. Explicit Dependencies
- Initial template principle slot 4 -> IV. Versioned Boundary Contracts
- Initial template principle slot 5 -> V. Test Behavior at the Right Level
Added sections:
- VI. Structured Events as the Source of Truth
- VII. Reversible Delivery
- VIII. Attention Budget for Operations
- IX. User Value Over Merge Completion
- X. Command Discoverability and CI Parity
- Operational Constraints
- Review and Delivery Workflow
Removed sections:
- None
Follow-up TODOs:
- None
-->
# mono Constitution

## Core Principles

### I. Single Deployable First
**Rationale**  
Distributed systems multiply coordination cost, failure modes, and cognitive load.
Round trips, ownership boundaries, and reconciliation work dominate before latency
micro-optimizations matter.

**Rule**  
The default architecture is one deployable, one primary process, and vertical
scaling. A new process, service, queue, or asynchronous workflow MUST include a
written justification tied to at least one of: working-set overflow, genuinely
independent compute, geographic latency, or organizational independence.

**How To Apply**  
- Reject diffs that introduce a new service, worker, broker, queue, or network hop
  without the written justification in the design or PR.
- Prefer in-process modules, background routines, and a single database before
  introducing cross-process coordination.
- Treat coordination cost as required retries, ordering guarantees, idempotency,
  and failure handling, not as a theoretical latency number.

### II. Design for Deletion
**Rationale**  
Software survives by staying comprehensible. Small modules are easier to replace
than large extension points, and accidental abstraction is a durable source of
complexity.

**Rule**  
Every module MUST remain small enough that one engineer can delete and rewrite it
 in a day. Speculative abstractions are forbidden. Code MUST stay inline until the
 pain is concrete; extraction is justified only after repeated, demonstrated need.
 Duplication below three occurrences is cheaper than the wrong abstraction.

**How To Apply**  
- Reject frameworks, base classes, helper layers, or generic factories added before
  a real third use exists.
- Prefer direct code over indirection when the abstraction only saves a few lines.
- Flag modules whose size, dependency fan-in, or branching would prevent a one-day
  rewrite by a knowledgeable engineer.

### III. Explicit Dependencies
**Rationale**  
Hidden coupling prevents local reasoning, undermines tests, and turns unrelated
changes into system-wide risk.

**Rule**  
Dependencies MUST be visible either in a function signature or at the top of the
file that defines the behavior. Hidden global state, implicit singletons, and
import-time side effects are prohibited. Dependency injection is required over
singleton access.

**How To Apply**  
- Reject new implicit registries, ambient context lookups, mutable module globals,
  and constructors that reach into process-wide state.
- Require side-effectful setup to happen in explicit bootstrap code, not on import.
- Ask whether a reader can list every external dependency of the changed function
  without tracing runtime magic.

### IV. Versioned Boundary Contracts
**Rationale**  
Meaning diverges at system boundaries. Durable systems make the translation
explicit where context changes, not deep inside shared internals.

**Rule**  
Every producer-consumer boundary, including HTTP, queues, files, and database
interfaces, MUST have a schema and explicit version. Semantic reconciliation MUST
occur at the boundary and be owned by the side that understands both contexts.
Shared mutable schemas are forbidden.

**How To Apply**  
- Reject boundary changes that alter payload shape, meaning, or required fields
  without a versioned schema update.
- Require adapters or translators at ingress and egress rather than leaking one
  model across unrelated domains.
- Prefer append-only or compatibility-preserving schema evolution; when not
  possible, require an upgrade path and owner for the reconciliation logic.

### V. Test Behavior at the Right Level
**Rationale**  
Tests are only useful when they verify behavior at the level where uncertainty
lives. Plumbing-heavy tests slow change without increasing confidence.

**Rule**  
Unit tests MUST cover pure transformation logic. Integration tests MUST cover
system boundaries. Code owned by this repository MUST NOT be mocked in tests;
external systems MAY be mocked. A bug fix is incomplete until a test fails before
the fix and passes after it.

**How To Apply**  
- Reject unit tests that only assert wiring, framework calls, or mocked internal
  methods.
- Require integration coverage for contract changes, database interactions, file
  formats, queues, and HTTP behavior.
- Reject bug-fix diffs that lack a failing regression test or a documented reason
  the failure can only be demonstrated at a higher level.

### VI. Structured Events as the Source of Truth
**Rationale**  
Observability fragments when logs, metrics, and traces are treated as separate
systems. A shared event shape preserves meaning and supports derived views.

**Rule**  
New code MUST emit structured events as the primitive telemetry record. Logs,
metrics, and traces are projections from that record. High-cardinality fields,
including request ID, user ID, tenant ID, and feature-flag state when applicable,
are required. Unstructured log lines are prohibited in new code.

**How To Apply**  
- Reject string-only logging added to new code paths.
- Require event fields that identify actor, request, feature exposure, outcome,
  and timing where applicable.
- Prefer centralized event definitions and projection pipelines over one-off metric
  names and free-form log statements.

### VII. Reversible Delivery
**Rationale**  
Prevention eventually fails. Fast, practiced recovery limits blast radius better
than optimistic deployment assumptions.

**Rule**  
Every change MUST be revertible in under five minutes without a code change.
Feature flags MUST gate risky behavior. Data migrations MUST follow
expand-then-contract. Rollback MUST be tested as part of deployment, not assumed.

**How To Apply**  
- Reject releases that cannot be disabled, rolled back, or traffic-shifted quickly.
- Require migration plans that preserve old readers and writers during transition.
- Require deploy checklists or automation to exercise rollback or feature-disable
  paths for materially risky changes.

### VIII. Attention Budget for Operations
**Rationale**  
Human attention is the scarcest operational resource. Signals that do not map to
user pain create noise, delay diagnosis, and erode trust.

**Rule**  
Every alert MUST correspond to a user-visible symptom and have a runbook.
Dashboards MUST be saved queries used for diagnosis, not decorative reporting.
Signals that have not contributed to a useful page in 90 days MUST be deleted or
downgraded.

**How To Apply**  
- Reject alerts defined only in terms of internal counters without a user-impact
  statement and remediation steps.
- Require dashboards to answer a concrete operational question such as "is the
  user path degraded?" or "which tenant is failing?"
- Periodically review pages and remove noisy or unused signals.

### IX. User Value Over Merge Completion
**Rationale**  
Merged code has no value until users can exercise it safely and the team can see
what it is doing in production.

**Rule**  
A pull request is not done until the change is in users' hands, observable, and
revertible. "Shipped" means deployed, instrumented, and monitored; merge alone is
not a completion event.

**How To Apply**  
- Reject completion claims that stop at code review or CI success for user-facing
  changes.
- Require rollout, instrumentation, and rollback notes for changes that affect
  production behavior.
- Prefer staged delivery and confirmation from live telemetry before marking work
  complete.

### X. Command Discoverability and CI Parity
**Rationale**  
A development system is only reliable when the interface is obvious and
consistent. Hidden commands and CI-only steps create fragile tribal knowledge.

**Rule**  
Every repeatable action, including build, test, lint, migrate, deploy, and seed,
MUST be exposed as a single named command listed in one place. The command run
locally MUST be the same command CI runs. Hidden arguments, undocumented targets,
and CI-only shell steps are prohibited.

**How To Apply**  
- Reject automation added only to CI configuration without a locally runnable
  equivalent command.
- Require contributor-facing documentation to list the canonical command surface in
  one location.
- Ask whether a new contributor can discover and run every workflow command within
  30 seconds without insider knowledge.

## Operational Constraints

- Architectural exceptions MUST be recorded in the relevant design artifact or PR
  and reference the principle they intentionally violate.
- New infrastructure, schemas, and telemetry MUST identify an owner responsible
  for operation, cleanup, and compatibility.
- Any deviation from these principles MUST reduce net complexity or risk and must
  describe why the default rule fails in this case.

## Review and Delivery Workflow

- Reviews MUST evaluate diffs against each applicable principle and cite the
  violated principle by name when requesting changes.
- Planning artifacts for risky work MUST describe boundary contracts,
  observability, rollback, and command-surface impact before implementation.
- Releases MUST confirm deployability, observability, and reversibility before the
  work is marked complete.

## Governance

This constitution supersedes informal engineering habits for this repository. All
changes, reviews, and release decisions MUST be evaluated for compliance.

Amendments MUST be made in `.specify/memory/constitution.md` through an explicit
update that includes a Sync Impact Report. Semantic versioning governs changes to
this constitution: MAJOR for incompatible principle redefinitions or removals,
MINOR for new principles or materially expanded guidance, and PATCH for wording
clarifications that do not change intent.

Compliance reviews are mandatory for pull requests that alter architecture, data
contracts, deployment behavior, observability, or developer workflow. Reviewers
MUST block changes that violate a principle unless the diff includes a written,
repository-specific exception and rationale.

**Version**: 1.0.0 | **Ratified**: 2026-08-12 | **Last Amended**: 2026-08-12
