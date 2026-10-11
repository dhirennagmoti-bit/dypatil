# InsureChain — Enterprise Multi-Insurer Claims & Policy Management Platform

**VORTEXA 3.0 Hackathon — Problem Statement B-02**

---

## 1. Project Overview

**InsureChain** is a professional, multi-insurer-capable insurance policy, claim eligibility, and fraud-detection management platform designed to provide transparent, deterministic, and cryptographically auditable insurance operations.

Unlike traditional opaque insurance systems, InsureChain guarantees:
1. **Multi-Insurer Data Isolation**: Complete tenancy boundaries between fictional insurance companies (Apex Mutual, Vortex Shield, Beacon Health).
2. **Deterministic Claim Eligibility**: Explicit, rules-based evaluations for every claim (filing window, exclusions, coverage limits, policy active state).
3. **Above-Limit Policy Rule**: Documented handling of claims exceeding policy limits with automatic capping and deductible deduction.
4. **Duplicate Incident Detection**: SHA-256 fingerprinting that detects duplicate incident submissions across differing claim reference IDs.
5. **Tamper-Detectable Audit Trail**: Cryptographic SHA-256 hash-chained ledger of every workflow transition, approval, rejection, and unauthorized attempt.
6. **AI Inconsistency Advisory**: AI-assisted narrative extraction and inconsistency flagging kept strictly advisory without overriding deterministic business logic.

---

## 2. System Architecture

```
                    ┌────────────────────────────────────────┐
                    │      React 18 + TypeScript + Vite      │
                    │   Tailwind CSS / Lucide / Recharts     │
                    └───────────────────┬────────────────────┘
                                        │ REST API (JWT)
                                        ▼
                    ┌────────────────────────────────────────┐
                    │       Spring Boot 3.x Backend          │
                    │  Controllers, Services, Rules Engine   │
                    │  JWT Security, Audit Hash-Chain Engine │
                    └───────────────────┬────────────────────┘
                                        │ JDBC Pooler
                                        ▼
                    ┌────────────────────────────────────────┐
                    │     Supabase PostgreSQL Database       │
                    │   9 Relational Tables + Flyway DDL     │
                    └────────────────────────────────────────┘
```

### Portals Implemented
- **Policyholder Portal**: View coverage, browse policies, submit claims with evidence references, inspect real-time eligibility explanations and status tracking.
- **Insurer Admin Portal**: Manage organization rules, filing windows, excluded perils, coverage limits, view operational statistics and claim volume.
- **Claims Officer & Supervisor Portal**: Review assigned insurer claims, inspect deterministic rule explanations, examine duplicate incident warnings and AI advisory flags, execute workflow transitions (Under Review, Approve, Reject, Request Info).
- **Auditor & Compliance Portal**: Real-time hash-chain integrity verification tool, filter audit records by actor, insurer, or claim, inspect prevented security violations.

---

## 3. Demo Credentials

All test accounts use the password: `Password123!`

| Role | Email | Organization | Access Level |
|---|---|---|---|
| **Policyholder** | `sarah.policyholder@example.com` | N/A | Sarah Jenkins (Auto & Travel Policies) |
| **Policyholder** | `david.policyholder@example.com` | N/A | David Chen (Property & Health Policies) |
| **Claims Officer** | `officer.apex@example.com` | Apex Mutual | Review & process Apex claims |
| **Claims Supervisor** | `supervisor.apex@example.com` | Apex Mutual | Approve & reject Apex claims |
| **Insurer Admin** | `admin.apex@example.com` | Apex Mutual | Configure Apex rules & view metrics |
| **Claims Officer** | `officer.vortex@example.com` | Vortex Shield | Review & process Vortex claims |
| **Compliance Auditor** | `compliance.auditor@example.com` | N/A | Cross-insurer audit & hash-chain verification |
| **Platform Admin** | `platform.admin@example.com` | Platform | System-wide oversight |

---

## 4. Deterministic Eligibility Rules & Documented Policies

Every claim submitted undergoes deterministic rule evaluation:
- **Rule 1 (Active Coverage)**: Incident date must fall within `[effective_date, expiry_date]`.
- **Rule 2 (Filing Window)**: `filing_date - incident_date <= policy.filing_window_days`. (e.g. Apex Auto requires filing within 15 days).
- **Rule 3 (Excluded Categories)**: Incident cause must not be in `policy.excluded_categories` (e.g., Apex Property excludes `EARTHQUAKE`, `WAR`, `INTENTIONAL_DAMAGE`).
- **Rule 4 (Coverage Limit & Deductible)**: 
  - If `requested_amount <= coverage_limit`: Payout = `max(0, requested_amount - deductible)`.
  - If `requested_amount > coverage_limit`: Payout = `coverage_limit - deductible`. System flags `EXCEEDS_POLICY_LIMIT` and records exact excess variance excluded from covered payout.
- **Rule 5 (Duplicate Fingerprinting)**: Normalized hash `SHA-256(policy_id + incident_date + category + requested_amount)`. Detects repeat submissions even under different reference codes.

---

## 5. Audit Ledger & Cryptographic Integrity

Each workflow event is appended to `workflow_audit_logs` using SHA-256 hash chaining:
$$\text{Current Hash} = \text{SHA-256}(\text{Previous Hash} + \text{Claim ID} + \text{Actor ID} + \text{Action} + \text{Timestamp} + \text{State})$$

The Auditor portal provides a **Verify Cryptographic Chain** feature which traverses all historical blocks and verifies that no record was altered out-of-band in the database.
