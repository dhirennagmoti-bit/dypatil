# InsureChain — Architectural Inspection & Compliance Document

**Date:** October 11, 2026  
**Target:** VORTEXA 3.0 Hackathon — Problem Statement B-02  
**Platform:** InsureChain  

---

## 1. Environment & Initial State Inspection

| Item | Inspected State | Status |
|---|---|---|
| **Repository Root** | `d:\dypatil` | Fresh Git repository (`origin` empty remote) |
| **Java Runtime** | Oracle JDK 24.0.2 (Supports Java 21 bytecode targets) | Verified |
| **Build Tools** | Apache Maven 3.9.0 / Gradle 9.7.0 | Verified |
| **Node.js / npm** | Node v24.11.1 / npm 11.6.2 | Verified |
| **Database** | Supabase PostgreSQL 17.11 (`db.itbfacafyicjznksidyh.supabase.co`) | Active & Healthy |
| **Database Schema** | 9 Relational tables migrated via Flyway DDL | Verified |
| **Seed Data** | 3 Insurers, 8 Users, 4 Policies, 6 Claims, 5 Hash Chained Logs | Seeded & Verified |

---

## 2. Feature Classification Matrix (B-02 Requirements)

| Feature | Requirement | Classification | Implementation Detail |
|---|---|---|---|
| **Multi-Insurer Tenancy** | Apex Mutual, Vortex Shield, Beacon Health | Implemented & Seeded | Isolated by `insurer_id`, enforced in queries and controllers |
| **Role-Based Access Control** | Policyholder, Claims Officer, Supervisor, Insurer Admin, Auditor, Platform Admin | Implemented & Seeded | Spring Security + JWT authentication with Claims-based auth |
| **Policy Definition & Limits** | Coverage limit, deductible, filing window, excluded categories | Implemented & Seeded | Stored in `policies` table, editable by insurer admin |
| **Deterministic Rules Engine** | 5 explicit rules (Active, Window, Exclusions, Limit Capping, Deductible) | Implemented & Seeded | Java Service `EligibilityEngine` evaluating claim against policy rules |
| **Above-Limit Rule** | Consistent documented handling | Implemented & Seeded | Payout capped at `(coverage_limit - deductible)` with explicit excess variance explanation |
| **Duplicate Claim Detection** | Incident fingerprinting across reference IDs | Implemented & Seeded | Normalized SHA-256 fingerprint on `policy_id + incident_date + category + amount` |
| **Controlled Workflow State Machine** | `SUBMITTED` -> `UNDER_REVIEW` -> `APPROVED`/`REJECTED` -> `PAID` | Implemented & Seeded | Permitted transitions strictly validated; refused actions logged to audit trail |
| **Tamper-Detectable Audit History** | Cryptographic hash chaining | Implemented & Seeded | SHA-256 hash chaining with sequential link validation and live UI verification |
| **AI Inconsistency Advisory** | Review prompt only; never overrides deterministic eligibility | Implemented & Seeded | Advisory extraction results stored separately in `ai_extraction_results` |
| **Persistent Storage** | Supabase PostgreSQL via JDBC / Flyway | Implemented & Active | Tables created, foreign keys and indexes indexed |

---

## 3. Workflow State Machine Transitions

| From State | To State | Permitted Roles | Required Data |
|---|---|---|---|
| `[None]` | `SUBMITTED` | `POLICYHOLDER` | Policy ID, incident date, category, requested amount, narrative |
| `SUBMITTED` | `UNDER_REVIEW` | `CLAIMS_OFFICER`, `SUPERVISOR` | Review notes |
| `UNDER_REVIEW` | `APPROVED` | `SUPERVISOR`, `CLAIMS_OFFICER` (within limit) | Approved payout amount, decision reason |
| `UNDER_REVIEW` | `REJECTED` | `SUPERVISOR`, `CLAIMS_OFFICER` | Mandatory rejection explanation |
| `UNDER_REVIEW` | `ADDITIONAL_INFO_REQUIRED` | `CLAIMS_OFFICER`, `SUPERVISOR` | Description of needed evidence |
| `ADDITIONAL_INFO_REQUIRED` | `UNDER_REVIEW` | `POLICYHOLDER` | Supplemental evidence documents |
| `APPROVED` | `PAID` | `INSURER_ADMIN`, `SUPERVISOR` | Settlement confirmation ref |
| Any Invalid | Refused | All | Produces `400/403` and logs `ACTION_REFUSED` audit event |
