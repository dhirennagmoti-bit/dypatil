# PROJECT_CONTEXT.md — InsureChain Architecture

## Overview
InsureChain is a multi-insurer insurance policy and claims management platform built for the VORTEXA 3.0 Hackathon (Problem B-02). It provides deterministic claim eligibility evaluation, SHA-256 cryptographic audit trails, advisory-only AI review, and an Indian Policybazaar-inspired policy recommendation marketplace.

## Tech Stack
| Layer | Technology | Host |
|-------|-----------|------|
| Frontend | React 18 + TypeScript + Vite 5 + TailwindCSS 3 | Vercel |
| Backend | Java 21 + Spring Boot 3.3.4 + Spring Security + JPA | Render |
| Database | PostgreSQL 17 (Supabase) | Supabase |
| Auth | JWT (jjwt 0.12.6) | Backend-issued |
| AI | Advisory extraction (Gemini, optional) | Backend-only |

## Supabase Project
- Project ID: `itbfacafyicjznksidyh`
- API URL: `https://itbfacafyicjznksidyh.supabase.co`
- Region: ap-northeast-1
- DB pooler: `aws-0-ap-northeast-1.pooler.supabase.com:5432`

## User Roles
| Role | Capabilities |
|------|-------------|
| POLICYHOLDER | Compare & buy policies, submit claims, track status |
| CLAIMS_OFFICER | Review claims, transition workflow states |
| SUPERVISOR | All officer capabilities + approve/reject |
| INSURER_ADMIN | Manage policies, staff, view org metrics |
| AUDITOR | Read-only audit logs, verify hash chain |
| PLATFORM_ADMIN | Cross-insurer visibility |

## Frontend Application Routes
- `/` — Indian Policybazaar-inspired landing page with category tiles and demo profiles
- `/login` — Sign in with Indian demo personas
- `/register` — 2-step registration with +91 mobile number and "What do you want to be?" role selector
- `/policyholder/marketplace` — Policy comparison catalog and AI Recommendation Wizard
- `/policyholder/dashboard` — Active policyholder portal with live policies and claim history
- `/policyholder/submit` — Claim submission with real-time deterministic IRDAI pre-check simulator
- `/policyholder/claims/:id` — Claim evaluation and audit hash inspection
- `/officer/queue` — Claims adjudication table for officers
- `/officer/claims/:id` — Officer review view with AI extraction and decision modals
- `/insurer/admin` — Insurer underwriting policy creator and metrics
- `/auditor/portal` — IRDAI compliance sequential SHA-256 audit ledger visualizer

## API Endpoints
- `POST /api/auth/login` — JWT login
- `POST /api/auth/register` — Registration
- `GET /api/auth/me` — Current user profile
- `GET /api/policies` — List all policies
- `GET /api/policies/my` — Policyholder's enrolled policies
- `POST /api/policies/{id}/enroll` — Enroll in a policy
- `POST /api/policies` — Create policy (admin)
- `GET /api/claims` — List claims (filtered by role/insurer)
- `GET /api/claims/{id}` — Claim detail with eligibility, evidence, AI, audit
- `POST /api/claims` — Submit claim
- `POST /api/claims/{id}/transition` — Workflow state transition
- `GET /api/audit/logs` — Filtered audit logs
- `GET /api/audit/verify-chain` — Cryptographic chain verification
- `GET /api/insurers` — List insurers
- `GET /api/insurers/{id}/metrics` — Insurer metrics
- `GET /api/ai/review/{claimId}` — AI extraction result
- `POST /api/ai/reanalyze/{claimId}` — Re-trigger AI analysis

## Key Business Rules & Core Engine Specifications
1. **Feature 1 — Policy Eligibility Engine**:
   - Policies configured with Policy ID, Coverage Limit, Excluded Categories (JSON list), and Filing Window (days).
   - Claims require policy, incident date, filing date, category, amount, narrative, and evidence references.
   - Payout calculated as min(requestedAmount, coverageLimit) - deductible in Indian Rupees (₹).
   - Explicit failure reasons returned when late, excluded peril, or duplicate collision occurs.
2. **Feature 2 — Duplicate Incident Detection**:
   - Multi-layer duplicate detection combining a stable incident identifier (`incidentId`, e.g., `INC-55`) + `policyId`, alongside SHA-256 fingerprinting.
   - Prohibits paying the same incident twice under the same policy regardless of claim reference (e.g. `CLM-101` vs `CLM-205` for `INC-55`).
   - Hard blocks duplicate claims from progressing to `APPROVED` or `PAID` states.
3. **Feature 3 — Defined Workflow State Transitions & Role Permissions**:
   - Valid transitions: `SUBMITTED` -> `UNDER_REVIEW` (Officer/Supervisor), `UNDER_REVIEW` -> `APPROVED`/`REJECTED` (Supervisor/Admin only; Officer cannot approve), `APPROVED` -> `PAID` (Admin/Supervisor).
   - Direct leaps (e.g. `SUBMITTED` -> `PAID`) and unauthorized officer approvals are strictly rejected at the backend API handler.
4. **Feature 4 — Audit Trail & Tamper Detection**:
   - Chronological immutable record for accepted decisions AND refused actions (`ACTION_REFUSED`).
   - Captures who attempted, which claim, action attempted, accepted/refused status, refusal reason, timestamp, and sequential parent SHA-256 hash pointer.
   - Mathematical verification via `GET /api/audit/verify-chain`.

## Database Schema
Managed by JPA/Hibernate with `ddl-auto: none`. Key tables:
- `users`, `insurers`, `policies`, `user_policies`
- `claims` (includes `incident_id`, `incident_fingerprint`, `is_duplicate_suspected`, `duplicate_reason`), `claim_evidences`, `eligibility_evaluations`
- `ai_extraction_results`, `workflow_audit_logs`

## Environment Variables
- `SPRING_DATASOURCE_URL` — JDBC URL for Supabase PostgreSQL
- `SPRING_DATASOURCE_USERNAME` — DB user
- `SPRING_DATASOURCE_PASSWORD` — DB password
- `JWT_SECRET` — JWT signing key (min 256 bits)
- `CORS_ALLOWED_ORIGINS` — Comma-separated frontend origins
