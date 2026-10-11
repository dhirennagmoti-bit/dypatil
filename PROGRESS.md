# PROGRESS.md — InsureChain Development Progress

## Current Session: Indian Market (Policybazaar-Style) Transformation & AI Policy Recommender

### Policybazaar Indian Insurance Overhaul
- [x] **Currency & Metric Localization**: Transformed all currency values to Indian Rupees (`₹`, Lakhs, Crores) across all user roles, policy terms, and claim histories.
- [x] **Policybazaar-Inspired Category Tiles**: Added interactive tiles for Health / Mediclaim (Tax Saver 80D), Motor & Car (Instant Zero-Dep), 2-Wheeler (Bike), Travel & Transit, and Commercial SME.
- [x] **IRDAI Compliance & Trust Badges**: Incorporated 10,000+ cashless network hospitals, 98.6% settlement ratio, and IRDAI sandbox compliance tags.
- [x] **Indian Context Presets**: Localized test scenarios with Indian locations (Western Express Highway Mumbai, Outer Ring Road Bengaluru, Greater Noida) and FIR / police panchnama evidence documentation.

### New Features for Policyholder & Prospective Buyers
- [x] **Policy Marketplace (`/policyholder/marketplace`)**:
  - Full catalog browsing across all insurers (Apex Mutual, Vortex Shield, Beacon Health).
  - Indian Rupee coverage limits, deductibles, filing windows, and excluded perils.
  - Direct 1-click policy enrollment and instant certificate issuance.
- [x] **AI Policy Recommendation Wizard**:
  - Interactive profile questions: Beneficiaries (Family, Solo, Parents, Vehicle), Age tier, City tier (Metro / Tier-2), and Desired Sum Insured (₹5L to ₹1Cr).
  - Dynamic Best-Match plan algorithm displaying a 98% match score, tailored rationale, and calculated annual/monthly premium in ₹.
- [x] **Policyholder Dashboard Polish**:
  - Added quick-action tiles for "AI Policy Finder", "Compare Plans", and "File Fast Claim".

### 2-Step Sign In & Account Creation
- [x] **Registration Page (`/register`)**:
  - Step 1: Full name, email, +91 Indian mobile number, password.
  - Step 2 ("What do you want to be?"): Interactive role selector:
    - *Individual Policyholder / Buyer*
    - *Claims Adjudication Officer*
    - *Insurance Company Administrator*
    - *IRDAI Compliance & Security Auditor*
  - Automatically logs in and routes to the selected role's dedicated portal.
- [x] **Login Page (`/login`)**:
  - Updated with Indian demo personas (Rahul Sharma, Priya Patel, Rajesh Verma, Vikram Malhotra, Ananya Sen) and direct registration callout.

### Core Features (Problem Statement B-02 Full Implementation)
- [x] **Feature 1 — Policy Eligibility Engine**:
  - Implemented configurable policy rules: Policy ID, coverage limit, excluded categories (JSON array), filing window (days).
  - Enforced claim evaluation: policy, incident date, filing date, category, amount, narrative, and evidence references.
  - Calculated payout capped at coverage limit minus deductible in Indian Rupees (₹), returning explicit explanations for ineligibility.
- [x] **Feature 2 — Duplicate Incident Detection & Payment Blocker**:
  - Integrated stable incident identifier (`incidentId`, e.g. `INC-55`) matched against `policyId` to detect duplicate incident filings regardless of claim reference (CLM-101 vs CLM-205).
  - Hard-blocked duplicate claims from progressing to `APPROVED` or `PAID` state, returning explicit anti-double-dipping refusal messages.
  - Added 1-Click "🔁 Duplicate INC-55" simulation preset in claim submission UI.
- [x] **Feature 3 — Defined Workflow State Transitions & Role Permissions**:
  - Enforced strict state machine rules on the Spring Boot backend action handler:
    - `SUBMITTED` -> `UNDER_REVIEW` (Officer/Supervisor)
    - `UNDER_REVIEW` -> `APPROVED` / `REJECTED` (Supervisor only; Claims Officers are forbidden and blocked)
    - `APPROVED` -> `PAID` (Supervisor/Admin only)
    - Direct skips (e.g. `SUBMITTED` -> `PAID`) are strictly rejected.
- [x] **Feature 4 — Audit Trail & Tamper Detection**:
  - Chronological immutable record for accepted transitions and refused attempts (`ACTION_REFUSED`).
  - Records who attempted, which claim, action attempted, accepted/refused status, refusal reason, and timestamp.
  - Sequential SHA-256 parent hash chaining linking each block to the previous entry's digital fingerprint.
  - Real-time cryptographic ledger verification via `GET /api/audit/verify-chain` with interactive UI verification button.

### Verification Status
- Backend `mvn test`: **PASSED** (10/10 tests passed with 0 errors across `AuditChainTest`, `DuplicateDetectionAndWorkflowTest`, and `EligibilityEngineTest`)
- Frontend `npm run build`: **PASSED** (`tsc && vite build` built successfully with 0 errors in 9.51s)
- Frontend Dev Server: Running at `http://localhost:5173`
- Spring Boot Backend: Running at `http://localhost:8080` (Connected to Supabase PostgreSQL, `status: ONLINE`)
