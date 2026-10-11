# PROJECT_CONTEXT.md — InsureChain Architecture & Lifecycle

## Overview
InsureChain is a multi-insurer policy and claims lifecycle management platform built for the VORTEXA 3.0 Hackathon (Problem Statement B-02). It provides deterministic claim eligibility evaluation, multi-layer duplicate incident detection, role-segregated claim adjudication, cryptographic SHA-256 audit chaining with tamper detection, and Indian market financial localization.

---

## Tech Stack
| Layer | Technology | Host |
|---|---|---|
| Frontend | React 18 + TypeScript (strict) + Vite 5 + TailwindCSS 3 | Vercel |
| Backend | Java 21 + Spring Boot 3.3.4 + Spring Security + Spring Data JPA | Render |
| Database | PostgreSQL 17 (Supabase, schema migrations in Flyway) | Supabase |
| Auth | JWT (jjwt 0.12.6) with stateless token validation & RBAC | Spring Boot backend |
| AI | Advisory-only document extraction & fraud risk flagging | Gemini 2.5 Flash |

---

## Supabase PostgreSQL Configuration
- Project ID: `itbfacafyicjznksidyh`
- API URL: `https://itbfacafyicjznksidyh.supabase.co`
- Region: `ap-northeast-1`
- DB Connection Pooler: `aws-0-ap-northeast-1.pooler.supabase.com:5432`

---

## Role-Based Access Control (RBAC) & Authority Matrix

| Role | Scope | Permitted Actions | Forbidden Actions |
|---|---|---|---|
| **POLICYHOLDER** | Own policies & claims | Browse marketplace, enroll, submit claims, view evaluation & audit status | Cannot view internal queues, cannot alter workflow state |
| **CLAIMS_OFFICER** | Insurer-scoped claims | Inspect claim data, verify policy compliance, enter review notes, submit recommendation (`APPROVE` / `REJECT`) + justification to supervisor | Cannot make final approval/rejection decision, cannot mark claim paid |
| **SUPERVISOR** | Insurer-scoped claims | View approval queue with high-value flags, review officer recommendations, approve/reject eligible claims with mandatory justification | Cannot bypass hard eligibility failures, cannot approve claims for other insurers, cannot mark paid |
| **INSURER_ADMIN** | Insurer-scoped policies, staff, metrics | Configure policy terms & bounds, adjust high-value threshold, assign staff roles, process approved claims and record settlement references (mark `PAID`) | Cannot approve a rejected claim, cannot override eligibility, cannot delete audit entries |
| **AUDITOR** | System-wide / Insurer | View complete immutable decision and refusal audit ledger, trigger real-time cryptographic hash chain verification | Read-only; cannot alter claims or audit logs |
| **PLATFORM_ADMIN** | Cross-insurer | Cross-tenant administrative oversight and platform health | Cannot silently rewrite audit history |

---

## Claim State Transition Matrix

The lifecycle enforces the sequence:
`Policyholder (SUBMITTED) → Claims Officer (UNDER_REVIEW) → Supervisor (PENDING_SUPERVISOR_REVIEW) → Insurer Admin (APPROVED) → Settlement / Paid (PAID)`

| Current State | Target State | Authorized Role | Preconditions & Validation | Resulting Action & Audit |
|---|---|---|---|---|
| `SUBMITTED` | `UNDER_REVIEW` | CLAIMS_OFFICER, SUPERVISOR | Claim belongs to officer's insurer | Initial review started |
| `UNDER_REVIEW` | `PENDING_SUPERVISOR_REVIEW` | CLAIMS_OFFICER | Officer provides recommendation (`APPROVE`/`REJECT`) and mandatory justification | Escalated to supervisor queue; `OFFICER_RECOMMENDATION_SUBMITTED` logged |
| `PENDING_SUPERVISOR_REVIEW` | `APPROVED` | SUPERVISOR | Officer recommendation present; claim is strictly eligible (`isEligible == true`, no duplicate incident); supervisor justification provided | Escalated to admin settlement queue; `SUPERVISOR_DECISION_RECORDED` logged |
| `PENDING_SUPERVISOR_REVIEW` | `REJECTED` | SUPERVISOR | Mandatory rejection justification provided | Terminal state; `SUPERVISOR_DECISION_RECORDED` logged; cannot be paid by admin |
| `APPROVED` | `PAID` | INSURER_ADMIN | Valid supervisor approval; settlement reference (NEFT/UTR) provided | Settlement complete; `ADMIN_PROCESSING_RECORDED` logged |
| *Any* | *Invalid* | *Any* | Attempt to leap states, bypass eligibility, or perform unauthorized action | Blocked; `ACTION_REFUSED` audit entry generated |

---

## Key Business Rules & Deterministic Engine

### 1. Policy Eligibility Rules
1. **Active Policy Coverage**: Incident date must be between policy `effectiveDate` and `expiryDate`.
2. **Filing Window**: Claim filing date must be within `filingWindowDays` of the incident date.
3. **Excluded Perils**: Claim category must not match any peril in the policy's `excludedCategories` list.
4. **Coverage Limit & Deductible**: Payout is calculated as `max(0, min(requestedAmount, coverageLimit) - deductible)`. If requested amount exceeds the limit, it is capped and flagged with `EXCEEDS_POLICY_LIMIT` (advisory warning, not a hard failure).
5. **Hard Blocker Enforcement**: If any of rules 1-3 fail or a duplicate incident is detected, `isEligible` is `false`. Supervisors are strictly blocked by the backend service from approving the claim.

