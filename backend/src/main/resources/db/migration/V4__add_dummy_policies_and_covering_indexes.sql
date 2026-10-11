-- V4: Add covering foreign key indexes and dummy policies for Indian market catalog

-- 1. Covering Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_claims_officer_id ON public.claims(officer_id);
CREATE INDEX IF NOT EXISTS idx_claims_supervisor_id ON public.claims(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_claims_admin_id ON public.claims(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor_id ON public.workflow_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_policies_insurer_id ON public.policies(insurer_id);
CREATE INDEX IF NOT EXISTS idx_users_insurer_id ON public.users(insurer_id);
CREATE INDEX IF NOT EXISTS idx_user_policies_policy_id ON public.user_policies(policy_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidences_claim_id ON public.claim_evidences(claim_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_evaluations_claim_id ON public.eligibility_evaluations(claim_id);
CREATE INDEX IF NOT EXISTS idx_ai_extraction_results_claim_id ON public.ai_extraction_results(claim_id);

-- 2. Seed 8 Dummy Insurance Policies
INSERT INTO public.policies (
    id, insurer_id, policy_number, title, description, category,
    coverage_limit, deductible, filing_window_days, excluded_categories,
    policy_rules_description, effective_date, expiry_date, active, created_at, updated_at
) VALUES 
(
    'bbbbbbbb-2222-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'APEX-HLT-SANJ-01',
    'Apex Aarogya Sanjeevani Family Floater',
    'Comprehensive cashless mediclaim covering family hospitalization, ICU charges, daycare procedures, and Section 80D tax savings.',
    'HEALTH',
    1000000.00,
    5000.00,
    30,
    '["COSMETIC_SURGERY", "EXPERIMENTAL_TREATMENT", "SUBSTANCE_ABUSE"]',
    'Pre-authorization required for planned surgeries; emergency cashless claims within 48 hours of admission.',
    '2026-01-01',
    '2026-12-31',
    true,
    now(),
    now()
),
(
    'bbbbbbbb-2222-0000-0000-000000000006',
    '11111111-1111-1111-1111-111111111111',
    'APEX-MOT-B2B-102',
    'Apex Bumper-to-Bumper Zero-Dep Motor Shield',
    '100% Zero-Depreciation coverage for private 4-wheelers with engine protect, roadside assistance, and consumable cover.',
    'AUTO',
    1500000.00,
    2000.00,
    14,
    '["DRIVING_UNDER_INFLUENCE", "UNLICENSED_DRIVER", "COMMERCIAL_USE_OF_PRIVATE_CAR"]',
    'Must provide police panchnama/FIR for collisions exceeding ₹50,000; file within 14 days.',
    '2026-01-01',
    '2026-12-31',
    true,
    now(),
    now()
),
(
    'bbbbbbbb-2222-0000-0000-000000000007',
    '22222222-2222-2222-2222-222222222222',
    'VORTEX-BIKE-301',
    'Vortex Suraksha 2-Wheeler Super Cover',
    'Quick-claim protection for bikes and electric scooters, covers accidental damages, theft, and third-party liabilities.',
    'TWO_WHEELER',
    250000.00,
    500.00,
    7,
    '["RACING", "UNREGISTERED_VEHICLE", "HELMET_NON_COMPLIANCE"]',
    'Digital survey photo upload required within 7 days of incident.',
    '2026-01-01',
    '2026-12-31',
    true,
    now(),
    now()
),
(
    'bbbbbbbb-2222-0000-0000-000000000008',
    '22222222-2222-2222-2222-222222222222',
    'VORTEX-SME-UDYAM-401',
    'Vortex SME Bharat Udyam Suraksha',
    'Standard fire, flood, inundation, storm, and burglary coverage for small factories, warehouses, and retail shops.',
    'PROPERTY',
    5000000.00,
    25000.00,
    30,
    '["WAR", "NUCLEAR_RISK", "INTENTIONAL_SABOTAGE"]',
    'Incident report and stock ledger reconciliation required for claims over ₹5 Lakhs.',
    '2026-01-01',
    '2026-12-31',
    true,
    now(),
    now()
),
(
    'bbbbbbbb-2222-0000-0000-000000000009',
    '33333333-3333-3333-3333-333333333333',
    'BEACON-SNR-MED-501',
    'Beacon Senior Citizen Platinum Mediclaim',
    'Dedicated medical insurance for seniors (60+ years) with cashless cardiac, joint replacement, and dialysis hospital care.',
    'HEALTH',
    2500000.00,
    10000.00,
    45,
    '["UNPROVEN_AYUSH_TREATMENTS", "WEIGHT_LOSS_SURGERY", "COSMETIC_SURGERY"]',
    '2-year waiting period for pre-existing ailments; 45-day post-hospitalization submission window.',
    '2026-01-01',
    '2026-12-31',
    true,
    now(),
    now()
),
(
    'bbbbbbbb-2222-0000-0000-000000000010',
    '33333333-3333-3333-3333-333333333333',
    'BEACON-TRV-GLOBE-601',
    'Beacon Overseas Transit & Student Travel Guard',
    'Comprehensive international travel cover for Indian tourists and overseas students, covering medical evacuations and loss of baggage.',
    'TRAVEL',
    7500000.00,
    5000.00,
    21,
    '["EXTREME_SPORTS", "TRAVEL_AGAINST_MEDICAL_ADVICE", "PASSPORT_NEGLECT"]',
    'Requires airline carrier certificate (PIR) for baggage loss; file within 21 days of return.',
    '2026-01-01',
    '2026-12-31',
    true,
    now(),
    now()
),
(
    'bbbbbbbb-2222-0000-0000-000000000011',
    '11111111-1111-1111-1111-111111111111',
    'APEX-CYB-WAL-701',
    'Apex Cyber Fraud & Digital Wallet Suraksha',
    'Digital banking & UPI fraud protection against phishing, identity theft, malware theft, and unauthorized cyber transactions.',
    'COMMERCIAL',
    500000.00,
    1000.00,
    3,
    '["VOLUNTARY_OTP_DISCLOSURE", "CRYPTOCURRENCY_LOSSES", "GAMBLING_FRAUD"]',
    'Immediate bank blocking and National Cyber Crime Portal (cybercrime.gov.in) acknowledgement within 72 hours.',
    '2026-01-01',
    '2026-12-31',
    true,
    now(),
    now()
),
(
    'bbbbbbbb-2222-0000-0000-000000000012',
    '22222222-2222-2222-2222-222222222222',
    'VORTEX-CARGO-INL-801',
    'Vortex Bharat Marine Cargo & Inland Transit Shield',
    'Road & railway goods transit insurance protecting consignment loads against highway collision, overturn, derailment, and theft.',
    'PROPERTY',
    3000000.00,
    15000.00,
    15,
    '["INSUFFICIENT_PACKAGING", "INHERENT_VICE", "DRIVER_ABANDONMENT"]',
    'Lorry Receipt (LR) consignment note and joint damage assessment survey mandatory.',
    '2026-01-01',
    '2026-12-31',
    true,
    now(),
    now()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Enroll Demo Users
INSERT INTO public.user_policies (id, user_id, policy_id, enrolled_at, status) VALUES
('eeeeeeee-5555-0000-0000-000000000006', 'aaaaaaaa-1111-0000-0000-000000000007', 'bbbbbbbb-2222-0000-0000-000000000005', now(), 'ACTIVE'),
('eeeeeeee-5555-0000-0000-000000000007', 'aaaaaaaa-1111-0000-0000-000000000007', 'bbbbbbbb-2222-0000-0000-000000000006', now(), 'ACTIVE'),
('eeeeeeee-5555-0000-0000-000000000008', 'aaaaaaaa-1111-0000-0000-000000000008', 'bbbbbbbb-2222-0000-0000-000000000007', now(), 'ACTIVE'),
('eeeeeeee-5555-0000-0000-000000000009', 'aaaaaaaa-1111-0000-0000-000000000008', 'bbbbbbbb-2222-0000-0000-000000000009', now(), 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