### 2. Multi-Layer Duplicate Detection
- Combines stable incident identifier (`incidentId`, e.g. `INC-55`) with `policyId` alongside SHA-256 fingerprinting on `(policyId, incidentDate, category, amount)`.
- Prevents paying the same incident multiple times under the same policy regardless of claim reference (`CLM-101` vs `CLM-205`).

### 3. Configurable High-Value Monetary Threshold
- Stored persistently per insurer in `insurers.high_value_threshold` (numeric decimal, default ₹5,00,000.00).
- Admin modifies via `PATCH /api/insurers/{id}/threshold` with bounds checking (₹0 to ₹10,00,00,000.00).
- Emits `THRESHOLD_UPDATED` audit entry.
- Claims where `requestedAmount >= highValueThreshold` receive high-value badge and dedicated filtering in the supervisor queue.

### 4. Cryptographic Hash Chained Audit Ledger
- Each audit log row computes:
  `currentHash = SHA-256(previousHash + claimId + actorId + action + newState + timestamp)`
- `AuditChainService.verifyChainIntegrity()` sequentially verifies the entire ledger from genesis (previousHash = `0000000000000000000000000000000000000000000000000000000000000000`):
  1. Compares row's `previousHash` with preceding row's `currentHash` (detects `LINK_BROKEN`).
  2. Recomputes canonical payload hash and compares with stored `currentHash` (detects `HASH_MISMATCH` caused by direct database tampering).
  3. Validates sequential continuous order (detects `SEQUENCE_GAP`).

---

## REST API Specification

### Authentication & RBAC
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `POST /api/auth/register` — Self-registration (strictly creates `POLICYHOLDER` accounts).
- `GET /api/auth/me` — Authenticated user profile and permissions.

### Claims Management & Adjudication
- `GET /api/claims` — List claims (scoped to authenticated user/insurer).
- `GET /api/claims/{id}` — Full claim detail, eligibility evaluation, officer recommendation, supervisor decision, and audit history.
- `POST /api/claims` — Submit claim with policy, incident date, category, amount, narrative, and evidence references.
- `POST /api/claims/{id}/transition` — Enforce state transition with role checks, validations, and mandatory justifications.
  - Body: `{ action: "RECOMMEND_APPROVAL" | "RECOMMEND_REJECTION" | "APPROVE" | "REJECT" | "SETTLE_PAYMENT", reason: string, officerRecommendation?: "APPROVE" | "REJECT", settlementReference?: string }`

### Policies & Underwriting
- `GET /api/policies` — Active policy marketplace catalog.
- `GET /api/policies/my` — Enrolled policies for policyholder.
- `POST /api/policies/{id}/enroll` — Policyholder enrollment.
- `POST /api/policies` — Create policy (insurer admin).
- `PUT /api/policies/{id}` — Update policy rules with backend bounds validation (insurer admin).

### Insurer Administration & Organization
- `GET /api/insurers` — List insurer organizations.
- `GET /api/insurers/{id}/metrics` — Insurer-scoped claim count aggregation by lifecycle state.
- `PATCH /api/insurers/{id}/threshold` — Update high-value threshold (₹) with audit logging.
- `PUT /api/insurers/{id}/users/{userId}/role` — Staff role assignment with tenant validation and audit logging.

### Audit & Compliance
- `GET /api/audit/logs` — Query decision and refusal audit records with multi-field filters.
- `GET /api/audit/verify-chain` — Execute cryptographic ledger verification and return structured pass/fail report.

---

## Database Schema (PostgreSQL)

Key tables and workflow lifecycle columns:
- `users`: `id`, `name`, `email`, `role`, `insurer_id`, `created_at`
- `insurers`: `id`, `name`, `code`, `high_value_threshold` (NUMERIC(14,2))
- `policies`: `id`, `insurer_id`, `policy_number`, `name`, `coverage_limit`, `deductible`, `filing_window_days`, `excluded_categories` (JSONB), `effective_date`, `expiry_date`, `is_active`
- `user_policies`: `id`, `user_id`, `policy_id`, `enrolled_at`, `status`
- `claims`: `id`, `claim_reference`, `policy_id`, `user_id`, `insurer_id`, `status`, `incident_id`, `incident_date`, `filing_date`, `category`, `requested_amount`, `calculated_payout`, `excess_amount`, `incident_fingerprint`, `is_duplicate_suspected`, `duplicate_reason`, `officer_recommendation`, `officer_recommendation_justification`, `officer_recommended_at`, `officer_id`, `supervisor_decision`, `supervisor_decision_justification`, `supervisor_decided_at`, `supervisor_id`, `admin_processing_status`, `admin_notes`, `settlement_reference`, `admin_processed_at`, `admin_id`, `policy_rules_snapshot` (JSONB)
- `claim_evidences`: `id`, `claim_id`, `document_type`, `file_url`, `description`, `uploaded_at`
- `eligibility_evaluations`: `id`, `claim_id`, `is_eligible`, `calculated_payout`, `rule_results` (JSONB), `evaluated_at`
- `workflow_audit_logs`: `id`, `claim_id`, `actor_id`, `actor_role`, `insurer_id`, `action`, `previous_state`, `new_state`, `outcome`, `reason`, `previous_hash`, `current_hash`, `timestamp`

---

## Test Verification Summary
- **Backend Tests**: 21/21 passing (`AuditChainTest`, `DuplicateDetectionAndWorkflowTest`, `EligibilityEngineTest`, `InsurerAndPolicyManagementTest`).
- **Frontend Build**: `tsc && vite build` passing with zero errors.
- **Design Tokens**: Deep navy (`#183153`), muted blue (`#42658A`), warm neutral (`#F7F7F4`), charcoal (`#252B33`), restrained teal for success, amber for warnings, muted red for errors.
